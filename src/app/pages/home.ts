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
    <ul class="list">
      @for (k of kinds(); track k.code) {
        <li><a [routerLink]="['/kind', k.code]">{{ k.name }}</a></li>
      }
    </ul>
  `,
})
export class HomePage implements OnInit {
  private readonly svc = inject(KindService);
  protected readonly kinds = signal<KindSummary[]>([]);
  protected readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.kinds.set(await this.svc.getKinds());
    } catch {
      this.error.set('Could not load the list of collectables.');
    }
  }
}
