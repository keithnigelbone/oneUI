import { expect, type Locator, type Page } from 'playwright/test';

export function dividerSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** Root separator only — excludes inner slot wrap that incorrectly reuses `data-testid="divider-slot-icon"`. */
export function dividerRoot(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"][data-divider]`).first();
}

export async function dividerBox(page: Page, testId: string) {
  const root = dividerRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  return root.boundingBox();
}

/** Simple divider stroke uses `background-color`; content dividers use `.line` spans. */
export async function dividerStrokeRgb(root: Locator): Promise<string> {
  const hasLine = (await root.locator('span[aria-hidden="true"]').count()) > 0;
  if (hasLine) {
    return root.locator('span[aria-hidden="true"]').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  }
  return root.evaluate((el) => getComputedStyle(el).backgroundColor);
}

/** Horizontal simple divider stroke thickness (height). */
export async function horizontalStrokeThickness(root: Locator): Promise<number> {
  const box = await root.boundingBox();
  expect(box, 'divider should have a bounding box').not.toBeNull();
  return box!.height;
}

export async function expectHorizontalDivider(page: Page, testId: string): Promise<void> {
  const box = await dividerBox(page, testId);
  expect(box?.width ?? 0, `${testId} width`).toBeGreaterThan(0);
  expect(box?.height ?? 0, `${testId} height`).toBeGreaterThan(0);
  expect(box!.width, `${testId} horizontal width should exceed stroke height`).toBeGreaterThan(box!.height);
}

export async function expectVerticalDivider(page: Page, testId: string): Promise<void> {
  const box = await dividerBox(page, testId);
  expect(box?.width ?? 0, `${testId} width`).toBeGreaterThan(0);
  expect(box?.height ?? 0, `${testId} height`).toBeGreaterThan(0);
  expect(box!.height, `${testId} vertical height should exceed stroke width`).toBeGreaterThan(box!.width);
}
