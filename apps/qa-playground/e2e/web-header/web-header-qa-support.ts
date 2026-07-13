/**
 * Shared helpers for Web Header Playwright automation.
 */
export {
  formatAxeViolations,
  runWebHeaderAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeWebHeaderAxeArtefact,
  writeWebHeaderAxeHtmlReport,
} from '../web-header-playground/axeWebHeaderPlayground';
export {
  clickNavItem,
  expectActiveNavItem,
  expectAvatarHidden,
  expectAvatarVisible,
  expectEndButtonVisible,
  expectEndIconButtonsVisible,
  expectFocusRingVisible,
  expectLogoHidden,
  expectLogoVisible,
  expectMenuButtonHidden,
  expectMenuButtonVisible,
  expectNavItemHidden,
  expectNavItemVisible,
  expectNoErrorText,
  expectPrimaryNavMiddle,
  expectPrimaryNavType,
  primaryNavInMount,
  scrollToSection,
  searchboxInMount,
  searchInMount,
  webHeaderByTestId,
} from '../web-header-playground/webHeaderHelpers';
export { gotoWebHeaderPlayground } from '../web-header-playground/gotoWebHeaderPlayground';

import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  FIGMA_COMBO_GRID_TESTID,
  FIGMA_PROPERTY_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  WEB_HEADER_PLAYGROUND_ROUTE,
  WEB_HEADER_SHOWCASE_AXE_SCOPE,
  WEB_HEADER_SMOKE_TESTID,
} from '../web-header-playground/manifest';
import { webHeaderByTestId } from '../web-header-playground/webHeaderHelpers';

export {
  FIGMA_COMBO_GRID_TESTID,
  FIGMA_PROPERTY_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  WEB_HEADER_PLAYGROUND_ROUTE,
  WEB_HEADER_SHOWCASE_AXE_SCOPE,
};

export const WebHeaderTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const WEB_HEADER_TAG_SET = {
  functional: [WebHeaderTags.functional],
  accessibility: [WebHeaderTags.accessibility],
  smoke: [WebHeaderTags.functional, WebHeaderTags.smoke],
} as const;

const LOG_PREFIX = '[Web Header QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openWebHeaderTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Web Header playground', async () => {
    await page.goto(WEB_HEADER_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Web Header', level: 1 })).toBeVisible();
    await webHeaderByTestId(page, WEB_HEADER_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function openWebHeaderFigmaValidationTab(page: Page): Promise<void> {
  await qaStep(`Open ${FIGMA_VALIDATION_TAB} tab`, async () => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    await expect(page.getByTestId(FIGMA_PROPERTY_GRID_TESTID)).toBeVisible();
    await expect(page.getByTestId(FIGMA_COMBO_GRID_TESTID)).toBeVisible();
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
    `Browser console should have no errors during Web Header scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}
