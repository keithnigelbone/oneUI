/**
 * Chip QA playground — WCAG 2.1 AA automation (axe tags).
 *
 * **QA rule:** Fail on Chip defects; scope axe to story bands only for shell noise — never
 * disable rules that would hide Chip-specific violations.
 *
 * **Raised component defects:** see `chip-qa.spec.ts` header (fill/toggle failures).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  CHIP_SHOWCASE_AXE_SCOPE,
  CHIP_TAG_SET,
  formatAxeViolations,
  openChipTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './chip/chip-qa-support';
import { chipButton } from './chip-playground/chipHelpers';
import { CHIP_DATA_SECTIONS, CHIP_ROOT_TESTIDS, chipAppearanceTestId } from './chip-playground/manifest';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.beforeEach(async ({ page }) => {
  await openChipTestScenarios(page);
});

test.describe('Accessibility', { tag: CHIP_TAG_SET.accessibility }, () => {
  test('Accessibility — Story bands: WCAG 2.1 AA tags, axe JSON artefact, and HTML report', async ({
page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Chip story bands (not page chrome)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Chip showcase story bands',
        include: CHIP_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const section of CHIP_DATA_SECTIONS) {
    test(`Accessibility — Section “${section}”: WCAG 2.1 AA tags, zero serious or critical`, async ({
page,
    }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }


  test('Accessibility — ARIA validity rules: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(CHIP_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-roles', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('Accessibility — Default chip: role button, aria-pressed, Space toggles', async ({ page }) => {
    const btn = chipButton(page, CHIP_ROOT_TESTIDS.default);
    await expect(btn).toHaveRole('button');
    const before = await btn.getAttribute('aria-pressed');
    await btn.focus();
    await page.keyboard.press('Space');
    const after = await btn.getAttribute('aria-pressed');
    expect(after).not.toBe(before);
  });

  test('Accessibility — Disabled selected chip: aria-disabled and stays pressed on Space', async ({
page,
  }) => {
    const btn = chipButton(page, CHIP_ROOT_TESTIDS.disabledTrueSelected, 'chip-qa-disabled');
    await expect(btn).toBeDisabled();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await btn.focus();
    await page.keyboard.press('Space');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Accessibility — Tab moves focus to a real element', async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test('Accessibility — Reflow at 320px: each section fits without horizontal scroll', async ({
page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openChipTestScenarios(page);
    for (const section of CHIP_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('Accessibility — Figma Validation tab: WCAG tags on matrix root', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('chip-figma-validation-root')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('[data-testid="chip-figma-validation-root"]')
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
});
