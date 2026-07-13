import { expect, type Locator, type Page } from 'playwright/test';

export function counterBadgeSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export function counterBadgeRoot(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export async function counterBadgeBox(page: Page, testId: string) {
  const root = counterBadgeRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  return root.boundingBox();
}

export async function badgeFillRgb(root: Locator): Promise<string> {
  return root.evaluate((el) => getComputedStyle(el).backgroundColor);
}

export async function expectCircularBadge(page: Page, testId: string): Promise<void> {
  const box = await counterBadgeBox(page, testId);
  expect(box?.width ?? 0, `${testId} width`).toBeGreaterThan(0);
  expect(box?.height ?? 0, `${testId} height`).toBeGreaterThan(0);
  expect(box?.width, `${testId} should be circular (equal width/height)`).toBe(box?.height);
}

/**
 * Figma COMPONENT_SET: size XS + attention high = solid dot without numerals.
 * Must fail until `@oneui/ui` CounterBadge implements dot-only mode — do not soften.
 */
export async function expectFigmaXsHighDotOnly(root: Locator): Promise<void> {
  const text = (await root.textContent())?.trim() ?? '';
  expect(
    text,
    'CounterBadge XS+high (Figma): dot-only badge must not render displayValue numerals',
  ).toBe('');
  const box = await root.boundingBox();
  expect(box, 'XS dot-only badge should have a bounding box').not.toBeNull();
  expect(box!.width, 'XS dot-only badge should be circular (width === height)').toBe(box!.height);
}
