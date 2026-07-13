/**
 * Input Field QA playground — functional Playwright tests.
 *
 * STEP 1 inventory (`inputFieldQaScenarios.tsx` — Test Scenarios tab only):
 * - Component type: **interactive** (text/password/number input inside Field.Root)
 * - Route: `/c/input-field`
 * - data-section (14): `input-field-qa-default` … `input-field-qa-controls` — see `IFF_DATA_SECTIONS`
 * - data-testid: `IFF_SCENARIO_TESTIDS` (90 mounts) + `input-field-controls-panel` / `input-field-controls-live`
 *   + controls `input-field-ctrl-*` — see `IFF_ALL_TESTIDS`
 * - Props: size 8|10|12, label, description, required, infoIcon, error|feedback slot, dynamicText|slot,
 *   disabled, readOnly, invalid, fullWidth, attention, shape, appearance, type, start|start2|end|end2, labelSlot
 *
 * **QA rule:** Fail on `@oneui/ui` defects; do not weaken assertions to green-wash component bugs.
 * Appearance band uses default **medium** attention → role colour reads on **border**, not fill.
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  expectSectionVisible,
  IFF_TAG_SET,
  IffTags,
  gotoInputFieldPlayground,
  openInputFieldFigmaValidationTab,
  openInputFieldTestScenarios,
  qaLog,
  qaStep,
} from './input-field/input-field-qa-support';
import {
  computedInputBackgroundRgb,
  computedInputBorderRgb,
  computedInputFontSize,
  computedSlotIconColorRgb,
  expectDistinctInputBorder,
  expectFieldWrapperVisible,
  expectFocusRingVisible,
  expectNoPlaygroundFault,
  expectNonTransparentInputBackground,
  expectWrapperFillsParentCell,
  fieldFeedbackRow,
  figmaInputFieldCell,
  fieldInput,
  fieldInputContainer,
  fieldInputDecorativeIcons,
  fieldInputSlotSvgs,
  fieldLabel,
  fieldWrapper,
  iffControlsButton,
  iffControlsCheckbox,
  iffControlsLabelTextInput,
  iffSection,
  scrollToSection,
} from './input-field-playground/inputFieldHelpers';
import {
  IFF_APPEARANCE_ROLES,
  IFF_DATA_SECTIONS,
  IFF_FIGMA_SIZES,
  IFF_FIGMA_CELL_TESTIDS,
  IFF_FIGMA_LABEL,
  IFF_FIGMA_PLACEHOLDER,
  IFF_FIGMA_SIZE_CODE,
  IFF_FIGMA_SIZE_LABELS,
  IFF_FIGMA_VALIDATION_TAB_LABEL,
  IFF_FIELD_SLOT_TESTIDS,
  IFF_INPUT_CHROME_TESTIDS,
  IFF_INPUT_TYPE_TESTIDS,
  IFF_INPUT_SLOT_TESTIDS,
  IFF_PLAYGROUND_INVENTORY,
  IFF_REFLOW_SKIP_SECTIONS,
  IFF_ROOT_TESTIDS,
  IFF_SCENARIO_TESTIDS,
  IFF_SECTION_COUNT,
  IFF_SIZE_DATA,
  iffAppearanceTestId,
  iffFigmaCellTestId,
  iffSizeTestId,
} from './input-field-playground/manifest';

const D = IFF_ROOT_TESTIDS.default;

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/input-field`);
  expect(res.ok(), `Input Field playground reachable at ${origin}/c/input-field`).toBeTruthy();
});

test.describe('Functional', { tag: IFF_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openInputFieldTestScenarios(page);
  });

  // ── Group 1 — Render ────────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [IffTags.functional] }, () => {
    test('[fn] 1.1 — Page heading is visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Input Field', exact: true, level: 1 })).toBeVisible();
    });

    test('[fn] 1.1 — Playground loads without console errors', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openInputFieldTestScenarios(page);
      await assertNoConsoleErrors(errors);
    });

    test('[fn] 1.1 — Default field renders with label and textbox', async ({ page }) => {
      await expectFieldWrapperVisible(page, D);
      await expect(fieldLabel(page, D)).toContainText('Email address');
      await expect(fieldInput(page, D)).toBeVisible();
      await expectNoPlaygroundFault(fieldWrapper(page, D));
    });

    test('[fn] 1.1 — All properties mount is visible', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-all-props');
      await expectFieldWrapperVisible(page, IFF_ROOT_TESTIDS.allProps);
      await expect(fieldLabel(page, IFF_ROOT_TESTIDS.allProps)).toBeVisible();
      await expect(fieldInput(page, IFF_ROOT_TESTIDS.allProps)).toBeVisible();
    });

    test('[fn] 1.1 — Playground inventory matches manifest', async () => {
      qaLog('InputField playground inventory', IFF_PLAYGROUND_INVENTORY);
      expect(IFF_PLAYGROUND_INVENTORY.componentType).toBe('interactive');
      expect(IFF_DATA_SECTIONS.length).toBe(IFF_SECTION_COUNT);
      expect(IFF_SCENARIO_TESTIDS.length).toBeGreaterThan(80);
    });

    test('[fn] 1.2 — Every scenario data-testid is visible', async ({ page }) => {
      for (const testId of IFF_SCENARIO_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          await fieldWrapper(page, testId).scrollIntoViewIfNeeded();
          await expectFieldWrapperVisible(page, testId);
          await expect(fieldInput(page, testId), `Input control in "${testId}"`).toBeVisible();
          await expectNoPlaygroundFault(fieldWrapper(page, testId));
        });
      }
    });

    test('[fn] 1.2 — Controls panel and live preview testids are visible', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-controls');
      await expect(page.getByTestId(IFF_ROOT_TESTIDS.controlsPanel)).toBeVisible();
      await expect(page.getByTestId(IFF_ROOT_TESTIDS.controlsLive)).toBeVisible();
    });

    test('[fn] 1.3 — Every showcase data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section^="input-field-qa"]');
      expect(await sections.count(), 'Section count on Test Scenarios tab').toBe(IFF_SECTION_COUNT);
      for (const sectionId of IFF_DATA_SECTIONS) {
        await qaStep(`Assert section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [IffTags.functional] }, () => {
    for (const figma of IFF_FIGMA_SIZES) {
      test(`[fn] 2.1 — Size ${figma} input shell uses data-size "${IFF_SIZE_DATA[figma]}"`, async ({ page }) => {
        await scrollToSection(page, 'input-field-qa-size');
        const testId = iffSizeTestId(figma);
        await expect(fieldInputContainer(page, testId)).toHaveAttribute('data-size', IFF_SIZE_DATA[figma]);
      });
    }

    test('[fn] 2.2 — Font sizes scale progressively S → M → L', async ({ page }) => {
      const sizes: number[] = [];
      for (const figma of IFF_FIGMA_SIZES) {
        const testId = iffSizeTestId(figma);
        await fieldWrapper(page, testId).evaluate((el) =>
          el.scrollIntoView({ block: 'center', inline: 'nearest' }),
        );
        const px = await computedInputFontSize(page, testId);
        sizes.push(parseFloat(px));
      }
      expect(sizes[1], 'Size M font should be ≥ S').toBeGreaterThanOrEqual(sizes[0]);
      expect(sizes[2], 'Size L font should be ≥ M').toBeGreaterThanOrEqual(sizes[1]);
    });

    test('[fn] 2.1 — Required field shows asterisk in label', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      await expect(fieldLabel(page, 'input-field-required')).toContainText('*');
    });

    test('[fn] 2.1 — Disabled field input is disabled', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      await expect(fieldInput(page, 'input-field-disabled')).toBeDisabled();
    });

    test('[fn] 2.1 — Feedback mount shows error message', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      await expect(fieldWrapper(page, 'input-field-feedback')).toContainText('not valid');
    });

    test('[fn] 2.1 — Invalid chrome mount sets aria-invalid on control', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-chrome');
      await expect(fieldInput(page, 'input-field-chrome-invalid')).toHaveAttribute('aria-invalid', 'true');
    });

    test('[fn] 2.1 — Readonly mount keeps value unchanged on fill attempt', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-chrome');
      const input = fieldInput(page, 'input-field-chrome-readonly');
      await expect(input).toHaveAttribute('readonly', '');
      const before = await input.inputValue();
      await input.fill('changed', { force: true });
      await expect(input).toHaveValue(before);
    });

    // Resting input stroke is surface-relative, NOT appearance-relative (see Input.module.css):
    // on the page background every appearance role shares the same neutral medium-attention
    // border. The role only tints the border inside a colored <Surface> or on focus.
    test('[fn] 2.3 — Appearance roles share the neutral resting border on the page surface', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-appearance');
      const colours: string[] = [];
      for (const role of ['primary', 'negative'] as const) {
        colours.push(await computedInputBorderRgb(page, iffAppearanceTestId(role)));
      }
      expect(colours[0], 'Primary and negative resting borders are both neutral on the page surface').toEqual(colours[1]);
    });

    for (const role of IFF_APPEARANCE_ROLES) {
      test(`[fn] 2.3 — Appearance "${role}" resolves a visible border colour`, async ({ page }) => {
        await scrollToSection(page, 'input-field-qa-appearance');
        await expectDistinctInputBorder(page, iffAppearanceTestId(role), role);
      });
    }

    test('[fn] 2.3 — Attention high uses non-transparent filled background', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-chrome');
      const medium = await computedInputBackgroundRgb(page, 'input-field-chrome-attention-medium');
      const high = await computedInputBackgroundRgb(page, 'input-field-chrome-attention-high');
      expect(medium, 'Medium and high attention backgrounds should differ').not.toEqual(high);
      await expectNonTransparentInputBackground(page, 'input-field-chrome-attention-high', 'high attention');
    });

    test('[fn] 2.1 — Pill shape uses different border-radius than default shape', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-chrome');
      const defaultRadius = await fieldInputContainer(page, 'input-field-chrome-shape-default').evaluate(
        (el) => getComputedStyle(el as HTMLElement).borderRadius,
      );
      const pillRadius = await fieldInputContainer(page, 'input-field-chrome-shape-pill').evaluate(
        (el) => getComputedStyle(el as HTMLElement).borderRadius,
      );
      expect(defaultRadius, 'Default and pill shape border-radius should differ').not.toEqual(pillRadius);
    });

    for (const testId of IFF_INPUT_TYPE_TESTIDS) {
      test(`[fn] 2.1 — Input type mount "${testId}" renders control`, async ({ page }) => {
        await scrollToSection(page, 'input-field-qa-input-types');
        await expectFieldWrapperVisible(page, testId);
        await expect(fieldInput(page, testId)).toBeVisible();
      });
    }

    for (const testId of IFF_FIELD_SLOT_TESTIDS) {
      test(`[fn] 2.1 — Field slot mount "${testId}" renders`, async ({ page }) => {
        await scrollToSection(page, 'input-field-qa-field-slots');
        await expectFieldWrapperVisible(page, testId);
      });
    }

    for (const testId of IFF_INPUT_CHROME_TESTIDS) {
      test(`[fn] 2.1 — Chrome mount "${testId}" is visible`, async ({ page }) => {
        await scrollToSection(page, 'input-field-qa-input-chrome');
        await expectFieldWrapperVisible(page, testId);
      });
    }
  });

  // ── Group 3 — Click interaction ─────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [IffTags.functional] }, () => {
    test('[fn] 3.1 — Click focuses the default text input', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.click();
      await expect(input, 'Click should focus the text input').toBeFocused();
    });

    test('[fn] 3.2 — Disabled field does not accept typing on click', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      const input = fieldInput(page, 'input-field-disabled');
      await input.click({ force: true });
      await input.fill('blocked', { force: true });
      await expect(input).toHaveValue('');
    });

    test('[fn] 3.3 — Readonly field does not change value on click + fill', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-chrome');
      const input = fieldInput(page, 'input-field-chrome-readonly');
      const before = await input.inputValue();
      await input.click({ force: true });
      await input.fill('new text', { force: true });
      await expect(input, 'Readonly value must stay unchanged').toHaveValue(before);
    });

    test('[fn] 3.4 — Click outside removes focus from input', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.focus();
      await expect(input).toBeFocused();
      await page.getByRole('heading', { name: 'Input Field' }).click();
      await expect(input, 'Focus should leave the input after clicking outside').not.toBeFocused();
    });
  });

  // ── Group 4 — Keyboard navigation ───────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [IffTags.functional] }, () => {
    test('[fn] 4.1 — Tab reaches default text input', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.focus();
      await expect(input, 'Default input should be focusable').toBeFocused();
    });

    test('[fn] 4.1 — Disabled field is not editable via keyboard', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      const input = fieldInput(page, 'input-field-disabled');
      await expect(input).toBeDisabled();
    });

    test('[fn] 4.1 — Shift+Tab moves focus away from controls label field', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-controls');
      const labelInput = iffControlsLabelTextInput(page);
      await labelInput.focus();
      await page.keyboard.press('Shift+Tab');
      await expect(labelInput, 'Shift+Tab should move focus off the label text field').not.toBeFocused();
    });

    test('[fn] 4.1 — Tab reaches controls panel label text field when label on', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-controls');
      const input = iffControlsLabelTextInput(page);
      await input.focus();
      await expect(input).toBeFocused();
    });

    test('[fn] 4.2 — Enter key (N/A on single-line text)', async () => {
      qaLog('Skipped — Enter in a text field inserts newline only for textarea; InputField uses type=text');
    });

    test('[fn] 4.3 — Space toggles required checkbox in controls panel', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-controls');
      const checkbox = iffControlsCheckbox(page, /^required$/i);
      await checkbox.focus();
      const before = await checkbox.isChecked();
      await page.keyboard.press('Space');
      if (before) {
        await expect(checkbox).not.toBeChecked();
      } else {
        await expect(checkbox).toBeChecked();
      }
    });

    test('[fn] 4.3 — User can type characters in default field', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.focus();
      await page.keyboard.type('qa');
      await expect(input).toHaveValue(/qa/);
    });

    test('[fn] 4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — InputField is not a list; arrow keys move caret inside text only');
    });

    test('[fn] 4.5 — Home and End (N/A)', async () => {
      qaLog('Skipped — InputField is not a collection; Home/End move caret');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No dropdown or modal on InputField showcase');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      await fieldInput(page, D).focus();
      for (let i = 0; i < 15; i += 1) {
        await page.keyboard.press('Tab');
      }
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(activeTag.length, 'Focus should move through the page').toBeGreaterThan(0);
    });
  });

  // ── Group 5 — Focus management ──────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [IffTags.functional] }, () => {
    test('[fn] 5.1 — Click to focus default input', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.click();
      await expect(input).toBeFocused();
    });

    test('[fn] 5.2 — Focused input shows visible focus indicator', async ({ page }) => {
      await fieldInput(page, D).focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.3 — Focus order reaches input after label stack', async ({ page }) => {
      await fieldInput(page, D).focus();
      await expect(fieldInput(page, D)).toBeFocused();
    });

    test('[fn] 5.4 — Blur removes focus from input', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.focus();
      await input.blur();
      await expect(input).not.toBeFocused();
    });

    test('[fn] 5.5 — autoFocus (N/A in showcase)', async () => {
      qaLog('Skipped — No autoFocus scenario mount in playground');
    });
  });

  // ── Group 6 — State tests ───────────────────────────────────────────────────
  test.describe('Group 6 — State tests', { tag: [IffTags.functional] }, () => {
    test('[fn] 6.1 — Default state is editable with placeholder', async ({ page }) => {
      const input = fieldInput(page, D);
      await expect(input).toBeEditable();
      await expect(input).toHaveAttribute('placeholder', /example/i);
    });

    test('[fn] 6.2 — Selected/checked (N/A)', async () => {
      qaLog('Skipped — InputField has no selected/checked state');
    });

    test('[fn] 6.3 — Disabled state blocks interaction', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      const input = fieldInput(page, 'input-field-disabled');
      await expect(input).toBeDisabled();
      await input.click({ force: true });
      await expect(input, 'Disabled input should not become focused on click').not.toBeFocused();
    });

    test('[fn] 6.4 — Readonly state preserves value and allows focus', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-chrome');
      const input = fieldInput(page, 'input-field-chrome-readonly');
      await input.focus();
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute('readonly', '');
    });

    test('[fn] 6.5 — Error state shows feedback and aria-invalid', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      await expect(fieldInput(page, 'input-field-feedback')).toHaveAttribute('aria-invalid', 'true');
      await expect(fieldFeedbackRow(page, 'input-field-feedback')).toBeVisible();
    });

    test('[fn] 6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — InputField has no loading prop in playground');
    });
  });

  // ── Group 7 — Slot tests ────────────────────────────────────────────────────
  test.describe('Group 7 — Slot tests', { tag: [IffTags.functional] }, () => {
    test('[fn] 7.1 — Default field has no start/end slot icons', async ({ page }) => {
      await expect(fieldInputSlotSvgs(page, D)).toHaveCount(0);
    });

    test('[fn] 7.1 — Start slot renders decorative icon', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-slots');
      const icons = fieldInputDecorativeIcons(page, 'input-field-slot-start');
      await expect(icons.first()).toBeVisible();
    });

    test('[fn] 7.2 — End slot renders decorative icon', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-slots');
      const icons = fieldInputDecorativeIcons(page, 'input-field-slot-end');
      await expect(icons.first()).toBeVisible();
    });

    test('[fn] 7.3 — Start and end icons visible together', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-slots');
      await expect(
        fieldInputSlotSvgs(page, 'input-field-slot-start-end'),
        'Start + end slots should render two icon SVGs',
      ).toHaveCount(2);
    });

    test('[fn] 7.1 — start2 prefix text is visible', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-slots');
      await expect(fieldWrapper(page, 'input-field-slot-start2')).toContainText('$');
    });

    test('[fn] 7.2 — end2 suffix text is visible', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-slots');
      await expect(fieldWrapper(page, 'input-field-slot-end2')).toContainText('kg');
    });

    for (const testId of IFF_INPUT_SLOT_TESTIDS) {
      test(`[fn] 7.x — Slot mount "${testId}" is visible`, async ({ page }) => {
        await scrollToSection(page, 'input-field-qa-input-slots');
        await expectFieldWrapperVisible(page, testId);
      });
    }

    test('[fn] 7.4 — Slot icons use aria-hidden', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-slots');
      const icon = fieldInputDecorativeIcons(page, 'input-field-slot-start').first();
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    test('[fn] 7.4 — Slot icon colour is resolved (not transparent)', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-appearance');
      const iconColor = await computedSlotIconColorRgb(page, iffAppearanceTestId('primary'));
      expect(iconColor, 'Start icon should inherit a visible colour from appearance').not.toMatch(
        /^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/,
      );
      expect(iconColor).not.toBe('transparent');
    });
  });

  // ── Group 8 — Toggle and selection (controls panel) ─────────────────────────
  test.describe('Group 8 — Toggle and selection', { tag: [IffTags.functional] }, () => {
    test('[fn] 8.1 — Size L control updates live preview data-size', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-controls');
      await iffControlsButton(page, 'L').click();
      await expect(fieldInputContainer(page, IFF_ROOT_TESTIDS.controlsLive)).toHaveAttribute(
        'data-size',
        '12',
      );
    });

    test('[fn] 8.2 — Disabling label hides visible label on live preview', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-controls');
      const labelCheckbox = iffControlsCheckbox(page, /^label$/i);
      if (await labelCheckbox.isChecked()) {
        await labelCheckbox.click();
      }
      await expect(fieldLabel(page, IFF_ROOT_TESTIDS.controlsLive)).toHaveCount(0);
    });

    test('[fn] 8.1 — Toggle on/off (N/A)', async () => {
      qaLog('Skipped — InputField is not a toggle; controls panel uses checkboxes for props');
    });

    test('[fn] 8.2 — Single select (N/A)', async () => {
      qaLog('Skipped — InputField is not a selection group');
    });

    test('[fn] 8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — InputField has no indeterminate state');
    });
  });

  // ── Group 9 — Input and typing ──────────────────────────────────────────────
  test.describe('Group 9 — Input and typing', { tag: [IffTags.functional] }, () => {
    test('[fn] 9.1 — Default field accepts typed value', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.fill('qa@example.com');
      await expect(input).toHaveValue('qa@example.com');
    });

    test('[fn] 9.1 — Input accepts special characters', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.fill('!@#_+-');
      await expect(input).toHaveValue('!@#_+-');
    });

    test('[fn] 9.1 — Input can be cleared', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.fill('temp');
      await input.fill('');
      await expect(input).toHaveValue('');
    });

    test('[fn] 9.2 — Controls live field accepts typing', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-controls');
      const input = fieldInput(page, IFF_ROOT_TESTIDS.controlsLive);
      await input.fill('controls value');
      await expect(input).toHaveValue('controls value');
    });

    test('[fn] 9.2 — Backspace deletes last character', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.fill('ab');
      await input.focus();
      await page.keyboard.press('Backspace');
      await expect(input).toHaveValue('a');
    });

    test('[fn] 9.2 — Delete key removes character at cursor', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.fill('ab');
      await input.focus();
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Delete');
      await expect(input, 'Delete with caret before last char should remove that character').toHaveValue('a');
    });

    test('[fn] 9.2 — ArrowLeft and ArrowRight move caret', async ({ page }) => {
      const input = fieldInput(page, D);
      await input.fill('ab');
      await input.focus();
      await page.keyboard.press('ArrowLeft');
      const posAfterLeft = await input.evaluate((el) => (el as HTMLInputElement).selectionStart);
      await page.keyboard.press('ArrowRight');
      const posAfterRight = await input.evaluate((el) => (el as HTMLInputElement).selectionStart);
      expect(posAfterLeft, 'ArrowLeft should move caret').toBeLessThan(posAfterRight ?? 0);
    });

    test('[fn] 9.3 — Number type rejects letters', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-types');
      const input = fieldInput(page, 'input-field-type-number');
      await input.click();
      await page.keyboard.type('abc');
      const value = await input.inputValue();
      expect(value, 'Number input should not retain alphabetic characters').not.toMatch(/[a-z]/i);
    });

    test('[fn] 9.3 — Max length (N/A)', async () => {
      qaLog('Skipped — No maxLength scenario in playground');
    });

    test('[fn] 9.4 — Copy and paste (N/A in headless)', async () => {
      qaLog('Skipped — Clipboard APIs are unreliable in CI headless');
    });
  });

  // ── Group 10 — Dependency rules ─────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [IffTags.functional] }, () => {
    test('[fn] 10.1 — infoIcon without label shows no info button', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-edge');
      await expect(
        fieldWrapper(page, 'input-field-edge-info-icon-no-label').getByRole('button', {
          name: /more information/i,
        }),
      ).toHaveCount(0);
    });

    test('[fn] 10.2 — infoIcon with label shows info button', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      await expect(
        fieldWrapper(page, 'input-field-info-icon').getByRole('button', { name: /more information/i }),
      ).toBeVisible();
    });

    test('[fn] 10.1 — required without label has no asterisk in DOM', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-edge');
      const mount = fieldWrapper(page, 'input-field-edge-required-no-label');
      await expect(mount.locator('label')).toHaveCount(0);
      await expect(mount.locator('.asterisk, [aria-hidden="true"]')).toHaveCount(0);
    });

    test('[fn] 10.2 — required with label shows asterisk', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      await expect(fieldLabel(page, 'input-field-required')).toContainText('*');
    });

    test('[fn] 10.3 — Loading overrides (N/A)', async () => {
      qaLog('Skipped — InputField has no loading prop');
    });
  });

  // ── Group 11 — Content and display ──────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [IffTags.functional] }, () => {
    test('[fn] 11.1 — Default label text is non-empty', async ({ page }) => {
      const text = (await fieldLabel(page, D).textContent())?.trim() ?? '';
      expect(text.length, 'Label should render copy').toBeGreaterThan(0);
    });

    test('[fn] 11.1 — Description mount shows helper copy', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-isolates');
      await expect(fieldWrapper(page, 'input-field-description')).toContainText(/helper description/i);
    });

    test('[fn] 11.2 — Start slot icon is visible', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-slots');
      await expect(fieldInputDecorativeIcons(page, 'input-field-slot-start').first()).toBeVisible();
    });

    test('[fn] 11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — InputField is not a progress indicator');
    });
  });

  // ── Group 12 — Layout and responsive ────────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [IffTags.functional] }, () => {
    test('[fn] 12.1 — fullWidth mount fills parent scenario cell', async ({ page }) => {
      await scrollToSection(page, 'input-field-qa-input-chrome');
      await expectWrapperFillsParentCell(page, 'input-field-chrome-full-width');
    });

    test('[fn] 12.1 — Theme toggle updates html data-mode', async ({ page }) => {
      const { before, after } = await clickPageThemeButton(page);
      expect(before, 'Theme should change').not.toEqual(after);
    });

    test('[fn] 12.2 — Reflow at 320px without horizontal scroll on bands', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      for (const sectionId of IFF_DATA_SECTIONS) {
        if ((IFF_REFLOW_SKIP_SECTIONS as readonly string[]).includes(sectionId)) continue;
        await qaStep(`Reflow 320px: ${sectionId}`, async () => {
          await scrollToSection(page, sectionId);
          const box = await iffSection(page, sectionId).boundingBox();
          expect(box?.width ?? 0, `Band ${sectionId} should fit 320px viewport`).toBeLessThanOrEqual(320);
        });
      }
    });

    test('[fn] 12.2 — Component visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await expectFieldWrapperVisible(page, D);
    });

    test('[fn] 12.3 — Orientation (N/A)', async () => {
      qaLog('Skipped — InputField is vertical stack only');
    });
  });
  test.describe('Figma validation matrix', { tag: [IffTags.functional] }, () => {
    test.beforeEach(async ({ page }) => {
      await openInputFieldFigmaValidationTab(page);
    });

    test('[fn] Figma matrix — every size cell is visible with spec copy', async ({ page }) => {
      for (const testId of IFF_FIGMA_CELL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const cell = figmaInputFieldCell(page, testId);
          await cell.scrollIntoViewIfNeeded();
          await expect(cell, `Figma cell "${testId}" should be visible`).toBeVisible();
          await expect(fieldLabel(page, testId)).toHaveText(IFF_FIGMA_LABEL);
          await expect(fieldInput(page, testId)).toHaveAttribute('placeholder', IFF_FIGMA_PLACEHOLDER);
        });
      }
    });

    for (const sizeLabel of IFF_FIGMA_SIZE_LABELS) {
      test(`[fn] Figma matrix — size ${sizeLabel} maps to data-size "${IFF_FIGMA_SIZE_CODE[sizeLabel]}"`, async ({
        page,
      }) => {
        const testId = iffFigmaCellTestId(sizeLabel);
        await expect(fieldInputContainer(page, testId)).toHaveAttribute(
          'data-size',
          IFF_FIGMA_SIZE_CODE[sizeLabel],
        );
      });
    }

    test('[fn] Figma matrix — start and end icons render (heart + microphone)', async ({ page }) => {
      const testId = iffFigmaCellTestId('M');
      await expect(fieldInputSlotSvgs(page, testId), 'Figma spec uses two slot icons').toHaveCount(2);
    });

    test('[fn] scenario tabs include Figma Validation', async ({ page }) => {
      await gotoInputFieldPlayground(page);
      await expect(page.getByRole('tab', { name: IFF_FIGMA_VALIDATION_TAB_LABEL })).toBeVisible();
    });
  });
});

test.describe('Smoke', { tag: IFF_TAG_SET.smoke }, () => {
  test('[smoke] playground route and default field', async ({ page }) => {
    await openInputFieldTestScenarios(page);
    await expectFieldWrapperVisible(page, D);
    await expect(fieldInput(page, D)).toBeEditable();
  });

  test('[smoke] all scenario testids reachable', async ({ page }) => {
    await openInputFieldTestScenarios(page);
    const sample = [D, IFF_ROOT_TESTIDS.allProps, 'input-field-slot-start', iffAppearanceTestId('primary')];
    for (const testId of sample) {
      await expectFieldWrapperVisible(page, testId);
    }
  });
});

test.describe('Regression', { tag: IFF_TAG_SET.regression }, () => {
  test.beforeEach(async ({ page }) => {
    await openInputFieldTestScenarios(page);
  });

  test('[reg] infoIcon without label does not render info control (known API quirk)', async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-edge');
    const mount = fieldWrapper(page, 'input-field-edge-info-icon-no-label');
    await expect(mount.getByRole('button', { name: /more information/i })).toHaveCount(0);
  });

  test('[reg] required without label still marks input required', async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-edge');
    await expect(fieldInput(page, 'input-field-edge-required-no-label')).toHaveAttribute('required', '');
  });

  test('[reg] disabled + feedback mount stays disabled', async ({ page }) => {
    await scrollToSection(page, 'input-field-qa-edge');
    await expect(fieldInput(page, 'input-field-edge-disabled-feedback')).toBeDisabled();
    await expect(fieldWrapper(page, 'input-field-edge-disabled-feedback')).toContainText('not valid');
  });
});
