/**
 * PaginationDots Playwright helpers — prefer wrapper `data-testid`, then `aria-label` tablist.
 */
import { expect, type Locator, type Page } from 'playwright/test';

/** Showcase wrapper around a PaginationDots instance. */
export function dotsWrap(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Interactive tablist inside a wrapper (or the tablist root when it carries `data-testid`). */
export function dotsTablist(page: Page, ariaLabel: string | RegExp, wrapTestId?: string): Locator {
  const tablist = page.getByRole('tablist', { name: ariaLabel });
  if (!wrapTestId) return tablist;
  return tablist.and(page.getByTestId(wrapTestId));
}

/** Read-only `role="status"` root (or inside a wrapper). */
export function dotsStatus(page: Page, ariaLabel: string | RegExp, wrapTestId?: string): Locator {
  const status = page.getByRole('status', { name: ariaLabel });
  if (!wrapTestId) return status;
  return status.and(page.getByTestId(wrapTestId));
}

export function dotTab(root: Locator, pageNum: number, count: number): Locator {
  return root.getByRole('tab', { name: `Page ${pageNum} of ${count}` });
}

export function activeDotTab(root: Locator): Locator {
  return root.locator('button[aria-selected="true"]');
}

export function tabbableDot(root: Locator): Locator {
  return root.locator('button[role="tab"][tabindex="0"]');
}

export async function expectActivePage(root: Locator, pageNum: number, count: number): Promise<void> {
  await expect(dotTab(root, pageNum, count)).toHaveAttribute('aria-selected', 'true');
}

export async function clickDot(root: Locator, pageNum: number, count: number): Promise<void> {
  const tab = dotTab(root, pageNum, count);
  await tab.scrollIntoViewIfNeeded();
  await tab.click({ force: true });
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

export async function screenshotDots(page: Page, root: Locator, name: string): Promise<void> {
  await root.screenshot({ path: `test-results/pagination-dots-${name}.png` });
}

export function dotsSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function activeDotBackgroundRgb(root: Locator): Promise<string> {
  return activeDotTab(root).evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}
