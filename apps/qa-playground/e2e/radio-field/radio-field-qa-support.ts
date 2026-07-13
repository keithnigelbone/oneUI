/**
 * Shared helpers for RadioField Playwright automation.
 */
export {
  formatAxeViolations,
  runRadioFieldAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeRadioFieldAxeArtefact,
  writeRadioFieldAxeHtmlReport,
} from '../radio-field-playground/axeRadioFieldPlayground';
export {
  expectFocusRingVisible,
  expectNoErrorText,
  fieldByTestId,
  fieldRadioBox,
  fieldSection,
  firstRadioInField,
  radioIndicatorBackgroundRgbInField,
  radiosInField,
  rgbaAlpha,
  scrollToSection,
} from '../radio-field-playground/radioFieldHelpers';
export { gotoRadioFieldPlayground } from '../radio-field-playground/gotoRadioFieldPlayground';

import { expect, test, type Page } from 'playwright/test';

import {
  assertModeSelectActivatesWithKey as assertModeSelectActivatesWithKeyCore,
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';
import {
  RADIO_FIELD_PLAYGROUND_ROUTE,
  RADIO_FIELD_SHOWCASE_AXE_SCOPE,
  RADIO_FIELD_SMOKE_TESTID,
} from '../radio-field-playground/manifest';
import { fieldByTestId } from '../radio-field-playground/radioFieldHelpers';

export { RADIO_FIELD_PLAYGROUND_ROUTE, RADIO_FIELD_SHOWCASE_AXE_SCOPE };

export const RadioFieldTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const RADIO_FIELD_TAG_SET = {
  functional: [RadioFieldTags.functional],
  accessibility: [RadioFieldTags.accessibility],
  smoke: [RadioFieldTags.functional, RadioFieldTags.smoke],
} as const;

const LOG_PREFIX = '[RadioField QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openRadioFieldTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to RadioField playground', async () => {
    await page.goto(RADIO_FIELD_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Radio Field', level: 1 })).toBeVisible();
    await fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle theme using the toolbar control', () => clickPageThemeButtonCore(page));
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function assertThemeActivatesWithKey(page: Page, key: 'Enter' | 'Space'): Promise<void> {
  await qaStep(`Activate theme control with ${key}`, () =>
    assertModeSelectActivatesWithKeyCore(page, key),
  );
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
    `Browser console should have no errors during RadioField scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function expectSectionVisible(page: Page, sectionId: string): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
}
