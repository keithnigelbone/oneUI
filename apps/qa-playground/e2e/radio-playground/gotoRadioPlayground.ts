import { expect, type Page } from 'playwright/test';

import { RADIO_PLAYGROUND_ROUTE, RADIO_ROOT_TESTIDS } from './manifest';
import { radioByTestId } from './radioHelpers';

export async function gotoRadioPlayground(page: Page): Promise<void> {
  await page.goto(RADIO_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await radioByTestId(page, RADIO_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
}
