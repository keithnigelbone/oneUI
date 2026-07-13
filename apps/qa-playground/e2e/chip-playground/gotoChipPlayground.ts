import type { Page } from 'playwright/test';

import { openChipTestScenarios } from '../chip/chip-qa-support';

/** @deprecated use `openChipTestScenarios` from `chip/chip-qa-support`. */
export async function gotoChipPlayground(page: Page): Promise<void> {
  await openChipTestScenarios(page);
}
