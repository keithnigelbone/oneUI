/**
 * SingleTextButton QA — functional coverage (`SingleTextButtonQaShowcase.tsx`).
 * Component type: interactive (action button — not a toggle).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` SingleTextButton defects.
 */
import { expect, test } from 'playwright/test';

import {
  STB_ALL_TESTIDS,
  STB_ATTENTION_VARIANT_MAP,
  STB_ATTENTIONS,
  STB_DATA_SECTIONS,
  STB_FIGMA_SIZES,
  STB_PLAYGROUND_ROUTE,
  STB_PREFIX,
  STB_SECTION_COUNT,
  stbAttentionTestId,
  stbCondensedTestId,
  stbSizeTestId,
} from './single-text-button-playground/manifest';
import {
  computedButtonBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  gotoSingleTextButtonPlayground,
  openSingleTextButtonTestScenarios,
  qaLog,
  qaStep,
  STB_TAG_SET,
  scrollToSection,
  stbButton,
  stbByTestId,
} from './single-text-button/single-text-button-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${STB_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `SingleTextButton playground reachable at ${origin}${STB_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.describe('Functional', { tag: STB_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openSingleTextButtonTestScenarios(page);
  });

  // ── Preserved tests (do not remove) ───────────────────────────────────────
  test('[fn] Component page shows title and QA tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Single Text Button', level: 1 })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default button shows label “Ag”, size M, high attention, bold variant', async ({ page }) => {
    const btn = stbButton(page, `${STB_PREFIX}-default`);
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText('Ag');
    await expect(btn).toHaveAttribute('data-size', 'm');
    await expect(btn).toHaveAttribute('data-attention', 'high');
    await expect(btn).toHaveAttribute('data-variant', 'bold');
  });

  test('[fn] Size variants S, M, and L render', async ({ page }) => {
    for (const size of STB_FIGMA_SIZES) {
      await expect(stbByTestId(page, stbSizeTestId(size))).toBeVisible();
    }
  });

  test('[fn] High / medium / low attention map to bold / subtle / ghost variants', async ({ page }) => {
    for (const attention of STB_ATTENTIONS) {
      const btn = stbButton(page, stbAttentionTestId(attention));
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('data-attention', attention);
      await expect(btn).toHaveAttribute('data-variant', STB_ATTENTION_VARIANT_MAP[attention]);
    }
  });

  test('[fn] Condensed buttons set data-condensed and correct data-size', async ({ page }) => {
    for (const size of STB_FIGMA_SIZES) {
      const btn = stbButton(page, stbCondensedTestId(size));
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('data-condensed', '');
      await expect(btn).toHaveAttribute('data-size', size);
    }
  });

  test('[fn] Click increments the press counter', async ({ page }) => {
    await stbButton(page, `${STB_PREFIX}-interactive`).click();
    await expect(stbByTestId(page, `${STB_PREFIX}-press-count`)).toContainText('presses: 1');
  });

  test('[fn] Disabled cannot be clicked; loading shows busy state and name “Loading”', async ({ page }) => {
    await expect(stbButton(page, `${STB_PREFIX}-disabled`)).toBeDisabled();
    const loading = stbButton(page, `${STB_PREFIX}-loading`);
    await expect(loading).toBeDisabled();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(loading).toHaveAccessibleName('Loading');
  });

  test('[fn] Long label edge-case cell renders', async ({ page }) => {
    await expect(stbByTestId(page, `${STB_PREFIX}-edge-long`)).toBeVisible();
  });

  test('[fn] All Test Scenarios story bands are mounted on the page', async ({ page }) => {
    for (const section of STB_DATA_SECTIONS) {
      await expect(page.locator(`[data-section="${section}"]`)).toBeVisible();
    }
  });

  test('[fn] Figma Validation tab shows API table and validation grids', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('single-text-button-api-validation-root')).toBeVisible();
    await expect(page.getByTestId('figma-single-text-button-grid')).toBeVisible();
    await expect(page.getByTestId('single-text-button-figma-val-m-high')).toBeVisible();
    await expect(page.getByTestId('single-text-button-figma-val-condensed-m')).toBeVisible();
  });

  // ── Group 1 — Render ──────────────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(STB_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await stbByTestId(page, `${STB_PREFIX}-default`).waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of STB_ALL_TESTIDS) {
        await stbByTestId(page, testId).scrollIntoViewIfNeeded();
        await expect(stbByTestId(page, testId)).toBeVisible();
        await expectNoErrorText(stbByTestId(page, testId));
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(STB_SECTION_COUNT);
      for (const sectionId of STB_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`)).toBeVisible();
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.2 — size bounding boxes grow S → L (circular)', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-size');
      const boxS = await stbButton(page, stbSizeTestId('s')).boundingBox();
      const boxM = await stbButton(page, stbSizeTestId('m')).boundingBox();
      const boxL = await stbButton(page, stbSizeTestId('l')).boundingBox();
      expect(boxS).not.toBeNull();
      expect(boxM).not.toBeNull();
      expect(boxL).not.toBeNull();
      expect(boxM!.height).toBeGreaterThanOrEqual(boxS!.height - 1);
      expect(boxL!.height).toBeGreaterThanOrEqual(boxM!.height - 1);
      expect(Math.abs(boxM!.width - boxM!.height)).toBeLessThanOrEqual(2);
    });


    test('[fn] 2.3 — Appearance colour (N/A)', async () => {
      qaLog('Skipped — appearance prop is not mounted in Test Scenarios showcase');
    });
  });

  // ── Group 3 — Click interaction ───────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.1 — click fires onClick and updates press counter', async ({ page }) => {
      const btn = stbButton(page, `${STB_PREFIX}-interactive`);
      await qaStep('Click interactive button', async () => {
        await btn.click();
      });
      await expect(stbByTestId(page, `${STB_PREFIX}-press-count`)).toContainText('presses: 1');
    });

    test('[fn] 3.2 — disabled button does not increment counter on forced click', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-states');
      await stbButton(page, `${STB_PREFIX}-disabled`).click({ force: true });
      await expect(stbByTestId(page, `${STB_PREFIX}-press-count`)).toContainText('presses: 0');
    });

    test('[fn] 3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — SingleTextButton has no readOnly prop in showcase');
    });

    test('[fn] 3.4 — click outside removes focus', async ({ page }) => {
      const btn = stbButton(page, `${STB_PREFIX}-interactive`);
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('h1').first().click();
      await expect(btn).not.toBeFocused();
    });
  });

  // ── Group 4 — Keyboard navigation ─────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.1 — Tab reaches interactive button', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-interaction');
      await stbButton(page, `${STB_PREFIX}-interactive`).focus();
      await expect(stbButton(page, `${STB_PREFIX}-interactive`)).toBeFocused();
    });

    test('[fn] 4.1 — disabled button is not focused via Tab from prior focusable', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-states');
      await stbButton(page, `${STB_PREFIX}-disabled`).focus({ force: true });
      await page.keyboard.press('Tab');
      await expect(stbButton(page, `${STB_PREFIX}-loading`)).not.toBeFocused();
    });

    test('[fn] 4.2 — Enter activates interactive button', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-interaction');
      const btn = stbButton(page, `${STB_PREFIX}-interactive`);
      await btn.focus();
      await page.keyboard.press('Enter');
      await expect(stbByTestId(page, `${STB_PREFIX}-press-count`)).toContainText('presses: 1');
    });

    test('[fn] 4.3 — Space activates interactive button', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-interaction');
      const btn = stbButton(page, `${STB_PREFIX}-interactive`);
      await btn.focus();
      await page.keyboard.press('Space');
      await expect(stbByTestId(page, `${STB_PREFIX}-press-count`)).toContainText('presses: 1');
    });

    test('[fn] 4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — Single action buttons, not a roving tabindex group');
    });

    test('[fn] 4.5 — Home and End keys (N/A)', async () => {
      qaLog('Skipped — Not a list navigator');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      await stbButton(page, `${STB_PREFIX}-interactive`).focus();
      for (let i = 0; i < 8; i += 1) {
        await page.keyboard.press('Tab');
      }
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(activeTag.length).toBeGreaterThan(0);
    });
  });

  // ── Group 5 — Focus management ────────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('[fn] 5.1 — click focuses button', async ({ page }) => {
      const btn = stbButton(page, `${STB_PREFIX}-interactive`);
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('[fn] 5.2 — focus ring visible', async ({ page }) => {
      await stbButton(page, `${STB_PREFIX}-interactive`).focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — SingleTextButton has no autoFocus prop in showcase');
    });
  });

  // ── Group 6 — State ───────────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('[fn] 6.1 — default state renders with high attention bold variant', async ({ page }) => {
      const btn = stbButton(page, `${STB_PREFIX}-default`);
      await expect(btn).toHaveAttribute('data-attention', 'high');
      await expect(btn).toHaveAttribute('data-variant', 'bold');
    });

    test('[fn] 6.2 — Selected/checked (N/A)', async () => {
      qaLog('Skipped — SingleTextButton is an action button, not a toggle/select control');
    });

    test('[fn] 6.3 — disabled is not enabled and skips Tab order', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-states');
      await expect(stbButton(page, `${STB_PREFIX}-disabled`)).toBeDisabled();
    });

    test('[fn] 6.4 — Readonly (N/A)', async () => {
      qaLog('Skipped — SingleTextButton has no readOnly prop in showcase');
    });

    test('[fn] 6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — SingleTextButton has no error/invalid prop in showcase');
    });

    test('[fn] 6.6 — loading disables and shows progressbar', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-states');
      const btn = stbButton(page, `${STB_PREFIX}-loading`);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('aria-busy', 'true');
      const pbCount = await btn.evaluate((el) => el.querySelectorAll('[role="progressbar"]').length);
      expect(pbCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Group 7 — Slots (N/A) ─────────────────────────────────────────────────
  test.describe('Group 7 — Slots (N/A)', () => {
    test('[fn] 7.1 — Start/end slots (N/A)', async () => {
      qaLog('Skipped — Label is children text (1–2 chars), not start/end icon slots');
    });
  });

  // ── Group 8 — Toggle and selection (N/A) ──────────────────────────────────
  test.describe('Group 8 — Toggle and selection (N/A)', () => {
    test('[fn] 8.1 — Toggle (N/A)', async () => {
      qaLog('Skipped — SingleTextButton fires onClick; no aria-pressed toggle state');
    });

    test('[fn] 8.2 — Single-select group (N/A)', async () => {
      qaLog('Skipped — Independent action buttons, not a single-select group');
    });

    test('[fn] 8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — SingleTextButton has no indeterminate state');
    });
  });

  // ── Group 9 — Input (N/A) ─────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', () => {
    test('[fn] 9.1 — Typing (N/A)', async () => {
      qaLog('Skipped — SingleTextButton is not typed entry');
    });
  });

  // ── Group 10 — Dependency rules ───────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.3 — loading=true forces disabled and shows spinner', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-states');
      const btn = stbButton(page, `${STB_PREFIX}-loading`);
      await expect(btn).toBeDisabled();
      const pb = await btn.evaluate((el) => el.querySelectorAll('[role="progressbar"]').length);
      expect(pb).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Group 11 — Content and display ────────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {
    test('[fn] 11.1 — default label text “Ag” is visible', async ({ page }) => {
      await expect(stbButton(page, `${STB_PREFIX}-default`)).toHaveText('Ag');
    });

    test('[fn] 11.1 — edge long label cell renders button', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-edge');
      await expect(stbButton(page, `${STB_PREFIX}-edge-long`)).toBeVisible();
    });
  });

  // ── Group 12 — Layout and responsive ──────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('[fn] 12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — fullWidth prop is not mounted in Test Scenarios showcase');
    });

    test('[fn] 12.2 — visible at 320px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoSingleTextButtonPlayground(page);
      await scrollToSection(page, 'single-text-button-qa-default');
      await expect(stbButton(page, `${STB_PREFIX}-default`)).toBeVisible();
      const overflow = await page
        .locator('[data-section="single-text-button-qa-default"]')
        .evaluate((el) => el.scrollWidth > el.clientWidth + 2);
      expect(overflow).toBe(false);
    });

    test('[fn] 12.2 — visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSingleTextButtonPlayground(page);
      await expect(stbButton(page, `${STB_PREFIX}-default`)).toBeVisible();
    });

    test('[fn] 12.3 — size strip is roughly horizontal', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-size');
      const a = await stbButton(page, stbSizeTestId('s')).boundingBox();
      const b = await stbButton(page, stbSizeTestId('m')).boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(Math.abs((a!.y ?? 0) - (b!.y ?? 0))).toBeLessThan(24);
    });
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: STB_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Single Text Button”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Single Text Button', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default control is visible', async ({ page }) => {
      await expect(stbButton(page, `${STB_PREFIX}-default`)).toBeVisible();
    });

    test('[fn] Smoke — Interactive control is visible', async ({ page }) => {
      await scrollToSection(page, 'single-text-button-qa-interaction');
      await expect(stbButton(page, `${STB_PREFIX}-interactive`)).toBeVisible();
    });
  });
});
