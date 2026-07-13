/**
 * Reusable Pagination interaction helpers for Playwright.
 *
 * ## Stable selector best practices
 * - Prefer `data-testid` on the root `<nav>` (`pagination-default`, `pagination-controlled`, …).
 * - Prefer `getByRole('navigation', { name })` scoped under that root for landmark queries.
 * - Use `getByRole('button', { name: 'Go to page N' })` for numbered pages (matches `PaginationItem` labels).
 * - Nav chrome: `Go to first page` | `Go to previous page` | `Go to next page` | `Go to last page`.
 * - Selected page: `aria-current="page"` (not class names or digit text alone).
 * - Ellipsis: `${testId}-ellipsis-start` | `${testId}-ellipsis-end` when root test id is set.
 * - Avoid CSS module hashes, list index, or raw `button:has-text("5")` without role+name.
 *
 * ## Suggested `data-testid` naming
 * - Root: `pagination-{scenario}` (e.g. `pagination-default`, `pagination-controlled`).
 * - Slots (optional, emitted by component when root id set): `{root}-page-{n}`, `{root}-previous`, `{root}-next`, `{root}-first`, `{root}-last`, `{root}-ellipsis-start|end`.
 * - QA-only captions: `pagination-controlled-caption`, `pagination-callback-log`.
 */
import { expect, type Locator, type Page } from 'playwright/test';

export const NAV_BUTTON_NAMES = {
  first: 'Go to first page',
  previous: 'Go to previous page',
  next: 'Go to next page',
  last: 'Go to last page',
} as const;

export type NavSlot = keyof typeof NAV_BUTTON_NAMES;

/** Locator for a pagination root by `data-testid`. */
export function paginationRoot(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Navigation landmark inside a root test id. */
export function paginationNav(page: Page, testId: string, ariaLabel?: string | RegExp): Locator {
  const root = paginationRoot(page, testId);
  if (ariaLabel) {
    return root;
  }
  return root;
}

/** Uses `data-testid` when present, else exact accessible name (avoids `1` matching `10`). */
export function pageButton(root: Locator, pageNum: number, rootTestId?: string): Locator {
  if (rootTestId) {
    return root.getByTestId(`${rootTestId}-page-${pageNum}`);
  }
  return root.getByRole('button', { name: `Go to page ${pageNum}`, exact: true });
}

export function navButton(root: Locator, slot: NavSlot): Locator {
  return root.getByRole('button', { name: NAV_BUTTON_NAMES[slot] });
}

/** Button with `aria-current="page"`. */
export function currentPageButton(root: Locator): Locator {
  return root.locator('button[aria-current="page"]');
}

export async function expectCurrentPage(
  root: Locator,
  pageNum: number,
  rootTestId?: string,
): Promise<void> {
  await expect(pageButton(root, pageNum, rootTestId)).toHaveAttribute('aria-current', 'page');
}

export async function clickPage(root: Locator, pageNum: number, rootTestId?: string): Promise<void> {
  await pageButton(root, pageNum, rootTestId).click();
}

export async function clickNav(root: Locator, slot: NavSlot): Promise<void> {
  await navButton(root, slot).click();
}

export async function expectNavEnabled(root: Locator, slot: NavSlot, enabled: boolean): Promise<void> {
  const btn = navButton(root, slot);
  if (enabled) {
    await expect(btn).toBeEnabled();
  } else {
    await expect(btn).toBeDisabled();
  }
}

export function ellipsisLocator(root: Locator, side: 'start' | 'end', rootTestId: string): Locator {
  return root.getByTestId(`${rootTestId}-ellipsis-${side}`);
}

/** Polite live region text (`Page N of M`). */
export async function readLiveRegion(root: Locator): Promise<string> {
  return root.locator('[aria-live="polite"]').innerText();
}

/** Hidden `data-visible-pages` attribute for window debugging. */
export async function readVisiblePagesAttr(root: Locator): Promise<string | null> {
  return root.locator('[data-visible-pages]').getAttribute('data-visible-pages');
}

/** First numbered page button in tab order (tabindex=0). */
export function tabbablePageButton(root: Locator): Locator {
  return root.locator('button[data-type="page"][tabindex="0"]');
}

export async function expectFocusVisible(page: Page): Promise<void> {
  const focusStyle = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = getComputedStyle(el);
    return {
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });
  const hasVisibleFocus =
    focusStyle?.outlineWidth !== '0px' ||
    (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
  expect(hasVisibleFocus, 'Focused element should show outline or box-shadow').toBe(true);
}

export async function screenshotPagination(
  page: Page,
  root: Locator,
  name: string,
): Promise<void> {
  await root.screenshot({ path: `test-results/pagination-${name}.png` });
}

export function paginationSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function selectedPageChipBackgroundRgb(root: Locator): Promise<string> {
  return currentPageButton(root).evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}
