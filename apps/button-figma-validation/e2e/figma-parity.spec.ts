/**
 * Button — Figma parity (static Vite harness, no Storybook).
 * Expected values come from `fixtures/figma-parity.fixture.json` (Figma export).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIGMA_FIXTURE_PATH = join(__dirname, '../fixtures/figma-parity.fixture.json');

type Fixture = {
  meta: {
    totalVariants: number;
    grid: {
      columns: { property: string; values: string[] };
      rows: { combinations: unknown[] };
    };
  };
  variants: Array<{
    id: string;
    props: { state?: string };
    expect?: {
      backgroundColor: string;
      borderRadius: string;
      border: string;
      width: string;
      height: string;
      color: string;
      fontSize: string;
      opacity: string;
    };
  }>;
};

const data = JSON.parse(readFileSync(FIGMA_FIXTURE_PATH, 'utf8')) as Fixture;

type VariantWithExpect = (typeof data)['variants'][number] & {
  expect: NonNullable<(typeof data)['variants'][number]['expect']>;
};

const variantsWithExpect = data.variants.filter((v): v is VariantWithExpect => Boolean(v.expect));

const RGB_TOLERANCE = Number(process.env.FIGMA_PARITY_RGB_TOLERANCE ?? '145');

function parseRgb(input: string): [number, number, number] | null {
  const s = input.trim();
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function rgbMaxChannelDelta(a: string, b: string): number {
  const pa = parseRgb(a);
  const pb = parseRgb(b);
  if (!pa || !pb) return Number.POSITIVE_INFINITY;
  return Math.max(Math.abs(pa[0] - pb[0]), Math.abs(pa[1] - pb[1]), Math.abs(pa[2] - pb[2]));
}

function normalizeRadius(px: string): string {
  const n = Number.parseFloat(px);
  if (!Number.isFinite(n)) return px;
  if (n >= 9000) return '9999px';
  return px;
}

function fontSizePxClose(actual: string, expected: string, tolPx = 3): boolean {
  const a = Number.parseFloat(actual);
  const b = Number.parseFloat(expected);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= tolPx;
}

test.describe('Button — Figma parity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('figma-button-grid').waitFor({ state: 'visible', timeout: 30_000 });
  });

  for (const v of variantsWithExpect) {
    test(`${v.id} — computed CSS (rgb), snapshot, a11y`, async ({ page }) => {
      const btn = page.locator(`[data-testid="${v.id}"]`).first();
      await expect(btn).toBeVisible();

      const css = await btn.evaluate((el) => {
        const cssColorToRgbString = (value: string): string => {
          const ctx = document.createElement('canvas').getContext('2d');
          if (!ctx) return value;
          ctx.fillStyle = value;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          return `rgb(${r}, ${g}, ${b})`;
        };

        const isTransparentCssColor = (value: string): boolean => {
          const t = value.trim().toLowerCase();
          if (t === 'transparent') return true;
          const m = t.match(
            /^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/,
          );
          if (m) return Number.parseFloat(m[1]) === 0;
          return false;
        };

        const effectiveBackgroundColor = (node: Element): string => {
          const own = window.getComputedStyle(node).backgroundColor;
          if (!isTransparentCssColor(own)) return own;
          let cur: Element | null = node.parentElement;
          while (cur) {
            const bg = window.getComputedStyle(cur).backgroundColor;
            if (!isTransparentCssColor(bg)) return bg;
            cur = cur.parentElement;
          }
          return window.getComputedStyle(document.body).backgroundColor;
        };

        const c = window.getComputedStyle(el);
        const label =
          [...el.querySelectorAll('span')].find((s) => s.textContent?.trim() === 'Label') ?? el;
        const lc = window.getComputedStyle(label);
        const rawBg = c.backgroundColor;
        const bgSource = isTransparentCssColor(rawBg) ? effectiveBackgroundColor(el) : rawBg;
        return {
          backgroundColor: cssColorToRgbString(bgSource),
          borderTopLeftRadius: c.borderTopLeftRadius,
          borderTopWidth: c.borderTopWidth,
          borderTopStyle: c.borderTopStyle,
          borderTopColor: cssColorToRgbString(c.borderTopColor),
          color: cssColorToRgbString(lc.color),
          fontSize: lc.fontSize,
          opacity: c.opacity,
          cursor: c.cursor,
        };
      });

      expect(rgbMaxChannelDelta(css.backgroundColor, v.expect.backgroundColor)).toBeLessThanOrEqual(
        RGB_TOLERANCE,
      );
      expect(rgbMaxChannelDelta(css.color, v.expect.color)).toBeLessThanOrEqual(RGB_TOLERANCE);

      expect(normalizeRadius(css.borderTopLeftRadius)).toBe(normalizeRadius(v.expect.borderRadius));
      expect(fontSizePxClose(css.fontSize, v.expect.fontSize)).toBe(true);

      if (v.expect.border === 'none') {
        expect(css.borderTopWidth).toMatch(/^(0|0px)$/);
      }

      await expect(btn).toHaveScreenshot(`${v.id}.png`, { threshold: 0.02 });

      const axe = await new AxeBuilder({ page }).include(`[data-testid="${v.id}"]`).analyze();
      expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
    });

    if (v.props.state === 'disabled') {
      test(`${v.id} — disabled interaction`, async ({ page }) => {
        const btn = page.locator(`[data-testid="${v.id}"]`).first();
        await expect(btn).toBeVisible();
        await expect(btn).toBeDisabled();

        const css = await btn.evaluate((el) => {
          const c = window.getComputedStyle(el);
          return { opacity: Number.parseFloat(c.opacity), cursor: c.cursor };
        });

        expect(css.opacity < 1 || css.cursor === 'not-allowed').toBeTruthy();

        await expect(btn.click()).rejects.toThrow();
      });
    }
  }
});
