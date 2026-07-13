import { expect, type Locator, type Page } from 'playwright/test';

import { ICON_CONTAINED_DECORATIVE_WRAPPER_TESTIDS } from './manifest';

export function iconContainedSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** Labelled IconContained root — `[role="img"][data-size]` inside wrapper `data-testid`. */
export function iconContainedLabelledRoot(page: Page, testId: string): Locator {
  return page.getByTestId(testId).locator('[role="img"][data-size]').first();
}

/** Decorative IconContained root — `[data-size][aria-hidden="true"]`, no `role="img"`. */
export function iconContainedDecorativeRoot(page: Page, testId: string): Locator {
  return page.getByTestId(testId).locator('[data-size][aria-hidden="true"]').first();
}

/** Resolves labelled or decorative IconContained root for a showcase wrapper `data-testid`. */
export function iconContainedInnerRoot(page: Page, testId: string): Locator {
  if (ICON_CONTAINED_DECORATIVE_WRAPPER_TESTIDS.has(testId)) {
    return iconContainedDecorativeRoot(page, testId);
  }
  return iconContainedLabelledRoot(page, testId);
}

/** @deprecated Alias — use {@link iconContainedLabelledRoot} or {@link iconContainedInnerRoot}. */
export function iconContainedRoot(page: Page, testId: string): Locator {
  return iconContainedLabelledRoot(page, testId);
}

export async function iconContainedBox(page: Page, testId: string) {
  const root = iconContainedRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  return root.boundingBox();
}

export async function iconContainedBackgroundRgb(root: Locator): Promise<string> {
  return root.evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}

export async function iconContainedIconColorRgb(root: Locator): Promise<string> {
  return root.evaluate((el) => {
    const host = el as HTMLElement;
    const iconWrap = host.querySelector('.icon') ?? host;
    const svg = iconWrap.querySelector('svg');
    if (!svg) return getComputedStyle(iconWrap as Element).color;

    const shape = svg.querySelector('path, circle, rect, polygon, use, g') ?? svg;
    const fill = getComputedStyle(shape).fill;
    if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'rgba(0, 0, 0, 0)') {
      return fill;
    }
    return getComputedStyle(iconWrap as Element).color;
  });
}

export async function iconContainedWidthHeight(root: Locator): Promise<{ width: number; height: number }> {
  const box = await root.boundingBox();
  expect(box, 'IconContained root should have a bounding box').not.toBeNull();
  return { width: box!.width, height: box!.height };
}

export function isTransparentRgb(color: string): boolean {
  return color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

export async function expectCircularIconContained(root: Locator, label: string): Promise<void> {
  const { width, height } = await iconContainedWidthHeight(root);
  expect(width, `${label} width`).toBeGreaterThan(0);
  expect(height, `${label} height`).toBeGreaterThan(0);
  expect(Math.abs(width - height), `${label} should be circular (equal width/height)`).toBeLessThan(1.5);
}
