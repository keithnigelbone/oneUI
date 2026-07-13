import { expect, type Locator, type Page } from 'playwright/test';

/** Playwright anchor — `QaSc` wrapper around `SegmentedControl`. */
export function scByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function scSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function scrollToScTestId(page: Page, testId: string): Promise<void> {
  await scByTestId(page, testId).scrollIntoViewIfNeeded();
}

/** Toggle group root inside the showcase wrapper (`data-size` on group). */
export function scGroupRoot(wrapper: Locator): Locator {
  return wrapper.locator('[data-size]').first();
}

export function scSegmentButtons(page: Page, testId: string): Locator {
  return scByTestId(page, testId).getByRole('button');
}

/** Segments in the pressed/selected state (uses implicit button role + aria-pressed). */
export function scPressedSegmentButtons(page: Page, testId: string): Locator {
  return scByTestId(page, testId).getByRole('button', { pressed: true });
}

export function scByTestIdInSection(page: Page, sectionId: string, testId: string): Locator {
  return scSection(page, sectionId).getByTestId(testId);
}

export async function scWrapperBox(page: Page, testId: string) {
  const el = scByTestId(page, testId);
  await el.scrollIntoViewIfNeeded();
  return el.boundingBox();
}

export async function scGroupBackgroundRgb(page: Page, testId: string): Promise<string> {
  return scGroupRoot(scByTestId(page, testId)).evaluate((el) => getComputedStyle(el).backgroundColor);
}

/** Selected segment fill — appearance prop affects item/state-layer colour, not the neutral track. */
export async function scPressedSegmentFillRgb(page: Page, testId: string): Promise<string> {
  return scByTestId(page, testId).evaluate((root) => {
    const btn = root.querySelector('button[aria-pressed="true"]');
    if (!btn) return 'transparent';
    const layer = btn.querySelector('span');
    const target = layer ?? btn;
    return getComputedStyle(target as Element).backgroundColor;
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
  expect(hasVisibleFocus, 'Focused segment should show outline or box-shadow').toBe(true);
}

export function defaultBandButtons(page: Page): Locator {
  return scSegmentButtons(page, 'segmented-control-default');
}

export function canonicalSegmentButtons(page: Page): Locator {
  return page.getByTestId('segmented-control').getByRole('button');
}

export async function selectedSegmentButton(page: Page, testId: string): Promise<Locator> {
  const pressed = scByTestId(page, testId).getByRole('button', { pressed: true });
  await expect(pressed.first()).toBeVisible();
  return pressed.first();
}
