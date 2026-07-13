/**
 * Shared helpers for Input Field Playwright automation.
 */
export {
  formatAxeViolations,
  runIffAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeIffAxeArtefact,
  writeIffAxeHtmlReport,
} from '../input-field-playground/axeInputFieldPlayground';
export {
  gotoInputFieldPlayground,
  openInputFieldFigmaValidationTab,
  openInputFieldTestScenarios,
} from '../input-field-playground/gotoInputFieldPlayground';

import { expect, test, type Page } from 'playwright/test';

import { IFF_SHOWCASE_AXE_SCOPE, INPUT_FIELD_PLAYGROUND_ROUTE } from '../input-field-playground/manifest';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

export { IFF_SHOWCASE_AXE_SCOPE, INPUT_FIELD_PLAYGROUND_ROUTE };

export const IffTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
  regression: '@Regression',
} as const;

export const IFF_TAG_SET = {
  functional: [IffTags.functional],
  accessibility: [IffTags.accessibility],
  smoke: [IffTags.functional, IffTags.smoke],
  regression: [IffTags.functional, IffTags.regression],
} as const;

const LOG_PREFIX = '[Input Field QA]';

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
    `Browser console should have no errors during Input Field scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

export async function expectSectionVisible(page: Page, sectionId: string): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
}
