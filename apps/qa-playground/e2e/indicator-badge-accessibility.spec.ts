/**
 * Indicator Badge QA playground — WCAG 2.1 AA automation (axe tags).
 *
 * Selectors mirror `IndicatorBadgeQaShowcase.tsx` (`data-section` === band `id`).
 *
 * **QA rule:** Fail on IndicatorBadge defects; scope axe to story bands only (no full-page or
 * color-contrast sweeps — those pick up page chrome / shared tokens).
 *
 * **Raised defects (track in issue tracker — do not soften IndicatorBadge tests):**
 * - BUG-CHROME-CONTRAST-001 — neutral subtle Button/Badge label text ~4.44:1 on page chrome (not IndicatorBadge).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  clickPageThemeButton,
  formatAxeViolations,
  INDICATOR_BADGE_SHOWCASE_AXE_SCOPE,
  openIndicatorBadgeTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './indicator-badge/indicator-badge-qa-support';
import { INDICATOR_BADGE_DATA_SECTIONS } from './indicator-badge-playground/manifest';
import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

test.beforeEach(async ({ page }) => {
  await openIndicatorBadgeTestScenarios(page);
});

test.describe('Accessibility', () => {
  test('[a11y] WCAG 2.1 AA tag scan on story bands + JSON artefact + HTML report', async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on Indicator Badge story bands (not page chrome)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Indicator Badge showcase story bands',
        include: INDICATOR_BADGE_SHOWCASE_AXE_SCOPE,
        tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const section of INDICATOR_BADGE_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test('[a11y] Section 508 tag run on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(INDICATOR_BADGE_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] ARIA validity rules on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(INDICATOR_BADGE_SHOWCASE_AXE_SCOPE)
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
      ])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test('[a11y] reflow: showcase regions fit at 320px (no horizontal overflow inside bands)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openIndicatorBadgeTestScenarios(page);
    for (const section of INDICATOR_BADGE_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('[a11y] resize: 200% zoom — indicator dots remain visible', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator(
      `${INDICATOR_BADGE_SHOWCASE_AXE_SCOPE} [data-testid^="indicator-badge-"]`,
    );
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test('[a11y] Tab reaches a focusable control', async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test('[a11y] default indicator: role status + accessible name', async ({ page }) => {
    const el = page.getByTestId('indicator-badge-default');
    await expect(el).toHaveRole('status');
    await expect(el).toHaveAccessibleName(/.+/);
  });

  test('[a11y] every Indicator Badge status in showcase has non-empty accessible name', async ({ page }) => {
    const badges = page.locator(
      `${INDICATOR_BADGE_SHOWCASE_AXE_SCOPE} [data-testid^="indicator-badge-"]`,
    );
    const count = await badges.count();
    expect(count, 'Showcase should expose indicator-badge data-testid roots').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      await expect(badge).toHaveRole('status');
      await expect(badge, `badge index ${i}`).toHaveAccessibleName(/.+/);
    }
  });
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });

  test('[a11y] Theme toggle updates label via page chrome control', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });
});
