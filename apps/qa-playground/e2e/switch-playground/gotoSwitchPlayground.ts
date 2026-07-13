import { expect, type Page } from 'playwright/test';

import { SWITCH_PLAYGROUND_ROUTE, SWITCH_SMOKE_TESTID } from './manifest';
import { switchByTestId } from './switchHelpers';

export async function gotoSwitchPlayground(page: Page): Promise<void> {
  await page.goto(SWITCH_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await switchByTestId(page, SWITCH_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
