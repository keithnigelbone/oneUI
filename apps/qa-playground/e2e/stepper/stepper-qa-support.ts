/**
 * Shared helpers for Stepper Playwright automation.
 */
export {
  formatAxeViolations,
  runStepperAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeStepperAxeArtefact,
  writeStepperAxeHtmlReport,
} from '../stepper-playground/axeStepperPlayground';
export {
  allStepperValueFields,
  computedStepperGroupBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
expectStepperDefaultFieldInitial,
  scrollToSection,
  stepperByTestId,
  stepperGroup,
  stepperValueField,
STEPPER_DEFAULT_BAND_INITIAL_VALUE,
} from '../stepper-playground/stepperHelpers';
export { gotoStepperPlayground } from '../stepper-playground/gotoStepperPlayground';

import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  STEPPER_PLAYGROUND_ROUTE,
  STEPPER_SHOWCASE_AXE_SCOPE,
  STEPPER_SMOKE_TESTID,
} from '../stepper-playground/manifest';
import { stepperByTestId } from '../stepper-playground/stepperHelpers';

export { STEPPER_PLAYGROUND_ROUTE, STEPPER_SHOWCASE_AXE_SCOPE };

export const StepperTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const STEPPER_TAG_SET = {
  functional: [StepperTags.functional],
  accessibility: [StepperTags.accessibility],
  smoke: [StepperTags.functional, StepperTags.smoke],
} as const;

const LOG_PREFIX = '[Stepper QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openStepperTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Stepper playground', async () => {
    await page.goto(STEPPER_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Stepper', level: 1 })).toBeVisible();
    await stepperByTestId(page, STEPPER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

