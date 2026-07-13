import { expect, type Locator, type Page } from 'playwright/test';

/** `data-testid` is forwarded to the radio control (`BaseRadio.Root`). */
export function radioByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function radioSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function scrollToRadioTestId(page: Page, testId: string): Promise<void> {
  await radioByTestId(page, testId).scrollIntoViewIfNeeded();
}

export async function radioBox(page: Page, testId: string) {
  const el = radioByTestId(page, testId);
  await el.scrollIntoViewIfNeeded();
  return el.boundingBox();
}

/** Indicator fill / background on the radio control (browser-normalised rgb/rgba). */
export async function radioIndicatorBackgroundRgb(page: Page, testId: string): Promise<string> {
  return radioByTestId(page, testId).evaluate((root) => {
    const indicator =
      root.querySelector('[data-radio-indicator]') ??
      root.querySelector('[class*="indicator"]') ??
      root.firstElementChild ??
      root;
    return getComputedStyle(indicator as Element).backgroundColor;
  });
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
  expect(hasVisibleFocus, 'Focused radio should show outline or box-shadow').toBe(true);
}

export function defaultBandRadios(page: Page): Locator {
  return page.locator('#radio-qa-default [role="radio"]');
}
