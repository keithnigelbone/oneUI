import { expect, type Locator, type Page } from 'playwright/test';

export function stbByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Button inside a wrapper span `data-testid`. */
export function stbButton(page: Page, testId: string): Locator {
  return stbByTestId(page, testId).getByRole('button');
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

/** `rgb(...)` background on the root button element. */
export async function computedButtonBackgroundRgb(page: Page, testId: string): Promise<string> {
  return stbButton(page, testId).evaluate((el) => getComputedStyle(el).backgroundColor);
}
