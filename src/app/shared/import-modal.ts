import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { decodeCollection, peekKindCode } from '../core/collection-codec';
import { CollectionStore } from '../core/collection-store';
import { KindService } from '../core/kind.service';
import { Modal } from './modal';

@Component({
  selector: 'app-import-modal',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal title="Import Collection" (closed)="closed.emit()">
      <h2>Import Collection</h2>
      <label for="import-text">Collection code</label>
      <textarea id="import-text" rows="5" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
      <div class="actions">
        <button type="button" class="btn" (click)="paste()">Paste</button>
        <button type="button" class="btn primary" [disabled]="!text().trim()" (click)="import()">Import</button>
      </div>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
    </app-modal>
  `,
  styles: `
    h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
    label { display: block; margin-bottom: 0.5rem; }
    textarea { width: 100%; box-sizing: border-box; font: inherit; }
    .actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .error { color: #b00020; }
  `,
})
export class ImportModal {
  private readonly store = inject(CollectionStore);
  private readonly kinds = inject(KindService);
  private readonly router = inject(Router);
  readonly closed = output<void>();

  protected readonly text = signal('');
  protected readonly error = signal('');

  protected async paste(): Promise<void> {
    try {
      this.text.set(await navigator.clipboard.readText());
      this.error.set('');
    } catch {
      this.error.set('Could not read the clipboard. Paste the code into the box instead.');
    }
  }

  protected async import(): Promise<void> {
    const raw = this.text().trim();
    const kindCode = peekKindCode(raw);
    if (!kindCode) return this.error.set('This is not a valid collection code.');
    let itemCount: number;
    try {
      itemCount = (await this.kinds.getKind(kindCode)).items.length;
    } catch {
      return this.error.set(`Unknown collectible kind "${kindCode}".`);
    }
    const decoded = decodeCollection(raw, kindCode, itemCount);
    if (!decoded.ok) return this.error.set(decoded.error);
    const { kind, name, counts, icon } = decoded.value;
    const lower = name.toLowerCase();
    if (this.store.namesForKind(kind).some((n) => n.toLowerCase() === lower)) {
      return this.error.set('A collection with the same name already exists.');
    }
    this.store.import(kind, name, counts, icon);
    this.closed.emit();
    await this.router.navigate(['/kind', kind]);
  }
}
