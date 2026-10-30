import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import * as QRCode from 'qrcode';
import { iconPath } from '../core/collection-icons';
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
  readonly icon = input('');
  readonly closed = output<void>();
  protected readonly dataUrl = signal('');
  protected readonly copied = signal(false);

  async ngOnInit(): Promise<void> {
    const size = 400;
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, this.text(), { errorCorrectionLevel: 'H', margin: 2, width: size });
    const ctx = canvas.getContext('2d');
    if (ctx && this.icon()) {
      try {
        const img = await this.loadImage(iconPath(this.icon()));
        const box = Math.round(size * 0.22);
        const pad = Math.round(box * 0.12);
        const x = Math.round((size - box) / 2);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(x - pad, x - pad, box + pad * 2, box + pad * 2, pad);
        ctx.fill();
        ctx.drawImage(img, x, x, box, box);
      } catch {
        // Icon failed to load; the plain QR code is still valid.
      }
    }
    this.dataUrl.set(canvas.toDataURL('image/png'));
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('icon load failed'));
      img.src = src;
    });
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
