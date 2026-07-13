import { expect, type Page } from 'playwright/test';

import { TOOLTIP_PLAYGROUND_ROUTE, TOOLTIP_SMOKE_TESTID } from './manifest';
import { wrapByTestId } from './tooltipHelpers';

export async function gotoTooltipPlayground(page: Page): Promise<void> {
  await page.goto(TOOLTIP_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await wrapByTestId(page, TOOLTIP_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
