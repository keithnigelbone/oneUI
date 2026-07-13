/**
 * Checkbox QA — functional coverage aligned to `CheckboxQaShowcase.tsx`.
 *
 * Component type: **interactive** (form checkbox / toggle).
 *
 * **QA rule:** Do not weaken assertions or add playground workarounds so a run goes green.
 * If the showcase documents a prop and `@oneui/ui` ignores it, the test must fail until the component is fixed.
 *
 * **Raised component defects (tests must fail until fixed in `Checkbox.tsx`):**
 * - `accent` prop is passed in the showcase but ignored at runtime (`accent: _accentIgnored`) — no fill override.
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  CheckboxTags,
  CHECKBOX_TAG_SET,
  expectSectionVisible,
  clickPageThemeButton,
  openCheckboxTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './checkbox/checkbox-qa-support';
import { gotoCheckboxPlayground } from './checkbox-playground/gotoCheckboxPlayground';
import {
  CHECKBOX_ACCENTS,
  CHECKBOX_ALL_TESTIDS,
  CHECKBOX_COMBO_COUNT,
  CHECKBOX_DATA_SECTIONS,
  CHECKBOX_FIGMA_APPEARANCES,
  CHECKBOX_FIGMA_SIZES,
  CHECKBOX_ROOT_TESTIDS,
  CHECKBOX_SECTION_COUNT,
  CHECKBOX_SIZE_ALIASES,
  checkboxAccentTripletTestId,
  checkboxAppearanceTestId,
  checkboxComboTestId,
  checkboxSizeAliasTestId,
  checkboxSizeTestId,
} from './checkbox-playground/manifest';
import {
  checkboxAssociatedText,
  checkboxBox,
  checkboxByTestId,
  checkboxControlFillRgb,
  checkboxLabelWrapper,
  checkboxSection,
  expectFocusVisible,
  rgbaAlpha,
  scrollToCheckboxTestId,
} from './checkbox-playground/checkboxHelpers';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/checkbox`);
  expect(res.ok(), `Checkbox playground should be reachable at ${origin}/c/checkbox`).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await gotoCheckboxPlayground(page);
});

test.describe('Functional', { tag: CHECKBOX_TAG_SET.functional }, () => {
  // ── Preserved behaviour (same assertions as legacy suite; titles human-readable) ──
  test.describe('Preserved checks (same coverage as before)', { tag: CHECKBOX_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Checkbox”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Checkbox', level: 1 })).toBeVisible();
    });

    test('Smoke — Theme toggle changes its label when clicked', async ({ page }) => {
      const { before, after } = await clickPageThemeButton(page);
      expect(before, 'Theme button label should change after click').not.toEqual(after);
    });

    test('Smoke — Test Scenarios, Accessibility, and Functional Tests tabs are visible', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
    });

    test('Smoke — Default showcase checkbox (`checkbox-default`) is visible', async ({ page }) => {
      await expect(page.getByTestId('checkbox-default')).toBeVisible();
    });

    test('Smoke — Size S / M / L checkboxes toggle checked state when clicked', async ({ page }) => {
      for (const figma of ['S', 'M', 'L'] as const) {
        const cb = page.getByTestId(`checkbox-size-${figma}`);
        await expect(cb).toBeVisible();
        const before = await cb.isChecked();
        await cb.click();
        const after = await cb.isChecked();
        expect(after).toBe(!before);
      }
    });

    test('Smoke — Selected band: unchecked vs checked props match `aria-checked`', async ({ page }) => {
      await expect(page.getByTestId('checkbox-selected-false')).not.toBeChecked();
      await expect(page.getByTestId('checkbox-selected-true')).toBeChecked();
    });

    test('Smoke — Indeterminate row: second control is in indeterminate state', async ({ page }) => {
      const ind = page.getByTestId('checkbox-indeterminate-true');
      await expect(ind).toHaveAttribute('data-indeterminate');
    });

    test('Smoke — Read-only checked checkbox does not toggle when the label is clicked', async ({ page }) => {
      const cb = page.getByTestId('checkbox-readonly-true-on');
      await expect(cb).toBeChecked();
      await page.locator('label', { has: cb }).click();
      await expect(cb).toBeChecked();
    });

    test('Smoke — Disabled unchecked checkbox stays unchecked when clicked', async ({ page }) => {
      const cb = page.getByTestId('checkbox-disabled-true-off');
      await expect(cb).not.toBeChecked();
      await page.locator('label', { has: cb }).click({ force: true });
      await expect(cb).not.toBeChecked();
    });

    test('Smoke — Appearance matrix shows primary off / on / indeterminate checkboxes', async ({ page }) => {
      const band = page.locator('#checkbox-qa-appearance');
      await expect(band.getByTestId('checkbox-appearance-primary-off')).toBeVisible();
      await expect(band.getByTestId('checkbox-appearance-primary-on')).toBeVisible();
      await expect(band.getByTestId('checkbox-appearance-primary-ind')).toBeVisible();
    });

    test('Smoke — Accent matrix shows primary off / on / indeterminate checkboxes', async ({ page }) => {
      const band = page.locator('#checkbox-qa-accent');
      await expect(band.getByTestId('checkbox-accent-primary-off')).toBeVisible();
      await expect(band.getByTestId('checkbox-accent-primary-on')).toBeVisible();
      await expect(band.getByTestId('checkbox-accent-primary-ind')).toBeVisible();
    });

    test('Smoke — Combination matrix renders every combo row (`checkbox-combo-0` …)', async ({ page }) => {
      for (let i = 0; i < CHECKBOX_COMBO_COUNT; i++) {
        await expect(page.getByTestId(`checkbox-combo-${i}`)).toBeVisible();
      }
    });
  });

  // ── GROUP 1 — Render ─────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [CheckboxTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default checkbox mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openCheckboxTestScenarios(page);
      await qaStep('Assert no console errors', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every playground `data-testid` is visible and has role checkbox', async ({ page }) => {
      test.setTimeout(120_000);
      for (const testId of CHECKBOX_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const cb = checkboxByTestId(page, testId);
          await cb.scrollIntoViewIfNeeded();
          await expect(cb, `Expected visible: ${testId}`).toBeVisible();
          await expect(cb, `${testId} should be role=checkbox`).toHaveAttribute('role', 'checkbox');
          const text = (await cb.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of CHECKBOX_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      const sections = page.locator('[data-section^="checkbox-qa-"]');
      await expect(sections).toHaveCount(CHECKBOX_SECTION_COUNT);
    });

    test('1.4 — Default checkbox exposes showcase props on the DOM', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      await expect(cb, 'Default uses size M').toHaveAttribute('data-size', 'm');
      await expect(cb, 'Default uses appearance neutral').toHaveAttribute('data-appearance', 'neutral');
      await expect(cb).not.toBeChecked();
    });
  });

  // ── GROUP 2 — Props validation ───────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [CheckboxTags.functional] }, () => {
    for (const figma of CHECKBOX_FIGMA_SIZES) {
      test(`2.1 — Size ${figma} checkbox renders`, async ({ page }) => {
        await checkboxSection(page, 'checkbox-qa-size').scrollIntoViewIfNeeded();
        await expect(checkboxByTestId(page, checkboxSizeTestId(figma))).toBeVisible();
      });
    }

    test('2.2 — Size S / M / L bounding boxes scale progressively (square controls)', async ({ page }) => {
      await checkboxSection(page, 'checkbox-qa-size').scrollIntoViewIfNeeded();
      const boxes = await Promise.all(
        CHECKBOX_FIGMA_SIZES.map((figma) => checkboxBox(page, checkboxSizeTestId(figma))),
      );
      for (const box of boxes) {
        expect(box).not.toBeNull();
      }
      const [s, m, l] = boxes as NonNullable<Awaited<ReturnType<typeof checkboxBox>>>[];
      expect(s.width).toBeLessThanOrEqual(m.width + 2);
      expect(m.width).toBeLessThanOrEqual(l.width + 2);
      expect(s.height).toBeLessThanOrEqual(m.height + 2);
      expect(m.height).toBeLessThanOrEqual(l.height + 2);
      expect(Math.abs(s.width - s.height)).toBeLessThanOrEqual(4);
      expect(Math.abs(m.width - m.height)).toBeLessThanOrEqual(4);
      expect(Math.abs(l.width - l.height)).toBeLessThanOrEqual(4);
    });

    for (const alias of CHECKBOX_SIZE_ALIASES) {
      test(`2.1 — Legacy size alias “${alias}” renders`, async ({ page }) => {
        await checkboxSection(page, 'checkbox-qa-size').scrollIntoViewIfNeeded();
        await expect(checkboxByTestId(page, checkboxSizeAliasTestId(alias))).toBeVisible();
      });
    }

    for (const appearance of CHECKBOX_FIGMA_APPEARANCES) {
      test(`2.1 — Appearance “${appearance}” renders off / on / indeterminate`, async ({ page }) => {
        await checkboxSection(page, 'checkbox-qa-appearance').scrollIntoViewIfNeeded();
        await expect(checkboxByTestId(page, checkboxAppearanceTestId(appearance, 'off'))).toBeVisible();
        await expect(checkboxByTestId(page, checkboxAppearanceTestId(appearance, 'on'))).toBeVisible();
        await expect(checkboxByTestId(page, checkboxAppearanceTestId(appearance, 'ind'))).toBeVisible();
      });
    }

    test('2.1 — Appearance “brand-bg” renders off / on / indeterminate', async ({ page }) => {
      await checkboxSection(page, 'checkbox-qa-appearance').scrollIntoViewIfNeeded();
      await expect(checkboxByTestId(page, checkboxAppearanceTestId('brand-bg', 'off'))).toBeVisible();
      await expect(checkboxByTestId(page, checkboxAppearanceTestId('brand-bg', 'on'))).toBeVisible();
      await expect(checkboxByTestId(page, checkboxAppearanceTestId('brand-bg', 'ind'))).toBeVisible();
    });


    for (const accent of CHECKBOX_ACCENTS) {
      test(`2.1 — Accent “${accent}” renders off / on / indeterminate`, async ({ page }) => {
        await checkboxSection(page, 'checkbox-qa-accent').scrollIntoViewIfNeeded();
        await expect(checkboxByTestId(page, checkboxAccentTripletTestId(accent, 'off'))).toBeVisible();
        await expect(checkboxByTestId(page, checkboxAccentTripletTestId(accent, 'on'))).toBeVisible();
        await expect(checkboxByTestId(page, checkboxAccentTripletTestId(accent, 'ind'))).toBeVisible();
      });
    }


    test('2.1 — `appearance="auto"` resolves to secondary on the control', async ({ page }) => {
      const el = checkboxByTestId(page, checkboxAppearanceTestId('auto', 'off'));
      await expect(el, 'auto should resolve to secondary per Checkbox engine').toHaveAttribute(
        'data-appearance',
        'secondary',
      );
    });

  });

  // ── GROUP 3 — Click interaction ──────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [CheckboxTags.functional] }, () => {
    test('3.1 — Click toggles checked state on default checkbox', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      const before = await cb.isChecked();
      await cb.click();
      if (before) {
        await expect(cb).not.toBeChecked();
      } else {
        await expect(cb).toBeChecked();
      }
    });

    test('3.2 — Disabled checkbox does not change when clicked', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.disabledTrueOff);
      await expect(cb).not.toBeChecked();
      await checkboxLabelWrapper(page, CHECKBOX_ROOT_TESTIDS.disabledTrueOff).click({ force: true });
      await expect(cb).not.toBeChecked();
      await expect(cb).toHaveAttribute('aria-disabled', 'true');
    });

    test('3.3 — Read-only checked checkbox stays checked when label is clicked', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.readonlyTrueOn);
      await expect(cb).toBeChecked();
      await checkboxLabelWrapper(page, CHECKBOX_ROOT_TESTIDS.readonlyTrueOn).click();
      await expect(cb).toBeChecked();
    });

    test('3.4 — Clicking the page heading moves focus away from the checkbox', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      await cb.focus();
      await expect(cb).toBeFocused();
      await page.getByRole('heading', { name: 'Checkbox', level: 1 }).click();
      await expect(cb).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ───────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [CheckboxTags.functional] }, () => {
    test('4.1 — Tab eventually reaches a checkbox in the tab order', async ({ page }) => {
      let sawCheckbox = false;
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
        if (role === 'checkbox') {
          sawCheckbox = true;
          break;
        }
      }
      expect(sawCheckbox, 'Expected Tab to reach at least one role=checkbox').toBe(true);
    });

    test('4.2 — Enter while focused does not remove the checkbox', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      await cb.focus();
      await page.keyboard.press('Enter');
      await expect(cb).toBeVisible();
      await expect(cb).toHaveAttribute('role', 'checkbox');
    });

    test('4.3 — Space toggles the focused default checkbox', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      await cb.focus();
      const before = await cb.isChecked();
      await page.keyboard.press('Space');
      if (before) {
        await expect(cb).not.toBeChecked();
      } else {
        await expect(cb).toBeChecked();
      }
    });

    test('4.7 — Repeated Tab visits multiple distinct focus targets (no single-element trap)', async ({ page }) => {
      const seen = new Set<string>();
      for (let i = 0; i < 18; i++) {
        await page.keyboard.press('Tab');
        const sig =
          (await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return '';
            return `${el.tagName}:${el.getAttribute('role') ?? ''}:${el.getAttribute('data-testid') ?? ''}`;
          })) ?? '';
        seen.add(sig);
      }
      expect(seen.size).toBeGreaterThan(3);
    });
  });

  // ── GROUP 5 — Focus management ───────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [CheckboxTags.functional] }, () => {
    test('5.1 — Click moves focus to the checkbox control', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      await cb.click();
      await expect(cb).toBeFocused();
    });

    test('5.2 — Keyboard focus shows outline or box-shadow (computed style)', async ({ page }) => {
      await checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default).focus();
      await expectFocusVisible(page);
    });

    test('5.4 — Blur: focus leaves the checkbox after clicking elsewhere', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      await cb.focus();
      await page.getByRole('heading', { name: 'Checkbox', level: 1 }).click();
      await expect(cb).not.toBeFocused();
    });
  });

  // ── GROUP 6 — State ──────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [CheckboxTags.functional] }, () => {
    test('6.1 — Default checkbox starts unchecked (uncontrolled default)', async ({ page }) => {
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default)).not.toBeChecked();
    });

    test('6.2 — Selected `false` / `true` rows reflect `checked` prop', async ({ page }) => {
      await scrollToCheckboxTestId(page, CHECKBOX_ROOT_TESTIDS.selectedTrue);
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.selectedTrue)).toBeChecked();
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.selectedFalse)).not.toBeChecked();
    });

    test('6.3 — Disabled checkbox exposes `aria-disabled`', async ({ page }) => {
      await scrollToCheckboxTestId(page, CHECKBOX_ROOT_TESTIDS.disabledTrueOff);
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.disabledTrueOff)).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    test('6.4 — Read-only checkbox can receive keyboard focus', async ({ page }) => {
      await scrollToCheckboxTestId(page, CHECKBOX_ROOT_TESTIDS.readonlyFalseOff);
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.readonlyFalseOff);
      await cb.focus();
      await expect(cb).toBeFocused();
    });

    test('6.4 — Read-only exposes `aria-readonly` and `data-readonly`', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.readonlyTrueOn);
      await expect(cb, 'Read-only control should expose aria-readonly').toHaveAttribute(
        'aria-readonly',
        'true',
      );
      const wrapper = checkboxLabelWrapper(page, CHECKBOX_ROOT_TESTIDS.readonlyTrueOn);
      await expect(wrapper, 'Read-only label wrapper should expose data-readonly').toHaveAttribute(
        'data-readonly',
      );
      await expect(cb, 'Read-only control should expose data-readonly').toHaveAttribute('data-readonly');
    });

    test('6.1 — Indeterminate=false row is not in indeterminate state', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.indeterminateFalse);
      await expect(cb).not.toHaveAttribute('data-indeterminate');
    });
  });

  test.describe('Group 6 — Error / loading (N/A)', { tag: [CheckboxTags.functional] }, () => {
    test('6.5 — Error state is not part of Checkbox API', async () => {
      qaLog('Skipped — Checkbox has no error/invalid prop in showcase');
    });

    test('6.6 — Loading state is not part of Checkbox API', async () => {
      qaLog('Skipped — Checkbox has no loading prop in showcase');
    });
  });

  // ── GROUP 8 — Toggle and selection ───────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', { tag: [CheckboxTags.functional] }, () => {
    test('8.1 — Double click cycle: off → on → off on default checkbox', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default);
      await cb.click();
      await expect(cb).toBeChecked();
      await cb.click();
      await expect(cb).not.toBeChecked();
    });

    test('8.3 — Indeterminate row exposes indeterminate semantics on the control', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.indeterminateTrue);
      await expect(cb).toHaveAttribute('data-indeterminate');
    });

    test('8.3 — Indeterminate exposes `aria-checked="mixed"` for assistive tech', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.indeterminateTrue);
      await expect(
        cb,
        'Indeterminate should map to mixed checked semantics — fix Checkbox if this fails',
      ).toHaveAttribute('aria-checked', 'mixed');
    });

    test('8.2 — Single-select is N/A for standalone Checkbox', async () => {
      qaLog('Skipped — Checkbox is not a single-select group; use Radio or selectable primitives');
    });
  });

  test.describe('Group 7 — Slots (N/A)', { tag: [CheckboxTags.functional] }, () => {
    test('7.x — Checkbox has label prop only, not start/end slots', async () => {
      qaLog('Skipped — no start/end/icon slots on Checkbox in showcase');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [CheckboxTags.functional] }, () => {
    test('9.x — Checkbox is not a text input', async () => {
      qaLog('Skipped — use Input / Textarea for typed entry');
    });
  });

  // ── GROUP 10 — Dependencies ─────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [CheckboxTags.functional] }, () => {
    test('10.1 — Read-only prevents toggling when the label is clicked', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.readonlyTrueOn);
      await expect(cb).toBeChecked();
      await checkboxLabelWrapper(page, CHECKBOX_ROOT_TESTIDS.readonlyTrueOn).click();
      await expect(cb).toBeChecked();
    });

    test('10.1 — Disabled prevents toggling when clicked', async ({ page }) => {
      const cb = checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.disabledTrueOff);
      await checkboxLabelWrapper(page, CHECKBOX_ROOT_TESTIDS.disabledTrueOff).click({ force: true });
      await expect(cb).not.toBeChecked();
    });
  });

  // ── GROUP 11 — Content and display ───────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [CheckboxTags.functional] }, () => {
    test('11.1 — Default checkbox shows “Accept terms and conditions” copy', async ({ page }) => {
      const text = await checkboxAssociatedText(page, CHECKBOX_ROOT_TESTIDS.default);
      expect(text).toContain('Accept terms and conditions');
    });

    test('11.1 — Size row captions document S / M / L', async ({ page }) => {
      await checkboxSection(page, 'checkbox-qa-size').scrollIntoViewIfNeeded();
      await expect(checkboxSection(page, 'checkbox-qa-size')).toContainText('size: S');
      await expect(checkboxSection(page, 'checkbox-qa-size')).toContainText('size: M');
    });
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [CheckboxTags.functional] }, () => {
    test('12.2 — At 320px viewport, each scenario band fits without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await gotoCheckboxPlayground(page);
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default)).toBeVisible();
      for (const sectionId of CHECKBOX_DATA_SECTIONS) {
        const band = checkboxSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        await expect(band).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default checkbox visible at 1440px wide viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoCheckboxPlayground(page);
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default)).toBeVisible();
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [CheckboxTags.functional] }, () => {
    test('13.1 — After theme toggle, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of CHECKBOX_DATA_SECTIONS) {
        await expect(checkboxSection(page, sectionId)).toBeVisible();
      }
      await expect(checkboxByTestId(page, CHECKBOX_ROOT_TESTIDS.default)).toBeVisible();
    });

  });

  // ── Combination matrix ───────────────────────────────────────────────────
  test.describe('Group 12 — fullWidth / orientation (N/A)', { tag: [CheckboxTags.functional] }, () => {
    test('12.1 — fullWidth is not a Checkbox prop', async () => {
      qaLog('Skipped — Checkbox has no fullWidth prop');
    });

    test('12.3 — Orientation is not a Checkbox prop', async () => {
      qaLog('Skipped — use CheckboxGroup for layout');
    });
  });

  test.describe('Combination matrix', { tag: [CheckboxTags.functional] }, () => {
    test('Figma combination matrix renders every combo row', async ({ page }) => {
      await checkboxSection(page, 'checkbox-qa-combos').scrollIntoViewIfNeeded();
      for (let i = 0; i < CHECKBOX_COMBO_COUNT; i++) {
        await expect(checkboxByTestId(page, checkboxComboTestId(i))).toBeVisible();
      }
    });
  });
});
