/**
 * Shared helpers for Selectable Icon Button Playwright automation.
 */
export {
  formatAxeViolations,
  runSibAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSibAxeArtefact,
  writeSibAxeHtmlReport,
} from '../selectable-icon-button-playground/axeSelectableIconButtonPlayground';
export {
  computedButtonBackgroundRgb,
  computedSvgFillRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  rgbaAlpha,
  scrollToSection,
  sibByTestId,
} from '../selectable-icon-button-playground/selectableIconButtonHelpers';
export { gotoSelectableIconButtonPlayground } from '../selectable-icon-button-playground/gotoSelectableIconButtonPlayground';

import { expect, test, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  SIB_PLAYGROUND_ROUTE,
  SIB_SHOWCASE_AXE_SCOPE,
  SIB_SMOKE_TESTID,
} from '../selectable-icon-button-playground/manifest';
import { sibByTestId } from '../selectable-icon-button-playground/selectableIconButtonHelpers';

export { SIB_PLAYGROUND_ROUTE, SIB_SHOWCASE_AXE_SCOPE };

export const SelectableIconButtonTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const SIB_TAG_SET = {
  functional: [SelectableIconButtonTags.functional],
  accessibility: [SelectableIconButtonTags.accessibility],
  smoke: [SelectableIconButtonTags.functional, SelectableIconButtonTags.smoke],
} as const;

const LOG_PREFIX = '[SelectableIconButton QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openSelectableIconButtonTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Selectable Icon Button playground', async () => {
    await page.goto(SIB_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Selectable Icon Button', level: 1 })).toBeVisible();
    await sibByTestId(page, SIB_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during Selectable Icon Button scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

