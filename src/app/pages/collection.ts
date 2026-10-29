import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { COUNT_MAX, NAME_MAX, base64ToCounts, validateName } from '../core/collection-codec';
import { iconPath, randomIcon } from '../core/collection-icons';
import { CollectionStore } from '../core/collection-store';
import { KindService } from '../core/kind.service';
import { CollectibleKind } from '../core/models';
import { Compare } from '../shared/compare';
import { IconPicker } from '../shared/icon-picker';
import { ItemModal } from '../shared/item-modal';
import { Modal } from '../shared/modal';
import { QrShow } from '../shared/qr-show';

type Dialog = 'qr' | 'compare' | 'edit' | 'delete' | null;

@Component({
  selector: 'app-collection',
  imports: [RouterLink, ItemModal, Modal, QrShow, Compare, IconPicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/kind', code()]" class="back">← {{ kind()?.name ?? 'Back' }}</a>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    @if (collection() && kind(); as k) {
      <h1 class="title">
        <img class="cicon" [src]="iconSrc()" alt="" />
        <span>{{ name() }}</span>
        <button type="button" class="pencil" aria-label="Edit collection" (click)="openEdit()">✎</button>
      </h1>
      <div class="actions">
        <button type="button" (click)="dialog.set('qr')">Show QR</button>
        <button type="button" (click)="dialog.set('compare')">Scan QR</button>
        <button type="button" (click)="dialog.set('delete')">Delete</button>
      </div>
      <div class="grid">
        @for (item of k.items; track item.code; let i = $index) {
          <div class="cell">
            <button type="button" class="icon" [attr.aria-label]="'Add one ' + item.name + ', current count ' + counts()[i]" (click)="bump(i)">
              <img [src]="item.icon" alt="" />
              <span class="badge" [class.zero]="counts()[i] === 0">{{ counts()[i] }}</span>
            </button>
            <button type="button" class="name" (click)="selected.set(i)">{{ item.name }}</button>
          </div>
        }
      </div>

      @if (selectedItem(); as s) {
        <app-item-modal [item]="s.item" [count]="s.count" (countChange)="setCount(s.index, $event)" (closed)="selected.set(null)" />
      }
      @switch (dialog()) {
        @case ('qr') {
          <app-qr-show [text]="encoded()" (closed)="dialog.set(null)" />
        }
        @case ('compare') {
          <app-compare [kindCode]="code()" [items]="k.items" [mine]="counts()" (closed)="dialog.set(null)" />
        }
        @case ('edit') {
          <app-modal title="Edit collection" (closed)="dialog.set(null)">
            <form (submit)="save($event)">
              <label for="newname">Collection name</label>
              <input id="newname" type="text" autocomplete="off" [attr.maxlength]="maxLength" [value]="newName()" (input)="newName.set($any($event.target).value)" />
              @if (renameError()) {
                <p class="error" role="alert">{{ renameError() }}</p>
              }
              <span class="label">Collection icon</span>
              <app-icon-picker [selected]="newIcon()" (selectedChange)="newIcon.set($event)" />
              <button type="submit" class="btn primary" [disabled]="renameError() !== null">Save</button>
            </form>
          </app-modal>
        }
        @case ('delete') {
          <app-modal title="Delete collection" (closed)="dialog.set(null)">
            <p>Delete <strong>{{ name() }}</strong>? This cannot be undone.</p>
            <button type="button" class="btn danger" (click)="remove()">Delete</button>
            <button type="button" class="btn" (click)="dialog.set(null)">Cancel</button>
          </app-modal>
        }
      }
    } @else if (!error()) {
      <p class="muted">Collection not found.</p>
    }
  `,
  styles: `
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .actions button { min-height: 44px; padding: 0 1rem; border-radius: 8px; border: 1px solid #bbb; background: #f4f4f4; cursor: pointer; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr)); gap: 0.75rem 0.25rem; }
    .cell { display: flex; flex-direction: column; align-items: center; }
    .icon { position: relative; border: 0; background: none; padding: 0.25rem; cursor: pointer; width: 4.5rem; height: 4.5rem; }
    .icon img { width: 100%; height: 100%; pointer-events: none; }
    .badge { position: absolute; top: -2px; right: -2px; min-width: 1.6rem; height: 1.6rem; padding: 0 0.3rem; box-sizing: border-box; border-radius: 0.8rem; background: #0b5ed7; color: #fff; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .badge.zero { background: #777; }
    .name { border: 0; background: none; min-height: 44px; padding: 0.25rem; font: inherit; font-size: 0.8rem; text-align: center; cursor: pointer; text-decoration: underline; }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    label, .label { font-weight: 600; margin-bottom: 0.5rem; }
    input[type='text'] { min-height: 44px; padding: 0 0.75rem; box-sizing: border-box; }
    .title { display: flex; align-items: center; gap: 0.5rem; }
    .cicon { width: 2.5rem; height: 2.5rem; }
    .pencil { width: 44px; height: 44px; border: 0; background: none; font-size: 1.4rem; cursor: pointer; }
  `,
})
export class CollectionPage {
  readonly code = input.required<string>();
  readonly name = input.required<string>();

  private readonly store = inject(CollectionStore);
  private readonly svc = inject(KindService);
  private readonly router = inject(Router);

  protected readonly maxLength = NAME_MAX;
  protected readonly kind = signal<CollectibleKind | null>(null);
  protected readonly error = signal('');
  protected readonly dialog = signal<Dialog>(null);
  protected readonly selected = signal<number | null>(null);
  protected readonly newName = signal('');
  protected readonly newIcon = signal('');
  protected readonly iconSrc = computed(() => iconPath(this.collection()?.icon ?? ''));

  protected readonly collection = computed(() => this.store.collections().find((c) => c.kind === this.code() && c.name === this.name()));
  protected readonly counts = computed(() => {
    const c = this.collection();
    return (c && base64ToCounts(c.data)) || [];
  });
  protected readonly encoded = computed(() => {
    const c = this.collection();
    return c ? this.store.encoded(c) : '';
  });
  protected readonly selectedItem = computed(() => {
    const i = this.selected();
    const k = this.kind();
    return i === null || !k ? null : { index: i, item: k.items[i], count: this.counts()[i] ?? 0 };
  });
  protected readonly renameError = computed(() => {
    const others = this.store.namesForKind(this.code()).filter((n) => n !== this.name());
    return validateName(this.newName(), others);
  });

  constructor() {
    effect(() => {
      this.svc.getKind(this.code()).then(
        (k) => this.kind.set(k),
        () => this.error.set('This collectable could not be found.'),
      );
    });
  }

  protected bump(index: number): void {
    const current = this.counts()[index] ?? 0;
    if (current < COUNT_MAX) this.store.setCount(this.code(), this.name(), index, current + 1);
  }

  protected setCount(index: number, value: number): void {
    this.store.setCount(this.code(), this.name(), index, value);
  }

  protected openEdit(): void {
    this.newName.set(this.name());
    this.newIcon.set(this.collection()?.icon ?? randomIcon());
    this.dialog.set('edit');
  }

  protected save(event: Event): void {
    event.preventDefault();
    if (this.renameError() !== null) return;
    const newName = this.newName().trim();
    this.store.edit(this.code(), this.name(), newName, this.newIcon());
    this.dialog.set(null);
    if (newName !== this.name()) {
      this.router.navigate(['/kind', this.code(), 'c', newName], { replaceUrl: true });
    }
  }

  protected remove(): void {
    this.store.remove(this.code(), this.name());
    this.dialog.set(null);
    this.router.navigate(['/kind', this.code()], { replaceUrl: true });
  }
}
