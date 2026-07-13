/**
 * Tooltip QA — WCAG 2.1 AA axe + a11y checks.
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Tooltip defects.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { qaAnnotate } from './qa-a11y-test-meta';
import {
  TOOLTIP_A11Y_BANDS,
  TOOLTIP_FIGMA_GRID_AXE_TEST,
  TOOLTIP_FOCUS_TRAP_TEST,
  TOOLTIP_KEYBOARD_TAB_TEST,
  TOOLTIP_OPEN_TOOLTIP_NAME_TEST,
  TOOLTIP_PAGE_LANG_TEST,
  TOOLTIP_REFLOW_320_TEST,
TOOLTIP_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS } from './qa-axe-helpers';
import {
  formatAxeViolations,
  openTooltipTestScenarios,
  qaStep,
  runTooltipAxePageScan,
  seriousOrCritical,
  TOOLTIP_SHOWCASE_AXE_SCOPE,
  TOOLTIP_TAG_SET,
  writeTooltipAxeArtefact,
writeTooltipAxeHtmlReport,
} from './tooltip/tooltip-qa-support';
import {
  FIGMA_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  TOOLTIP_ALL_WRAPPER_TESTIDS,
  TOOLTIP_AXE_TARGET_TESTIDS,
  TOOLTIP_DATA_SECTIONS,
TOOLTIP_FIGMA_CELL_TESTIDS,
} from './tooltip-playground/manifest';
import { expectFocusRingVisible, scrollToTestId, wrapByTestId } from './tooltip-playground/tooltipHelpers';

test.beforeEach(async ({ page }) => {
  await openTooltipTestScenarios(page);
});

test.describe('Accessibility', { tag: TOOLTIP_TAG_SET.accessibility }, () => {
  test(`[a11y] ${TOOLTIP_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runTooltipAxePageScan(page, TOOLTIP_SHOWCASE_AXE_SCOPE),
    );
    writeTooltipAxeArtefact(results);
    writeTooltipAxeHtmlReport(results);
    expectA11yClean(results, TOOLTIP_WCAG_PAGE_TEST);
  });

  for (const { id, title } of TOOLTIP_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      await page.locator(`[data-section="${id}"]`).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${id}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, title);
    });
  }

  for (const testId of TOOLTIP_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await scrollToTestId(page, testId);
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${blocking.length} serious/critical violation(s)`).toHaveLength(0);
    });
  }

  test(`[a11y] ${TOOLTIP_FIGMA_GRID_AXE_TEST}`, async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    const results = await new AxeBuilder({ page })
      .include('[data-testid^="tt-figma-val-pos-"]')
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    expectA11yClean(results, TOOLTIP_FIGMA_GRID_AXE_TEST);
  });

  for (const section of TOOLTIP_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const sectionEl = page.locator(`[data-section="${section}"]`);
      await sectionEl.scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const testId of TOOLTIP_ALL_WRAPPER_TESTIDS) {
    test(`[a11y] Showcase "${testId}": WCAG 2.1 AA scan has no serious or critical issues`, async ({ page }) => {
      const el = wrapByTestId(page, testId);
      await expect(el, `Playground must define data-testid="${testId}"`).toHaveCount(1);
      await scrollToTestId(page, testId);
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  }

  test(`[a11y] ${TOOLTIP_OPEN_TOOLTIP_NAME_TEST}`, async ({ page }) => {
    await scrollToTestId(page, 'tt-figma-tip-true');
    const tooltip = page.getByRole('tooltip', { name: 'With tip' });
    await expect(tooltip, 'Open tooltip must expose role=tooltip with accessible name').toBeVisible();
  });

  test(`[a11y] ${TOOLTIP_KEYBOARD_TAB_TEST}`, async ({ page }) => {
    await page.locator('#tooltip-trigger-click').scrollIntoViewIfNeeded();
    const btn = wrapByTestId(page, 'tt-figma-trigger-click').locator('button').first();
    await btn.focus();
    await expect(btn).toBeFocused();
    await expectFocusRingVisible(page);
  });

  test(`[a11y] ${TOOLTIP_FOCUS_TRAP_TEST}`, async ({ page }) => {
    await page.locator('#tooltip-trigger-click').scrollIntoViewIfNeeded();
    const btn = wrapByTestId(page, 'tt-figma-trigger-click').locator('button').first();
    await btn.focus();
    await expect(btn).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(btn, 'Tab should advance focus out of the click trigger').not.toBeFocused();
  });

  test(`[a11y] ${TOOLTIP_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const section of TOOLTIP_DATA_SECTIONS) {
      await qaStep(`Reflow check: ${section}`, async () => {
        const band = page.locator(`[data-section="${section}"]`);
        await band.scrollIntoViewIfNeeded();
        await expect(band).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${section} at 320px`).toBe(false);
      });
    }
  });

  test(`[a11y] ${TOOLTIP_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang, '<html lang> should be set for screen readers').toBeTruthy();
  });

  test('[a11y] Full page WCAG 2.1 AA scan has no serious or critical issues (report saved)', async ({ page }) => {
    const results = await runTooltipAxePageScan(page);
    writeTooltipAxeArtefact(results);
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const testId of TOOLTIP_FIGMA_CELL_TESTIDS) {
    test(`[a11y] Figma grid cell "${testId}" — zero serious/critical`, async ({ page }) => {
      await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
      await wrapByTestId(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, `Figma grid cell ${testId}`);
    });
  }
});
