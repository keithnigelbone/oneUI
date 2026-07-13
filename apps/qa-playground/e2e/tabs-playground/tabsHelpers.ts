/**
 * Tabs Playwright helpers — wrapper `data-testid` from `TabsQaShowcase` → inner `[role="tablist"]`.
 */
import { expect, type Locator, type Page } from 'playwright/test';

import { dataSectionForTabsTestId } from './manifest';

/** Showcase wrapper around a TabGroup instance. */
export function tabsWrap(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Tab list inside a showcase wrapper. */
export function tabsList(page: Page, testId: string): Locator {
  return tabsWrap(page, testId).getByRole('tablist');
}

/** All tab triggers inside a wrapper. */
export function tabButtons(page: Page, testId: string): Locator {
  return tabsWrap(page, testId).getByRole('tab');
}

export function tabByIndex(page: Page, testId: string, index: number): Locator {
  return tabButtons(page, testId).nth(index);
}

export function selectedTab(page: Page, testId: string): Locator {
  return tabsWrap(page, testId).locator('[role="tab"][aria-selected="true"]');
}

export function tabbableTab(page: Page, testId: string): Locator {
  return tabsWrap(page, testId).locator('[role="tab"][tabindex="0"]');
}

export async function expectTabSelected(page: Page, testId: string, index: number): Promise<void> {
  await expect(tabByIndex(page, testId, index)).toHaveAttribute('aria-selected', 'true');
}

export async function expectTabNotSelected(page: Page, testId: string, index: number): Promise<void> {
  await expect(tabByIndex(page, testId, index)).toHaveAttribute('aria-selected', 'false');
}

export async function clickTab(page: Page, testId: string, index: number): Promise<void> {
  await tabByIndex(page, testId, index).click();
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

export async function expectHorizontalTabLayout(page: Page, testId: string): Promise<void> {
  const tabs = tabButtons(page, testId);
  const count = await tabs.count();
  if (count < 2) return;
  const box1 = await tabs.nth(0).boundingBox();
  const box2 = await tabs.nth(1).boundingBox();
  expect(box1).not.toBeNull();
  expect(box2).not.toBeNull();
  expect(box2!.x).toBeGreaterThan(box1!.x);
  expect(Math.abs(box2!.y - box1!.y)).toBeLessThan(20);
}

export async function expectVerticalTabLayout(page: Page, testId: string): Promise<void> {
  const tabs = tabButtons(page, testId);
  const count = await tabs.count();
  if (count < 2) return;
  const box1 = await tabs.nth(0).boundingBox();
  const box2 = await tabs.nth(1).boundingBox();
  expect(box1).not.toBeNull();
  expect(box2).not.toBeNull();
  expect(box2!.y).toBeGreaterThan(box1!.y);
  expect(Math.abs(box2!.x - box1!.x)).toBeLessThan(20);
}

/** Scroll the story band that contains this wrapper `data-testid` into view. */
export async function scrollToTabsTestId(page: Page, testId: string): Promise<void> {
  const section = dataSectionForTabsTestId(testId);
  await page.locator(`[data-section="${section}"]`).first().scrollIntoViewIfNeeded();
}
