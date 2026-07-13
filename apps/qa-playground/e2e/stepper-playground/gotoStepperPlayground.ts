import { expect, type Page } from 'playwright/test';

import { STEPPER_PLAYGROUND_ROUTE, STEPPER_SMOKE_TESTID } from './manifest';
import { stepperByTestId } from './stepperHelpers';

export async function gotoStepperPlayground(page: Page): Promise<void> {
  await page.goto(STEPPER_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await stepperByTestId(page, STEPPER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
