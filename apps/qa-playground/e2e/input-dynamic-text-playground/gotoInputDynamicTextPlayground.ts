import { expect, type Page } from 'playwright/test';

import { IDT_ROOT_TESTIDS, INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE } from './manifest';
import { dynamicTextByTestId } from './inputDynamicTextHelpers';

export async function gotoInputDynamicTextPlayground(page: Page): Promise<void> {
  await page.goto(INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await dynamicTextByTestId(page, IDT_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
}
