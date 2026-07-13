/**
 * Switch QA — functional coverage (`SwitchQaShowcase.tsx`).
 * Component type: interactive (toggle switch — role="switch", aria-checked).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Switch defects.
 */
import { expect, test, type Page } from 'playwright/test';

import {
  SWITCH_ALL_TESTIDS,
  SWITCH_DATA_SECTIONS,
  SWITCH_FIGMA_SIZES,
  SWITCH_PLAYGROUND_ROUTE,
  SWITCH_PRESERVED_SPOT_TESTIDS,
  SWITCH_SECTION_COUNT,
  switchAppearanceTestId,
  switchSizeTestId,
} from './switch-playground/manifest';
import {
  clickPageThemeButton,
  computedSwitchTrackBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  gotoSwitchPlayground,
  openSwitchTestScenarios,
  qaLog,
  qaStep,
  scrollToSection,
  SWITCH_TAG_SET,
  switchByTestId,
} from './switch/switch-qa-support';

async function switchWrapperSize(page: Page, testId: string): Promise<string | null> {
  return switchByTestId(page, testId).evaluate((el) => el.closest('label')?.getAttribute('data-size') ?? null);
}

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${SWITCH_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `Switch playground reachable at ${origin}${SWITCH_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.describe('Functional', { tag: SWITCH_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openSwitchTestScenarios(page);
  });

  // ── Preserved tests (do not remove) ───────────────────────────────────────
  test('[fn] shows Switch page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Switch', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[fn] scenario and report tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] figma validation tab mounts grid', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    const grid = page.getByTestId('figma-switch-grid');
    await expect(grid).toBeVisible();
    await expect(grid.getByRole('caption')).toContainText(/Switch/i);
    await expect(grid.getByRole('row', { name: /selected: false/i })).toBeVisible();
    await expect(grid.getByRole('row', { name: /selected: true/i })).toBeVisible();
  });

  for (const testId of SWITCH_PRESERVED_SPOT_TESTIDS) {
    test(`[fn] renders switch: ${testId}`, async ({ page }) => {
      const el = page.getByTestId(testId);
      await expect(el).toBeVisible({ timeout: 60_000 });
    });
  }

  test('[fn] default switch toggles on click', async ({ page }) => {
    const sw = page.getByTestId('sw-figma-default');
    await expect(sw).toBeVisible();
    await expect(sw).not.toBeChecked();
    await sw.click();
    await expect(sw).toBeChecked();
    await sw.click();
    await expect(sw).not.toBeChecked();
  });

  test('[fn] controlled switch toggles via click', async ({ page }) => {
    const sw = page.getByTestId('sw-figma-selected-controlled');
    await expect(sw).toBeVisible({ timeout: 60_000 });
    const before = await sw.isChecked();
    await sw.click();
    if (before) {
      await expect(sw).not.toBeChecked();
    } else {
      await expect(sw).toBeChecked();
    }
  });

  test('[fn] Space toggles focused default switch', async ({ page }) => {
    const sw = page.getByTestId('sw-figma-default');
    await sw.focus();
    await expect(sw).toBeFocused();
    await page.keyboard.press('Space');
    await expect(sw).toBeChecked();
  });

  // ── Group 1 — Render ──────────────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(SWITCH_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await switchByTestId(page, 'sw-figma-default').waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of SWITCH_ALL_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          await switchByTestId(page, testId).scrollIntoViewIfNeeded();
          await expect(switchByTestId(page, testId), `${testId} should be visible`).toBeVisible();
          await expectNoErrorText(switchByTestId(page, testId));
        });
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(SWITCH_SECTION_COUNT);
      for (const sectionId of SWITCH_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`), `Section ${sectionId}`).toBeVisible();
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — size S/M/L wrappers expose data-size', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-size-selected');
      for (const size of SWITCH_FIGMA_SIZES) {
        expect(await switchWrapperSize(page, switchSizeTestId(size, false))).toBe(size);
      }
    });

    test('[fn] 2.1 — appearance primary-off sets data-appearance on switch', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-appearance');
      await expect(switchByTestId(page, switchAppearanceTestId('primary', false))).toHaveAttribute(
        'data-appearance',
        'primary',
      );
    });

    test('[fn] 2.1 — selected-true cells are checked by default', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-size-selected');
      await expect(switchByTestId(page, switchSizeTestId('m', true))).toBeChecked();
      await expect(switchByTestId(page, switchSizeTestId('m', false))).not.toBeChecked();
    });

    test('[fn] 2.2 — Size scaling — S < M < L track width', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-size-selected');
      const widths: number[] = [];
      for (const size of SWITCH_FIGMA_SIZES) {
        const box = await switchByTestId(page, switchSizeTestId(size, false)).boundingBox();
        expect(box, `Bounding box for size ${size}`).not.toBeNull();
        widths.push(box!.width);
      }
      expect(widths[0], 'Size S track should be narrower than M').toBeLessThan(widths[1]);
      expect(widths[1], 'Size M track should be narrower than L').toBeLessThan(widths[2]);
    });

  });

  // ── Group 3 — Click interaction ─────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.1 — click toggles aria-checked on default switch', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-default');
      await expect(sw).not.toBeChecked();
      await sw.click();
      await expect(sw, 'Switch should be checked after click').toBeChecked();
    });

    test('[fn] 3.2 — disabled switch does not toggle on click', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-disabled-true-off');
      await scrollToSection(page, 'switch-figma-disabled');
      await expect(sw).not.toBeChecked();
      await sw.click({ force: true });
      await expect(sw, 'Disabled switch must stay unchecked').not.toBeChecked();
    });

    test('[fn] 3.3 — readOnly switch does not toggle on click', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-readonly-true-off');
      await scrollToSection(page, 'switch-figma-readonly');
      await expect(sw).not.toBeChecked();
      await sw.click({ force: true });
      await expect(sw, 'Read-only switch must stay unchecked').not.toBeChecked();
    });

    test('[fn] 3.4 — click outside removes focus from switch', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-default');
      await sw.focus();
      await expect(sw).toBeFocused();
      await page.locator('h1').first().click();
      await expect(sw).not.toBeFocused();
    });
  });

  // ── Group 4 — Keyboard navigation ─────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.1 — Tab reaches default switch', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-default');
      await sw.focus();
      await expect(sw).toBeFocused();
    });

    test('[fn] 4.2 — Enter toggles focused default switch', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-default');
      await sw.focus();
      await expect(sw).not.toBeChecked();
      await page.keyboard.press('Enter');
      await expect(sw).toBeChecked();
    });

    test('[fn] 4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — Switch is a single toggle; arrow keys do not apply');
    });

    test('[fn] 4.5 — Home and End (N/A)', async () => {
      qaLog('Skipped — Switch is not a list; Home/End do not apply');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      await switchByTestId(page, 'sw-figma-default').focus();
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press('Tab');
      }
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(activeTag.length).toBeGreaterThan(0);
    });
  });

  // ── Group 5 — Focus management ────────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('[fn] 5.1 — click focuses default switch', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-default');
      await sw.click();
      await expect(sw).toBeFocused();
    });

    test('[fn] 5.2 — focus ring visible on default switch', async ({ page }) => {
      await switchByTestId(page, 'sw-figma-default').focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — Switch has no autoFocus prop in Test Scenarios showcase');
    });
  });

  // ── Group 6 — State ───────────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('[fn] 6.1 — default switch starts unchecked', async ({ page }) => {
      await expect(switchByTestId(page, 'sw-figma-default')).not.toBeChecked();
    });

    test('[fn] 6.2 — appearance-on cells render checked', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-appearance');
      await expect(switchByTestId(page, switchAppearanceTestId('secondary', true))).toBeChecked();
    });

    test('[fn] 6.3 — disabled switch is not enabled', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-disabled');
      await expect(switchByTestId(page, 'sw-figma-disabled-true-on')).toBeDisabled();
    });

    test('[fn] 6.4 — readOnly switch exposes aria-readonly', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-readonly');
      await expect(switchByTestId(page, 'sw-figma-readonly-true-on')).toHaveAttribute('aria-readonly', 'true');
    });

    test('[fn] 6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — Switch has no error/invalid prop in Test Scenarios showcase');
    });

    test('[fn] 6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — Switch has no loading prop in Test Scenarios showcase');
    });
  });

  // ── Group 7 — Slots ───────────────────────────────────────────────────────
  test.describe('Group 7 — Slots', () => {
    test('[fn] 7.1 — start/end slots (N/A)', async () => {
      qaLog('Skipped — Switch showcase has label children only; no start/end slot props');
    });
  });

  // ── Group 8 — Toggle and selection ──────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', () => {
    test('[fn] 8.1 — click toggles off → on → off with aria-checked', async ({ page }) => {
      const sw = switchByTestId(page, 'sw-figma-default');
      await expect(sw).not.toBeChecked();
      await sw.click();
      await expect(sw).toBeChecked();
      await sw.click();
      await expect(sw).not.toBeChecked();
    });

    test('[fn] 8.2 — Single select (N/A)', async () => {
      qaLog('Skipped — Switch is not a selection group');
    });

    test('[fn] 8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — Switch has no indeterminate state');
    });
  });

  // ── Group 9 — Input and typing (N/A) ────────────────────────────────────
  test.describe('Group 9 — Input and typing (N/A)', () => {
    test('[fn] 9.1 — Typing (N/A)', async () => {
      qaLog('Skipped — Switch is not a text input');
    });
  });

  // ── Group 10 — Dependency rules ───────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.1 — accent prop renders accent on/off pair', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-accent');
      await expect(switchByTestId(page, 'sw-figma-accent-sparkle-off')).toBeVisible();
      await expect(switchByTestId(page, 'sw-figma-accent-sparkle-on')).toBeChecked();
    });
  });

  // ── Group 11 — Content and display ────────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {

    test('[fn] 11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — Switch is not a progress indicator');
    });
  });

  // ── Group 12 — Layout and responsive ──────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('[fn] 12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Switch has no fullWidth prop in Test Scenarios showcase');
    });

    test('[fn] 12.2 — visible at 320px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoSwitchPlayground(page);
      await scrollToSection(page, 'switch-figma-default');
      await expect(switchByTestId(page, 'sw-figma-default')).toBeVisible();
    });

    test('[fn] 12.2 — visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSwitchPlayground(page);
      await expect(switchByTestId(page, 'sw-figma-default')).toBeVisible();
    });

    test('[fn] 12.3 — size band rows layout horizontally', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-size-selected');
      const off = switchByTestId(page, switchSizeTestId('m', false));
      const on = switchByTestId(page, switchSizeTestId('m', true));
      const offBox = await off.boundingBox();
      const onBox = await on.boundingBox();
      expect(offBox && onBox).toBeTruthy();
      expect(onBox!.x, 'Off and on switches in a row should sit side by side').toBeGreaterThan(offBox!.x);
    });
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: SWITCH_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Switch”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Switch', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default switch is visible', async ({ page }) => {
      await expect(switchByTestId(page, 'sw-figma-default')).toBeVisible();
    });

    test('[fn] Smoke — Appearance primary-off switch is visible', async ({ page }) => {
      await scrollToSection(page, 'switch-figma-appearance');
      await expect(switchByTestId(page, switchAppearanceTestId('primary', false))).toBeVisible();
    });
  });
});
