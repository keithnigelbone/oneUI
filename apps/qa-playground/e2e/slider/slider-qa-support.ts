/**
 * Shared helpers for Slider Playwright automation.
 */
export {
  formatAxeViolations,
  runSliderAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSliderAxeArtefact,
  writeSliderAxeHtmlReport,
} from '../slider-playground/axeSliderPlayground';
export {
  ariaValueNow,
  computedSliderFillToken,
  expectFocusRingVisible,
  expectNoErrorText,
  scrollToSection,
  sliderByTestId,
  sliderRoot,
  slidersIn,
} from '../slider-playground/sliderHelpers';
export { gotoSliderPlayground } from '../slider-playground/gotoSliderPlayground';

import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  SLIDER_PLAYGROUND_ROUTE,
  SLIDER_SHOWCASE_AXE_SCOPE,
  SLIDER_SMOKE_TESTID,
} from '../slider-playground/manifest';
import { sliderByTestId } from '../slider-playground/sliderHelpers';

export { SLIDER_PLAYGROUND_ROUTE, SLIDER_SHOWCASE_AXE_SCOPE };

export const SliderTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const SLIDER_TAG_SET = {
  functional: [SliderTags.functional],
  accessibility: [SliderTags.accessibility],
  smoke: [SliderTags.functional, SliderTags.smoke],
} as const;

const LOG_PREFIX = '[Slider QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openSliderTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Slider playground', async () => {
    await page.goto(SLIDER_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Slider', level: 1 })).toBeVisible();
    await sliderByTestId(page, SLIDER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during Slider scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

