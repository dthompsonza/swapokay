import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { COLLECTION_ICONS, iconPath } from '../core/collection-icons';

@Component({
  selector: 'app-icon-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="picker" role="radiogroup" aria-label="Collection icon">
      @for (icon of icons; track icon; let i = $index) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="icon === selected()"
          [attr.aria-label]="'Icon ' + (i + 1)"
          [class.on]="icon === selected()"
          (click)="selectedChange.emit(icon)"
        >
          <img [src]="path(icon)" alt="" />
        </button>
      }
    </div>
  `,
  styles: `
    .picker { display: grid; grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr)); gap: 0.25rem; max-height: 14rem; overflow: auto; }
    button { min-height: 44px; padding: 0.25rem; border: 2px solid transparent; border-radius: 8px; background: none; cursor: pointer; }
    button.on { border-color: #0b5ed7; background: #e7f0ff; }
    img { width: 100%; height: 2.25rem; object-fit: contain; pointer-events: none; }
  `,
})
export class IconPicker {
  readonly selected = input.required<string>();
  readonly selectedChange = output<string>();
  protected readonly icons = COLLECTION_ICONS;
  protected path = iconPath;
}
