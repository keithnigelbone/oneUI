/**
 * Shared helpers for Pagination Playwright automation.
 */
export {
  formatAxeViolations,
  runPaginationAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writePaginationAxeArtefact,
  writePaginationAxeHtmlReport,
} from '../pagination-playground/axePaginationPlayground';
export {
  clickNav,
  clickPage,
  currentPageButton,
  expectCurrentPage,
  expectFocusVisible,
  expectNavEnabled,
  navButton,
  pageButton,
  paginationRoot,
  paginationSection,
  readLiveRegion,
  readVisiblePagesAttr,
  screenshotPagination,
  selectedPageChipBackgroundRgb,
  tabbablePageButton,
} from '../pagination-playground/paginationHelpers';
export { gotoPaginationPlayground } from '../pagination-playground/gotoPaginationPlayground';

import { expect, test, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  PAGINATION_PLAYGROUND_ROUTE,
  PAGINATION_ROOT_TESTIDS,
  PAGINATION_SHOWCASE_AXE_SCOPE,
} from '../pagination-playground/manifest';
import { paginationRoot } from '../pagination-playground/paginationHelpers';

export { PAGINATION_PLAYGROUND_ROUTE, PAGINATION_SHOWCASE_AXE_SCOPE };

export const PaginationTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const PAGINATION_TAG_SET = {
  functional: [PaginationTags.functional],
  accessibility: [PaginationTags.accessibility],
  smoke: [PaginationTags.functional, PaginationTags.smoke],
} as const;

const LOG_PREFIX = '[Pagination QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openPaginationTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Pagination playground', async () => {
    await page.goto(PAGINATION_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Pagination', level: 1 })).toBeVisible();
    await paginationRoot(page, PAGINATION_ROOT_TESTIDS.default).waitFor({
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
    `Browser console should have no errors during Pagination scenario load.\n${errors.join('\n')}`,
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
