import { expect, type Locator, type Page } from 'playwright/test';

export function sliderByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function slidersIn(wrapper: Locator): Locator {
  return wrapper.getByRole('slider');
}

export function sliderRoot(wrapper: Locator): Locator {
  return wrapper.locator('[data-knob-style]').first();
}

export async function expectNoErrorText(locator: Locator): Promise<void> {
  await expect(locator).not.toContainText(/error|failed|exception/i);
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
}

export async function ariaValueNow(slider: Locator): Promise<number> {
  const raw = await slider.getAttribute('aria-valuenow');
  expect(raw, 'Slider thumb should expose aria-valuenow').not.toBeNull();
  return Number(raw);
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
  expect(hasVisibleFocus, 'Focused slider thumb should show outline or box-shadow').toBe(true);
}

/** Resolved `--_slider-fill` token on the slider root (appearance-specific). */
export async function computedSliderFillToken(page: Page, testId: string): Promise<string> {
  return sliderRoot(sliderByTestId(page, testId)).evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--_slider-fill').trim(),
  );
}
