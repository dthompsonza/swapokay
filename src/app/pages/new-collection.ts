import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DEFAULT_NAME, NAME_MAX, validateName } from '../core/collection-codec';
import { randomIcon } from '../core/collection-icons';
import { CollectionStore } from '../core/collection-store';
import { KindService } from '../core/kind.service';
import { CollectibleKind } from '../core/models';
import { IconPicker } from '../shared/icon-picker';

@Component({
  selector: 'app-new-collection',
  imports: [RouterLink, IconPicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/kind', code()]" class="back">← Cancel</a>
    <h1>Add Collection</h1>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    @if (needsName()) {
      <form (submit)="next($event)">
        <p class="muted">You already have a collection called "{{ defaultName }}". Choose a name for the new one.</p>
        <label for="name">Collection name</label>
        <input id="name" type="text" autocomplete="off" [attr.maxlength]="maxLength" [value]="name()" (input)="name.set($any($event.target).value)" />
        <small class="muted">{{ name().length }}/{{ maxLength }}</small>
        @if (name() && validation()) {
          <p class="error" role="alert">{{ validation() }}</p>
        }
        <span class="label">Collection icon</span>
        <app-icon-picker [selected]="icon()" (selectedChange)="icon.set($event)" />
        <button type="submit" class="btn primary" [disabled]="validation() !== null || !kind()">Next</button>
      </form>
    }
  `,
  styles: `
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    label, .label { font-weight: 600; margin-bottom: 0.5rem; }
    input { min-height: 44px; padding: 0 0.75rem; box-sizing: border-box; }
  `,
})
export class NewCollectionPage {
  readonly code = input.required<string>();
  private readonly store = inject(CollectionStore);
  private readonly svc = inject(KindService);
  private readonly router = inject(Router);
  protected readonly defaultName = DEFAULT_NAME;
  protected readonly maxLength = NAME_MAX;
  protected readonly name = signal('');
  protected readonly icon = signal(randomIcon());
  protected readonly kind = signal<CollectibleKind | null>(null);
  protected readonly error = signal('');
  protected readonly needsName = signal(false);
  protected readonly validation = computed(() => validateName(this.name(), this.store.namesForKind(this.code())));

  constructor() {
    effect(() => {
      this.svc.getKind(this.code()).then(
        (k) => {
          this.kind.set(k);
          if (validateName(DEFAULT_NAME, this.store.namesForKind(k.code)) === null) {
            this.create(k, DEFAULT_NAME);
          } else {
            this.needsName.set(true);
          }
        },
        () => this.error.set('This collectable could not be found.'),
      );
    });
  }

  protected next(event: Event): void {
    event.preventDefault();
    const kind = this.kind();
    if (!kind || this.validation() !== null) return;
    this.create(kind, this.name().trim());
  }

  private create(kind: CollectibleKind, name: string): void {
    this.store.add(kind.code, name, kind.items.length, this.icon());
    this.router.navigate(['/kind', kind.code, 'c', name], { replaceUrl: true });
  }
}
