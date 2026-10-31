import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SoundService } from './core/sound.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="top">
      <a routerLink="/">SwapOkay</a>
      <button
        type="button"
        class="sound-toggle"
        [attr.aria-label]="sound.enabled() ? 'Mute sounds' : 'Unmute sounds'"
        [attr.aria-pressed]="!sound.enabled()"
        (click)="sound.toggle()"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
          @if (sound.enabled()) {
            <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
          } @else {
            <path d="m16 9 6 6M22 9l-6 6" />
          }
        </svg>
      </button>
    </header>
    <main><router-outlet /></main>
  `,
})
export class App {
  protected readonly sound = inject(SoundService);
}
