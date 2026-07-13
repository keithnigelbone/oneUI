/**
 * Shared helpers for Touch Slider Playwright automation.
 */
export {
  formatAxeViolations,
  runTouchSliderAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeTouchSliderAxeArtefact,
  writeTouchSliderAxeHtmlReport,
} from '../touch-slider-playground/axeTouchSliderPlayground';
export {
  ariaValueNow,
  computedTouchSliderFillRgb,
  controlIn,
  expectFocusRingVisible,
  expectNoErrorText,
  expectTouchSliderReachable,
  expectTouchSliderRootLabeled,
  scrollToSection,
  scrollToTestId,
  slidersIn,
  startSlotOffsetX,
  touchSliderByTestId,
  touchSliderRoot,
} from '../touch-slider-playground/touchSliderHelpers';
export { gotoTouchSliderPlayground } from '../touch-slider-playground/gotoTouchSliderPlayground';

import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  TOUCH_SLIDER_PLAYGROUND_ROUTE,
  TOUCH_SLIDER_SHOWCASE_AXE_SCOPE,
  TOUCH_SLIDER_SMOKE_TESTID,
} from '../touch-slider-playground/manifest';
import { touchSliderByTestId } from '../touch-slider-playground/touchSliderHelpers';

export { TOUCH_SLIDER_PLAYGROUND_ROUTE, TOUCH_SLIDER_SHOWCASE_AXE_SCOPE };

export const TouchSliderTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const TOUCH_SLIDER_TAG_SET = {
  functional: [TouchSliderTags.functional],
  accessibility: [TouchSliderTags.accessibility],
  smoke: [TouchSliderTags.functional, TouchSliderTags.smoke],
} as const;

const LOG_PREFIX = '[Touch Slider QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openTouchSliderTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Touch Slider playground', async () => {
    await page.goto(TOUCH_SLIDER_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Touch Slider', level: 1 })).toBeVisible();
    await touchSliderByTestId(page, TOUCH_SLIDER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
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
