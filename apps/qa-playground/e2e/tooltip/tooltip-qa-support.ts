/**
 * Shared helpers for Tooltip Playwright automation.
 */
export {
  formatAxeViolations,
  runTooltipAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeTooltipAxeArtefact,
  writeTooltipAxeHtmlReport,
} from '../tooltip-playground/axeTooltipPlayground';
export {
  buttonInWrap,
clickTooltipWrap,
  computedTooltipBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  expectTooltipNotOpen,
  expectTooltipOpen,
  hoverElement,
  hoverTooltipWrap,
  pressButton,
  resetPointer,
  scrollToSection,
  scrollToTestId,
  tooltipVisibleArrowSvgs,
  triggerInWrap,
  wrapByTestId,
} from '../tooltip-playground/tooltipHelpers';
export { gotoTooltipPlayground } from '../tooltip-playground/gotoTooltipPlayground';

import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  TOOLTIP_PLAYGROUND_ROUTE,
  TOOLTIP_SHOWCASE_AXE_SCOPE,
  TOOLTIP_SMOKE_TESTID,
} from '../tooltip-playground/manifest';
import { wrapByTestId } from '../tooltip-playground/tooltipHelpers';

export { TOOLTIP_PLAYGROUND_ROUTE, TOOLTIP_SHOWCASE_AXE_SCOPE };

export const TooltipTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const TOOLTIP_TAG_SET = {
  functional: [TooltipTags.functional],
  accessibility: [TooltipTags.accessibility],
  smoke: [TooltipTags.functional, TooltipTags.smoke],
} as const;

const LOG_PREFIX = '[Tooltip QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openTooltipTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Tooltip playground', async () => {
    await page.goto(TOOLTIP_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Tooltip', level: 1 })).toBeVisible();
    await wrapByTestId(page, TOOLTIP_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

