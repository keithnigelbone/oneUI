import { expect, type Locator, type Page } from 'playwright/test';

/** `data-section` story band. */
export function cpiSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export function cpiRoot(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/**
 * `data-testid` sits on the inner ring wrapper; `role="progressbar"` lives on the Base UI root.
 */
export function progressbarForTestId(page: Page, testId: string): Locator {
  return page.getByRole('progressbar').filter({ has: page.getByTestId(testId) });
}

export async function cpiBoundingBox(page: Page, testId: string) {
  const root = cpiRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  return root.boundingBox();
}

export async function expectCircularRoot(page: Page, testId: string): Promise<void> {
  const box = await cpiBoundingBox(page, testId);
  expect(box?.width ?? 0, `${testId} should have width`).toBeGreaterThan(0);
  expect(box?.height ?? 0, `${testId} should have height`).toBeGreaterThan(0);
  expect(box?.width, `${testId} should be circular (equal width/height)`).toBe(box?.height);
}

/** Second `circle` in first direct `svg` — the progress arc (indicator stroke). */
export function indicatorCircle(root: Locator): Locator {
  return root.locator(':scope > svg').first().locator('circle').nth(1);
}

export async function indicatorStrokeRgb(root: Locator): Promise<string> {
  return indicatorCircle(root).evaluate((el) => getComputedStyle(el).stroke);
}

export async function animationNameOnIndicator(root: Locator): Promise<string> {
  return indicatorCircle(root).evaluate((el) => getComputedStyle(el).animationName);
}

export async function animationNameOnSvg(root: Locator): Promise<string> {
  return root.locator(':scope > svg').first().evaluate((el) => getComputedStyle(el).animationName);
}
