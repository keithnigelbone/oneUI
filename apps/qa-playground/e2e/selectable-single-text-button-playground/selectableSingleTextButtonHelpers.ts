import { expect, type Locator, type Page } from 'playwright/test';

export function sstbByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
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

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
}

/** `rgb(...)` background on the root button. */
export async function computedButtonBackgroundRgb(page: Page, testId: string): Promise<string> {
  return sstbByTestId(page, testId).evaluate((el) => {
    const style = getComputedStyle(el);
    return style.backgroundColor;
  });
}
