import { ChangeDetectionStrategy, Component } from '@angular/core';

const SPONSORS: readonly string[] = [];

@Component({
  selector: 'app-sponsors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Sponsors</h1>
    <p>
      SwapOkay is a labour of love, and it wouldn't be the same without the kind people who give their time or money
      to help it along. Thank you!
    </p>
    <p>
      Would you like to contribute? We'd be delighted to hear from you! Just contact the web author at
      <a href="mailto:wjcay4pz7@mozmail.com">wjcay4pz7&#64;mozmail.com</a>, and your name or message will be posted
      on this page as a thank-you.
    </p>
    <h2>Thanks</h2>
    @if (sponsors.length) {
      <ul>
        @for (s of sponsors; track s) {
          <li>{{ s }}</li>
        }
      </ul>
    } @else {
      <p>Our list of friends to thank is waiting for its first name. Could it be yours?</p>
    }
  `,
})
export class SponsorsPage {
  protected readonly sponsors = SPONSORS;
}
