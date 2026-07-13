import { expect, type Page } from 'playwright/test';

import {
  PAGINATION_DOTS_ARIA,
  PAGINATION_DOTS_PLAYGROUND_ROUTE,
  PAGINATION_DOTS_ROOT_TESTIDS,
} from './manifest';
import { dotsTablist } from './paginationDotsHelpers';

/** Opens Pagination Dots QA and waits for the default instance. */
export async function gotoPaginationDotsPlayground(page: Page): Promise<void> {
  await page.goto(PAGINATION_DOTS_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await dotsTablist(
    page,
    PAGINATION_DOTS_ARIA.default,
    PAGINATION_DOTS_ROOT_TESTIDS.default,
  ).waitFor({ state: 'visible', timeout: 90_000 });
}
