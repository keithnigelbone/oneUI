import { expect, type Locator, type Page } from 'playwright/test';

/** QA wrapper `data-testid` from `InputFeedbackScenarioGrid`. */
export function feedbackWrapper(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Figma validation tab cell anchor (`InputFeedbackFigmaValidationShowcase`). */
export function figmaFeedbackCell(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Inner `InputFeedback` root (`role="alert"` or `role="status"`). */
export function feedbackRow(page: Page, testId: string): Locator {
  return feedbackWrapper(page, testId).locator('[role="alert"], [role="status"]').first();
}

export function feedbackMessage(page: Page, testId: string): Locator {
  return feedbackRow(page, testId).locator('span').last();
}

export function feedbackIcon(page: Page, testId: string): Locator {
  return feedbackRow(page, testId).locator('[aria-hidden="true"]').first();
}

export async function expectFeedbackWrapperVisible(page: Page, testId: string): Promise<void> {
  await expect(feedbackWrapper(page, testId), `Wrapper "${testId}" should be visible`).toBeVisible();
}

/** Playground fault strings — not variant copy that may include the word "error". */
const PLAYGROUND_FAULT_PATTERN = /failed to (load|render)|something went wrong|unhandled runtime/i;

export async function expectNoPlaygroundFault(locator: Locator): Promise<void> {
  await expect(locator).not.toContainText(PLAYGROUND_FAULT_PATTERN);
}

export function ifbControlsSection(page: Page): Locator {
  return ifbSection(page, 'input-feedback-qa-controls');
}

export function ifbControlsMessageInput(page: Page): Locator {
  return ifbControlsSection(page).getByRole('textbox', { name: /feedback message/i });
}

export function ifbControlsButton(page: Page, name: string | RegExp): Locator {
  return ifbControlsSection(page).getByRole('button', { name });
}

export function ifbControlsCheckbox(page: Page, name: string | RegExp): Locator {
  return ifbControlsSection(page).getByRole('checkbox', { name });
}

export function ifbSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await ifbSection(page, sectionId).scrollIntoViewIfNeeded();
}

export async function computedRowBackground(page: Page, testId: string): Promise<string> {
  return feedbackRow(page, testId).evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}

export async function computedRowFontSize(page: Page, testId: string): Promise<string> {
  return feedbackRow(page, testId).evaluate((el) => getComputedStyle(el as HTMLElement).fontSize);
}

export async function computedMessageColor(page: Page, testId: string): Promise<string> {
  return feedbackMessage(page, testId).evaluate((el) => getComputedStyle(el).color);
}

export function parseRgbAlpha(rgb: string): number {
  const m = rgb.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
  if (m) return Number(m[1]);
  return rgb.includes('rgba') ? 0 : 1;
}

export async function expectNonTransparentBackground(page: Page, testId: string, label: string): Promise<void> {
  const bg = await computedRowBackground(page, testId);
  const alpha = parseRgbAlpha(bg);
  expect(alpha, `${label} background should not be transparent (${bg})`).toBeGreaterThan(0.05);
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
  expect(hasVisibleFocus, 'Focused element should show outline or box-shadow').toBe(true);
}
