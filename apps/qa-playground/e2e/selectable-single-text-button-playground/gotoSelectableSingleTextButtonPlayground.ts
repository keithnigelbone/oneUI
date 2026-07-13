import { expect, type Page } from 'playwright/test';

import { SSTB_PLAYGROUND_ROUTE, SSTB_SMOKE_TESTID } from './manifest';
import { sstbByTestId } from './selectableSingleTextButtonHelpers';

export async function gotoSelectableSingleTextButtonPlayground(page: Page): Promise<void> {
  await page.goto(SSTB_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await sstbByTestId(page, SSTB_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
