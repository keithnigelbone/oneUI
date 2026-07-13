import { expect, type Page } from 'playwright/test';

import { STB_PLAYGROUND_ROUTE, STB_SMOKE_TESTID } from './manifest';
import { stbByTestId } from './singleTextButtonHelpers';

export async function gotoSingleTextButtonPlayground(page: Page): Promise<void> {
  await page.goto(STB_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await stbByTestId(page, STB_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
