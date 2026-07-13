/**
 * Input Dynamic Text QA playground — WCAG 2.1 AA automation (axe-core),
 * ARIA contracts, keyboard focus, and reflow checks.
 *
 * **QA rule:** Fail on InputDynamicText defects; do not weaken assertions to green-wash component bugs.
*
 * **Raised defect (tests must fail until fixed — do not soften):**
 * - BUG-IDT-001 — `idt-disabled` row fails axe `color-contrast` (disabled copy/button vs fill below WCAG AA).
 *   Fails: full-page scan, states band, disabled row scope, color-contrast rule sweep.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  formatAxeViolations,
  IDT_SHOWCASE_AXE_SCOPE,
  IDT_TAG_SET,
  dynamicTextByTestId,
  dynamicTextContent,
  dynamicTextEndButton,
  idtSection,
  openIdtTestScenarios,
  qaStep,
  runIdtAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeIdtAxeArtefact,
writeIdtAxeHtmlReport,
} from './input-dynamic-text/input-dynamic-text-qa-support';
import {
  IDT_AXE_TARGET_TESTIDS,
  IDT_COMBO_KEYS,
  IDT_CONTENT_END_PRESETS,
  IDT_DATA_SECTIONS,
  IDT_FIGMA_SIZES,
  IDT_ROOT_TESTIDS,
  idtSizeTestId,
  idtSlotTestId
} from './input-dynamic-text-playground/manifest';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  IDT_A11Y_BANDS,
  IDT_ARIA_VALIDITY_TEST,
IDT_END_ARIA_LABEL_TEST,
  IDT_REFLOW_320_TEST
} from './qa-component-test-labels';

const D = IDT_ROOT_TESTIDS.default;

/** `idt-size-M` → "Size M" for report titles. */
function idtRowPhrase(testId: string): string {
  return testId
    .replace(/^idt-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

test.describe('Accessibility', { tag: IDT_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openIdtTestScenarios(page);
  });

  test('[a11y] Full page WCAG 2.1 AA scan has no serious or critical issues (report saved)', async ({
page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Input Dynamic Text story bands', async () => {
      const results = await runIdtAxePageScan(page, IDT_SHOWCASE_AXE_SCOPE);
      writeIdtAxeArtefact(results);
      writeIdtAxeHtmlReport(results);
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  for (const { id, title } of IDT_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      await qaStep(`axe WCAG tags on [data-section="${id}"]`, async () => {
        const results = await new AxeBuilder({ page })
          .include(`[data-section="${id}"]`)
          .withTags([...WCAG_AA_TAGS])
          .analyze();
        const blocking = seriousOrCritical(results.violations);
        expect(blocking, `Section "${id}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
      });
    });
  }

  for (const testId of IDT_AXE_TARGET_TESTIDS) {
    test(`[a11y] Row "${idtRowPhrase(testId)}": WCAG 2.1 AA scan has no serious or critical issues`, async ({
page,
    }) => {
      if (testId !== D) {
        await dynamicTextByTestId(page, testId).scrollIntoViewIfNeeded();
      }
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const figma of IDT_FIGMA_SIZES) {
    test(`[a11y] Size ${figma} row is visible`, async ({ page }) => {
      await page.locator('[data-section="idt-qa-size"]').scrollIntoViewIfNeeded();
      await expect(dynamicTextByTestId(page, idtSizeTestId(figma))).toBeVisible();
    });
  }

  for (const preset of IDT_CONTENT_END_PRESETS) {
    test(`[a11y] Content and end preset "${preset}" behaves as expected`, async ({ page }) => {
      await page.locator('[data-section="idt-qa-content-end"]').scrollIntoViewIfNeeded();
      const testId = idtSlotTestId(preset);
      if (preset === 'none') {
        await expect(page.getByTestId(testId)).toHaveCount(0);
        return;
      }
      await expect(dynamicTextByTestId(page, testId)).toBeVisible();
    });
  }

  test('[a11y] Disabled row trailing button is disabled', async ({ page }) => {
    await page.locator('[data-section="idt-qa-states"]').scrollIntoViewIfNeeded();
    await expect(dynamicTextEndButton(page, IDT_ROOT_TESTIDS.disabled)).toBeDisabled();
  });

  test('[a11y] Default trailing button has an accessible name from its label', async ({ page }) => {
    await expect(dynamicTextEndButton(page, D)).toHaveAccessibleName(/Helper Button/i);
  });

  test(`[a11y] ${IDT_END_ARIA_LABEL_TEST}`, async ({ page }) => {
    await page.locator('[data-section="idt-qa-states"]').scrollIntoViewIfNeeded();
    await expect(dynamicTextEndButton(page, IDT_ROOT_TESTIDS.endAriaLabel)).toHaveAccessibleName(
      'Submit helper action',
    );
  });

  test('[a11y] Polite aria-live region on content copy', async ({ page }) => {
    await page.locator('[data-section="idt-qa-states"]').scrollIntoViewIfNeeded();
    await expect(dynamicTextContent(page, IDT_ROOT_TESTIDS.ariaLivePolite)).toHaveAttribute(
      'aria-live',
      'polite',
    );
});


  test(`[a11y] ${IDT_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(IDT_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] Document has a non-empty lang attribute on the html element', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang?.trim()).not.toBe('');
  });

  for (const { testId } of IDT_COMBO_KEYS) {
    test(`[a11y] Combination row "${idtRowPhrase(testId)}" is visible`, async ({ page }) => {
      await page.locator('[data-section="idt-qa-combos"]').scrollIntoViewIfNeeded();
      await expect(dynamicTextByTestId(page, testId)).toBeVisible();
    });
  }

  test('[a11y] Empty slot preset does not mount a row root in the DOM', async ({ page }) => {
    await page.locator('[data-section="idt-qa-content-end"]').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('idt-slot-none')).toHaveCount(0);
  });

  test(`[a11y] ${IDT_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openIdtTestScenarios(page);
    for (const sectionId of IDT_DATA_SECTIONS) {
      const band = idtSection(page, sectionId);
      await band.scrollIntoViewIfNeeded();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
    }
  });
});
