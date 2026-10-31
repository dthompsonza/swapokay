import { Injectable, signal } from '@angular/core';

const KEY = 'swapokay.sound.v1';

@Injectable({ providedIn: 'root' })
export class SoundService {
  readonly enabled = signal(this.load());

  toggle(): void {
    this.enabled.update((v) => !v);
    try {
      localStorage.setItem(KEY, JSON.stringify(this.enabled()));
    } catch {
      // Storage unavailable; setting lasts for this session only.
    }
  }

  private load(): boolean {
    try {
      return localStorage.getItem(KEY) !== 'false';
    } catch {
      return true;
    }
  }
}
