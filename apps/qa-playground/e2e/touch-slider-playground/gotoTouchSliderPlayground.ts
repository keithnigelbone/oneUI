import { expect, type Page } from 'playwright/test';

import { TOUCH_SLIDER_PLAYGROUND_ROUTE, TOUCH_SLIDER_SMOKE_TESTID } from './manifest';
import { touchSliderByTestId } from './touchSliderHelpers';

export async function gotoTouchSliderPlayground(page: Page): Promise<void> {
  await page.goto(TOUCH_SLIDER_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await touchSliderByTestId(page, TOUCH_SLIDER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
