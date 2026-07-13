import { expect, type Locator, type Page } from 'playwright/test';

export function imageSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** Image root — `data-testid` from `testID` prop. */
export function imageRoot(page: Page, testId: string): Locator {
  return page.getByTestId(testId).first();
}

/** Inner `<img>` when source has not errored. */
export function imageImg(root: Locator): Locator {
  return root.locator('img').first();
}

export async function imageBox(page: Page, testId: string) {
  const root = imageRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  return root.boundingBox();
}

export async function imageObjectFitRgb(root: Locator): Promise<string> {
  const img = root.locator('img').first();
  if ((await img.count()) === 0) return '';
  return img.evaluate((el) => getComputedStyle(el as HTMLElement).objectFit);
}

export async function imageBorderRadius(root: Locator): Promise<string> {
  return root.evaluate((el) => getComputedStyle(el as HTMLElement).borderRadius);
}

export async function imageWidthHeight(root: Locator): Promise<{ width: number; height: number }> {
  const box = await root.boundingBox();
  expect(box, 'Image root should have a bounding box').not.toBeNull();
  return { width: box!.width, height: box!.height };
}

export async function expectFocusRingVisible(root: Locator, label: string): Promise<void> {
  const styles = await root.evaluate((el) => {
    const s = getComputedStyle(el as HTMLElement);
    return {
      outlineWidth: s.outlineWidth,
      outlineStyle: s.outlineStyle,
      boxShadow: s.boxShadow,
    };
  });
  const hasOutline =
    styles.outlineWidth !== '0px' && styles.outlineStyle !== 'none' && styles.outlineStyle !== '';
  const hasShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
  expect(hasOutline || hasShadow, `${label} should show focus ring (outline or box-shadow)`).toBe(true);
}
