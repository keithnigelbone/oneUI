import { expect, type Page } from 'playwright/test';

import { INPUT_PLAYGROUND_ROUTE, INPUT_ROOT_TESTIDS } from './manifest';
import { inputByTestId } from './inputHelpers';

export async function gotoInputPlayground(page: Page): Promise<void> {
  await page.goto(INPUT_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await inputByTestId(page, INPUT_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
}
