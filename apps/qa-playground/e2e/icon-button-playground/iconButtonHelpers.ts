import { expect, type Locator, type Page } from 'playwright/test';

export function iconButtonSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** Root `<button>` — scoped by forwarded `data-testid` and emitted `data-size`. */
export function iconButtonRoot(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"][data-size]`).first();
}

export async function iconButtonBox(page: Page, testId: string) {
  const root = iconButtonRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  return root.boundingBox();
}

export async function iconButtonBackgroundRgb(root: Locator): Promise<string> {
  return root.evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}

export async function iconButtonWidthHeight(root: Locator): Promise<{ width: number; height: number }> {
  const box = await root.boundingBox();
  expect(box, 'icon button should have a bounding box').not.toBeNull();
  return { width: box!.width, height: box!.height };
}

export function isTransparentRgb(color: string): boolean {
  return color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

export async function expectFocusRingVisible(root: Locator, label: string): Promise<void> {
  const styles = await root.evaluate((el) => {
    const computed = getComputedStyle(el as HTMLElement);
    return {
      outlineWidth: computed.outlineWidth,
      boxShadow: computed.boxShadow,
    };
  });
  const hasOutline = styles.outlineWidth !== '0px' && styles.outlineWidth !== '';
  const hasShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
  expect(
    hasOutline || hasShadow,
    `${label} should show focus indicator (outline or box-shadow); got outline=${styles.outlineWidth}, shadow=${styles.boxShadow}`,
  ).toBe(true);
}
