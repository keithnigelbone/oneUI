import { expect, type Locator, type Page } from 'playwright/test';

export function touchSliderByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function slidersIn(wrapper: Locator): Locator {
  return wrapper.getByRole('slider');
}

export function touchSliderRoot(wrapper: Locator): Locator {
  return wrapper.locator('[data-progress-style]').first();
}

export function controlIn(wrap: Locator): Locator {
  return touchSliderRoot(wrap).locator('[class*="control"]').first();
}

export async function expectNoErrorText(locator: Locator): Promise<void> {
  await expect(locator).not.toContainText(/error|failed|exception/i);
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
}

export async function scrollToTestId(page: Page, testId: string): Promise<void> {
  await touchSliderByTestId(page, testId).scrollIntoViewIfNeeded();
}

export async function ariaValueNow(slider: Locator): Promise<number> {
  const raw = await slider.getAttribute('aria-valuenow');
  expect(raw, 'Touch Slider thumb should expose aria-valuenow').not.toBeNull();
  return Number(raw);
}

export async function startSlotOffsetX(wrap: Locator): Promise<number | null> {
  const slot = wrap.locator('[data-slider-slot="start"]');
  const slotBox = await slot.boundingBox();
  const rootBox = await touchSliderRoot(wrap).boundingBox();
  if (!slotBox || !rootBox) return null;
  return slotBox.x - rootBox.x;
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
  expect(hasVisibleFocus, 'Focused Touch Slider should show outline or box-shadow').toBe(true);
}

/** Computed fill on progress indicator (appearance-specific). */
export async function computedTouchSliderFillRgb(page: Page, testId: string): Promise<string> {
  const root = touchSliderRoot(touchSliderByTestId(page, testId));
  const indicator = root.locator('[class*="indicator"]').first();
  await indicator.waitFor({ state: 'visible' });
  return indicator.evaluate((el) => getComputedStyle(el).backgroundColor);
}

/** Resolved `--_ts-fill` token on the Touch Slider root (appearance-specific). */
export async function computedTouchSliderFillToken(page: Page, testId: string): Promise<string> {
  return touchSliderRoot(touchSliderByTestId(page, testId)).evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--_ts-fill').trim(),
  );
}

export async function expectTouchSliderRootLabeled(
  wrapper: Locator,
  namePattern: RegExp | string,
): Promise<void> {
  await expect(touchSliderRoot(wrapper)).toHaveAttribute('aria-label', namePattern);
}

export async function expectTouchSliderReachable(
  wrapper: Locator,
  rootNamePattern?: RegExp | string,
): Promise<void> {
  await expect(slidersIn(wrapper).first()).toBeAttached();
  if (rootNamePattern) {
    await expectTouchSliderRootLabeled(wrapper, rootNamePattern);
  } else {
    await expect(touchSliderRoot(wrapper)).toHaveAttribute('aria-label', /.+/);
  }
}
