import type { Page } from 'playwright/test';

import { openCpiTestScenarios } from '../circular-progress-indicator/cpi-qa-support';

/** @deprecated use `openCpiTestScenarios` from `circular-progress-indicator/cpi-qa-support`. */
export async function gotoCpiPlayground(page: Page): Promise<void> {
  await openCpiTestScenarios(page);
}
