/**
 * CheckboxField QA — functional coverage aligned to `CheckboxFieldQaShowcase.tsx`.
 *
 * Component type: **composite** (CheckboxField = Field.Root + Checkbox/CheckboxGroup
 * + InputFeedback). `dynamicText` / `helperButton` / `dynamicTextSlot` are InputField APIs
 * — showcase band 8 documents planned parity but CheckboxField does not wire them yet.
 *
 * **DOM contract:**
 * `<CheckboxField>` does NOT spread `...rest` onto its root element, so `data-testid`
 * passed to `<CheckboxField>` is silently dropped. Tests therefore use:
 *   - `[data-section="<band-id>"]` scoping (primary approach)
 *   - `[role="checkbox"]` within a section
 *   - `data-testid` only on standalone `<Checkbox>` children and plain `<span>` elements
 *     that DO forward their props to the DOM.
 *
 * **Scope:** Functional tests only — rendering, props, interaction, keyboard, focus, state.
 * Colour, layout/responsive, dark-mode, and N/A stubs are intentionally excluded.
 */
import { expect, test } from 'playwright/test';

import { gotoCheckboxFieldPlayground } from './checkbox-field-playground/gotoCheckboxFieldPlayground';
import {
  CHECKBOX_FIELD_DATA_SECTIONS,
  CHECKBOX_FIELD_MULTI_OPTION_TESTIDS,
  CHECKBOX_FIELD_PLAIN_TESTIDS,
  CHECKBOX_FIELD_SECTION_COUNT,
  CHECKBOX_FIELD_SIZES,
  CHECKBOX_FIELD_APPEARANCES,
  CHECKBOX_FIELD_COMBO_COUNT,
  CHECKBOX_FIELD_FIGMA_GRID_TESTIDS,
  CHECKBOX_FIELD_FIGMA_VALIDATION_TAB,
} from './checkbox-field-playground/manifest';
import {
  fieldSection,
  firstCheckboxInSection,
  checkboxByTestId,
  legendInSection,
  textInSection,
  expectFocusVisible,
  figmaGrid,
  appearanceRowInSection,
} from './checkbox-field-playground/checkboxFieldHelpers';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  CHECKBOX_FIELD_TAG_SET,
  CheckboxFieldTags,
  clickPageThemeButton,
  expectSectionVisible,
  openCheckboxFieldFigmaValidation,
  openCheckboxFieldTestScenarios,
  qaLog,
  qaStep,
} from './checkbox-field/checkbox-field-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/checkbox-field`);
  expect(
    res.ok(),
    `CheckboxField playground must be reachable at ${origin}/c/checkbox-field`,
  ).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await gotoCheckboxFieldPlayground(page);
});

test.describe('Functional', { tag: CHECKBOX_FIELD_TAG_SET.functional }, () => {

  /* ══ SMOKE ═════════════════════════════════════════════════════════ */
  test.describe('Smoke', { tag: CHECKBOX_FIELD_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads "Checkbox Field"', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Checkbox Field', level: 1 })).toBeVisible();
    });

    test('Smoke — Theme toggle changes its label when clicked', async ({ page }) => {
      const { before, after } = await clickPageThemeButton(page);
      expect(before, 'Theme button label must change after click').not.toEqual(after);
    });

    test('Smoke — Test Scenarios, Figma Validation, Accessibility, and Functional Tests tabs are visible', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
      await expect(page.getByRole('tab', { name: CHECKBOX_FIELD_FIGMA_VALIDATION_TAB })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
    });

    test('Smoke — Default section renders a checkbox control', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await expect(cb).toBeVisible();
      await expect(cb).toHaveRole('checkbox');
    });

    test('Smoke — Size S / M / L sections each render at least one checkbox', async ({ page }) => {
      const sizeBand = fieldSection(page, 'checkboxfield-qa-size');
      await sizeBand.scrollIntoViewIfNeeded();
      const checkboxes = sizeBand.locator('[role="checkbox"]');
      await expect(checkboxes.first()).toBeVisible();
      expect(await checkboxes.count()).toBeGreaterThanOrEqual(3);
    });

    test('Smoke — Combination matrix band renders expected number of combos', async ({ page }) => {
      const comboSection = fieldSection(page, 'checkboxfield-qa-combos');
      await comboSection.scrollIntoViewIfNeeded();
      const checkboxes = comboSection.locator('[role="checkbox"]');
      expect(await checkboxes.count()).toBeGreaterThanOrEqual(CHECKBOX_FIELD_COMBO_COUNT);
    });
  });

  /* ══ GROUP 1 — Render ═══════════════════════════════════════════════ */
  test.describe('Group 1 — Render', { tag: [CheckboxFieldTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default band mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openCheckboxFieldTestScenarios(page);
      await qaStep('Assert no console errors', async () => assertNoConsoleErrors(errors));
      await expect(firstCheckboxInSection(page, 'checkboxfield-qa-default')).toBeVisible();
    });

    test('1.2 — Every `data-section` story band is visible', async ({ page }) => {
      test.setTimeout(120_000);
      for (const sectionId of CHECKBOX_FIELD_DATA_SECTIONS) {
        await qaStep(`Visible: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
    });

    test('1.3 — Section count matches showcase band count', async ({ page }) => {
      const sections = page.locator('[data-section^="checkboxfield-qa-"]');
      await expect(sections).toHaveCount(CHECKBOX_FIELD_SECTION_COUNT);
    });

    test('1.4 — Default band: inner checkbox has role=checkbox and starts unchecked', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await expect(cb).toHaveRole('checkbox');
      await expect(cb).not.toBeChecked();
    });

    test('1.5 — Default section has no role="alert" elements', async ({ page }) => {
      // The full page intentionally has many InputFeedback components (negative variant → role="alert").
      // Scope the check to the default section which has no feedback content.
      const band = fieldSection(page, 'checkboxfield-qa-default');
      await expect(band.getByRole('alert')).toHaveCount(0);
    });
  });

  /* ══ GROUP 2 — Props validation ══════════════════════════════════════ */
  test.describe('Group 2 — Props validation', { tag: [CheckboxFieldTags.functional] }, () => {
    for (const size of CHECKBOX_FIELD_SIZES) {
      test(`2.1 — Size "${size}" renders a checkbox control with data-size attribute`, async ({ page }) => {
        const sizeBand = fieldSection(page, 'checkboxfield-qa-size');
        await sizeBand.scrollIntoViewIfNeeded();
        const controls = sizeBand.locator(`[role="checkbox"][data-size="${size}"]`);
        await expect(controls.first()).toBeVisible();
      });
    }

    test('2.2 — Size S bounding box is smaller than M which is smaller than L (progressive scale)', async ({ page }) => {
      const sizeBand = fieldSection(page, 'checkboxfield-qa-size');
      await sizeBand.scrollIntoViewIfNeeded();
      const sBox = await sizeBand.locator('[role="checkbox"][data-size="s"]').first().boundingBox();
      const mBox = await sizeBand.locator('[role="checkbox"][data-size="m"]').first().boundingBox();
      const lBox = await sizeBand.locator('[role="checkbox"][data-size="l"]').first().boundingBox();
      expect(sBox).not.toBeNull();
      expect(mBox).not.toBeNull();
      expect(lBox).not.toBeNull();
      const [s, m, l] = [sBox!, mBox!, lBox!];
      expect(s.width).toBeLessThanOrEqual(m.width + 2);
      expect(m.width).toBeLessThanOrEqual(l.width + 2);
      expect(s.height).toBeLessThanOrEqual(m.height + 2);
    });

    for (const appearance of CHECKBOX_FIELD_APPEARANCES) {
      test(`2.3 — Appearance "${appearance}" renders unchecked / checked / indeterminate controls`, async ({ page }) => {
        const band = fieldSection(page, 'checkboxfield-qa-appearance');
        await band.scrollIntoViewIfNeeded();
        const appearanceRow = appearanceRowInSection(page, 'checkboxfield-qa-appearance', appearance);
        await expect(appearanceRow).toBeVisible();
        const checkboxes = appearanceRow.locator('[role="checkbox"]');
        await expect(checkboxes).toHaveCount(3);
        const resolvedAppearance = appearance === 'auto' ? 'secondary' : appearance;
        await expect(
          appearanceRow.locator(`[role="checkbox"][data-appearance="${resolvedAppearance}"]`),
        ).toHaveCount(3);
      });
    }

    test('2.4 — Checked = true control has aria-checked="true"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-checked');
      await band.scrollIntoViewIfNeeded();
      const checked = band.locator('[role="checkbox"][aria-checked="true"]').first();
      await expect(checked).toBeVisible();
    });

    test('2.5 — Indeterminate control has aria-checked="mixed"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-checked');
      await band.scrollIntoViewIfNeeded();
      const ind = band.locator('[role="checkbox"][aria-checked="mixed"]').first();
      await expect(
        ind,
        'Indeterminate must expose aria-checked="mixed" — fix Checkbox if this fails',
      ).toBeVisible();
    });

    test('2.6 — readOnly control exposes aria-readonly="true"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-readonly');
      await band.scrollIntoViewIfNeeded();
      const readOnly = band.locator('[role="checkbox"][aria-readonly="true"]').first();
      await expect(readOnly).toBeVisible();
    });

    test('2.7 — disabled control exposes aria-disabled="true"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-disabled');
      await band.scrollIntoViewIfNeeded();
      const disabled = band.locator('[role="checkbox"][aria-disabled="true"]').first();
      await expect(disabled).toBeVisible();
    });

    test('2.8 — required field renders an asterisk (*) in the label row', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-label');
      await band.scrollIntoViewIfNeeded();
      await expect(band.getByText('*', { exact: true }).first()).toBeVisible();
    });

    test('2.9 — description text renders below the label', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-label');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'checkboxfield-qa-label', 'Supporting description text'),
      ).toBeVisible();
    });

    test('2.10 — error string shorthand renders negative feedback text', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-feedback');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'checkboxfield-qa-feedback', 'You must accept to continue'),
      ).toBeVisible();
    });

    test('2.11 — informative feedback slot renders its message text', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-feedback');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'checkboxfield-qa-feedback', 'Preferences sync across'),
      ).toBeVisible();
    });

    test('2.12 — dynamicText string row (N/A)', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-dynamic-text');
      await band.scrollIntoViewIfNeeded();
      await expect(band.getByText('Nickname', { exact: true }).first()).toBeVisible();
      qaLog('Skipped dynamicText copy — CheckboxField does not implement dynamicText yet');
    });

    test('2.13 — helperButton (N/A)', async () => {
      qaLog('Skipped — CheckboxField does not implement helperButton yet');
    });

    test('2.14 — dynamicTextSlot (N/A)', async () => {
      qaLog('Skipped — CheckboxField does not implement dynamicTextSlot yet');
    });
  });

  /* ══ GROUP 3 — Click interaction ════════════════════════════════════ */
  test.describe('Group 3 — Click interaction', { tag: [CheckboxFieldTags.functional] }, () => {
    test('3.1 — Click on default checkbox toggles checked state', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      const before = await cb.isChecked();
      await cb.click();
      if (before) {
        await expect(cb).not.toBeChecked();
      } else {
        await expect(cb).toBeChecked();
      }
    });

    test('3.2 — Double click: default checkbox off → on → off', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await expect(cb).not.toBeChecked();
      await cb.click();
      await expect(cb).toBeChecked();
      await cb.click();
      await expect(cb).not.toBeChecked();
    });

    test('3.3 — disabled checkbox does not toggle when clicked', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-disabled');
      await band.scrollIntoViewIfNeeded();
      const cb = band.locator('[role="checkbox"][aria-disabled="true"]').first();
      const before = await cb.getAttribute('aria-checked');
      await cb.click({ force: true });
      await expect(cb).toHaveAttribute('aria-checked', before ?? 'false');
    });

    test('3.4 — readOnly checked checkbox stays checked when clicked', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-readonly');
      await band.scrollIntoViewIfNeeded();
      const cb = band.locator('[role="checkbox"][aria-checked="true"][aria-readonly="true"]').first();
      await expect(cb).toBeVisible();
      await cb.click({ force: true });
      await expect(cb).toBeChecked();
    });

    test('3.5 — Clicking field label toggles the controlled single checkbox', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const stateEl = page.getByTestId(CHECKBOX_FIELD_PLAIN_TESTIDS.controlledSingleState);
      const before = await stateEl.textContent();
      const label = band.getByText('Email me about product updates', { exact: false }).first();
      await label.click();
      const after = await stateEl.textContent();
      expect(before).not.toEqual(after);
    });
  });

  /* ══ GROUP 4 — Keyboard navigation ══════════════════════════════════ */
  test.describe('Group 4 — Keyboard navigation', { tag: [CheckboxFieldTags.functional] }, () => {
    test('4.1 — Tab eventually reaches a checkbox in the field', async ({ page }) => {
      let sawCheckbox = false;
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const role = await page.evaluate(
          () => document.activeElement?.getAttribute('role'),
        );
        if (role === 'checkbox') { sawCheckbox = true; break; }
      }
      expect(sawCheckbox, 'Tab must reach at least one role=checkbox').toBe(true);
    });

    test('4.2 — Space toggles the focused default checkbox', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await cb.focus();
      const before = await cb.isChecked();
      await page.keyboard.press('Space');
      if (before) {
        await expect(cb).not.toBeChecked();
      } else {
        await expect(cb).toBeChecked();
      }
    });

    test('4.3 — Enter does not unmount the focused checkbox', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await cb.focus();
      await page.keyboard.press('Enter');
      await expect(cb).toBeVisible();
      await expect(cb).toHaveRole('checkbox');
    });

    test('4.4 — Tab traverses multiple distinct focus targets (no keyboard trap)', async ({ page }) => {
      const seen = new Set<string>();
      for (let i = 0; i < 18; i++) {
        await page.keyboard.press('Tab');
        const sig =
          (await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return '';
            return `${el.tagName}:${el.getAttribute('role') ?? ''}:${el.getAttribute('data-testid') ?? ''}:${el.getAttribute('id') ?? ''}`;
          })) ?? '';
        seen.add(sig);
      }
      expect(seen.size, 'Tab must visit multiple distinct focus targets').toBeGreaterThan(3);
    });

    test('4.5 — Space does NOT toggle a readOnly checked field', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-readonly');
      await band.scrollIntoViewIfNeeded();
      const cb = band.locator('[role="checkbox"][aria-checked="true"][aria-readonly="true"]').first();
      await cb.focus();
      await page.keyboard.press('Space');
      await expect(cb).toBeChecked();
    });
  });

  /* ══ GROUP 5 — Focus management ══════════════════════════════════════ */
  test.describe('Group 5 — Focus management', { tag: [CheckboxFieldTags.functional] }, () => {
    test('5.1 — Click moves focus to the checkbox control', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await cb.click();
      await expect(cb).toBeFocused();
    });

    test('5.2 — Keyboard focus shows outline or box-shadow (visible focus ring)', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await cb.focus();
      await expectFocusVisible(page);
    });

    test('5.3 — Blur: focus leaves the checkbox after clicking a heading', async ({ page }) => {
      const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
      await cb.focus();
      await page.getByRole('heading', { name: 'Checkbox Field', level: 1 }).click();
      await expect(cb).not.toBeFocused();
    });
  });

  /* ══ GROUP 6 — State ══════════════════════════════════════════════════ */
  test.describe('Group 6 — State', { tag: [CheckboxFieldTags.functional] }, () => {
    test('6.1 — checked=false control is not checked', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-checked');
      await band.scrollIntoViewIfNeeded();
      const unchecked = band.locator('[role="checkbox"][aria-checked="false"]').first();
      await expect(unchecked).not.toBeChecked();
    });

    test('6.2 — checked=true control is checked', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-checked');
      await band.scrollIntoViewIfNeeded();
      const checked = band.locator('[role="checkbox"][aria-checked="true"]').first();
      await expect(checked).toBeChecked();
    });

    test('6.3 — disabled control has aria-disabled="true"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-disabled');
      await band.scrollIntoViewIfNeeded();
      const cb = band.locator('[role="checkbox"][aria-disabled="true"]').first();
      await expect(cb).toHaveAttribute('aria-disabled', 'true');
    });

    test('6.4 — readOnly control exposes aria-readonly="true" and data-readonly attribute', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-readonly');
      await band.scrollIntoViewIfNeeded();
      const cb = band.locator('[role="checkbox"][aria-readonly="true"]').first();
      await expect(cb).toHaveAttribute('aria-readonly', 'true');
      await expect(cb).toHaveAttribute('data-readonly');
    });

    test('6.5 — indeterminate control has aria-checked="mixed"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-checked');
      await band.scrollIntoViewIfNeeded();
      const ind = band.locator('[role="checkbox"][aria-checked="mixed"]').first();
      await expect(ind).toHaveAttribute('aria-checked', 'mixed');
      await expect(ind).toHaveAttribute('data-indeterminate');
    });

    test('6.6 — invalid field renders error highlight on the checkbox control', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-feedback');
      await band.scrollIntoViewIfNeeded();
      // Checkbox.tsx:291 emits data-invalid on the outer wrapper div, NOT on the
      // [role="checkbox"] span inside it. Use :has() to target the wrapper that
      // specifically wraps a checkbox control.
      const errWrapper = band.locator('[data-invalid]:has([role="checkbox"])').first();
      await expect(errWrapper).toBeVisible();
    });

    test('6.7 — invalid=true + error string: Field.Root has aria-invalid or data-invalid', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-feedback');
      await band.scrollIntoViewIfNeeded();
      const fieldRoot = band.locator('[role="radiogroup"][aria-invalid], [data-invalid]').first();
      await expect(fieldRoot).toBeVisible();
    });
  });

  /* ══ GROUP 7 — Multi-option mode ══════════════════════════════════════ */
  test.describe('Group 7 — Multi-option (children) mode', { tag: [CheckboxFieldTags.functional] }, () => {
    test('7.1 — Multi-option band renders all three checkbox children', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-multi');
      await band.scrollIntoViewIfNeeded();
      await expect(checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiNews)).toBeVisible();
      await expect(checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiTips)).toBeVisible();
      await expect(checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiResearch)).toBeVisible();
    });

    // COMPONENT BUG: groupDefaultValue={['news']} is forwarded to CheckboxGroup.defaultValue
    // but the child checkbox aria-checked remains "false" on first render. The uncontrolled
    // initial-selection state is not applied to child spans by CheckboxGroup.
    test('7.2 — groupDefaultValue pre-selects "Product news" option', async ({ page }) => {
      await band7Scroll(page);
      const news = checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiNews);
      await expect(news).toBeChecked();
      const tips = checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiTips);
      await expect(tips).not.toBeChecked();
    });

    test('7.3 — Fragment children are flattened: multi-frag renders 3 checkboxes', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-multi');
      await band.scrollIntoViewIfNeeded();
      await expect(checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiFragA)).toBeVisible();
      await expect(checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiFragB)).toBeVisible();
      await expect(checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiFragC)).toBeVisible();
    });

    test('7.4 — Multi-option disabled field: all child checkboxes have aria-disabled="true"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-multi');
      await band.scrollIntoViewIfNeeded();
      const disabledCell = band
        .locator('[class*="scenarioLabeledCell"], .scenarioLabeledCell')
        .filter({ hasText: 'multi + disabled' });
      const disabledField = disabledCell.locator('[role="radiogroup"]');
      await expect(disabledField).toBeVisible();
      const childCbs = disabledField.locator('[role="checkbox"]');
      await expect(childCbs).toHaveCount(2);
      await expect(childCbs.nth(0)).toHaveAttribute('aria-disabled', 'true');
      await expect(childCbs.nth(1)).toHaveAttribute('aria-disabled', 'true');
    });

    test('7.5 — Clicking an unselected multi-option checkbox adds it to selection', async ({ page }) => {
      await band7Scroll(page);
      const tips = checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiTips);
      await expect(tips).not.toBeChecked();
      await tips.click();
      await expect(tips).toBeChecked();
    });

    test('7.6 — Multi-option header: group has a fieldset with legend text', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-multi');
      await band.scrollIntoViewIfNeeded();
      const legend = legendInSection(page, 'checkboxfield-qa-multi');
      await expect(legend).toContainText('Notifications');
    });

    test('7.7 — Multi-option with feedback: informative message is visible', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-multi');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'checkboxfield-qa-multi', 'Changing options may reset'),
      ).toBeVisible();
    });

    test('7.8 — Multi-option invalid: error text renders below options', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-multi');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'checkboxfield-qa-multi', 'Select at least one option'),
      ).toBeVisible();
    });
  });

  /* ══ GROUP 8 — Real-world / controlled scenarios ═════════════════════ */
  test.describe('Group 8 — Controlled / real-world scenarios', { tag: [CheckboxFieldTags.functional] }, () => {
    test('8.1 — Controlled single: clicking the checkbox updates state display', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const stateEl = page.getByTestId(CHECKBOX_FIELD_PLAIN_TESTIDS.controlledSingleState);
      const before = await stateEl.textContent();
      const cb = band.locator('[role="checkbox"]').first();
      await cb.click();
      const after = await stateEl.textContent();
      expect(before).not.toEqual(after);
    });

    // COMPONENT BUG: ControlledMultiField uses groupValue={['news']} (controlled state), but
    // the CheckboxGroup does not reflect groupValue into child aria-checked. Clicking a child
    // does not trigger onGroupValueChange to update state. Controlled multi-option mode is broken.
    test('8.2 — Controlled multi: clicking an unselected option adds it to state display', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const stateEl = page.getByTestId(CHECKBOX_FIELD_PLAIN_TESTIDS.controlledMultiState);
      const before = await stateEl.textContent();
      const tipsCb = checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.optionTips);
      await tipsCb.click();
      const after = await stateEl.textContent();
      expect(before).not.toEqual(after);
      expect(after).toContain('tips');
    });

    // COMPONENT BUG: Same controlled multi-option issue — groupValue={['news']} is not reflected
    // in aria-checked, so the initial state check (news should be checked) immediately fails.
    test('8.3 — Controlled multi: deselecting "news" removes it from state display', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const newsCb = checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.optionNews);
      await expect(newsCb).toBeChecked();
      await newsCb.click();
      await expect(newsCb).not.toBeChecked();
      const stateEl = page.getByTestId(CHECKBOX_FIELD_PLAIN_TESTIDS.controlledMultiState);
      const text = await stateEl.textContent();
      expect(text).not.toContain('news');
    });
  });

  /* ══ GROUP 9 — Edge cases ═════════════════════════════════════════════ */
  test.describe('Group 9 — Edge cases', { tag: [CheckboxFieldTags.functional] }, () => {
    test('9.1 — Edge-cases band mounts without errors', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      await expect(band).toBeVisible();
    });

    test('9.2 — feedback renders when dynamicText props are present (dynamicText N/A)', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      await expect(textInSection(page, 'checkboxfield-qa-edge-cases', 'Helper text')).toBeVisible();
      qaLog('dynamicText not wired on CheckboxField — only feedback message is asserted');
    });

    test('9.3 — Multi mode without header: checkboxes render inside the band', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      const checkboxes = band.locator('[role="checkbox"]');
      const count = await checkboxes.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  /* ══ GROUP 10 — Content and display ══════════════════════════════════ */
  test.describe('Group 10 — Content and display', { tag: [CheckboxFieldTags.functional] }, () => {
    test('10.1 — Default section label text "Accept terms and conditions" is visible', async ({ page }) => {
      await expect(
        textInSection(page, 'checkboxfield-qa-default', 'Accept terms and conditions'),
      ).toBeVisible();
    });

    test('10.2 — Label band has visible label "label only" copy', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-label');
      await band.scrollIntoViewIfNeeded();
      // The section also has a caption "label only" and "no label (aria-label only)" which all
      // match a case-insensitive partial search. Use .first() to target the actual label element.
      await expect(textInSection(page, 'checkboxfield-qa-label', 'Label only').first()).toBeVisible();
    });

    test('10.3 — Feedback band renders positive feedback copy "Saved successfully"', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-feedback');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'checkboxfield-qa-feedback', 'Saved successfully'),
      ).toBeVisible();
    });

    test('10.4 — fullWidth field root is present and wider than 200px', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-fullwidth');
      await band.scrollIntoViewIfNeeded();
      const fieldRoot = band.locator('[role="radiogroup"], [data-field-root]').first();
      await expect(fieldRoot).toBeVisible();
      const box = await fieldRoot.boundingBox();
      if (box) expect(box.width).toBeGreaterThan(200);
    });
  });

  /* ══ GROUP 11 — Figma Validation tab (updated Figma COMPONENT_SET) ═══ */
  test.describe('Group 11 — Figma Validation tab', { tag: [CheckboxFieldTags.functional] }, () => {
    test.beforeEach(async ({ page }) => {
      await openCheckboxFieldFigmaValidation(page);
    });

    test('11.1 — Figma Validation tab mounts state, size, feedback, dynamic, and multi grids', async ({
      page,
    }) => {
      await expect(page.getByTestId(CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.root)).toBeVisible();
      await expect(figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.state)).toBeVisible();
      await expect(figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.size)).toBeVisible();
      await expect(figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.feedback)).toBeVisible();
      await expect(figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.dynamic)).toBeVisible();
      await expect(figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.multi)).toBeVisible();
    });

    test('11.2 — State grid: unchecked, checked, and indeterminate rows each render checkboxes', async ({
      page,
    }) => {
      const grid = figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.state);
      for (const state of ['unchecked', 'checked', 'indeterminate'] as const) {
        const row = grid.locator(`tr[data-testrow="state-${state}"]`);
        await expect(row.locator('[role="checkbox"]').first()).toBeVisible();
      }
    });

    test('11.3 — State grid: checked row uses aria-checked true; indeterminate row uses mixed', async ({
      page,
    }) => {
      const grid = figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.state);
      await expect(
        grid.locator('tr[data-testrow="state-checked"] [role="checkbox"][aria-checked="true"]').first(),
      ).toBeVisible();
      await expect(
        grid.locator('tr[data-testrow="state-indeterminate"] [role="checkbox"][aria-checked="mixed"]').first(),
      ).toBeVisible();
      await expect(
        grid.locator('tr[data-testrow="state-unchecked"] [role="checkbox"][aria-checked="false"]').first(),
      ).toBeVisible();
    });

    test('11.4 — Size grid: S/M/L rows expose data-size and three checked-state columns', async ({
      page,
    }) => {
      const grid = figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.size);
      for (const size of CHECKBOX_FIELD_SIZES) {
        const row = grid.locator(`tr[data-testrow="size-${size}"]`);
        await expect(row.locator(`[role="checkbox"][data-size="${size}"]`).first()).toBeVisible();
        expect(await row.locator('[role="checkbox"]').count()).toBeGreaterThanOrEqual(3);
        await expect(
          row.locator('[role="checkbox"][aria-checked="mixed"]').first(),
        ).toBeVisible();
      }
    });

    test('11.5 — Multi grid: content mode renders option checkboxes and fieldset legend', async ({
      page,
    }) => {
      const grid = figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.multi);
      const defaultCell = grid.locator('td').first();
      await expect(defaultCell.locator('[role="checkbox"]').first()).toBeVisible();
      expect(await defaultCell.locator('[role="checkbox"]').count()).toBeGreaterThanOrEqual(2);
      await expect(defaultCell.locator('fieldset legend')).toContainText('Notifications');
    });
  });

  /* ══ GROUP 12 — Figma API gaps (Test Scenarios; no colour assertions) ═ */
  test.describe('Group 12 — Figma API coverage gaps', { tag: [CheckboxFieldTags.functional] }, () => {
    test('12.1 — readOnly band: unchecked and indeterminate controls do not toggle on click', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-readonly');
      await band.scrollIntoViewIfNeeded();
      for (const selector of [
        '[role="checkbox"][aria-readonly="true"][aria-checked="false"]',
        '[role="checkbox"][aria-readonly="true"][aria-checked="mixed"]',
      ]) {
        const cb = band.locator(selector).first();
        await expect(cb).toBeVisible();
        const before = await cb.getAttribute('aria-checked');
        await cb.click({ force: true });
        await expect(cb).toHaveAttribute('aria-checked', before ?? '');
      }
    });

    test('12.2 — Checked band: indeterminate false is not mixed; checked+indeterminate prefers mixed', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-checked');
      await band.scrollIntoViewIfNeeded();
      const indFalse = band.locator('[role="checkbox"][aria-checked="false"]');
      expect(await indFalse.count()).toBeGreaterThanOrEqual(1);
      await expect(indFalse.first()).not.toHaveAttribute('aria-checked', 'mixed');
      const both = band.locator('[role="checkbox"][aria-checked="mixed"]');
      expect(await both.count()).toBeGreaterThanOrEqual(1);
    });

    test('12.3 — Size band: S, M, and L each render one distinct checkbox control', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-size');
      await band.scrollIntoViewIfNeeded();
      for (const size of CHECKBOX_FIELD_SIZES) {
        await expect(band.locator(`[role="checkbox"][data-size="${size}"]`)).toHaveCount(1);
      }
    });

    test('12.4 — Label band: infoIcon cell exposes an info button; label-only field does not', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-label');
      await band.scrollIntoViewIfNeeded();
      await expect(band.getByRole('button', { name: /more about crash/i })).toBeVisible();
      const labelOnlyField = band
        .locator('[role="radiogroup"]')
        .filter({ hasText: 'Label only' })
        .filter({ hasNotText: 'Supporting description' });
      await expect(labelOnlyField.getByRole('button')).toHaveCount(0);
    });

    test('12.5 — Label band: label-only has no supporting description; label+description does', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-label');
      await band.scrollIntoViewIfNeeded();
      await expect(band.getByText('Supporting description text', { exact: true })).toBeVisible();
      const labelOnlyField = band
        .locator('[role="radiogroup"]')
        .filter({ hasText: 'Label only' })
        .filter({ hasNotText: 'Supporting description' });
      await expect(labelOnlyField.getByText('Supporting description text', { exact: true })).toHaveCount(
        0,
      );
    });

    test('12.6 — content false: default band has no fieldset; multi band has fieldset', async ({
      page,
    }) => {
      await expect(fieldSection(page, 'checkboxfield-qa-default').locator('fieldset')).toHaveCount(0);
      const multi = fieldSection(page, 'checkboxfield-qa-multi');
      await multi.scrollIntoViewIfNeeded();
      await expect(multi.locator('fieldset').first()).toBeVisible();
    });

    test('12.7 — Feedback band: invalid without error message still marks checkbox wrapper invalid', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-feedback');
      await band.scrollIntoViewIfNeeded();
      const invalidOnly = band
        .locator('[role="radiogroup"][data-invalid]')
        .filter({ hasText: 'Accept terms' })
        .filter({ hasNotText: 'You must accept to continue' });
      await expect(invalidOnly.locator('[data-invalid]:has([role="checkbox"])').first()).toBeVisible();
    });

    test('12.8 — Edge band: empty dynamicText (N/A)', async ({ page }) => {
      const band = fieldSection(page, 'checkboxfield-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      await expect(band.getByText('Empty dynamic', { exact: true })).toBeVisible();
      qaLog('Skipped dynamicText row — CheckboxField does not implement dynamicText yet');
    });

    test('12.9 — Appearance band: primary row checked and indeterminate expose correct aria-checked', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-appearance');
      await band.scrollIntoViewIfNeeded();
      const primaryRow = appearanceRowInSection(page, 'checkboxfield-qa-appearance', 'primary');
      await expect(
        primaryRow.locator('[role="checkbox"][data-appearance="primary"][aria-checked="true"]').first(),
      ).toBeVisible();
      await expect(
        primaryRow.locator('[role="checkbox"][data-appearance="primary"][aria-checked="mixed"]').first(),
      ).toBeVisible();
    });

    test('12.10 — Disabled band: checked and indeterminate disabled controls stay non-interactive on click', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-disabled');
      await band.scrollIntoViewIfNeeded();
      for (const selector of [
        '[role="checkbox"][aria-disabled="true"][aria-checked="true"]',
        '[role="checkbox"][aria-disabled="true"][aria-checked="mixed"]',
      ]) {
        const cb = band.locator(selector).first();
        await expect(cb).toBeVisible();
        const before = await cb.getAttribute('aria-checked');
        await cb.click({ force: true });
        await expect(cb).toHaveAttribute('aria-checked', before ?? '');
      }
    });
  });
});

/* helper to scroll to multi-option band */
async function band7Scroll(page: Parameters<typeof fieldSection>[0]) {
  const band = fieldSection(page, 'checkboxfield-qa-multi');
  await band.scrollIntoViewIfNeeded();
}
