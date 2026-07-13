import { expect, type Locator, type Page } from 'playwright/test';

/** `data-testid` is forwarded to the checkbox control (`BaseCheckbox.Root`). */
export function checkboxByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function checkboxSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function scrollToCheckboxTestId(page: Page, testId: string): Promise<void> {
  await checkboxByTestId(page, testId).scrollIntoViewIfNeeded();
}

export async function checkboxBox(page: Page, testId: string) {
  const el = checkboxByTestId(page, testId);
  await el.scrollIntoViewIfNeeded();
  return el.boundingBox();
}

/** Native label wrapper for clicking the full hit target (matches showcase `label` + control). */
export function checkboxLabelWrapper(page: Page, testId: string): Locator {
  return page.locator('label').filter({ has: page.getByTestId(testId) });
}

/** Visible copy: native `<label>` ancestor wrapping the control, or `aria-label` on the control. */
export async function checkboxAssociatedText(page: Page, testId: string): Promise<string> {
  const el = page.getByTestId(testId).first();
  await el.waitFor({ state: 'visible' });
  return el.evaluate((node) => {
    const lab = (node as HTMLElement).closest('label');
    if (lab) {
      return (lab.innerText || lab.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return ((node as HTMLElement).getAttribute('aria-label') ?? '').trim();
  });
}

/**
 * Resolved fill for colour assertions — checked / indeterminate fill is applied on the
 * `role="checkbox"` root (see `Checkbox.module.css`); the inner indicator is often transparent.
 */
export async function checkboxControlFillRgb(page: Page, testId: string): Promise<string> {
  return checkboxByTestId(page, testId).evaluate((root) => {
    const el = root as Element;
    const rootBg = getComputedStyle(el).backgroundColor;
    if (rootBg && rootBg !== 'rgba(0, 0, 0, 0)' && rootBg !== 'transparent') {
      return rootBg;
    }
    const indicator =
      el.querySelector('[class*="indicator"]') ?? el.querySelector('.indicator') ?? el.firstElementChild ?? el;
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
  expect(hasVisibleFocus, 'Focused checkbox should show outline or box-shadow').toBe(true);
}
