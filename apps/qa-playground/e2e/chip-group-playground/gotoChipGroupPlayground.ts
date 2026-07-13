import type { Page } from 'playwright/test';

import { openChipGroupTestScenarios } from '../chip-group/chip-group-qa-support';

/** @deprecated use `openChipGroupTestScenarios` from `chip-group/chip-group-qa-support`. */
export async function gotoChipGroupPlayground(page: Page): Promise<void> {
  await openChipGroupTestScenarios(page);
}
