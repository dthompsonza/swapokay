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
    <p>
      <a
        class="repo-link"
        href="https://github.com/dthompsonza/swapokay"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="24" height="24" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
          />
        </svg>
        View SwapOkay on GitHub
      </a>
    </p>
  `,
  styles: `
    .repo-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 44px;
    }
  `,
})
export class AboutPage {}
