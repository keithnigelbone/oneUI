import { expect, type Page } from 'playwright/test';

import { MODAL_PLAYGROUND_ROUTE } from './manifest';

export async function gotoModalPlayground(page: Page): Promise<void> {
  await page.goto(MODAL_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await expect(page.getByRole('heading', { name: 'Modal', level: 1 })).toBeVisible();
}
