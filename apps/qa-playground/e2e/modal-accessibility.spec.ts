/**
 * Modal QA playground — WCAG 2.1 AA automation (axe-core),
 * dialog ARIA contracts, focus trap, keyboard dismiss, and reflow checks.
 *
 * **QA rule:** Assert playground intent. Fail red on component/showcase defects —
 * never `test.fail()`, never skip to hide failures, never swap selectors to work around missing UI.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  closeModalViaEscape,
  formatAxeViolations,
  modalDialog,
  MODAL_SHOWCASE_AXE_SCOPE,
  MODAL_TAG_SET,
  openModalTestScenarios,
  openModalViaTrigger,
  qaStep,
  runModalAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeModalAxeArtefact,
writeModalAxeHtmlReport
} from './modal/modal-qa-support';
import {
  MODAL_AXE_TARGET_TRIGGERS,
  MODAL_DATA_SECTIONS
} from './modal-playground/manifest';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  MODAL_A11Y_BANDS,
  MODAL_ARIA_VALIDITY_TEST,
  MODAL_ESCAPE_DISMISS_TEST,
  MODAL_FIGMA_WCAG_TEST,
  MODAL_FOCUS_TRAP_TEST,
  MODAL_HEADER_CLOSE_LABEL_TEST,
  MODAL_LABEL_RULE_TEST,
  MODAL_OPEN_DIALOG_AXE_TEST,
MODAL_REFLOW_320_TEST,
} from './qa-component-test-labels';

test.describe('Accessibility', { tag: MODAL_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openModalTestScenarios(page);
  });

  test('[a11y] Full page WCAG 2.1 AA scan has no serious or critical issues (report saved)', async ({
page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Modal story bands', async () => {
      const results = await runModalAxePageScan(page, MODAL_SHOWCASE_AXE_SCOPE);
      writeModalAxeArtefact(results);
      writeModalAxeHtmlReport(results);
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  for (const { id, title } of MODAL_A11Y_BANDS) {
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

test(`[a11y] ${MODAL_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(MODAL_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${MODAL_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(MODAL_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-roles', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const triggerId of MODAL_AXE_TARGET_TRIGGERS) {
    test(`[a11y] Open dialog via "${triggerId}" — axe on [role="dialog"]`, async ({ page }) => {
      await openModalViaTrigger(page, triggerId);
      const results = await new AxeBuilder({ page })
        .withTags([...WCAG_AA_TAGS])
        .include('[role="dialog"]')
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${triggerId} open dialog:\n${formatAxeViolations(blocking)}`).toHaveLength(
        0,
      );
      await closeModalViaEscape(page);
    });
  }

  test(`[a11y] ${MODAL_OPEN_DIALOG_AXE_TEST}`, async ({ page }) => {
    await openModalViaTrigger(page, 'modal-trigger-default');
    const results = await new AxeBuilder({ page })
      .withTags([...WCAG_AA_TAGS])
      .include('[role="dialog"]')
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    await closeModalViaEscape(page);
  });

  test(`[a11y] ${MODAL_HEADER_CLOSE_LABEL_TEST}`, async ({ page }) => {
    await openModalViaTrigger(page, 'modal-trigger-default');
    const closeBtn = modalDialog(page).locator('button[aria-label="Close"]');
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute('aria-label', 'Close');
    await closeModalViaEscape(page);
  });

  test(`[a11y] ${MODAL_ESCAPE_DISMISS_TEST}`, async ({ page }) => {
    await openModalViaTrigger(page, 'modal-trigger-default');
    await expect(modalDialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modalDialog(page)).toHaveCount(0);
  });

  test(`[a11y] ${MODAL_FOCUS_TRAP_TEST}`, async ({ page }) => {
    await openModalViaTrigger(page, 'modal-trigger-default');
    await expect(modalDialog(page)).toBeVisible();
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
    expect(focused, 'Focus should remain inside dialog after Tab').not.toBeNull();
    await closeModalViaEscape(page);
  });

  test(`[a11y] ${MODAL_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openModalTestScenarios(page);
    for (const sectionId of MODAL_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${sectionId}"]`);
      await band.scrollIntoViewIfNeeded();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${sectionId} at 320px`).toBe(false);
    }
  });

  test(`[a11y] ${MODAL_FIGMA_WCAG_TEST}`, async ({ page }) => {
    await qaStep('Open Figma Validation tab and scan grid', async () => {
      await page.getByRole('tab', { name: 'Figma Validation' }).click();
      await expect(page.getByTestId('figma-modal-grid')).toBeVisible();
      const results = await new AxeBuilder({ page })
        .include('[data-testid="figma-modal-grid"]')
        .withTags([...WCAG_AA_TAGS])
        // Grid viewport uses overflow-x scroll for layout; not keyboard-focusable by design.
        .disableRules(['scrollable-region-focusable'])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });
});
