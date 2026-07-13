import type { Page } from 'playwright/test';

import { openCheckboxTestScenarios } from '../checkbox/checkbox-qa-support';

/** @deprecated use `openCheckboxTestScenarios` from `checkbox/checkbox-qa-support`. */
export async function gotoCheckboxPlayground(page: Page): Promise<void> {
  await openCheckboxTestScenarios(page);
}
