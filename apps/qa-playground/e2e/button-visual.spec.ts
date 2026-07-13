/**
 * Screenshot + computed-style checks for the default Button on the QA playground.
 *
 * Bless baselines (after intentional visual changes):
 *   pnpm --filter @oneui/qa-playground exec playwright test e2e/button-visual.spec.ts --update-snapshots
 *
 * Snapshots live under `e2e/button-visual.spec.ts-snapshots/` (per OS/project).
 */
import { expect, test } from 'playwright/test';

function isResolvedColor(value: string): boolean {
  const v = value.trim();
  return /^(rgb|rgba|oklch|oklab|hsla?|#[0-9a-f])/i.test(v);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/c/button');
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
});

test.describe('Visual', () => {
  test('default contained Button — screenshot (medium attention, size M)', async ({ page }) => {
    const button = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
    await expect(button).toBeVisible();
    await expect(button).toHaveScreenshot('button-default-contained-medium.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.06,
    });
  });

  test('default contained Button — key computed styles', async ({ page }) => {
    const button = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
    await expect(button).toBeVisible();

    const style = await button.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        fontWeight: cs.fontWeight,
        borderRadius: cs.borderRadius,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
      };
    });

    expect(parseInt(style.fontWeight, 10), 'label weight').toBeGreaterThanOrEqual(500);

    const radius = parseFloat(style.borderRadius);
    expect(radius, 'pill-like radius').toBeGreaterThan(20);

    expect(isResolvedColor(style.color), 'text color').toBe(true);
    expect(isResolvedColor(style.backgroundColor), 'fill').toBe(true);
    expect(style.backgroundColor).not.toBe(style.color);
  });

  test('default contained Button — touch target height', async ({ page }) => {
    const button = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(32);
  });
});
