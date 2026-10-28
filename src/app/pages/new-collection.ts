import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NAME_MAX, validateName } from '../core/collection-codec';
import { CollectionStore } from '../core/collection-store';
import { KindService } from '../core/kind.service';
import { CollectibleKind } from '../core/models';

@Component({
  selector: 'app-new-collection',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/kind', code()]" class="back">← Cancel</a>
    <h1>Add Collection</h1>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    <form (submit)="next($event)">
      <label for="name">Collection name</label>
      <input id="name" type="text" autocomplete="off" [attr.maxlength]="maxLength" [value]="name()" (input)="name.set($any($event.target).value)" />
      <small class="muted">{{ name().length }}/{{ maxLength }}</small>
      @if (name() && validation()) {
        <p class="error" role="alert">{{ validation() }}</p>
      }
      <button type="submit" class="btn primary" [disabled]="validation() !== null || !kind()">Next</button>
    </form>
  `,
})
export class NewCollectionPage {
  readonly code = input.required<string>();
  private readonly store = inject(CollectionStore);
  private readonly svc = inject(KindService);
  private readonly router = inject(Router);
  protected readonly maxLength = NAME_MAX;
  protected readonly name = signal('');
  protected readonly kind = signal<CollectibleKind | null>(null);
  protected readonly error = signal('');
  protected readonly validation = computed(() => validateName(this.name(), this.store.namesForKind(this.code())));

  constructor() {
    effect(() => {
      this.svc.getKind(this.code()).then(
        (k) => this.kind.set(k),
        () => this.error.set('This collectable could not be found.'),
      );
    });
  }

  protected next(event: Event): void {
    event.preventDefault();
    const kind = this.kind();
    if (!kind || this.validation() !== null) return;
    const name = this.name().trim();
    this.store.add(kind.code, name, kind.items.length);
    this.router.navigate(['/kind', kind.code, 'c', name]);
  }
}
