import { expect, type Page } from 'playwright/test';

import { TABS_PLAYGROUND_ROUTE, TABS_ROOT_TESTIDS } from './manifest';
import { tabsList } from './tabsHelpers';

/** Opens Tabs QA and waits for the primary horizontal orientation strip. */
export async function gotoTabsPlayground(page: Page): Promise<void> {
  await page.goto(TABS_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await tabsList(page, TABS_ROOT_TESTIDS.horizontal).waitFor({ state: 'visible', timeout: 90_000 });
}
