import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CollectionStore } from '../core/collection-store';
import { iconPath } from '../core/collection-icons';
import { KindService } from '../core/kind.service';
import { CollectibleKind } from '../core/models';

@Component({
  selector: 'app-kind',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/" class="back">← Collectables</a>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    <h1>{{ kind()?.name }}</h1>
    <h2>My collections</h2>
    <ul class="list">
      @for (c of collections(); track c.name) {
        <li class="row"><img class="cicon" [src]="iconPath(c.icon)" alt="" /><a [routerLink]="['/kind', code(), 'c', c.name]">{{ c.name }}</a></li>
      } @empty {
        <li class="muted">You have no collections yet.</li>
      }
    </ul>
    <a class="btn primary" [routerLink]="['/kind', code(), 'new']">Add Collection</a>
  `,
  styles: `
    .row { display: flex; align-items: center; gap: 0.75rem; }
    .cicon { width: 2rem; height: 2rem; }
  `,
})
export class KindPage {
  protected readonly iconPath = iconPath;
  readonly code = input.required<string>();
  private readonly store = inject(CollectionStore);
  private readonly svc = inject(KindService);
  protected readonly kind = signal<CollectibleKind | null>(null);
  protected readonly error = signal('');
  protected readonly collections = computed(() => this.store.collections().filter((c) => c.kind === this.code()));

  constructor() {
    effect(() => {
      this.svc.getKind(this.code()).then(
        (k) => this.kind.set(k),
        () => this.error.set('This collectable could not be found.'),
      );
    });
  }
}
