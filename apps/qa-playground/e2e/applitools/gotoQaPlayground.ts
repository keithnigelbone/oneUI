import { expect, type Page } from 'playwright/test';

import { ensureTestScenariosTab } from './helpers';

/** Opens a component QA page and waits for the first scenario band. */
export async function gotoQaPlayground(
  page: Page,
  route: string,
  firstSectionId: string,
): Promise<void> {
  await page.goto(route);
  await ensureTestScenariosTab(page);
  const firstBand = page.locator(`[data-section="${firstSectionId}"]`);
  await expect(firstBand).toBeVisible({ timeout: 90_000 });
}
