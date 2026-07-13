import { expect, type Page } from 'playwright/test';

import { SIB_PLAYGROUND_ROUTE, SIB_SMOKE_TESTID } from './manifest';
import { sibByTestId } from './selectableIconButtonHelpers';

export async function gotoSelectableIconButtonPlayground(page: Page): Promise<void> {
  await page.goto(SIB_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await sibByTestId(page, SIB_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
