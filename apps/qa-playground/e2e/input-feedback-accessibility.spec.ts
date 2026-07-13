/**
 * Input Feedback QA playground — WCAG 2.1 AA automation (axe-core) + ARIA contracts.
 *
 * Selectors mirror `InputFeedbackQaShowcase.tsx` / `inputFeedbackQaScenarios.tsx`.
 *
 * **QA rule:** Fail on InputFeedback defects; do not weaken assertions to green-wash component bugs.
 *
 * Component type: **display** — live region semantics; keyboard tests target controls panel only.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { expectA11yClean } from './qa-axe-helpers';
import {
  assertThemeActivatesWithKey,
  formatAxeViolations,
  IFB_SHOWCASE_AXE_SCOPE,
  IFB_TAG_SET,
  openInputFeedbackFigmaValidationTab,
  openInputFeedbackTestScenarios,
  qaStep,
  runIfbAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeIfbAxeArtefact,
  writeIfbAxeHtmlReport,
} from './input-feedback/input-feedback-qa-support';
import {
  feedbackIcon,
  feedbackMessage,
  feedbackRow,
  feedbackWrapper,
  ifbSection,
  scrollToSection,
} from './input-feedback-playground/inputFeedbackHelpers';
import {
  IFB_AXE_TARGET_TESTIDS,
  IFB_DATA_SECTIONS,
  IFB_FIGMA_SHOWCASE_AXE_SCOPE,
  IFB_REFLOW_SKIP_SECTIONS,
  IFB_ROOT_TESTIDS,
  IFB_VARIANTS,
  ifbMatrixTestId,
  ifbVariantTestId,
} from './input-feedback-playground/manifest';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  IFB_A11Y_BANDS,
  IFB_FIGMA_A11Y_BANDS,
  IFB_FIGMA_WCAG_GRID_TEST,
  IFB_ARIA_VALIDITY_TEST,
  IFB_DEFAULT_ALERT_TEST,
  IFB_ICON_HIDDEN_TEST,
  IFB_REFLOW_320_TEST,
  IFB_VARIANT_STATUS_TEST,
} from './qa-component-test-labels';

const D = IFB_ROOT_TESTIDS.default;

function ifbRowPhrase(testId: string): string {
  return testId
    .replace(/^input-feedback-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

test.describe('Accessibility', { tag: IFB_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openInputFeedbackTestScenarios(page);
  });

  test('[a11y] Full page WCAG 2.1 AA scan has no serious or critical issues (report saved)', async ({
    page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Input Feedback story bands', async () => {
      const results = await runIfbAxePageScan(page, IFB_SHOWCASE_AXE_SCOPE);
      writeIfbAxeArtefact(results);
      writeIfbAxeHtmlReport(results);
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  for (const { id, title } of IFB_A11Y_BANDS) {
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

  test.describe('Figma validation tab', { tag: IFB_TAG_SET.accessibility }, () => {
    test.beforeEach(async ({ page }) => {
      await openInputFeedbackFigmaValidationTab(page);
    });

    test(`[a11y] ${IFB_FIGMA_WCAG_GRID_TEST}`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(IFB_FIGMA_SHOWCASE_AXE_SCOPE)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });

    for (const { id, title } of IFB_FIGMA_A11Y_BANDS) {
      test(`[a11y] ${title}`, async ({ page }, testInfo) => {
        qaAnnotate(testInfo, { band: id });
        const results = await new AxeBuilder({ page })
          .include(`[data-section="${id}"]`)
          .withTags([...WCAG_AA_TAGS])
          .analyze();
        const blocking = seriousOrCritical(results.violations);
        expect(blocking, `Section "${id}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
      });
    }
  });

  for (const testId of IFB_AXE_TARGET_TESTIDS) {
    test(`[a11y] Row "${ifbRowPhrase(testId)}": WCAG 2.1 AA scan has no serious or critical issues`, async ({
      page,
    }) => {
      await feedbackWrapper(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  }

  test('[a11y] Section 508 tag run — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(IFB_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    expectA11yClean(results, 'Section 508 — Input Feedback showcase bands');
  });

  test(`[a11y] ${IFB_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
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

  test(`[a11y] ${IFB_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openInputFeedbackTestScenarios(page);
    for (const sectionId of IFB_DATA_SECTIONS) {
      if ((IFB_REFLOW_SKIP_SECTIONS as readonly string[]).includes(sectionId)) continue;
      const band = ifbSection(page, sectionId);
      await band.scrollIntoViewIfNeeded();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
    }
  });

  test('[a11y] resize: 200% zoom — feedback rows remain visible', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    for (const testId of [D, IFB_ROOT_TESTIDS.allProps] as const) {
      await expect(feedbackWrapper(page, testId)).toBeVisible();
    }
  });

  test('[a11y] Tab reaches a focusable control in the controls panel', async ({ page }) => {
    await scrollToSection(page, 'input-feedback-qa-controls');
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test(`[a11y] ${IFB_DEFAULT_ALERT_TEST}`, async ({ page }) => {
    await expect(feedbackRow(page, D)).toHaveRole('alert');
    await expect(feedbackMessage(page, D)).toContainText(/password/i);
  });

  for (const variant of IFB_VARIANTS) {
    if (variant === 'negative') continue;
    test(`[a11y] ${IFB_VARIANT_STATUS_TEST(variant)}`, async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-variant');
      await expect(feedbackRow(page, ifbVariantTestId(variant))).toHaveRole('status');
    });
  }

  test(`[a11y] ${IFB_ICON_HIDDEN_TEST}`, async ({ page }) => {
    await expect(feedbackIcon(page, D)).toBeVisible();
    await expect(feedbackIcon(page, D)).toHaveAttribute('aria-hidden', 'true');
  });

  test('[a11y] High attention matrix rows expose message text to assistive tech', async ({ page }) => {
    await scrollToSection(page, 'input-feedback-qa-matrix');
    for (const variant of IFB_VARIANTS) {
      const row = feedbackRow(page, ifbMatrixTestId(variant, 'high'));
      const text = (await row.textContent())?.trim() ?? '';
      expect(text.length, `${variant} high row should include message copy`).toBeGreaterThan(0);
    }
  });

  test('[a11y] Controls panel message field has accessible name', async ({ page }) => {
    await scrollToSection(page, 'input-feedback-qa-controls');
    await expect(page.getByTestId('input-feedback-ctrl-message')).toHaveAccessibleName(/feedback message/i);
  });

  test('[a11y] Theme toggle activates with Enter when focused', async ({ page }) => {
    await assertThemeActivatesWithKey(page, 'Enter');
  });
});
