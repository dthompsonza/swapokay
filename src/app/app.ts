import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SoundService } from './core/sound.service';
import { ImportModal } from './shared/import-modal';
import { SharedCollection } from './shared/shared-collection';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ImportModal, SharedCollection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'menuOpen.set(false)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <header class="top">
      <a routerLink="/" class="logo"><img src="swapokay-header.png" alt="SwapOkay" width="200" height="122" /></a>
      <nav class="menu">
        <button
          type="button"
          class="menu-button"
          aria-label="Menu"
          aria-haspopup="true"
          [attr.aria-expanded]="menuOpen()"
          (click)="menuOpen.set(!menuOpen())"
        >
          <svg class="burger" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="menu-text" aria-hidden="true">MENU</span>
        </button>
        @if (menuOpen()) {
          <ul class="menu-panel">
            <li><a routerLink="/" (click)="menuOpen.set(false)">Home</a></li>
            <li><a routerLink="/about" (click)="menuOpen.set(false)">About</a></li>
            <li><a routerLink="/sponsors" (click)="menuOpen.set(false)">Sponsors</a></li>
            <li><button type="button" (click)="openImport()">Import</button></li>
          </ul>
        }
      </nav>
    </header>
    @if (importOpen()) {
      <app-import-modal (closed)="importOpen.set(false)" />
    }
    @if (sharedCode(); as code) {
      <app-shared-collection [code]="code" (closed)="closeShared()" />
    }
    <div class="controls">
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
    </div>
    <main><router-outlet /></main>
  `,
})
export class App {
  protected readonly sound = inject(SoundService);
  protected readonly menuOpen = signal(false);
  protected readonly importOpen = signal(false);
  protected readonly sharedCode = signal(new URLSearchParams(location.search).get('collection') ?? '');

  protected closeShared(): void {
    this.sharedCode.set('');
    const url = new URL(location.href);
    url.searchParams.delete('collection');
    history.replaceState(null, '', url);
  }
  private readonly host = inject(ElementRef<HTMLElement>);

  protected openImport(): void {
    this.menuOpen.set(false);
    this.importOpen.set(true);
  }

  protected onDocumentClick(event: Event): void {
    const nav = (this.host.nativeElement as HTMLElement).querySelector('.menu');
    if (!nav?.contains(event.target as Node)) this.menuOpen.set(false);
  }
}
