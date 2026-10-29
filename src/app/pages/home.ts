import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { KindService } from '../core/kind.service';
import { KindSummary } from '../core/models';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Collectables</h1>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    <ul class="kind-cards">
      @for (k of kinds(); track k.code) {
        <li>
          <a [routerLink]="['/kind', k.code]" [attr.aria-label]="k.name">
            <img
              [src]="src(k)"
              [attr.srcset]="srcset(k)"
              sizes="(min-width: 800px) 800px, 100vw"
              width="800"
              height="450"
              loading="lazy"
              [alt]="k.name"
            />
            <span class="caption">{{ k.name }}</span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class HomePage implements OnInit {
  private readonly svc = inject(KindService);
  protected readonly kinds = signal<KindSummary[]>([]);
  protected readonly error = signal('');

  protected src(k: KindSummary): string {
    return `${k.image}-${Math.max(...k.imageWidths)}.jpg`;
  }

  protected srcset(k: KindSummary): string {
    return k.imageWidths.map((w) => `${k.image}-${w}.jpg ${w}w`).join(', ');
  }

  async ngOnInit(): Promise<void> {
    try {
      this.kinds.set(await this.svc.getKinds());
    } catch {
      this.error.set('Could not load the list of collectables.');
    }
  }
}
