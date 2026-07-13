import { expect, type Page } from 'playwright/test';

import { SEGMENTED_CONTROL_PLAYGROUND_ROUTE, SEGMENTED_CONTROL_ROOT_TESTIDS } from './manifest';

export async function gotoSegmentedControlPlayground(page: Page): Promise<void> {
  await page.goto(SEGMENTED_CONTROL_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await page.getByTestId(SEGMENTED_CONTROL_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
}
