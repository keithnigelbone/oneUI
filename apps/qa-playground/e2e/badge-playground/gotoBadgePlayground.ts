import type { Page } from 'playwright/test';

import { BADGE_PLAYGROUND_ROUTE } from './manifest';

/** Opens the Badge QA page and waits for the default scenario badge. */
export async function gotoBadgePlayground(page: Page): Promise<void> {
  await page.goto(BADGE_PLAYGROUND_ROUTE);
  await page.getByTestId('badge-default').waitFor({ state: 'visible', timeout: 90_000 });
}
