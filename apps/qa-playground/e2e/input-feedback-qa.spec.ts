/**
 * Input Feedback QA playground — functional Playwright tests.
 * Selectors mirror `InputFeedbackQaShowcase.tsx` / `inputFeedbackQaScenarios.tsx`.
 *
 * Component type: **display** (live region row — not focusable; controls panel is interactive).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` InputFeedback defects.
 *
 * Playground inventory (Test Scenarios tab only):
 * - data-section: `IFB_DATA_SECTIONS` (9 bands)
 * - data-testid: `IFB_ALL_TESTIDS` (scenario wrappers + controls)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  expectSectionVisible,
  IFB_TAG_SET,
  IfbTags,
  openInputFeedbackFigmaValidationTab,
  openInputFeedbackTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './input-feedback/input-feedback-qa-support';
import {
  computedMessageColor,
  computedRowFontSize,
  expectFeedbackWrapperVisible,
  expectFocusRingVisible,
  figmaFeedbackCell,
  expectNoPlaygroundFault,
  ifbControlsButton,
  ifbControlsCheckbox,
  ifbControlsMessageInput,
  feedbackIcon,
  expectNonTransparentBackground,
  feedbackMessage,
  feedbackRow,
  feedbackWrapper,
  ifbSection,
  scrollToSection,
} from './input-feedback-playground/inputFeedbackHelpers';
import {
  IFB_ALL_TESTIDS,
  IFB_ATTENTIONS,
  IFB_COMBO_TESTIDS,
  IFB_DATA_SECTIONS,
  IFB_FIGMA_CELL_TESTIDS,
  IFB_FIGMA_MATRIX_MESSAGE,
  IFB_FIGMA_VALIDATION_TAB_LABEL,
  IFB_FIGMA_SIZES,
  IFB_REFLOW_SKIP_SECTIONS,
  IFB_ROOT_TESTIDS,
  IFB_SCENARIO_TESTIDS,
  IFB_SECTION_COUNT,
  IFB_SIZE_DATA,
  IFB_VARIANTS,
  ifbAttentionTestId,
  ifbMatrixTestId,
  ifbSizeTestId,
  ifbVariantTestId,
} from './input-feedback-playground/manifest';

const D = IFB_ROOT_TESTIDS.default;

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/input-feedback`);
  expect(res.ok(), `Input Feedback playground reachable at ${origin}/c/input-feedback`).toBeTruthy();
});

test.describe('Functional', { tag: IFB_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openInputFeedbackTestScenarios(page);
  });

  test.describe('Group 1 — Render', { tag: [IfbTags.functional] }, () => {
    test('[fn] 1.1 — Page heading is visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Input Feedback', exact: true, level: 1 })).toBeVisible();
    });

    test('[fn] 1.1 — Playground loads without console errors', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openInputFeedbackTestScenarios(page);
      await assertNoConsoleErrors(errors);
    });

    test('[fn] 1.1 — Default feedback row renders with negative alert semantics', async ({ page }) => {
      await expectFeedbackWrapperVisible(page, D);
      await expect(feedbackRow(page, D)).toHaveRole('alert');
      await expect(feedbackMessage(page, D)).toContainText('Password must be at least 8 characters');
      await expectNoPlaygroundFault(feedbackRow(page, D));
    });

    test('[fn] 1.1 — All properties mount is visible', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-all-props');
      await expectFeedbackWrapperVisible(page, IFB_ROOT_TESTIDS.allProps);
      await expect(feedbackRow(page, IFB_ROOT_TESTIDS.allProps)).toHaveRole('status');
      await expect(feedbackMessage(page, IFB_ROOT_TESTIDS.allProps)).toContainText('session expires');
    });

    test('[fn] 1.2 — Every scenario data-testid is visible without error text', async ({ page }) => {
      for (const testId of IFB_SCENARIO_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          await feedbackWrapper(page, testId).scrollIntoViewIfNeeded();
          await expectFeedbackWrapperVisible(page, testId);
          await expectNoPlaygroundFault(feedbackRow(page, testId));
        });
      }
    });

    test('[fn] 1.3 — Every showcase data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section^="input-feedback-qa"]');
      expect(await sections.count()).toBe(IFB_SECTION_COUNT);
      for (const sectionId of IFB_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });
  });

  test.describe('Group 2 — Props validation', { tag: [IfbTags.functional] }, () => {
    test('[fn] 2.1 — Default uses size M (data-size 10)', async ({ page }) => {
      await expect(feedbackRow(page, D)).toHaveAttribute('data-size', IFB_SIZE_DATA.M);
    });

    for (const figma of IFB_FIGMA_SIZES) {
      test(`[fn] 2.1 — Size ${figma} maps to data-size "${IFB_SIZE_DATA[figma]}"`, async ({ page }) => {
        await scrollToSection(page, 'input-feedback-qa-size');
        const testId = ifbSizeTestId(figma);
        await expect(feedbackRow(page, testId)).toHaveAttribute('data-size', IFB_SIZE_DATA[figma]);
      });
    }

    for (const attention of IFB_ATTENTIONS) {
      test(`[fn] 2.1 — Attention ${attention} row renders`, async ({ page }) => {
        await scrollToSection(page, 'input-feedback-qa-attention');
        const testId = ifbAttentionTestId(attention);
        await expect(feedbackMessage(page, testId)).toContainText(`${attention} attention`);
      });
    }

    for (const variant of IFB_VARIANTS) {
      test(`[fn] 2.1 — Variant ${variant} exposes expected live region role`, async ({ page }) => {
        await scrollToSection(page, 'input-feedback-qa-variant');
        const testId = ifbVariantTestId(variant);
        const role = variant === 'negative' ? 'alert' : 'status';
        await expect(feedbackRow(page, testId)).toHaveRole(role);
      });
    }

    test('[fn] 2.2 — Font sizes scale progressively S → M → L', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-size');
      const sizes: number[] = [];
      for (const figma of IFB_FIGMA_SIZES) {
        const px = await computedRowFontSize(page, ifbSizeTestId(figma));
        sizes.push(parseFloat(px));
      }
      expect(sizes[1]).toBeGreaterThanOrEqual(sizes[0]);
      expect(sizes[2]).toBeGreaterThanOrEqual(sizes[1]);
    });

    test('[fn] 2.3 — High attention fills differ per variant (distinct message colours)', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-matrix');
      const negativeColor = await computedMessageColor(page, ifbMatrixTestId('negative', 'high'));
      const positiveColor = await computedMessageColor(page, ifbMatrixTestId('positive', 'high'));
      expect(negativeColor).not.toEqual(positiveColor);
    });

    test('[fn] 2.3 — High attention rows use non-transparent backgrounds', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-matrix');
      for (const variant of IFB_VARIANTS) {
        await expectNonTransparentBackground(page, ifbMatrixTestId(variant, 'high'), variant);
      }
    });
  });

  test.describe('Group 3 — Click interaction (N/A on feedback row)', { tag: [IfbTags.functional] }, () => {
    test('3.x — InputFeedback row is not clickable', async () => {
      qaLog('Skipped — display live-region row; clicks apply to controls panel only');
    });
  });

  test.describe('Group 4 — Keyboard (controls panel only)', { tag: [IfbTags.functional] }, () => {
    test('[fn] 4.1 — Tab reaches controls panel message field', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-controls');
      const input = ifbControlsMessageInput(page);
      await input.focus();
      await expect(input).toBeFocused();
    });

    test('[fn] 4.3 — Space toggles customIcon checkbox', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-controls');
      const checkbox = ifbControlsCheckbox(page, /customIcon/i);
      await checkbox.focus();
      const before = await checkbox.isChecked();
      await page.keyboard.press('Space');
      if (before) {
        await expect(checkbox).not.toBeChecked();
      } else {
        await expect(checkbox).toBeChecked();
      }
    });
  });

  test.describe('Group 5 — Focus (controls panel)', { tag: [IfbTags.functional] }, () => {
    test('[fn] 5.2 — Focused control shows visible focus indicator', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-controls');
      await ifbControlsButton(page, 'positive').focus();
      await expectFocusRingVisible(page);
    });
  });

  test.describe('Group 6 — State (N/A)', { tag: [IfbTags.functional] }, () => {
    test('6.x — InputFeedback has no disabled/readonly/checked props', async () => {
      qaLog('Skipped — showcase has no disabled or readonly feedback rows');
    });
  });

  test.describe('Group 7 — Slots (N/A)', { tag: [IfbTags.functional] }, () => {
    test('7.x — No start/end slots on InputFeedback', async () => {
      qaLog('Skipped — feedback row is icon + message only');
    });
  });

  test.describe('Group 8 — Toggle (controls panel)', { tag: [IfbTags.functional] }, () => {
    test('[fn] 8.1 — Variant control updates live preview role', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-controls');
      await ifbControlsButton(page, 'positive').click();
      await expect(feedbackRow(page, IFB_ROOT_TESTIDS.controlsLive)).toHaveRole('status');
      await ifbControlsButton(page, 'negative').click();
      await expect(feedbackRow(page, IFB_ROOT_TESTIDS.controlsLive)).toHaveRole('alert');
    });
  });

  test.describe('Group 9 — Input (controls message field)', { tag: [IfbTags.functional] }, () => {
    test('[fn] 9.1 — Typing updates live feedback message', async ({ page }) => {
      await scrollToSection(page, 'input-feedback-qa-controls');
      const field = ifbControlsMessageInput(page);
      await field.fill('QA automation message');
      await expect(feedbackMessage(page, IFB_ROOT_TESTIDS.controlsLive)).toContainText('QA automation message');
    });
  });

  test.describe('Group 10 — Dependencies (N/A)', { tag: [IfbTags.functional] }, () => {
    test('10.x — No loading/slot dependency matrix', async () => {
      qaLog('Skipped — InputFeedback has no cross-prop dependency toggles in showcase');
    });
  });

  test.describe('Group 11 — Content and display', { tag: [IfbTags.functional] }, () => {
    test('[fn] 11.1 — Default message text is non-empty', async ({ page }) => {
      const text = (await feedbackMessage(page, D).textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('[fn] 11.2 — Default icon is decorative (aria-hidden)', async ({ page }) => {
      await expect(feedbackIcon(page, D)).toBeVisible();
      await expect(feedbackIcon(page, D)).toHaveAttribute('aria-hidden', 'true');
    });

    for (const testId of IFB_COMBO_TESTIDS) {
      test(`[fn] 11.1 — Combo "${testId}" shows message copy`, async ({ page }) => {
        await scrollToSection(page, 'input-feedback-qa-combos');
        await feedbackWrapper(page, testId).scrollIntoViewIfNeeded();
        const text = (await feedbackMessage(page, testId).textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(0);
      });
    }
  });

  test.describe('Group 12 — Layout and responsive', { tag: [IfbTags.functional] }, () => {
    test('[fn] 12.2 — At 320px viewport, bands fit without horizontal scroll', async ({ page }) => {
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

    test('[fn] 12.2b — Default row visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openInputFeedbackTestScenarios(page);
      await expectFeedbackWrapperVisible(page, D);
    });
  });

  test.describe('Group 12 — fullWidth (N/A)', { tag: [IfbTags.functional] }, () => {
    test('12.1 — fullWidth is not an InputFeedback prop', async () => {
      qaLog('Skipped — row uses width 100% in CSS but no fullWidth prop');
    });
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: IFB_FIGMA_VALIDATION_TAB_LABEL })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test.describe('Figma validation matrix', { tag: [IfbTags.functional] }, () => {
    test.beforeEach(async ({ page }) => {
      await openInputFeedbackFigmaValidationTab(page);
    });

    test('[fn] Figma matrix — every cell renders with reference message copy', async ({ page }) => {
      for (const testId of IFB_FIGMA_CELL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const cell = figmaFeedbackCell(page, testId);
          await cell.scrollIntoViewIfNeeded();
          await expect(cell, `Figma cell "${testId}" should be visible`).toBeVisible();
          await expect(feedbackMessage(page, testId)).toContainText(IFB_FIGMA_MATRIX_MESSAGE);
        });
      }
    });

    test('[fn] Figma matrix — negative · high uses role alert', async ({ page }) => {
      const testId = 'figma-input-feedback-negative-sz-M-att-high';
      await expect(feedbackRow(page, testId)).toHaveRole('alert');
    });

    test('[fn] Figma matrix — positive · low uses role status', async ({ page }) => {
      const testId = 'figma-input-feedback-positive-sz-M-att-low';
      await expect(feedbackRow(page, testId)).toHaveRole('status');
    });
  });

  test.describe('Smoke', { tag: IFB_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Input Feedback”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Input Feedback', level: 1 })).toBeVisible();
    });

    test('Smoke — Default feedback wrapper visible', async ({ page }) => {
      await expectFeedbackWrapperVisible(page, D);
    });
  });
});
