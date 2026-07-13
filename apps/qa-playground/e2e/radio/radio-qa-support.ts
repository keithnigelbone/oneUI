/**
 * Shared helpers for Radio Playwright automation.
 */
export {
  configureRadioAxeBuilder,
  formatAxeViolations,
  runRadioAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeRadioAxeArtefact,
  writeRadioAxeHtmlReport,
} from '../radio-playground/axeRadioPlayground';
export {
  defaultBandRadios,
  expectFocusVisible,
  radioBox,
  radioByTestId,
  radioIndicatorBackgroundRgb,
  radioSection,
  rgbaAlpha,
  scrollToRadioTestId,
} from '../radio-playground/radioHelpers';
export { gotoRadioPlayground } from '../radio-playground/gotoRadioPlayground';

import { expect, test, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import { RADIO_PLAYGROUND_ROUTE, RADIO_ROOT_TESTIDS, RADIO_SHOWCASE_AXE_SCOPE } from '../radio-playground/manifest';
import { radioByTestId } from '../radio-playground/radioHelpers';

export { RADIO_PLAYGROUND_ROUTE, RADIO_SHOWCASE_AXE_SCOPE };

export const RadioTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const RADIO_TAG_SET = {
  functional: [RadioTags.functional],
  accessibility: [RadioTags.accessibility],
  smoke: [RadioTags.functional, RadioTags.smoke],
} as const;

const LOG_PREFIX = '[Radio QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openRadioTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Radio playground', async () => {
    await page.goto(RADIO_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Radio', level: 1 })).toBeVisible();
    await radioByTestId(page, RADIO_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during Radio scenario load.\n${errors.join('\n')}`,
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

