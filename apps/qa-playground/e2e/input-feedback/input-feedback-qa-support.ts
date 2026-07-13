/**
 * Shared helpers for Input Feedback Playwright automation.
 */
export {
  formatAxeViolations,
  runIfbAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeIfbAxeArtefact,
  writeIfbAxeHtmlReport,
} from '../input-feedback-playground/axeInputFeedbackPlayground';
export {
  gotoInputFeedbackPlayground,
  openInputFeedbackFigmaValidationTab,
  openInputFeedbackTestScenarios,
} from '../input-feedback-playground/gotoInputFeedbackPlayground';

import { expect, test, type Page } from 'playwright/test';

import {
  assertModeSelectActivatesWithKey as assertModeSelectActivatesWithKeyCore,
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';
import { IFB_SHOWCASE_AXE_SCOPE, INPUT_FEEDBACK_PLAYGROUND_ROUTE } from '../input-feedback-playground/manifest';

export { IFB_SHOWCASE_AXE_SCOPE, INPUT_FEEDBACK_PLAYGROUND_ROUTE };

export const IfbTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const IFB_TAG_SET = {
  functional: [IfbTags.functional],
  accessibility: [IfbTags.accessibility],
  smoke: [IfbTags.functional, IfbTags.smoke],
} as const;

const LOG_PREFIX = '[Input Feedback QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
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
    `Browser console should have no errors during Input Feedback scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function expectSectionVisible(page: Page, sectionId: string): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle theme using the toolbar control', () => clickPageThemeButtonCore(page));
}

export async function assertThemeActivatesWithKey(page: Page, key: 'Enter' | 'Space'): Promise<void> {
  await qaStep(`Activate theme control with ${key}`, () =>
    assertModeSelectActivatesWithKeyCore(page, key),
  );
}

