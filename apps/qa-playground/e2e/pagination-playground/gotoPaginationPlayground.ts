import { expect, type Page } from 'playwright/test';

import { PAGINATION_PLAYGROUND_ROUTE, PAGINATION_ROOT_TESTIDS } from './manifest';

/** Opens Pagination QA and waits for the default navigator. */
export async function gotoPaginationPlayground(page: Page): Promise<void> {
  await page.goto(PAGINATION_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await page.getByTestId(PAGINATION_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
}
