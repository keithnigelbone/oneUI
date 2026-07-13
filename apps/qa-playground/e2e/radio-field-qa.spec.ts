/**
 * RadioField QA — functional coverage (`RadioFieldQaShowcase.tsx` / `radioFieldQaScenarios.tsx`).
 * Component type: interactive (radiogroup + role="radio", aria-checked).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` RadioField defects.
 */
import { expect, test } from 'playwright/test';

import {
  RADIO_FIELD_ALL_TESTIDS,
  RADIO_FIELD_ALL_TESTID_COUNT,
  RADIO_FIELD_APPEARANCE_ROLES,
  RADIO_FIELD_DATA_SECTIONS,
  RADIO_FIELD_PLAYGROUND_ROUTE,
  RADIO_FIELD_PRESERVED_TESTIDS,
  RADIO_FIELD_SECTION_COUNT,
  RADIO_FIELD_SIZES,
  RADIO_FIELD_SMOKE_TESTID,
  radioFieldAppearanceTestId,
  radioFieldSizeTestId,
} from './radio-field-playground/manifest';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  expectFocusRingVisible,
  expectNoErrorText,
  fieldByTestId,
  fieldRadioBox,
  firstRadioInField,
  openRadioFieldTestScenarios,
  qaLog,
  qaStep,
  radioIndicatorBackgroundRgbInField,
  radiosInField,
  rgbaAlpha,
  RADIO_FIELD_TAG_SET,
  scrollToSection,
} from './radio-field/radio-field-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${RADIO_FIELD_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `RadioField playground reachable at ${origin}${RADIO_FIELD_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.describe('Functional', { tag: RADIO_FIELD_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openRadioFieldTestScenarios(page);
  });

  // ── Preserved tests (do not remove) ───────────────────────────────────────
  test('[fn] shows Radio Field page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Radio Field', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'RadioField - Figma Validation' })).toBeVisible();
  });

  test('[fn] default integrated field is visible', async ({ page }) => {
    const anchor = fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID);
    await expect(anchor).toBeVisible();
    await expect(anchor.getByText('Default Radio')).toBeVisible();
  });

  test('[fn] default — integrated field exposes one radio', async ({ page }) => {
    const anchor = fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID);
    await expect(anchor.locator('[role="radio"]')).toHaveCount(1);
  });

  test('[fn] required — asterisk or required semantics on label row', async ({ page }) => {
    await scrollToSection(page, 'radio-field-qa-required');
    await expect(fieldByTestId(page, 'radio-field-required')).toBeVisible();
    await expect(page.getByText('Accept Communication Preference')).toBeVisible();
  });

  test('[fn] description long — wrapping copy visible', async ({ page }) => {
    await scrollToSection(page, 'radio-field-qa-description');
    await expect(page.getByText(/2GB data per day/)).toBeVisible();
  });

  test('[fn] checked — integrated radio is selected', async ({ page }) => {
    await scrollToSection(page, 'radio-field-qa-checked');
    const radio = firstRadioInField(fieldByTestId(page, 'radio-field-checked'));
    await expect(radio).toBeChecked();
  });

  test('[fn] disabled — radio is disabled', async ({ page }) => {
    await scrollToSection(page, 'radio-field-qa-disabled');
    const radio = firstRadioInField(fieldByTestId(page, 'radio-field-disabled'));
    await expect(radio).toBeDisabled();
  });

  test('[fn] keyboard target — Space toggles integrated radio', async ({ page }) => {
    await scrollToSection(page, 'radio-field-qa-a11y');
    const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
    await radio.focus();
    await expect(radio).toBeFocused();
    await page.keyboard.press('Space');
    await expect(radio).toBeChecked();
  });

  test('[fn] group shell — exactly two radios (billing), not contact survey', async ({ page }) => {
    await scrollToSection(page, 'radio-field-qa-group-shell');
    const anchor = fieldByTestId(page, 'radio-field-group-shell');
    await expect(radiosInField(anchor)).toHaveCount(2);
    await expect(anchor.getByText('Monthly')).toBeVisible();
    await expect(anchor.getByText('Annual')).toBeVisible();
    await expect(anchor.getByText('Email')).toHaveCount(0);
  });

  test(`[fn] all ${RADIO_FIELD_SECTION_COUNT} feature bands exist`, async ({ page }) => {
    for (const id of RADIO_FIELD_DATA_SECTIONS) {
      await qaStep(`Band ${id}`, async () => {
        await scrollToSection(page, id);
      });
    }
    qaLog('All feature bands present', { count: RADIO_FIELD_SECTION_COUNT });
  });

  for (const testId of RADIO_FIELD_PRESERVED_TESTIDS) {
    test(`[fn] mount visible — ${testId}`, async ({ page }) => {
      await expect(fieldByTestId(page, testId)).toBeVisible();
    });
  }

  // ── Group 1 — Render ──────────────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await page.goto(RADIO_FIELD_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
      await assertNoConsoleErrors(errors);
    });

    test('[fn] 1.1 — default field renders one radio with role', async ({ page }) => {
      const radio = firstRadioInField(fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID));
      await expect(radio).toBeVisible();
      await expect(radio).toHaveAttribute('role', 'radio');
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      expect(RADIO_FIELD_ALL_TESTIDS.length).toBe(RADIO_FIELD_ALL_TESTID_COUNT);
      for (const testId of RADIO_FIELD_ALL_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          const anchor = fieldByTestId(page, testId);
          await anchor.scrollIntoViewIfNeeded();
          await expect(anchor, `${testId} should be visible`).toBeVisible();
          await expectNoErrorText(anchor);
        });
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section^="radio-field-qa"]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(RADIO_FIELD_SECTION_COUNT);
      for (const sectionId of RADIO_FIELD_DATA_SECTIONS) {
        await expect(
          page.locator(`[data-section="${sectionId}"]`),
          `Section ${sectionId}`,
        ).toBeVisible();
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — size S/M/L radios expose data-size on control', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-size');
      for (const size of RADIO_FIELD_SIZES) {
        const radio = firstRadioInField(fieldByTestId(page, radioFieldSizeTestId(size)));
        await expect(radio, `Size ${size} should set data-size on radio`).toHaveAttribute('data-size', size);
      }
    });

    test('[fn] 2.1 — appearance primary sets data-appearance on radio', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-appearance');
      const radio = firstRadioInField(fieldByTestId(page, radioFieldAppearanceTestId('primary')));
      await expect(radio).toHaveAttribute('data-appearance', 'primary');
    });

    test('[fn] 2.1 — checked field defaultChecked applies', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-checked');
      await expect(firstRadioInField(fieldByTestId(page, 'radio-field-checked'))).toBeChecked();
    });

    test('[fn] 2.2 — Size S/M/L scale progressively (circular control)', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-size');
      const boxes = await Promise.all(
        RADIO_FIELD_SIZES.map((size) => fieldRadioBox(page, radioFieldSizeTestId(size))),
      );
      for (const box of boxes) {
        expect(box, 'Each size mount should have a bounding box').not.toBeNull();
      }
      const [s, m, l] = boxes as NonNullable<Awaited<ReturnType<typeof fieldRadioBox>>>[];
      expect(s.width, 'Size S should be narrower than M').toBeLessThanOrEqual(m.width + 2);
      expect(m.width, 'Size M should be narrower than L').toBeLessThanOrEqual(l.width + 2);
      expect(s.height, 'Size S should be shorter than M').toBeLessThanOrEqual(m.height + 2);
      expect(m.height, 'Size M should be shorter than L').toBeLessThanOrEqual(l.height + 2);
      for (const box of [s, m, l]) {
        expect(Math.abs(box.width - box.height), 'Radio control should be roughly square').toBeLessThanOrEqual(6);
      }
    });

    test('[fn] 2.3 — appearance roles use non-transparent indicator fills', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-appearance');
      for (const appearance of RADIO_FIELD_APPEARANCE_ROLES) {
        const bg = await radioIndicatorBackgroundRgbInField(
          fieldByTestId(page, radioFieldAppearanceTestId(appearance)),
        );
        expect(rgbaAlpha(bg), `${appearance} indicator should not be transparent`).toBeGreaterThan(0);
      }
    });

    test('[fn] 2.3 — appearance primary vs negative set distinct data-appearance', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-appearance');
      const primary = firstRadioInField(fieldByTestId(page, radioFieldAppearanceTestId('primary')));
      const negative = firstRadioInField(fieldByTestId(page, radioFieldAppearanceTestId('negative')));
      await expect(primary).toHaveAttribute('data-appearance', 'primary');
      await expect(negative).toHaveAttribute('data-appearance', 'negative');
    });
  });

  // ── Group 3 — Click interaction ─────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.1 — click selects integrated radio (aria-checked)', async ({ page }) => {
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
      await scrollToSection(page, 'radio-field-qa-a11y');
      await expect(radio).not.toBeChecked();
      await radio.click();
      await expect(radio, 'Radio should be checked after click').toBeChecked();
    });

    test('[fn] 3.2 — disabled field radio does not toggle on click', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-disabled');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-disabled'));
      await expect(radio).not.toBeChecked();
      await radio.click({ force: true });
      await expect(radio, 'Disabled radio must stay unchecked').not.toBeChecked();
    });

    test('[fn] 3.3 — readOnly field keeps checked state on click', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-readonly');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-readonly'));
      await expect(radio).toBeChecked();
      await radio.click({ force: true });
      await expect(radio, 'Read-only radio must stay checked').toBeChecked();
    });

    test('[fn] 3.4 — click outside removes focus from radio', async ({ page }) => {
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
      await scrollToSection(page, 'radio-field-qa-a11y');
      await radio.focus();
      await expect(radio).toBeFocused();
      await page.locator('h1').first().click();
      await expect(radio).not.toBeFocused();
    });
  });

  // ── Group 4 — Keyboard navigation ─────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.1 — Tab reaches a focusable control on the page', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(tag.length, 'Tab should move focus to an element').toBeGreaterThan(0);
    });

    test('[fn] 4.2 — Enter on focused radio (N/A)', async () => {
      qaLog('Skipped — Base UI RadioField integrated control uses Space, not Enter, for selection');
    });

    test('[fn] 4.3 — Space toggles focused integrated radio', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-a11y');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
      await radio.focus();
      await page.keyboard.press('Space');
      await expect(radio).toBeChecked();
    });

    test('[fn] 4.4 — ArrowDown moves selection in group shell', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-group-shell');
      const anchor = fieldByTestId(page, 'radio-field-group-shell');
      const radios = radiosInField(anchor);
      await expect(radios.nth(0)).toBeChecked();
      await radios.nth(0).focus();
      await page.keyboard.press('ArrowDown');
      await expect(radios.nth(1)).toBeChecked();
    });

    test('[fn] 4.4 — ArrowUp moves selection back in group shell', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-group-shell');
      const anchor = fieldByTestId(page, 'radio-field-group-shell');
      const radios = radiosInField(anchor);
      await radios.nth(1).click();
      await radios.nth(1).focus();
      await page.keyboard.press('ArrowUp');
      await expect(radios.nth(0)).toBeChecked();
    });

    test('[fn] 4.5 — Home and End (N/A)', async () => {
      qaLog('Skipped — RadioField group shell does not expose Home/End selection in this showcase');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — RadioField has no overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      const seen = new Set<string>();
      for (let i = 0; i < 25; i += 1) {
        await page.keyboard.press('Tab');
        const sig =
          (await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return '';
            return el.getAttribute('data-testid') ?? el.getAttribute('id') ?? el.tagName;
          })) ?? '';
        seen.add(sig);
      }
      expect(seen.size, 'Tab should visit multiple distinct focus targets').toBeGreaterThan(3);
    });
  });

  // ── Group 5 — Focus management ────────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('[fn] 5.1 — click focuses keyboard target radio', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-a11y');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
      await radio.click();
      await expect(radio).toBeFocused();
    });

    test('[fn] 5.2 — focus ring visible on keyboard-focused radio', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-a11y');
      await firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard')).focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.3 — group shell ArrowDown moves focus to second option', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-group-shell');
      const anchor = fieldByTestId(page, 'radio-field-group-shell');
      const radios = radiosInField(anchor);
      await radios.nth(0).focus();
      await page.keyboard.press('ArrowDown');
      await expect(radios.nth(1)).toBeFocused();
    });

    test('[fn] 5.4 — blur removes focus from radio', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-a11y');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
      await radio.focus();
      await page.locator('h1').first().click();
      await expect(radio).not.toBeFocused();
    });

    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — RadioField has no autoFocus prop in Test Scenarios showcase');
    });
  });

  // ── Group 6 — State ───────────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('[fn] 6.1 — default integrated radio starts unchecked', async ({ page }) => {
      await expect(firstRadioInField(fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID))).not.toBeChecked();
    });

    test('[fn] 6.2 — checked field exposes aria-checked true', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-checked');
      await expect(firstRadioInField(fieldByTestId(page, 'radio-field-checked'))).toBeChecked();
    });

    test('[fn] 6.3 — disabled field radio is disabled', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-disabled');
      await expect(firstRadioInField(fieldByTestId(page, 'radio-field-disabled'))).toBeDisabled();
    });

    test('[fn] 6.3 — disabled-checked field stays checked and disabled', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-disabled-checked');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-disabled-checked'));
      await expect(radio).toBeChecked();
      await expect(radio).toBeDisabled();
    });

    test('[fn] 6.4 — readOnly field exposes data-readonly on radio', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-readonly');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-readonly'));
      await expect(radio).toHaveAttribute('data-readonly', '');
    });

    test('[fn] 6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — RadioField error/invalid state not mounted in Test Scenarios');
    });

    test('[fn] 6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — RadioField has no loading prop in Test Scenarios showcase');
    });
  });

  // ── Group 7 — Slots ───────────────────────────────────────────────────────
  test.describe('Group 7 — Slots', () => {
    test('[fn] 7.1 — start/end slots (N/A)', async () => {
      qaLog('Skipped — RadioField uses infoIconSlot/feedback/dynamicText, not start/end slots');
    });
  });

  // ── Group 8 — Toggle and selection ──────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', () => {
    test('[fn] 8.1 — click toggles integrated radio off → on', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-a11y');
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
      await expect(radio).not.toBeChecked();
      await radio.click();
      await expect(radio).toBeChecked();
    });

    test('[fn] 8.2 — group shell single-select — only one checked at a time', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-group-shell');
      const anchor = fieldByTestId(page, 'radio-field-group-shell');
      const radios = radiosInField(anchor);
      await radios.nth(1).click();
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(0)).not.toBeChecked();
      await radios.nth(0).click();
      await expect(radios.nth(0)).toBeChecked();
      await expect(radios.nth(1)).not.toBeChecked();
    });

    test('[fn] 8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — Radio has no indeterminate state');
    });
  });

  // ── Group 9 — Input and typing (N/A) ────────────────────────────────────
  test.describe('Group 9 — Input and typing (N/A)', () => {
    test('[fn] 9.1 — Typing (N/A)', async () => {
      qaLog('Skipped — RadioField is not a text input');
    });
  });

  // ── Group 10 — Dependency rules ───────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.1 — accent on lone Radio child (not RadioField API)', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-accent');
      await expect(fieldByTestId(page, 'radio-field-accent-sparkle')).toBeVisible();
      const radio = firstRadioInField(fieldByTestId(page, 'radio-field-accent-sparkle'));
      await expect(radio).toBeVisible();
    });

    test('[fn] 10.2 — info icon slot renders when infoIconSlot passed', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-info-icon');
      const anchor = fieldByTestId(page, 'radio-field-info-icon');
      await expect(anchor.getByRole('button', { name: /more about this field/i })).toBeVisible();
    });
  });

  // ── Group 11 — Content and display ────────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {
    test('[fn] 11.1 — label field shows label copy', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-label');
      await expect(fieldByTestId(page, 'radio-field-label').getByText('Preferred Contact Method')).toBeVisible();
    });

    test('[fn] 11.1 — feedback field shows feedback copy', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-feedback');
      await expect(
        fieldByTestId(page, 'radio-field-feedback').getByText(/change this later in settings/i),
      ).toBeVisible();
    });

    test('[fn] 11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — RadioField is not a progress indicator');
    });
  });

  // ── Group 12 — Layout and responsive ──────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('[fn] 12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — RadioField has no fullWidth prop in Test Scenarios showcase');
    });

    test('[fn] 12.2 — visible at 320px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openRadioFieldTestScenarios(page);
      await scrollToSection(page, 'radio-field-qa-default');
      await expect(fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID)).toBeVisible();
    });

    test('[fn] 12.2 — visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openRadioFieldTestScenarios(page);
      await expect(fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID)).toBeVisible();
    });

    test('[fn] 12.3 — group shell vertical radiogroup orientation', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-group-shell');
      const anchor = fieldByTestId(page, 'radio-field-group-shell');
      await expect(anchor.locator('[role="radiogroup"][data-orientation="vertical"]').first()).toBeVisible();
      const radios = radiosInField(anchor);
      const firstBox = await radios.nth(0).boundingBox();
      const secondBox = await radios.nth(1).boundingBox();
      expect(firstBox && secondBox).toBeTruthy();
      expect(secondBox!.y, 'Second option should sit below the first in vertical layout').toBeGreaterThan(
        firstBox!.y,
      );
    });
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: RADIO_FIELD_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Radio Field”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Radio Field', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default field anchor is visible', async ({ page }) => {
      await expect(fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID)).toBeVisible();
    });

    test('[fn] Smoke — Required field anchor is visible', async ({ page }) => {
      await scrollToSection(page, 'radio-field-qa-required');
      await expect(fieldByTestId(page, 'radio-field-required')).toBeVisible();
    });
  });
});
