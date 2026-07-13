/**
 * Shared helpers for PaginationDots Playwright automation.
 */
export {
  formatAxeViolations,
  runPaginationDotsAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writePaginationDotsAxeArtefact,
  writePaginationDotsAxeHtmlReport,
} from '../pagination-dots-playground/axePaginationDotsPlayground';
export {
  activeDotBackgroundRgb,
  activeDotTab,
  clickDot,
  dotsSection,
  dotsStatus,
  dotsTablist,
  dotsWrap,
  dotTab,
  expectActivePage,
  expectFocusVisible,
  screenshotDots,
  tabbableDot,
} from '../pagination-dots-playground/paginationDotsHelpers';
export { gotoPaginationDotsPlayground } from '../pagination-dots-playground/gotoPaginationDotsPlayground';

import { expect, test, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  FIGMA_VALIDATION_TAB,
  PAGINATION_DOTS_ARIA,
  PAGINATION_DOTS_PLAYGROUND_ROUTE,
  PAGINATION_DOTS_ROOT_TESTIDS,
  PAGINATION_DOTS_SHOWCASE_AXE_SCOPE,
} from '../pagination-dots-playground/manifest';
import { dotsTablist, dotsWrap } from '../pagination-dots-playground/paginationDotsHelpers';

export {
  FIGMA_VALIDATION_TAB,
  PAGINATION_DOTS_PLAYGROUND_ROUTE,
  PAGINATION_DOTS_SHOWCASE_AXE_SCOPE,
};

export const PaginationDotsTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const PAGINATION_DOTS_TAG_SET = {
  functional: [PaginationDotsTags.functional],
  accessibility: [PaginationDotsTags.accessibility],
  smoke: [PaginationDotsTags.functional, PaginationDotsTags.smoke],
} as const;

const LOG_PREFIX = '[PaginationDots QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openPaginationDotsTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Pagination Dots playground', async () => {
    await page.goto(PAGINATION_DOTS_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Pagination Dots', level: 1 })).toBeVisible();
    await dotsWrap(page, PAGINATION_DOTS_ROOT_TESTIDS.default).waitFor({
      state: 'visible',
      timeout: 90_000,
    });
  });
}

export async function openPaginationDotsFigmaValidationTab(page: Page): Promise<void> {
  await qaStep(`Open ${FIGMA_VALIDATION_TAB} tab`, async () => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    await expect(page.getByTestId('figma-pagination-dots-grid')).toBeVisible();
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
    `Browser console should have no errors during PaginationDots scenario load.\n${errors.join('\n')}`,
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

export function isTransparentRgb(rgb: string): boolean {
  return rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)';
}

export async function defaultDotsTablist(page: Page) {
  return dotsTablist(page, PAGINATION_DOTS_ARIA.default, PAGINATION_DOTS_ROOT_TESTIDS.default);
}
