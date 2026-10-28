import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import * as QRCode from 'qrcode';
import { Modal } from './modal';

@Component({
  selector: 'app-qr-show',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal title="Collection QR code" (closed)="closed.emit()">
      <div class="body">
        <h2>Share this collection</h2>
        @if (dataUrl(); as url) {
          <img [src]="url" alt="QR code for this collection" />
        }
        <code>{{ text() }}</code>
        <button type="button" (click)="copy()">{{ copied() ? 'Copied!' : 'Copy code' }}</button>
      </div>
    </app-modal>
  `,
  styles: `
    .body { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    h2 { margin: 0; font-size: 1.1rem; }
    img { width: min(80vw, 18rem); height: auto; image-rendering: pixelated; }
    code { font-size: 0.75rem; word-break: break-all; text-align: center; }
  `,
})
export class QrShow implements OnInit {
  readonly text = input.required<string>();
  readonly closed = output<void>();
  protected readonly dataUrl = signal('');
  protected readonly copied = signal(false);

  async ngOnInit(): Promise<void> {
    this.dataUrl.set(await QRCode.toDataURL(this.text(), { errorCorrectionLevel: 'M', margin: 2, width: 400 }));
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.text());
      this.copied.set(true);
    } catch {
      // Clipboard unavailable; the code is visible for manual copying.
    }
  }
}
