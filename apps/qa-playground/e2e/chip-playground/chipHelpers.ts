import { expect, type Locator, type Page } from 'playwright/test';

export function chipSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export function chipBand(page: Page, sectionId: string): Locator {
  return page.locator(`#${sectionId}`);
}

/** Wrapper element carrying `data-testid` in the showcase. */
export function chipWrapper(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/**
 * Chip toggle button inside a wrapper `data-testid` (Chip does not forward testid).
 * Optional `bandId` scopes to a story band when the same testid could repeat.
 */
export function chipButton(page: Page, testId: string, bandId?: string): Locator {
  const root = bandId ? chipBand(page, bandId).getByTestId(testId) : chipWrapper(page, testId);
  return root.locator('button').first();
}

/** @deprecated use `chipButton(page, testId, bandId)` — kept for preserved spec helpers. */
export function chipEl(page: Page, bandId: string, testId: string): Locator {
  return chipButton(page, testId, bandId);
}

export async function scrollToChipTestId(page: Page, testId: string, bandId?: string): Promise<void> {
  const wrapper = bandId ? chipBand(page, bandId).getByTestId(testId) : chipWrapper(page, testId);
  await wrapper.scrollIntoViewIfNeeded();
}

export async function chipButtonBox(page: Page, testId: string, bandId?: string) {
  const btn = chipButton(page, testId, bandId);
  await btn.scrollIntoViewIfNeeded();
  return btn.boundingBox();
}

/** Resolved fill on the toggle button for colour assertions (computed rgb). */
export async function chipButtonFillRgb(page: Page, testId: string, bandId?: string): Promise<string> {
  return chipButton(page, testId, bandId).evaluate((el) => {
    const style = getComputedStyle(el);
    return style.backgroundColor;
  });
}

export async function expectChipButtonFocusRing(page: Page, testId: string, bandId?: string): Promise<void> {
  const btn = chipButton(page, testId, bandId);
  await btn.focus();
  const focusStyle = await btn.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });
  const hasVisibleFocus =
    focusStyle.outlineWidth !== '0px' ||
    (focusStyle.boxShadow != null && focusStyle.boxShadow !== 'none');
  expect(hasVisibleFocus, 'Focused chip should show outline or box-shadow focus indicator').toBe(true);
}
