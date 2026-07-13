/**
 * SegmentedControl — Playwright visual regression (computed styles + screenshots).
 *
 * Bless baselines after intentional visual changes:
 *   pnpm --filter @oneui/qa-playground exec playwright test e2e/segmented-control-visual.spec.ts --config playwright.segmented-control.config.ts --update-snapshots
 */
import { expect, test } from 'playwright/test';

import {
  SC_ATTENTION_VISUAL_TESTIDS,
  SC_CANONICAL,
  SC_SIZE_VISUAL_TESTIDS,
  SC_VISUAL_SCENARIOS,
} from './segmented-control/segmented-control-test-data';
import {
  clickPageThemeButton,
  gotoSegmentedControlPlayground,
  scByTestId,
  scGroupRoot,
  scSection,
  SC_TAG_SET,
  scSegmentButtons,
} from './segmented-control/segmented-control-qa-support';

function isResolvedColor(value: string): boolean {
  const v = value.trim();
  return /^(rgb|rgba|oklch|oklab|hsla?|#[0-9a-f])/i.test(v);
}

test.beforeEach(async ({ page }) => {
  await gotoSegmentedControlPlayground(page);
});

test.describe('Visual', { tag: SC_TAG_SET.visual }, () => {
  for (const scenario of SC_VISUAL_SCENARIOS) {
    test(`screenshot — ${scenario.description}`, async ({ page }) => {
      await scSection(page, scenario.sectionId).scrollIntoViewIfNeeded();
      const target = page.getByTestId(scenario.testId);
      await expect(target).toBeVisible();
      await expect(target).toHaveScreenshot(scenario.snapshot, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.08,
      });
    });
  }

  test('canonical pill — selected segment uses resolved fill colour', async ({ page }) => {
    await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
    const selected = page.getByTestId(SC_CANONICAL.itemDay);
    await expect(selected).toHaveAttribute('aria-pressed', 'true');

    const fill = await selected.evaluate((el) => {
      const layer = el.querySelector('span');
      const target = layer ?? el;
      return getComputedStyle(target as Element).backgroundColor;
    });
    expect(isResolvedColor(fill), 'selected segment fill').toBe(true);
    expect(fill).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('rectangular shape — border-radius differs from pill', async ({ page }) => {
    await scSection(page, 'segmented-control-qa-shape').scrollIntoViewIfNeeded();
    const pillRadius = await scGroupRoot(scByTestId(page, 'segmented-control-shape-pill')).evaluate(
      (el) => parseFloat(getComputedStyle(el).borderRadius),
    );
    const rectRadius = await scGroupRoot(scByTestId(page, 'segmented-control-shape-rectangular')).evaluate(
      (el) => parseFloat(getComputedStyle(el).borderRadius),
    );
    expect(pillRadius).toBeGreaterThan(rectRadius);
  });

  test('equalWidth true — segment widths within 2px', async ({ page }) => {
    await scSection(page, 'segmented-control-qa-equal-width').scrollIntoViewIfNeeded();
    const widths = await scSegmentButtons(page, 'segmented-control-equal-true').evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().width)),
    );
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(2);
  });

  test('equalWidth false — variable segment widths', async ({ page }) => {
    await scSection(page, 'segmented-control-qa-equal-width').scrollIntoViewIfNeeded();
    const widths = await scSegmentButtons(page, 'segmented-control-equal-false').evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().width),
    );
    expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths) + 8);
  });

  test('trackEmphasis high vs low — track background differs', async ({ page }) => {
    await scSection(page, 'segmented-control-qa-track-emphasis').scrollIntoViewIfNeeded();
    const highBg = await scGroupRoot(scByTestId(page, 'segmented-control-track-high')).evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const lowBg = await scGroupRoot(scByTestId(page, 'segmented-control-track-low')).evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(highBg).not.toBe(lowBg);
  });

  for (const testId of SC_ATTENTION_VISUAL_TESTIDS) {
    test(`attention variant renders — ${testId}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-attention').scrollIntoViewIfNeeded();
      await expect(scByTestId(page, testId)).toBeVisible();
    });
  }

  for (const testId of SC_SIZE_VISUAL_TESTIDS) {
    test(`size variant renders — ${testId}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-size').scrollIntoViewIfNeeded();
      await expect(scByTestId(page, testId)).toBeVisible();
    });
  }

  test('dark theme — canonical control remains visible', async ({ page }) => {
    await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
    await clickPageThemeButton(page);
    await expect(page.getByTestId(SC_CANONICAL.root)).toBeVisible();
    await expect(page.getByTestId(SC_CANONICAL.itemDay)).toHaveAttribute('aria-pressed', 'true');
  });

  test('Figma validation matrix — variant grid mounts 216 cells', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('figma-segmented-control-variant-grid')).toBeVisible();
    await expect(page.getByTestId('segmented-control-figma-var-0-0')).toBeVisible();
    await expect(page.getByTestId('segmented-control-figma-var-35-5')).toBeVisible();
  });
});
