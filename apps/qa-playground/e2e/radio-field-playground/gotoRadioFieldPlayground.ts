import { expect, type Page } from 'playwright/test';

import { RADIO_FIELD_PLAYGROUND_ROUTE } from './manifest';

export async function gotoRadioFieldPlayground(page: Page): Promise<void> {
  await page.goto(RADIO_FIELD_PLAYGROUND_ROUTE);
  await expect(page.getByRole('heading', { name: 'Radio Field', level: 1 })).toBeVisible();
}
