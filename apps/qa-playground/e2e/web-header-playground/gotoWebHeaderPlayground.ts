import { expect, type Page } from 'playwright/test';

import { WEB_HEADER_PLAYGROUND_ROUTE, WEB_HEADER_SMOKE_TESTID } from './manifest';
import { webHeaderByTestId } from './webHeaderHelpers';

export async function gotoWebHeaderPlayground(page: Page): Promise<void> {
  await page.goto(WEB_HEADER_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await webHeaderByTestId(page, WEB_HEADER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
