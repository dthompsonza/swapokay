import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { COUNT_MAX, COUNT_MIN, clampCount } from '../core/collection-codec';
import { CollectibleItem } from '../core/models';
import { Modal } from './modal';

@Component({
  selector: 'app-item-modal',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="item().description" (closed)="closed.emit()">
      <div class="body">
        <img [src]="item().image" [alt]="item().name" />
        <h2>{{ item().description }}</h2>
        <div class="counter">
          <button type="button" aria-label="Decrease count" [disabled]="count() <= min" (click)="countChange.emit(clamp(count() - 1))">−</button>
          <input
            type="text"
            inputmode="numeric"
            maxlength="3"
            aria-label="Count"
            [value]="count()"
            (input)="onInput($event)"
            (blur)="resetField($event)"
          />
          <button type="button" aria-label="Increase count" [disabled]="count() >= max" (click)="countChange.emit(clamp(count() + 1))">+</button>
        </div>
      </div>
    </app-modal>
  `,
  styles: `
    .body { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    img { width: min(70vw, 14rem); height: auto; }
    h2 { margin: 0; font-size: 1.1rem; text-align: center; }
    .counter { display: flex; align-items: center; gap: 0.5rem; }
    .counter button { width: 44px; height: 44px; font-size: 1.5rem; border-radius: 8px; border: 1px solid #bbb; background: #f4f4f4; cursor: pointer; }
    .counter button:disabled { opacity: 0.4; cursor: default; }
    .counter input { width: 5rem; height: 44px; text-align: center; font-size: 1.25rem; border: 1px solid #bbb; border-radius: 8px; }
  `,
})
export class ItemModal {
  readonly item = input.required<CollectibleItem>();
  readonly count = input.required<number>();
  readonly countChange = output<number>();
  readonly closed = output<void>();

  protected readonly min = COUNT_MIN;
  protected readonly max = COUNT_MAX;
  protected readonly clamp = clampCount;

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '');
    if (digits === '') return;
    const value = clampCount(parseInt(digits, 10));
    el.value = String(value);
    this.countChange.emit(value);
  }

  protected resetField(event: Event): void {
    (event.target as HTMLInputElement).value = String(this.count());
  }
}
