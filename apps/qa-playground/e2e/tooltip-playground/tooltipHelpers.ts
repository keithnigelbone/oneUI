import { expect, type Locator, type Page } from 'playwright/test';

export function wrapByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Reach Base UI trigger span inside a showcase wrapper div. */
export function triggerInWrap(wrap: Locator): Locator {
  return wrap.locator('[data-base-ui-tooltip-trigger]').first();
}

/** Native button inside wrapper — reliable when disabled omits trigger attribute. */
export function buttonInWrap(wrap: Locator): Locator {
  return wrap.locator('button').first();
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
}

export async function scrollToTestId(page: Page, testId: string): Promise<void> {
  await wrapByTestId(page, testId).scrollIntoViewIfNeeded();
}

export async function expectNoErrorText(locator: Locator): Promise<void> {
  await expect(locator).not.toContainText(/error|failed|exception/i);
}

/** Move virtual mouse to element centre — fires trusted pointer events for hover tooltips. */
export async function hoverElement(page: Page, locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element bounding box not found — may not be in DOM or visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

/** Base UI Button press sequence for controlled toggles. */
export async function pressButton(page: Page, button: Locator): Promise<void> {
  await button.dispatchEvent('pointerdown', { button: 0, buttons: 1, isPrimary: true, bubbles: true });
  await button.dispatchEvent('pointerup', { button: 0, buttons: 0, isPrimary: true, bubbles: true });
  await button.dispatchEvent('click', { button: 0, bubbles: true });
}

/** Clear hover state from other defaultOpen tooltips before pointer-driven tests. */
export async function resetPointer(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
}

/** Trusted click on the native button inside a showcase wrapper (bubbles to Tooltip trigger span). */
export async function clickTooltipWrap(page: Page, wrap: Locator): Promise<void> {
  await pressButton(page, buttonInWrap(wrap));
}

/** Trusted hover on the native button inside a showcase wrapper. */
export async function hoverTooltipWrap(page: Page, wrap: Locator): Promise<void> {
  await resetPointer(page);
  await hoverElement(page, buttonInWrap(wrap));
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

/** Computed background on open tooltip bubble (`role="tooltip"`). */
export async function computedTooltipBackgroundRgb(page: Page, name: string | RegExp): Promise<string> {
  const tooltip = page.getByRole('tooltip', { name });
  await expect(tooltip).toBeVisible();
  return tooltip.evaluate((el) => getComputedStyle(el).backgroundColor);
}

/**
 * Arrow tip SVGs inside the popup. Four orientations are mounted; CSS shows one.
 * Playwright counts all four unless filtered to visible nodes.
 */
export function tooltipVisibleArrowSvgs(tooltip: Locator): Locator {
  return tooltip.locator('svg:visible');
}

/** Hover-mode popups stay mounted with `role="tooltip"` — assert Base UI open/closed state. */
export function tooltipPopup(page: Page, name: string | RegExp): Locator {
  return page.getByRole('tooltip', { name });
}

export async function expectTooltipNotOpen(page: Page, name: string | RegExp): Promise<void> {
  await expect(tooltipPopup(page, name)).toHaveAttribute('data-closed', '');
}

/** Assert a named tooltip popup is open (`data-open` on the Base UI popup). */
export async function expectTooltipOpen(page: Page, name: string | RegExp): Promise<void> {
  await expect(tooltipPopup(page, name)).toHaveAttribute('data-open', '');
}
