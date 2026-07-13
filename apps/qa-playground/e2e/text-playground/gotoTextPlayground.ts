import type { Page } from 'playwright/test';
import { openTextTestScenarios } from '../text/text-qa-support';

export async function gotoTextPlayground(page: Page): Promise<void> {
  await openTextTestScenarios(page);
}
