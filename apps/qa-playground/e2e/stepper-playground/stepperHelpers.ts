import { expect, type Locator, type Page } from 'playwright/test';

/**
 * Default QA band (`stepper-default`) omits `defaultValue` in `StepperQaShowcase.tsx`.
 * Base UI NumberField therefore starts with an empty text value.
 */
export const STEPPER_DEFAULT_BAND_INITIAL_VALUE = '';

/** Assert the Default band value field has no initial numeric value. */
export async function expectStepperDefaultFieldInitial(field: Locator): Promise<void> {
  await expect(field).toHaveValue(STEPPER_DEFAULT_BAND_INITIAL_VALUE);
}
/** Base UI NumberField uses `input[type="text"]` with `aria-roledescription="Number field"`. */
export function stepperValueField(parent: Locator): Locator {
  return parent.locator('input[aria-roledescription="Number field"]');
}

export function allStepperValueFields(page: Page): Locator {
  return page.locator('[data-testid^="stepper-"] input[aria-roledescription="Number field"]');
}

export function stepperByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function stepperGroup(root: Locator): Locator {
  return root.locator('[data-size]').first();
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
  expect(hasVisibleFocus, 'Focused control should show outline or box-shadow').toBe(true);
}

/** Computed background on the stepper `.group` fill region. */
export async function computedStepperGroupBackgroundRgb(page: Page, testId: string): Promise<string> {
  return stepperGroup(stepperByTestId(page, testId)).evaluate((el) => getComputedStyle(el).backgroundColor);
}
