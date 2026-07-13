/**
 * Shared helpers for SegmentedControl Playwright automation.
 */
export {
  axeSegmentedControlPlayground,
  configureSegmentedControlAxeBuilder,
  formatAxeViolations,
  runSegmentedControlAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSegmentedControlAxeArtefact,
  writeSegmentedControlAxeHtmlReport,
} from '../segmented-control-playground/axeSegmentedControlPlayground';
export {
  defaultBandButtons,
  expectFocusVisible,
  rgbaAlpha,
  scByTestId,
  scGroupBackgroundRgb,
  scGroupRoot,
  scPressedSegmentFillRgb,
  scSection,
  scByTestIdInSection,
  scPressedSegmentButtons,
  scSegmentButtons,
  scWrapperBox,
  scrollToScTestId,
  selectedSegmentButton,
  canonicalSegmentButtons,
} from '../segmented-control-playground/segmentedControlHelpers';
export { gotoSegmentedControlPlayground } from '../segmented-control-playground/gotoSegmentedControlPlayground';

import { expect, test, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  SEGMENTED_CONTROL_PLAYGROUND_ROUTE,
  SEGMENTED_CONTROL_ROOT_TESTIDS,
  SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE,
} from '../segmented-control-playground/manifest';
import { scByTestId } from '../segmented-control-playground/segmentedControlHelpers';

export { SEGMENTED_CONTROL_PLAYGROUND_ROUTE, SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE };

export const SegmentedControlTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const SC_TAG_SET = {
  functional: [SegmentedControlTags.functional],
  accessibility: [SegmentedControlTags.accessibility],
  visual: ['@Visual'],
  smoke: [SegmentedControlTags.functional, SegmentedControlTags.smoke],
} as const;

const LOG_PREFIX = '[SegmentedControl QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openSegmentedControlTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Segmented Control playground', async () => {
    await page.goto(SEGMENTED_CONTROL_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab (ignore Brand / Theme toolbar)', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Segmented Control', level: 1 })).toBeVisible();
    await scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default).waitFor({
      state: 'visible',
      timeout: 90_000,
    });
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
    `Browser console should have no errors during SegmentedControl scenario load.\n${errors.join('\n')}`,
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
