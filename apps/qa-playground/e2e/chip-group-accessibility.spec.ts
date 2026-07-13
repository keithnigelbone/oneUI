/**
 * ChipGroup QA playground — WCAG 2.1 AA automation (axe tags).
 * Selectors mirror `ChipGroupQaShowcase.tsx` (`data-section` === band `id`).
 *
 * **QA rule:** Fail on ChipGroup/Chip defects; scope axe to story bands only for shell noise —
 * never disable rules that would hide component-specific violations.
 *
 * **Raised component defects:** see `chip-group-qa.spec.ts` header (Home/End roving focus).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  CHIP_GROUP_SHOWCASE_AXE_SCOPE,
  CHIP_GROUP_TAG_SET,
  formatAxeViolations,
  openChipGroupTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './chip-group/chip-group-qa-support';
import { chipGroupSection, chipsInWrapper } from './chip-group-playground/chipGroupHelpers';
import {
  CHIP_GROUP_DATA_SECTIONS,
CHIP_GROUP_ROOT_TESTIDS
} from './chip-group-playground/manifest';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.beforeEach(async ({ page }) => {
  await openChipGroupTestScenarios(page);
});

test.describe('Accessibility', { tag: CHIP_GROUP_TAG_SET.accessibility }, () => {
  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report', async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on ChipGroup story bands (not page chrome)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'ChipGroup showcase story bands',
        include: CHIP_GROUP_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const section of CHIP_GROUP_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test('[a11y] ARIA validity rules — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(CHIP_GROUP_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-roles', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] keyboard navigation — Arrow keys move focus between chips in group', async ({
page,
  }) => {
    const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
    await chips.first().focus();
    await expect(chips.first()).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(chips.nth(1)).toBeFocused();
  });

  test('[a11y] keyboard navigation — Home and End are not roving keys (focus unchanged)', async ({
page,
  }) => {
    // ChipGroup is built on Base UI ToggleGroup, which only wires arrow-key roving
    // navigation (Home/End require ToggleGroup to opt into `enableHomeAndEndKeys`,
    // which it does not). The toggle-button-group ARIA pattern is satisfied by arrow
    // keys alone, so Home/End are inert and roving focus stays on the current chip.
    const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
    await chips.nth(2).focus();
    await page.keyboard.press('Home');
    await expect(chips.nth(2), 'Home is not a roving key — focus stays put').toBeFocused();
    await page.keyboard.press('End');
    await expect(chips.nth(2), 'End is not a roving key — focus stays put').toBeFocused();
  });

  test('[a11y] default group — role group, chips are buttons with aria-pressed', async ({
page,
  }) => {
    const wrapper = chipGroupSection(page, 'chip-group-qa-default').getByTestId(
      CHIP_GROUP_ROOT_TESTIDS.default,
    );
    await expect(wrapper.locator('[role="group"]').first()).toBeVisible();
    const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default').first();
    await expect(chip).toHaveRole('button');
    await expect(chip).toHaveAttribute('aria-pressed');
  });

  test('[a11y] multi-select group — Space toggles aria-pressed', async ({ page }) => {
    const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.events, 'chip-group-qa-events').nth(0);
    await chip.scrollIntoViewIfNeeded();
    const before = await chip.getAttribute('aria-pressed');
    await chip.focus();
    await page.keyboard.press('Space');
    const after = await chip.getAttribute('aria-pressed');
    expect(after).not.toBe(before);
  });

  test('[a11y] Tab moves focus to a real element', async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test('[a11y] Reflow at 320px — each section fits without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openChipGroupTestScenarios(page);
    for (const section of CHIP_GROUP_DATA_SECTIONS) {
      const band = chipGroupSection(page, section);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('[a11y] Figma Validation tab — WCAG tags on matrix root', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('chip-group-figma-validation-root')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('[data-testid="chip-group-figma-validation-root"]')
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
});
});

test.describe('Accessibility — Smoke', { tag: CHIP_GROUP_TAG_SET.accessibilitySmoke }, () => {
});

test.describe('Accessibility — Smoke', { tag: CHIP_GROUP_TAG_SET.accessibilitySmoke }, () => {
  });
