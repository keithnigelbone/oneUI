/**
 * Shared helpers for Single Text Button Playwright automation.
 */
export {
  formatAxeViolations,
  runStbAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeStbAxeArtefact,
  writeStbAxeHtmlReport,
} from '../single-text-button-playground/axeSingleTextButtonPlayground';
export {
  computedButtonBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  scrollToSection,
  stbButton,
  stbByTestId,
} from '../single-text-button-playground/singleTextButtonHelpers';
export { gotoSingleTextButtonPlayground } from '../single-text-button-playground/gotoSingleTextButtonPlayground';

import { expect, test, type Page } from 'playwright/test';

import {
  STB_PLAYGROUND_ROUTE,
  STB_SHOWCASE_AXE_SCOPE,
  STB_SMOKE_TESTID,
} from '../single-text-button-playground/manifest';
import { stbByTestId } from '../single-text-button-playground/singleTextButtonHelpers';

export { STB_PLAYGROUND_ROUTE, STB_SHOWCASE_AXE_SCOPE };

export const SingleTextButtonTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const STB_TAG_SET = {
  functional: [SingleTextButtonTags.functional],
  accessibility: [SingleTextButtonTags.accessibility],
  smoke: [SingleTextButtonTags.functional, SingleTextButtonTags.smoke],
} as const;

const LOG_PREFIX = '[SingleTextButton QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openSingleTextButtonTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Single Text Button playground', async () => {
    await page.goto(STB_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Single Text Button', level: 1 })).toBeVisible();
    await stbByTestId(page, STB_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export function attachConsoleErrorCollector(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

export async function assertNoConsoleErrors(errors: string[]): Promise<void> {
  expect(
    errors,
    `Browser console should have no errors during Single Text Button scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}
