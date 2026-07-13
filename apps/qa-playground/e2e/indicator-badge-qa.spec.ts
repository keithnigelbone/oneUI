/**
 * Indicator Badge QA playground — functional Playwright tests.
 * Selectors mirror `IndicatorBadgeQaShowcase.tsx`.
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` IndicatorBadge defects.
 *
 * **Raised defects (issue tracker — tests must fail until fixed in component):**
 * - None for IndicatorBadge when `aria-label` is provided (see showcase).
 *
 * **Page chrome (not IndicatorBadge — use `clickPageThemeButton`, not `/Theme:/`):**
 * - Theme toggle validates the detail-page header control.
 *
 * **Out of scope for this suite (removed tests):** full-page axe and color-contrast sweeps
 * (page chrome / shared tokens). See `indicator-badge-accessibility.spec.ts` header for BUG ids.
 */
import { expect, test } from 'playwright/test';

import {
  clickPageThemeButton,
  openIndicatorBadgeTestScenarios,
} from './indicator-badge/indicator-badge-qa-support';
import { INDICATOR_BADGE_COMBO_COUNT } from './indicator-badge-playground/manifest';

test.describe('Functional', () => {
  test.beforeEach(async ({ page }) => {
    await openIndicatorBadgeTestScenarios(page);
  });

  test('[fn] shows Indicator Badge page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Indicator Badge', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default indicator is visible (empty dot)', async ({ page }) => {
    const el = page.getByTestId('indicator-badge-default');
    await expect(el).toBeVisible();
    await expect(el).toHaveText('');
  });

  test('[fn] Size row — XS / S / M / L / XL visible', async ({ page }) => {
    for (const figma of ['XS', 'S', 'M', 'L', 'XL'] as const) {
      const el = page.getByTestId(`indicator-badge-size-${figma}`);
      await expect(el).toBeVisible();
      await expect(el).toHaveText('');
    }
  });

  test('[fn] Appearance matrix — primary row visible', async ({ page }) => {
    const band = page.locator('#indicator-qa-appearance');
    await expect(band.getByTestId('indicator-badge-appearance-primary')).toBeVisible();
  });

  test('[fn] brand-bg band — xs / m / xl visible', async ({ page }) => {
    const band = page.locator('#indicator-qa-brand-bg');
    await expect(band.getByTestId('indicator-badge-brand-bg-xs')).toBeVisible();
    await expect(band.getByTestId('indicator-badge-brand-bg-m')).toBeVisible();
    await expect(band.getByTestId('indicator-badge-brand-bg-xl')).toBeVisible();
  });

  test('[fn] Combination matrix renders all combo rows', async ({ page }) => {
    for (let i = 0; i < INDICATOR_BADGE_COMBO_COUNT; i++) {
      await expect(page.getByTestId(`indicator-badge-combo-${i}`)).toBeVisible();
    }
  });

  test('[fn] Figma Validation tab renders matrix root', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('indicator-badge-figma-validation-root')).toBeVisible();
    await expect(page.getByTestId('indicator-badge-figma-sz-M-app-primary')).toBeVisible();
  });
});
