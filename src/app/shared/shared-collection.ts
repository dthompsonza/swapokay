import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { base64ToCounts, collectionStats, decodeCollection, padCounts, peekKindCode } from '../core/collection-codec';
import { iconPath } from '../core/collection-icons';
import { CollectionStore } from '../core/collection-store';
import { KindService } from '../core/kind.service';
import { CollectibleKind, itemLabel } from '../core/models';
import { Compare } from './compare';
import { Modal } from './modal';

interface Shared {
  name: string;
  icon: string;
  counts: number[];
  kind: CollectibleKind;
}

@Component({
  selector: 'app-shared-collection',
  imports: [Modal, Compare],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (comparing(); as c) {
      <app-compare [kindCode]="c.kind.code" [items]="c.kind.items" [mine]="mine()" [mineName]="selectedName()" [mineIcon]="mineIcon()" [initialCode]="code()" (closed)="closed.emit()" />
    } @else {
      <app-modal [title]="title()" (closed)="closed.emit()">
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        } @else if (shared(); as s) {
          @if (mineOptions().length) {
            <h2 class="heading">Compare to...</h2>
            <div class="compare">
              <select aria-label="Your collection" [value]="selectedName()" (change)="selectedName.set($any($event.target).value)">
                @for (n of mineOptions(); track n) {
                  <option [value]="n" [selected]="n === selectedName()">{{ n }}</option>
                }
              </select>
              <button type="button" class="btn primary" (click)="comparing.set(s)">Compare</button>
            </div>
          }
          <div class="head">
            <img [src]="iconSrc()" alt="" />
            <span class="cname">{{ s.name }}</span>
          </div>
          <p class="stats">{{ stats() }}</p>
          <div class="grid">
            @for (e of visible(); track e.index) {
              <div class="cell">
                <div class="icon">
                  <img [src]="e.item.icon" [alt]="label(e.item)" />
                  <span class="badge">{{ e.count }}</span>
                </div>
                <span class="iname">{{ label(e.item) }}</span>
              </div>
            } @empty {
              <p class="muted">No items yet.</p>
            }
          </div>
        } @else {
          <p class="muted">Loading…</p>
        }
      </app-modal>
    }
  `,
  styles: `
    .heading { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .compare { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
    select { flex: 1; min-width: 0; min-height: 36px; font: inherit; }
    .head { display: flex; align-items: center; gap: 0.5rem; }
    .head img { width: 2.2rem; height: 2.2rem; }
    .cname { font-size: 1.1rem; line-height: 1.1rem; font-weight: 600; }
    .stats { margin: 0.25rem 0 0.75rem; font-size: 0.85rem; color: #555; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr)); gap: 0.5rem 0.25rem; }
    .cell { display: flex; flex-direction: column; align-items: center; }
    .icon { position: relative; width: 4rem; height: 4rem; }
    .icon img { width: 100%; height: 100%; }
    .badge { position: absolute; top: -2px; right: -2px; min-width: 1.5rem; height: 1.5rem; padding: 0 0.3rem; box-sizing: border-box; border-radius: 0.75rem; background: #0b5ed7; color: #fff; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .iname { font-size: 0.75rem; text-align: center; }
    .muted { color: #666; }
    .error { color: #b00020; }
  `,
})
export class SharedCollection implements OnInit {
  readonly code = input.required<string>();
  readonly closed = output<void>();

  private readonly store = inject(CollectionStore);
  private readonly kinds = inject(KindService);
  protected readonly label = itemLabel;
  protected readonly shared = signal<Shared | null>(null);
  protected readonly error = signal('');
  protected readonly comparing = signal<Shared | null>(null);
  protected readonly selectedName = signal('');

  protected readonly mineOptions = computed(() => {
    const s = this.shared();
    return s ? this.store.namesForKind(s.kind.code) : [];
  });
  protected readonly title = computed(() => (this.mineOptions().length ? 'Compare to...' : 'Shared collection'));
  protected readonly iconSrc = computed(() => iconPath(this.shared()?.icon ?? ''));
  protected readonly stats = computed(() => collectionStats(this.shared()?.counts ?? []));
  protected readonly visible = computed(() => {
    const s = this.shared();
    if (!s) return [];
    return s.kind.items.map((item, index) => ({ item, index, count: s.counts[index] ?? 0 })).filter((e) => e.count > 0);
  });
  protected readonly mineIcon = computed(() => {
    const s = this.comparing();
    return (s && this.store.get(s.kind.code, this.selectedName())?.icon) || '';
  });
  protected readonly mine = computed(() => {
    const s = this.comparing();
    const c = s && this.store.get(s.kind.code, this.selectedName());
    return padCounts((c && base64ToCounts(c.data)) || [], s?.kind.items.length ?? 0);
  });

  async ngOnInit(): Promise<void> {
    const kindCode = peekKindCode(this.code());
    if (!kindCode) return this.error.set('This is not a valid collection link.');
    let kind: CollectibleKind;
    try {
      kind = await this.kinds.getKind(kindCode);
    } catch {
      return this.error.set(`Unknown collectible kind "${kindCode}".`);
    }
    const decoded = decodeCollection(this.code(), kindCode, kind.items.length);
    if (!decoded.ok) return this.error.set(decoded.error);
    this.shared.set({ name: decoded.value.name, icon: decoded.value.icon, counts: decoded.value.counts, kind });
    this.selectedName.set(this.store.namesForKind(kindCode)[0] ?? '');
  }
}
