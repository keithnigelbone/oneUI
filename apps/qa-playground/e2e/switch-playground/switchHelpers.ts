import { expect, type Locator, type Page } from 'playwright/test';

/** `data-testid` is on `BaseSwitch.Root` (`role="switch"`). */
export function switchByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export async function expectNoErrorText(locator: Locator): Promise<void> {
  await expect(locator).not.toContainText(/error|failed|exception/i);
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
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
  expect(hasVisibleFocus, 'Focused switch should show outline or box-shadow').toBe(true);
}

/** Computed track background on the switch root (`[role="switch"]`). */
export async function computedSwitchTrackBackgroundRgb(page: Page, testId: string): Promise<string> {
  return switchByTestId(page, testId).evaluate((el) => getComputedStyle(el).backgroundColor);
}
