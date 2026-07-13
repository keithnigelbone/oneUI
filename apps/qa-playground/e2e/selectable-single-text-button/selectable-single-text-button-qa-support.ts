/**
 * Shared helpers for Selectable Single Text Button Playwright automation.
 */
export {
  formatAxeViolations,
  runSstbAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSstbAxeArtefact,
  writeSstbAxeHtmlReport,
} from '../selectable-single-text-button-playground/axeSelectableSingleTextButtonPlayground';
export {
  computedButtonBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  scrollToSection,
  sstbByTestId,
} from '../selectable-single-text-button-playground/selectableSingleTextButtonHelpers';
export { gotoSelectableSingleTextButtonPlayground } from '../selectable-single-text-button-playground/gotoSelectableSingleTextButtonPlayground';

import { expect, test, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  SSTB_PLAYGROUND_ROUTE,
  SSTB_SHOWCASE_AXE_SCOPE,
  SSTB_SMOKE_TESTID,
} from '../selectable-single-text-button-playground/manifest';
import { sstbByTestId } from '../selectable-single-text-button-playground/selectableSingleTextButtonHelpers';

export { SSTB_PLAYGROUND_ROUTE, SSTB_SHOWCASE_AXE_SCOPE };

export const SelectableSingleTextButtonTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const SSTB_TAG_SET = {
  functional: [SelectableSingleTextButtonTags.functional],
  accessibility: [SelectableSingleTextButtonTags.accessibility],
  smoke: [SelectableSingleTextButtonTags.functional, SelectableSingleTextButtonTags.smoke],
} as const;

const LOG_PREFIX = '[SelectableSingleTextButton QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openSelectableSingleTextButtonTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Selectable Single Text Button playground', async () => {
    await page.goto(SSTB_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Selectable Single Text Button', level: 1 })).toBeVisible();
    await sstbByTestId(page, SSTB_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during Selectable Single Text Button scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

