import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>About</h1>
    <p>
      Welcome to SwapOkay! This site lets you count how many of each collectible item you have, so you always know
      what's in your collection.
    </p>
    <p>
      Then, using the <strong>Show QR</strong> and <strong>Scan QR</strong> buttons, you can quickly compare with
      other people to see which items you can swap.
    </p>
    <p>
      SwapOkay is a personal, not-for-profit weekend project, built with the help of Copilot in a couple of hours.
    </p>
    <p>
      It was made to keep track of Checkers Collectables, but can and will be expanded to include other kinds of
      collectibles. We'd love to hear from you! Please contact the web author at
      <a href="mailto:wjcay4pz7@mozmail.com">wjcay4pz7&#64;mozmail.com</a> and share your suggestions.
    </p>
  `,
})
export class AboutPage {}
