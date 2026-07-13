import { expect, type Page } from 'playwright/test';

import { SLIDER_PLAYGROUND_ROUTE, SLIDER_SMOKE_TESTID } from './manifest';
import { sliderByTestId } from './sliderHelpers';

export async function gotoSliderPlayground(page: Page): Promise<void> {
  await page.goto(SLIDER_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await sliderByTestId(page, SLIDER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
