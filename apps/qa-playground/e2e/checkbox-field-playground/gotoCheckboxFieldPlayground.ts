import type { Page } from 'playwright/test';
import { openCheckboxFieldTestScenarios } from '../checkbox-field/checkbox-field-qa-support';

export async function gotoCheckboxFieldPlayground(page: Page): Promise<void> {
  await openCheckboxFieldTestScenarios(page);
}
