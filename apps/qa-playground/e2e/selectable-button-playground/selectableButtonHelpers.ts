import { expect, type Locator, type Page } from 'playwright/test';

/** Wrapper `data-testid` from showcase — inner control is `role="button"`. */
export function selectableButtonWrap(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function selectableButtonByTestId(page: Page, testId: string): Locator {
  return selectableButtonWrap(page, testId).getByRole('button');
}

export function selectableButtonSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function scrollToSelectableButtonTestId(page: Page, testId: string): Promise<void> {
  await selectableButtonWrap(page, testId).scrollIntoViewIfNeeded();
}

export async function selectableButtonBox(page: Page, testId: string) {
  const el = selectableButtonByTestId(page, testId);
  await el.scrollIntoViewIfNeeded();
  return el.boundingBox();
}

/** Button fill / background (browser-normalised rgb/rgba). */
export async function selectableButtonBackgroundRgb(page: Page, testId: string): Promise<string> {
  return selectableButtonByTestId(page, testId).evaluate((btn) => getComputedStyle(btn).backgroundColor);
}

export function rgbaAlpha(rgbOrRgba: string): number {
  const m = rgbOrRgba.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!m) return rgbOrRgba === 'transparent' ? 0 : 1;
  if (m[1] === undefined) return 1;
  return Number.parseFloat(m[1]);
}

export async function expectFocusVisible(page: Page): Promise<void> {
  const focusStyle = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = getComputedStyle(el);
    return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
  });
  const hasVisibleFocus =
    focusStyle?.outlineWidth !== '0px' ||
    (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
  expect(hasVisibleFocus, 'Focused selectable button should show outline or box-shadow').toBe(true);
}
