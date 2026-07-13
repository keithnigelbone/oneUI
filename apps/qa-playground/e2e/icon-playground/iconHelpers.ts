import { expect, type Locator, type Page } from 'playwright/test';

export function iconSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** Icon root span — scoped by forwarded `data-testid` and emitted `data-size`. */
export function iconRoot(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"][data-size]`).first();
}

export async function iconBox(page: Page, testId: string) {
  const root = iconRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  return root.boundingBox();
}

/** Resolved glyph colour (fill on SVG path, or inherited currentColor). */
export async function iconColorRgb(root: Locator): Promise<string> {
  return root.evaluate((el) => {
    const host = el as HTMLElement;
    const svg = host.querySelector('svg');
    if (!svg) return getComputedStyle(host).color;

    const shape = svg.querySelector('path, circle, rect, polygon, use, g') ?? svg;
    const fill = getComputedStyle(shape).fill;
    if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'rgba(0, 0, 0, 0)') {
      return fill;
    }
    const svgColor = getComputedStyle(svg).color;
    if (svgColor && svgColor !== 'rgba(0, 0, 0, 0)') return svgColor;
    return getComputedStyle(host).color;
  });
}

export async function iconWidthHeight(root: Locator): Promise<{ width: number; height: number }> {
  const box = await root.boundingBox();
  expect(box, 'icon root should have a bounding box').not.toBeNull();
  return { width: box!.width, height: box!.height };
}

export function isTransparentRgb(color: string): boolean {
  return color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

export async function expectSquareIcon(root: Locator, label: string): Promise<void> {
  const { width, height } = await iconWidthHeight(root);
  expect(width, `${label} width`).toBeGreaterThan(0);
  expect(height, `${label} height`).toBeGreaterThan(0);
  expect(Math.abs(width - height), `${label} should be square`).toBeLessThan(1.5);
}
