import { expect, type Page } from 'playwright/test';

import {
  SELECTABLE_BUTTON_PLAYGROUND_ROUTE,
  SELECTABLE_BUTTON_ROOT_TESTIDS,
} from './manifest';
import { selectableButtonWrap } from './selectableButtonHelpers';

export async function gotoSelectableButtonPlayground(page: Page): Promise<void> {
  await page.goto(SELECTABLE_BUTTON_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await expect(page.getByRole('heading', { name: 'Selectable Button', level: 1 })).toBeVisible();
  await selectableButtonWrap(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default).waitFor({
    state: 'visible',
    timeout: 90_000,
  });
}
