import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, input, output, signal, viewChild } from '@angular/core';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { decodeCollection } from '../core/collection-codec';
import { CollectibleItem, itemLabel } from '../core/models';
import { SwapResult, computeSwap } from '../core/swap-diff';
import { Modal } from './modal';

@Component({
  selector: 'app-compare',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal title="Compare collections" (closed)="closed.emit()">
      <h2>Compare with another collection</h2>
      @if (result(); as r) {
        <p class="other">Compared with <strong>{{ otherName() }}</strong></p>
        <p>Possible swaps: <strong>{{ r.swaps }}</strong></p>
        <h3>You can give ({{ r.give.length }})</h3>
        @for (e of r.give; track e.item.code) {
          <div class="row"><img [src]="e.item.icon" alt="" /><span>{{ label(e.item) }}</span><b>×{{ e.quantity }}</b></div>
        } @empty {
          <p class="muted">Nothing to give.</p>
        }
        <h3>You can receive ({{ r.receive.length }})</h3>
        @for (e of r.receive; track e.item.code) {
          <div class="row"><img [src]="e.item.icon" alt="" /><span>{{ label(e.item) }}</span><b>×{{ e.quantity }}</b></div>
        } @empty {
          <p class="muted">Nothing to receive.</p>
        }
        <button type="button" (click)="reset()">Compare another</button>
      } @else {
        @if (scanning()) {
          <video #video playsinline muted></video>
          <button type="button" (click)="stopScan()">Stop camera</button>
        } @else {
          <button type="button" class="primary" (click)="startScan()">Scan QR code with camera</button>
        }
        <label for="paste">Or paste the collection code</label>
        <textarea id="paste" rows="3" [value]="pasted()" (input)="pasted.set($any($event.target).value)"></textarea>
        <button type="button" [disabled]="!pasted().trim()" (click)="compare(pasted())">Compare</button>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
      }
    </app-modal>
  `,
  styles: `
    h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
    h3 { margin: 1rem 0 0.25rem; font-size: 1rem; }
    video { width: 100%; border-radius: 8px; background: #000; }
    textarea { width: 100%; box-sizing: border-box; font: inherit; }
    button { min-height: 44px; margin: 0.5rem 0; padding: 0 1rem; border-radius: 8px; border: 1px solid #bbb; background: #f4f4f4; cursor: pointer; }
    button.primary { background: #0b5ed7; color: #fff; border-color: #0b5ed7; }
    .row { display: flex; align-items: center; gap: 0.5rem; min-height: 44px; }
    .row img { width: 36px; height: 36px; }
    .row span { flex: 1; }
    .muted { color: #666; margin: 0.25rem 0; }
    .error { color: #b00020; }
    .other { margin: 0; }
  `,
})
export class Compare implements OnDestroy {
  protected readonly label = itemLabel;
  readonly kindCode = input.required<string>();
  readonly items = input.required<CollectibleItem[]>();
  readonly mine = input.required<number[]>();
  readonly closed = output<void>();

  protected readonly pasted = signal('');
  protected readonly error = signal('');
  protected readonly scanning = signal(false);
  protected readonly otherName = signal('');
  protected readonly result = signal<SwapResult | null>(null);
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  private controls?: IScannerControls;
  private readonly itemCount = computed(() => this.items().length);

  async startScan(): Promise<void> {
    this.error.set('');
    this.scanning.set(true);
    // Wait for the <video> element to be rendered.
    await new Promise((resolve) => setTimeout(resolve));
    const video = this.video()?.nativeElement;
    if (!video) return;
    try {
      this.controls = await new BrowserQRCodeReader().decodeFromVideoDevice(undefined, video, (res) => {
        if (res) {
          this.stopScan();
          this.compare(res.getText());
        }
      });
    } catch {
      this.scanning.set(false);
      this.error.set('Could not access the camera. Allow camera access, or paste the code instead.');
    }
  }

  stopScan(): void {
    this.controls?.stop();
    this.controls = undefined;
    this.scanning.set(false);
  }

  compare(text: string): void {
    const decoded = decodeCollection(text, this.kindCode(), this.itemCount());
    if (!decoded.ok) {
      this.error.set(decoded.error);
      return;
    }
    this.error.set('');
    this.otherName.set(decoded.value.name);
    this.result.set(computeSwap(this.items(), this.mine(), decoded.value.counts));
  }

  protected reset(): void {
    this.result.set(null);
    this.pasted.set('');
    this.error.set('');
  }

  ngOnDestroy(): void {
    this.stopScan();
  }
}
