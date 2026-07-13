import { expect, type Locator, type Page } from 'playwright/test';

/** QA wrapper `div` around each `RadioField` mount (`data-testid` on anchor, not Field.Root). */
export function fieldByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function fieldSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export function radiosInField(anchor: Locator): Locator {
  return anchor.locator('[role="radio"]');
}

export function firstRadioInField(anchor: Locator): Locator {
  return radiosInField(anchor).first();
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  const section = fieldSection(page, sectionId);
  await section.scrollIntoViewIfNeeded();
  await expect(section, `Story band "${sectionId}" should be visible`).toBeVisible();
}

export async function expectNoErrorText(locator: Locator): Promise<void> {
  await expect(locator).not.toContainText(/error|failed|exception/i);
}

export async function expectFocusRingVisible(page: Page): Promise<void> {
  const focusStyle = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = getComputedStyle(el);
    return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
  });
  const hasVisibleFocus =
    focusStyle?.outlineWidth !== '0px' ||
    (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
  expect(hasVisibleFocus, 'Focused control should show outline or box-shadow').toBe(true);
}

/** Indicator fill on the integrated radio inside a field anchor. */
export async function radioIndicatorBackgroundRgbInField(anchor: Locator): Promise<string> {
  return firstRadioInField(anchor).evaluate((root) => {
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

export async function fieldRadioBox(page: Page, testId: string) {
  const radio = firstRadioInField(fieldByTestId(page, testId));
  await radio.scrollIntoViewIfNeeded();
  return radio.boundingBox();
}
