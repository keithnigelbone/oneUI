/**
 * Shared helpers for Switch Playwright automation.
 */
export {
  formatAxeViolations,
  runSwitchAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSwitchAxeArtefact,
  writeSwitchAxeHtmlReport,
} from '../switch-playground/axeSwitchPlayground';
export {
  computedSwitchTrackBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  scrollToSection,
  switchByTestId,
} from '../switch-playground/switchHelpers';
export { gotoSwitchPlayground } from '../switch-playground/gotoSwitchPlayground';

import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  SWITCH_PLAYGROUND_ROUTE,
  SWITCH_SHOWCASE_AXE_SCOPE,
  SWITCH_SMOKE_TESTID,
} from '../switch-playground/manifest';
import { switchByTestId } from '../switch-playground/switchHelpers';

export { SWITCH_PLAYGROUND_ROUTE, SWITCH_SHOWCASE_AXE_SCOPE };

export const SwitchTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const SWITCH_TAG_SET = {
  functional: [SwitchTags.functional],
  accessibility: [SwitchTags.accessibility],
  smoke: [SwitchTags.functional, SwitchTags.smoke],
} as const;

const LOG_PREFIX = '[Switch QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openSwitchTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Switch playground', async () => {
    await page.goto(SWITCH_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Switch', level: 1 })).toBeVisible();
    await switchByTestId(page, SWITCH_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

