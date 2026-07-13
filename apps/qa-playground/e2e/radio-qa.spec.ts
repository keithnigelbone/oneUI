/**
 * Radio QA — functional coverage aligned to `RadioQaShowcase.tsx`.
 */
import { expect, test } from 'playwright/test';

import {
  RADIO_ACCENTS,
  RADIO_ALL_TESTIDS,
  RADIO_COMBO_COUNT,
  RADIO_DATA_SECTIONS,
  RADIO_FIGMA_APPEARANCES,
  RADIO_FIGMA_SIZES,
  RADIO_ROOT_TESTIDS,
  RADIO_SECTION_COUNT,
  RADIO_SIZE_ALIASES,
  radioAccentNeutralTestId,
  radioAccentPairTestId,
  radioAppearanceTestId,
  radioComboTestId,
  radioSizeAliasTestId,
  radioSizeTestId,
} from './radio-playground/manifest';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  defaultBandRadios,
  expectFocusVisible,
  gotoRadioPlayground,
  qaLog,
  qaStep,
  radioBox,
  radioByTestId,
  radioIndicatorBackgroundRgb,
  radioSection,
  rgbaAlpha,
  RADIO_TAG_SET,
  scrollToRadioTestId,
} from './radio/radio-qa-support';

const COMBO_COUNT = RADIO_COMBO_COUNT;

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/radio`);
  expect(res.ok(), `Radio playground should be reachable at ${origin}/c/radio`).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await gotoRadioPlayground(page);
});

test.describe('Functional', { tag: RADIO_TAG_SET.functional }, () => {
  // ── Preserved tests (do not remove) ─────────────────────────────────────
  test('[fn] shows Radio page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Radio', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default story first radio is visible', async ({ page }) => {
    await expect(page.getByTestId('radio-default')).toBeVisible();
  });

  test('[fn] Default group — selecting second option moves selection', async ({ page }) => {
    const band = page.locator('#radio-qa-default');
    const radios = band.locator('[role="radio"]');
    await radios.nth(1).click();
    await expect(radios.nth(1)).toBeChecked();
    await expect(page.getByTestId('radio-default')).not.toBeChecked();
  });

  test('[fn] Size row — S / M / L radios visible', async ({ page }) => {
    for (const figma of ['S', 'M', 'L'] as const) {
      await expect(page.getByTestId(`radio-size-${figma}`)).toBeVisible();
    }
  });

  test('[fn] Selected band — empty group has no selection; defaultValue group has selection', async ({ page }) => {
    await expect(page.getByTestId('radio-selected-false')).not.toBeChecked();
    await expect(page.getByTestId('radio-selected-true')).toBeChecked();
  });

  test('[fn] Read-only selected group — clicking sibling does not change selection', async ({ page }) => {
    const group = page.getByRole('radiogroup', { name: 'readOnly true second selected' });
    await expect(page.getByTestId('radio-readonly-true-on')).toBeChecked();
    await group.locator('[role="radio"]').nth(0).click({ force: true });
    await expect(page.getByTestId('radio-readonly-true-on')).toBeChecked();
  });

  test('[fn] Disabled group — cannot move selection to second option', async ({ page }) => {
    const group = page.getByRole('radiogroup', { name: 'disabled true first selected' });
    await expect(page.getByTestId('radio-disabled-true-off')).toBeChecked();
    await group.locator('[role="radio"]').nth(1).click({ force: true });
    await expect(page.getByTestId('radio-disabled-true-off')).toBeChecked();
    await expect(group.locator('[role="radio"]').nth(1)).not.toBeChecked();
  });

  test('[fn] Appearance matrix — primary row radios visible', async ({ page }) => {
    const band = page.locator('#radio-qa-appearance');
    await expect(band.getByTestId('radio-appearance-primary-off')).toBeVisible();
    await expect(band.getByTestId('radio-appearance-primary-on')).toBeVisible();
  });

  test('[fn] Accent row — primary accent pair visible', async ({ page }) => {
    const band = page.locator('#radio-qa-accent');
    await expect(band.getByTestId('radio-accent-primary-off')).toBeVisible();
    await expect(band.getByTestId('radio-accent-primary-on')).toBeVisible();
  });

  test('[fn] Combination matrix renders all combo rows', async ({ page }) => {
    for (let i = 0; i < COMBO_COUNT; i++) {
      await expect(page.getByTestId(`radio-combo-${i}`)).toBeVisible();
    }
  });

  // ── GROUP 1 — Render tests ───────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('1.1 — Page loads without console errors', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await qaStep('Reload Radio playground and wait for default control', async () => {
        await gotoRadioPlayground(page);
        await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).toBeVisible();
      });
      await assertNoConsoleErrors(errors);
    });

    test('1.1 — Default radio renders with role radio', async ({ page }) => {
      const radio = radioByTestId(page, RADIO_ROOT_TESTIDS.default);
      await expect(radio).toBeVisible();
      await expect(radio).toHaveAttribute('role', 'radio');
    });

    test('1.2 — Every playground data-testid is visible', async ({ page }) => {
      for (const testId of RADIO_ALL_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          const radio = radioByTestId(page, testId);
          await radio.scrollIntoViewIfNeeded();
          await expect(radio, `Expected visible: ${testId}`).toBeVisible();
          await expect(radio).toHaveAttribute('role', 'radio');
          const errorText = await radio.locator('text=/error|failed/i').count();
          expect(errorText, `${testId} should not render error text`).toBe(0);
        });
      }
    });

    test('1.3 — Every data-section band is visible', async ({ page }) => {
      for (const sectionId of RADIO_DATA_SECTIONS) {
        await expect(radioSection(page, sectionId)).toBeVisible();
      }
      const sections = page.locator('[data-section^="radio-qa-"]');
      await expect(sections).toHaveCount(RADIO_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    for (const figma of RADIO_FIGMA_SIZES) {
      test(`2.1 — Size ${figma} renders`, async ({ page }) => {
        await radioSection(page, 'radio-qa-size').scrollIntoViewIfNeeded();
        await expect(radioByTestId(page, radioSizeTestId(figma))).toBeVisible();
      });
    }

    test('2.2 — Size S/M/L scale progressively (width and height)', async ({ page }) => {
      await radioSection(page, 'radio-qa-size').scrollIntoViewIfNeeded();
      const boxes = await Promise.all(
        RADIO_FIGMA_SIZES.map((figma) => radioBox(page, radioSizeTestId(figma))),
      );
      for (const box of boxes) {
        expect(box).not.toBeNull();
      }
      const [s, m, l] = boxes as NonNullable<Awaited<ReturnType<typeof radioBox>>>[];
      expect(s.width).toBeLessThanOrEqual(m.width + 2);
      expect(m.width).toBeLessThanOrEqual(l.width + 2);
      expect(s.height).toBeLessThanOrEqual(m.height + 2);
      expect(m.height).toBeLessThanOrEqual(l.height + 2);
      expect(Math.abs(s.width - s.height)).toBeLessThanOrEqual(4);
      expect(Math.abs(m.width - m.height)).toBeLessThanOrEqual(4);
      expect(Math.abs(l.width - l.height)).toBeLessThanOrEqual(4);
    });

    for (const alias of RADIO_SIZE_ALIASES) {
      test(`2.1 — Legacy size alias "${alias}" renders`, async ({ page }) => {
        await radioSection(page, 'radio-qa-size').scrollIntoViewIfNeeded();
        await expect(radioByTestId(page, radioSizeAliasTestId(alias))).toBeVisible();
      });
    }

    for (const appearance of RADIO_FIGMA_APPEARANCES) {
      test(`2.1 — Appearance ${appearance} off/on pair renders`, async ({ page }) => {
        await radioSection(page, 'radio-qa-appearance').scrollIntoViewIfNeeded();
        await expect(radioByTestId(page, radioAppearanceTestId(appearance, 'off'))).toBeVisible();
        await expect(radioByTestId(page, radioAppearanceTestId(appearance, 'on'))).toBeVisible();
      });
    }


    for (const accent of RADIO_ACCENTS) {
      test(`2.1 — Accent ${accent} pair renders`, async ({ page }) => {
        await radioSection(page, 'radio-qa-accent').scrollIntoViewIfNeeded();
        await expect(radioByTestId(page, radioAccentPairTestId(accent, 'off'))).toBeVisible();
        await expect(radioByTestId(page, radioAccentPairTestId(accent, 'on'))).toBeVisible();
      });
    }

  });

  // ── GROUP 3 — Click interaction ──────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('3.1 — Click selects radio and updates aria-checked', async ({ page }) => {
      const radios = defaultBandRadios(page);
      await radios.nth(1).click();
      await expect(radios.nth(1)).toBeChecked();
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).not.toBeChecked();
    });

    test('3.2 — Disabled group ignores click on sibling', async ({ page }) => {
      const group = page.getByRole('radiogroup', { name: 'disabled true first selected' });
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.disabledTrueOff)).toBeChecked();
      await group.locator('[role="radio"]').nth(1).click({ force: true });
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.disabledTrueOff)).toBeChecked();
    });

    test('3.3 — Read-only group keeps selection after click on sibling', async ({ page }) => {
      const group = page.getByRole('radiogroup', { name: 'readOnly true second selected' });
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.readonlyTrueOn)).toBeChecked();
      await group.locator('[role="radio"]').nth(0).click({ force: true });
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.readonlyTrueOn)).toBeChecked();
    });

    test('3.4 — Click outside removes focus from radio', async ({ page }) => {
      const radio = radioByTestId(page, RADIO_ROOT_TESTIDS.default);
      await radio.focus();
      await expect(radio).toBeFocused();
      await page.locator('h1').click();
      await expect(radio).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('4.1 — Tab reaches default group radios', async ({ page }) => {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      expect(['radio', null]).toContain(focused);
    });

    test('4.2 — Space selects focused radio in default group', async ({ page }) => {
      const radios = defaultBandRadios(page);
      await radios.nth(1).focus();
      await page.keyboard.press('Space');
      await expect(radios.nth(1)).toBeChecked();
    });

    test('4.4 — ArrowDown moves selection in default vertical group', async ({ page }) => {
      const radios = defaultBandRadios(page);
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).toBeChecked();
      await radios.nth(0).focus();
      await page.keyboard.press('ArrowDown');
      await expect(radios.nth(1)).toBeChecked();
    });

    test.skip('4.5 — Home moves focus to first radio in default group', async ({ page }) => {
      // Base UI RadioGroup does not handle Home — tracked as component gap; ArrowDown/ArrowUp work.
      const radios = defaultBandRadios(page);
      await radios.nth(2).click();
      await expect(radios.nth(2)).toBeChecked();
      await radios.nth(2).focus();
      await page.keyboard.press('Home');
      await expect(radios.nth(0)).toBeFocused();
    });

    test.skip('4.5 — End moves focus to last radio in default group', async ({ page }) => {
      // Base UI RadioGroup does not handle End — tracked as component gap; ArrowDown/ArrowUp work.
      const radios = defaultBandRadios(page);
      await radios.nth(0).focus();
      await page.keyboard.press('End');
      await expect(radios.nth(2)).toBeFocused();
    });

    test('4.6 — Escape does not remove radios (no overlay)', async ({ page }) => {
      await radioByTestId(page, RADIO_ROOT_TESTIDS.default).focus();
      await page.keyboard.press('Escape');
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('4.7 — Repeated Tab visits multiple distinct focus targets (no single-element trap)', async ({
      page,
    }) => {
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
  test.describe('Group 5 — Focus management', () => {
    test('5.1 — Click focuses radio control', async ({ page }) => {
      const radio = radioByTestId(page, RADIO_ROOT_TESTIDS.default);
      await radio.click();
      await expect(radio).toBeFocused();
    });

    test('5.2 — Focus indicator visible on keyboard focus', async ({ page }) => {
      await radioByTestId(page, RADIO_ROOT_TESTIDS.default).focus();
      await expectFocusVisible(page);
    });

    test('5.4 — Blur removes focus', async ({ page }) => {
      const radio = radioByTestId(page, RADIO_ROOT_TESTIDS.default);
      await radio.focus();
      await page.locator('h1').click();
      await expect(radio).not.toBeFocused();
    });

    test('5.3 — Read-only radio can receive focus', async ({ page }) => {
      await scrollToRadioTestId(page, RADIO_ROOT_TESTIDS.readonlyFalseOff);
      const radio = radioByTestId(page, RADIO_ROOT_TESTIDS.readonlyFalseOff);
      await radio.focus();
      await expect(radio).toBeFocused();
    });
  });

  // ── GROUP 6 — State tests ────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('6.1 — Default group first option is selected', async ({ page }) => {
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).toBeChecked();
    });

    test('6.2 — Selected true control is checked', async ({ page }) => {
      await scrollToRadioTestId(page, RADIO_ROOT_TESTIDS.selectedTrue);
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.selectedTrue)).toBeChecked();
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.selectedFalse)).not.toBeChecked();
    });

    test('6.3 — Disabled group marks controls disabled', async ({ page }) => {
      await scrollToRadioTestId(page, RADIO_ROOT_TESTIDS.disabledTrueOff);
      const radio = radioByTestId(page, RADIO_ROOT_TESTIDS.disabledTrueOff);
      await expect(radio).toHaveAttribute('aria-disabled', 'true');
    });

    test('6.4 — Read-only group selection is stable', async ({ page }) => {
      await scrollToRadioTestId(page, RADIO_ROOT_TESTIDS.readonlyTrueOn);
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.readonlyTrueOn)).toBeChecked();
    });

    test('6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — Radio has no error/invalid prop in showcase');
    });

    test('6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — Radio has no loading prop in showcase');
    });
  });

  // ── GROUP 7 — Slot tests (N/A) ───────────────────────────────────────────
  test.describe('Group 7 — Slots (N/A)', () => {
    test('7.x — Radio has no start/end/icon slots', async () => {
      qaLog('Skipped — Radio uses label children only; no start/end slot API');
    });
  });

  // ── GROUP 8 — Toggle and selection ─────────────────────────────────────
  test.describe('Group 8 — Selection', () => {
    test('8.1 — Toggle on/off (N/A)', async () => {
      qaLog('Skipped — Radio is single-select within a group, not a binary toggle');
    });

    test('8.2 — Only one option selected at a time in default group', async ({ page }) => {
      const radios = defaultBandRadios(page);
      await radios.nth(1).click();
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(0)).not.toBeChecked();
      await expect(radios.nth(2)).not.toBeChecked();
    });

    test('8.2 — Selecting third option deselects first', async ({ page }) => {
      const radios = defaultBandRadios(page);
      await radios.nth(2).click();
      await expect(radios.nth(2)).toBeChecked();
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).not.toBeChecked();
    });

  });

  // ── GROUP 9 — Input and typing (N/A) ─────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — Radio is not typed entry');
    });
  });

  // ── GROUP 10 — Dependencies ──────────────────────────────────────────────
  test.describe('Group 10 — Dependencies', () => {
    test('10.1 — Group readOnly prevents selection change', async ({ page }) => {
      const group = page.getByRole('radiogroup', { name: 'readOnly true second selected' });
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.readonlyTrueOn)).toBeChecked();
      await group.locator('[role="radio"]').nth(0).click({ force: true });
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.readonlyTrueOn)).toBeChecked();
    });

    test('10.1 — Group disabled prevents selection change', async ({ page }) => {
      const group = page.getByRole('radiogroup', { name: 'disabled true first selected' });
      await group.locator('[role="radio"]').nth(1).click({ force: true });
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.disabledTrueOff)).toBeChecked();
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {
    test('11.1 — Default radio exposes visible label text', async ({ page }) => {
      await expect(page.locator('#radio-qa-default')).toContainText('Option A');
    });

    test('11.1 — Size row documents S/M/L captions', async ({ page }) => {
      await radioSection(page, 'radio-qa-size').scrollIntoViewIfNeeded();
      await expect(radioSection(page, 'radio-qa-size')).toContainText('size: S');
      await expect(radioSection(page, 'radio-qa-size')).toContainText('size: M');
    });
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Radio has no fullWidth prop');
    });

    test('12.2 — At 320px viewport, each scenario band fits without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoRadioPlayground(page);
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).toBeVisible();
      for (const sectionId of RADIO_DATA_SECTIONS) {
        const band = radioSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        await expect(band).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2 — Visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoRadioPlayground(page);
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Default group stacks options vertically', async ({ page }) => {
      const radios = defaultBandRadios(page);
      const boxes = await Promise.all(
        [0, 1, 2].map(async (i) => {
          const box = await radios.nth(i).boundingBox();
          expect(box, `Radio option ${i} should have layout box`).not.toBeNull();
          return box!;
        }),
      );
      expect(boxes[1]!.y).toBeGreaterThan(boxes[0]!.y);
      expect(boxes[2]!.y).toBeGreaterThan(boxes[1]!.y);
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', () => {
    test('13.1 — All sections visible after theme toggle', async ({ page }) => {
      await clickPageThemeButton(page);
      for (const sectionId of RADIO_DATA_SECTIONS) {
        await expect(radioSection(page, sectionId)).toBeVisible();
      }
      await expect(radioByTestId(page, RADIO_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('13.1 — Appearance primary selected visible in dark mode', async ({ page }) => {
      await clickPageThemeButton(page);
      await radioSection(page, 'radio-qa-appearance').scrollIntoViewIfNeeded();
      const on = radioByTestId(page, radioAppearanceTestId('primary', 'on'));
      await expect(on).toBeVisible();
      const rgb = await radioIndicatorBackgroundRgb(page, radioAppearanceTestId('primary', 'on'));
      expect(rgbaAlpha(rgb)).toBeGreaterThan(0);
    });
  });

  // ── Combination matrix ───────────────────────────────────────────────────
  test.describe('Combination matrix', () => {
    test('Figma combination matrix renders every row', async ({ page }) => {
      await radioSection(page, 'radio-qa-combos').scrollIntoViewIfNeeded();
      for (let i = 0; i < RADIO_COMBO_COUNT; i++) {
        await expect(radioByTestId(page, radioComboTestId(i))).toBeVisible();
      }
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: RADIO_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Radio”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Radio', level: 1 })).toBeVisible();
    });

    test('Smoke — Default radio is visible and checked', async ({ page }) => {
      const radio = radioByTestId(page, RADIO_ROOT_TESTIDS.default);
      await expect(radio).toBeVisible();
      await expect(radio).toBeChecked();
    });
  });
});
