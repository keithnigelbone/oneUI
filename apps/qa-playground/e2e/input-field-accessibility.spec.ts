/**
 * Input Field QA — WCAG 2.1 AA (axe-core) + ARIA contracts.
 *
 * Selectors mirror `InputFieldQaShowcase.tsx` / `inputFieldQaScenarios.tsx`.
 * Component type: **interactive** (text input + field label association).
 *
 * **QA rule:** Fail on InputField defects; do not weaken assertions to green-wash component bugs.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { expectA11yClean } from './qa-axe-helpers';
import {
  formatAxeViolations,
  IFF_SHOWCASE_AXE_SCOPE,
  IFF_TAG_SET,
  openInputFieldFigmaValidationTab,
  openInputFieldTestScenarios,
  qaStep,
  runIffAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeIffAxeArtefact,
  writeIffAxeHtmlReport,
} from './input-field/input-field-qa-support';
import {
  fieldFeedbackRow,
  fieldInput,
  fieldInputDecorativeIcons,
  fieldLabel,
  fieldWrapper,
  iffSection,
  scrollToSection,
} from './input-field-playground/inputFieldHelpers';
import {
  IFF_AXE_TARGET_TESTIDS,
  IFF_A11Y_TESTIDS,
  IFF_DATA_SECTIONS,
  IFF_FIGMA_SHOWCASE_AXE_SCOPE,
  IFF_EDGE_TESTIDS,
  IFF_REFLOW_SKIP_SECTIONS,
  IFF_ROOT_TESTIDS,
} from './input-field-playground/manifest';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  IFF_A11Y_BANDS,
  IFF_ARIA_VALIDITY_TEST,
  IFF_FIGMA_A11Y_BANDS,
  IFF_FIGMA_WCAG_GRID_TEST,
  IFF_DEFAULT_LABEL_TEST,
  IFF_DISABLED_INPUT_TEST,
  IFF_FEEDBACK_ALERT_TEST,
  IFF_INFO_ICON_LABEL_TEST,
  IFF_REFLOW_320_TEST,
  IFF_REQUIRED_LABEL_TEST,
  IFF_INVALID_ARIA_TEST,
  IFF_PASSWORD_TYPE_TEST,
  IFF_SLOT_ICON_HIDDEN_TEST,
} from './qa-component-test-labels';

const D = IFF_ROOT_TESTIDS.default;

function iffRowPhrase(testId: string): string {
  return testId
    .replace(/^input-field-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

test.describe('Accessibility', { tag: IFF_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openInputFieldTestScenarios(page);
  });

  test('[a11y] Full page WCAG 2.1 AA scan has no serious or critical issues (report saved)', async ({
    page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Input Field story bands', async () => {
      const results = await runIffAxePageScan(page, IFF_SHOWCASE_AXE_SCOPE);
      writeIffAxeArtefact(results);
      writeIffAxeHtmlReport(results);
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  test(IFF_ARIA_VALIDITY_TEST, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, 'ARIA validity rules on showcase');
    const results = await new AxeBuilder({ page })
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
      ])
      .include(IFF_SHOWCASE_AXE_SCOPE)
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const { id, title } of IFF_A11Y_BANDS) {
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

  test.describe('Figma validation tab', { tag: IFF_TAG_SET.accessibility }, () => {
    test.beforeEach(async ({ page }) => {
      await openInputFieldFigmaValidationTab(page);
    });

    test(`[a11y] ${IFF_FIGMA_WCAG_GRID_TEST}`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(IFF_FIGMA_SHOWCASE_AXE_SCOPE)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });

    for (const { id, title } of IFF_FIGMA_A11Y_BANDS) {
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

  for (const testId of IFF_AXE_TARGET_TESTIDS) {
    test(`[a11y] Row "${iffRowPhrase(testId)}": WCAG 2.1 AA scan has no serious or critical issues`, async ({
      page,
    }) => {
      await fieldWrapper(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  }

  test('[a11y] Section 508 tag run — zero serious/critical on showcase', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(IFF_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    expectA11yClean(results, 'Section 508 — Input Field showcase bands');
  });

  test(IFF_DEFAULT_LABEL_TEST, async ({ page }) => {
    await expect(fieldLabel(page, D)).toBeVisible();
    await expect(fieldInput(page, D)).toHaveAccessibleName(/email address/i);
  });

  test(IFF_REQUIRED_LABEL_TEST, async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-a11y');
    await expect(fieldInput(page, 'input-field-a11y-required')).toHaveAttribute('required', '');
    await expect(fieldLabel(page, 'input-field-a11y-required')).toBeVisible();
  });

  test(IFF_DISABLED_INPUT_TEST, async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-a11y');
    await expect(fieldInput(page, 'input-field-a11y-disabled')).toBeDisabled();
  });

  test('[a11y] Placeholder supplies accessible name when no visible label', async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-a11y');
    await expect(fieldInput(page, 'input-field-a11y-aria-label')).toHaveAccessibleName(/search/i);
  });

  test(IFF_FEEDBACK_ALERT_TEST, async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-isolates');
    await expect(fieldFeedbackRow(page, 'input-field-feedback')).toHaveRole('alert');
  });

  test(IFF_INFO_ICON_LABEL_TEST, async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-isolates');
    await expect(
      fieldWrapper(page, 'input-field-info-icon').getByRole('button', { name: /more information/i }),
    ).toBeVisible();
  });

  test(IFF_SLOT_ICON_HIDDEN_TEST, async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-input-slots');
    await expect(fieldInputDecorativeIcons(page, 'input-field-slot-start').first()).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  test(IFF_REFLOW_320_TEST, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const sectionId of IFF_DATA_SECTIONS) {
      if ((IFF_REFLOW_SKIP_SECTIONS as readonly string[]).includes(sectionId)) continue;
      await qaStep(`Reflow band ${sectionId}`, async () => {
        await scrollToSection(page, sectionId);
        const scrollW = await iffSection(page, sectionId).evaluate((el) => el.scrollWidth);
        const clientW = await iffSection(page, sectionId).evaluate((el) => el.clientWidth);
        expect(scrollW, `Band ${sectionId} should not overflow horizontally`).toBeLessThanOrEqual(clientW + 1);
      });
    }
  });

  for (const testId of IFF_A11Y_TESTIDS) {
    test(`[a11y] A11y mount "${testId}" is visible with associated control`, async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-a11y');
      await expect(fieldWrapper(page, testId)).toBeVisible();
      await expect(fieldInput(page, testId)).toBeVisible();
    });
  }

  test(IFF_INVALID_ARIA_TEST, async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-input-chrome');
    await expect(fieldInput(page, 'input-field-chrome-invalid')).toHaveAttribute('aria-invalid', 'true');
  });

  test(IFF_PASSWORD_TYPE_TEST, async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-input-types');
    await expect(fieldInput(page, 'input-field-type-password')).toBeVisible();
  });

  for (const testId of IFF_EDGE_TESTIDS) {
    test(`[a11y] Edge mount "${testId}" exposes focusable input`, async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-edge');
      const input = fieldInput(page, testId);
      if (testId === 'input-field-edge-disabled-feedback' || testId === 'input-field-edge-disabled-dynamic') {
        await expect(input).toBeDisabled();
        return;
      }
      await expect(input).toBeVisible();
    });
  }
});
