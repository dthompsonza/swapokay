import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <div class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="title()" (click)="$event.stopPropagation()">
        <button type="button" class="close" aria-label="Close" (click)="closed.emit()">×</button>
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.55); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 100; }
    .dialog { position: relative; background: #fff; border-radius: 12px; padding: 1.5rem 1.25rem 1.25rem; width: min(100%, 26rem); max-height: 100%; overflow: auto; }
    .close { position: absolute; top: 0.25rem; right: 0.25rem; width: 44px; height: 44px; border: 0; background: none; font-size: 1.75rem; cursor: pointer; }
  `,
})
export class Modal {
  readonly title = input('');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
