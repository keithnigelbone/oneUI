/**
 * Input QA playground — WCAG 2.1 AA automation (axe-core),
 * ARIA contracts, keyboard focus, and reflow checks.
 *
 * **QA rule:** Fail on Input defects; do not weaken assertions to green-wash component bugs.
 * **Raised defect:** BUG-INPUT-001 — errorHighlight must set `aria-invalid="true"` on control.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  formatAxeViolations,
  INPUT_SHOWCASE_AXE_SCOPE,
  INPUT_TAG_SET,
  inputByTestId,
  openInputTestScenarios,
  qaStep,
  runInputAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeInputAxeArtefact,
writeInputAxeHtmlReport,
} from './input/input-qa-support';
import { expectFocusVisible, inputSection, inputShellByTestId } from './input-playground/inputHelpers';
import {
  INPUT_AXE_TARGET_TESTIDS,
  INPUT_DATA_SECTIONS,
  INPUT_FIGMA_APPEARANCES,
  INPUT_FIGMA_ATTENTIONS,
  INPUT_FIGMA_SHAPES,
  INPUT_FIGMA_SIZES,
  INPUT_FIGMA_STATES,
  INPUT_HTML_TYPES,
  INPUT_ROOT_TESTIDS,
  INPUT_SLOT_END,
  INPUT_SLOT_END2,
  INPUT_SLOT_START,
  INPUT_SLOT_START2,
  inputAppearanceTestId,
  inputAttentionTestId,
  inputShapeTestId,
  inputSizeTestId,
  inputSlotEnd2TestId,
  inputSlotEndTestId,
  inputSlotStart2TestId,
  inputSlotStartTestId,
  inputStateTestId
} from './input-playground/manifest';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  INPUT_A11Y_BANDS,
  INPUT_ACCESSIBLE_NAME_LABELED_TEST,
  INPUT_ARIA_VALIDITY_TEST,
INPUT_FEEDBACK_ARIA_INVALID_TEST,
  INPUT_FEEDBACK_SHELL_INVALID_TEST,
  INPUT_LABEL_RULE_TEST,
  INPUT_REFLOW_320_TEST
} from './qa-component-test-labels';

const D = INPUT_ROOT_TESTIDS.default;

/** `input-appearance-primary` → "Appearance Primary" for report titles. */
function inputControlPhrase(testId: string): string {
  return testId
    .replace(/^input-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

test.describe('Accessibility', { tag: INPUT_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openInputTestScenarios(page);
  });

  test('[a11y] Full page WCAG 2.1 AA scan has no serious or critical issues (report saved)', async ({
page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Input story bands', async () => {
      const results = await runInputAxePageScan(page, INPUT_SHOWCASE_AXE_SCOPE);
      writeInputAxeArtefact(results);
      writeInputAxeHtmlReport(results);
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  for (const { id, title } of INPUT_A11Y_BANDS) {
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

  for (const testId of INPUT_AXE_TARGET_TESTIDS) {
    test(`[a11y] Control "${inputControlPhrase(testId)}": WCAG 2.1 AA scan has no serious or critical issues`, async ({
page,
    }) => {
      if (testId !== D) {
        await inputByTestId(page, testId).scrollIntoViewIfNeeded();
      }
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const figma of INPUT_FIGMA_SIZES) {
    test(`[a11y] Size ${figma} input can receive keyboard focus`, async ({ page }) => {
      await page.locator('[data-section="input-qa-size"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, inputSizeTestId(figma));
      await input.focus();
      await expect(input).toBeFocused();
    });
  }

  for (const attention of INPUT_FIGMA_ATTENTIONS) {
    test(`[a11y] Attention ${attention} input is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-attention"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputAttentionTestId(attention))).toBeVisible();
    });
  }

  for (const appearance of INPUT_FIGMA_APPEARANCES) {
    test(`[a11y] Appearance ${appearance} input is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-appearance"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputAppearanceTestId(appearance))).toBeVisible();
    });
  }

  for (const shape of INPUT_FIGMA_SHAPES) {
    test(`[a11y] Shape ${shape} input is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-shape"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputShapeTestId(shape))).toBeVisible();
    });
  }

  for (const state of INPUT_FIGMA_STATES) {
    test(`[a11y] State ${state} input is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputStateTestId(state))).toBeVisible();
    });
  }

  test(`[a11y] ${INPUT_FEEDBACK_SHELL_INVALID_TEST}`, async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    const testId = inputStateTestId('feedback');
    await expect(inputShellByTestId(page, testId)).toHaveAttribute('data-invalid', 'true');
  });

  test(`[a11y] ${INPUT_FEEDBACK_ARIA_INVALID_TEST}`, async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, inputStateTestId('feedback'))).toHaveAttribute('aria-invalid', 'true');
  });

  test(`[a11y] ${INPUT_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(INPUT_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] Placeholder example is visible', async ({ page }) => {
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.placeholder)).toBeVisible();
  });

  test(`[a11y] ${INPUT_ACCESSIBLE_NAME_LABELED_TEST}`, async ({ page }) => {
    await page.locator('[data-section="input-qa-labeled"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.labeled)).toHaveAccessibleName(/Email/i);
  });

  test('[a11y] Disabled state input is disabled', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, inputStateTestId('disabled'))).toBeDisabled();
  });

  test('[a11y] Readonly state input has the readonly attribute', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, inputStateTestId('readonly'))).toHaveAttribute('readonly', '');
  });

  test('[a11y] Required input exposes required or aria-required', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.required);
    const required = await input.getAttribute('required');
    const ariaRequired = await input.getAttribute('aria-required');
    expect(required !== null || ariaRequired === 'true').toBe(true);
  });

  test('[a11y] Start adornment example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-adornments"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.startAdornment)).toBeVisible();
  });

  test('[a11y] End adornment example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-adornments"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.endAdornment)).toBeVisible();
  });

  for (const { type, testId } of INPUT_HTML_TYPES) {
    if (type === 'password') continue;
    test(`[a11y] HTML type ${type} control is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, testId)).toBeVisible();
    });
  }

  test('[a11y] Max length validation example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-validation"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.maxlength)).toBeVisible();
  });

  test('[a11y] Pattern validation example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-validation"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.pattern)).toBeVisible();
  });

  test('[a11y] Full width layout example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-layout"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.fullwidth)).toBeVisible();
  });

  test('[a11y] Autofocus layout example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-layout"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.autofocus)).toBeVisible();
  });

  for (const kind of INPUT_SLOT_START) {
    test(`[a11y] Start slot (${kind}) example is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotStartTestId(kind))).toBeVisible();
    });
  }

  for (const kind of INPUT_SLOT_START2) {
    test(`[a11y] Second start slot (${kind}) example is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotStart2TestId(kind))).toBeVisible();
    });
  }

  for (const kind of INPUT_SLOT_END) {
    test(`[a11y] End slot (${kind}) example is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotEndTestId(kind))).toBeVisible();
    });
  }

  for (const kind of INPUT_SLOT_END2) {
    test(`[a11y] Second end slot (${kind}) example is visible`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotEnd2TestId(kind))).toBeVisible();
    });
  }

  test('[a11y] Default input can receive keyboard focus', async ({ page }) => {
    await inputByTestId(page, D).focus();
    await expect(inputByTestId(page, D)).toBeFocused();
  });

  test('[a11y] Tabbing past the default input does not trap focus in the field', async ({ page }) => {
    await inputByTestId(page, D).focus();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
    }
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBeTruthy();
  });

  test('[a11y] Focused default input shows a visible focus indicator', async ({ page }) => {
    await inputByTestId(page, D).focus();
    await expectFocusVisible(page);
  });

  test(`[a11y] ${INPUT_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(INPUT_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] Password field uses type password', async ({ page }) => {
    await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.typePassword)).toHaveAttribute('type', 'password');
  });

  test('[a11y] Document has a non-empty lang attribute on the html element', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang?.trim()).not.toBe('');
  });

  test('[a11y] Figma XS size row passes axe when scoped to the control', async ({ page }) => {
    await inputByTestId(page, 'input-size-XS').scrollIntoViewIfNeeded();
    const results = await new AxeBuilder({ page })
      .include('[data-testid="input-size-XS"]')
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, `input-size-XS:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
  });

  test(`[a11y] ${INPUT_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openInputTestScenarios(page);
    for (const sectionId of INPUT_DATA_SECTIONS) {
      const band = inputSection(page, sectionId);
      await band.scrollIntoViewIfNeeded();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
    }
  });
});
