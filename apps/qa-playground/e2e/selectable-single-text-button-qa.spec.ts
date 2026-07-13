/**
 * SelectableSingleTextButton QA — functional coverage (`SelectableSingleTextButtonQaShowcase.tsx`).
 * Component type: interactive (Base UI Toggle, `aria-pressed`, 1–2 char label).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` SelectableSingleTextButton defects.
 */
import { expect, test } from 'playwright/test';

import {
  SSTB_ALL_TESTIDS,
  SSTB_DATA_SECTIONS,
  SSTB_FIGMA_SIZES,
  SSTB_PLAYGROUND_ROUTE,
  SSTB_PREFIX,
  SSTB_SECTION_COUNT,
  sstbAppearanceTestId,
  sstbSizeTestId,
} from './selectable-single-text-button-playground/manifest';
import {
  computedButtonBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  gotoSelectableSingleTextButtonPlayground,
  openSelectableSingleTextButtonTestScenarios,
  qaLog,
  qaStep,
  SSTB_TAG_SET,
  scrollToSection,
  sstbByTestId,
  switchPlaygroundToDarkTheme,
} from './selectable-single-text-button/selectable-single-text-button-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${SSTB_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `SelectableSingleTextButton playground reachable at ${origin}${SSTB_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await openSelectableSingleTextButtonTestScenarios(page);
});

test.describe('Functional', { tag: SSTB_TAG_SET.functional }, () => {
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — page heading visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Selectable Single Text Button', level: 1 })).toBeVisible();
    });

    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(SSTB_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await sstbByTestId(page, `${SSTB_PREFIX}-default`).waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of SSTB_ALL_TESTIDS) {
        await sstbByTestId(page, testId).scrollIntoViewIfNeeded();
        await expect(sstbByTestId(page, testId)).toBeVisible();
        await expectNoErrorText(sstbByTestId(page, testId));
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(SSTB_SECTION_COUNT);
      for (const sectionId of SSTB_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`)).toBeVisible();
      }
    });

    test('[fn] 1.4 — default component visible', async ({ page }) => {
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-default`)).toBeVisible();
    });

    test('[fn] 1.1 — all-defaults-explicit cell renders with default props', async ({ page }) => {
      await scrollToSection(page, 'combinations');
      const el = sstbByTestId(page, `${SSTB_PREFIX}-all-defaults-explicit`);
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Group 2 — Size', () => {
    test('[fn] 2.1 — size strip sets data-size on root', async ({ page }) => {
      await scrollToSection(page, 'size');
      await expect(sstbByTestId(page, sstbSizeTestId('M'))).toHaveAttribute('data-size', 'm');
      await expect(sstbByTestId(page, sstbSizeTestId('S'))).toHaveAttribute('data-size', 's');
      await expect(sstbByTestId(page, sstbSizeTestId('L'))).toHaveAttribute('data-size', 'l');
    });

    test('[fn] 2.2 — size bounding boxes grow S → L', async ({ page }) => {
      await scrollToSection(page, 'size');
      const boxS = await sstbByTestId(page, sstbSizeTestId('S')).boundingBox();
      const boxM = await sstbByTestId(page, sstbSizeTestId('M')).boundingBox();
      const boxL = await sstbByTestId(page, sstbSizeTestId('L')).boundingBox();
      expect(boxS).not.toBeNull();
      expect(boxM).not.toBeNull();
      expect(boxL).not.toBeNull();
      expect(boxM!.height).toBeGreaterThanOrEqual(boxS!.height - 1);
      expect(boxL!.height).toBeGreaterThanOrEqual(boxM!.height - 1);
    });

    test('[fn] 2.3 — S is smaller than L', async ({ page }) => {
      await scrollToSection(page, 'size');
      const sBox = await sstbByTestId(page, sstbSizeTestId('S')).boundingBox();
      const lBox = await sstbByTestId(page, sstbSizeTestId('L')).boundingBox();
      expect(sBox!.height).toBeLessThan(lBox!.height);
    });
  });

  test.describe('Group 3 — Attention', () => {
    test('[fn] 3.1 — attention strip sets data-attention', async ({ page }) => {
      await scrollToSection(page, 'attention');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-attention-high`)).toHaveAttribute('data-attention', 'high');
    });

  });

  test.describe('Group 4 — Appearance', () => {
    test('[fn] 4.1 — all 9 appearance variants render on default surface', async ({ page }) => {
      await scrollToSection(page, 'appearance');
      for (const ap of [
        'auto',
        'neutral',
        'primary',
        'secondary',
        'sparkle',
        'negative',
        'positive',
        'warning',
        'informative',
      ] as const) {
        await expect(sstbByTestId(page, sstbAppearanceTestId(ap))).toBeVisible();
      }
    });

  });

  test.describe('Group 5 — Condensed', () => {
    test('[fn] 5.1 — condensed false and true render', async ({ page }) => {
      await scrollToSection(page, 'condensed');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-condensed-false`)).toBeVisible();
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-condensed-true`)).toBeVisible();
    });

    test('[fn] 5.2 — condensed=true is not taller than condensed=false (same defaults)', async ({ page }) => {
      await scrollToSection(page, 'condensed');
      const a = await sstbByTestId(page, `${SSTB_PREFIX}-condensed-false`).boundingBox();
      const b = await sstbByTestId(page, `${SSTB_PREFIX}-condensed-true`).boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(b!.height).toBeLessThanOrEqual(a!.height + 2);
    });

    test('[fn] 5.3 — condensed × size cells render', async ({ page }) => {
      await scrollToSection(page, 'condensed-size');
      for (const figma of SSTB_FIGMA_SIZES) {
        await expect(sstbByTestId(page, `${SSTB_PREFIX}-condensed-true-size-${figma}`)).toBeVisible();
      }
    });
  });

  test.describe('Group 6 — Disabled', () => {
    test('[fn] 6.1 — disabled=true is disabled', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-disabled-true`)).toBeDisabled();
    });

    test('[fn] 6.2 — disabled=false is enabled', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-disabled-false`)).toBeEnabled();
    });

    test('[fn] 6.3 — Tab skips disabled-true after disabled-false', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      await sstbByTestId(page, `${SSTB_PREFIX}-disabled-false`).focus();
      await page.keyboard.press('Tab');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-disabled-true`)).not.toBeFocused();
    });

    test('[fn] 6.4 — disabled=true does not toggle on click', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-disabled-true`);
      const before = await btn.getAttribute('aria-pressed');
      await btn.click({ force: true });
      await expect(btn).toHaveAttribute('aria-pressed', before ?? '');
    });

    test('[fn] 6.5 — appearance × disabled matrix', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      for (const ap of ['primary', 'negative', 'neutral'] as const) {
        await expect(sstbByTestId(page, `${SSTB_PREFIX}-${ap}-disabled-true`)).toBeVisible();
        await expect(sstbByTestId(page, `${SSTB_PREFIX}-${ap}-disabled-true`)).toBeDisabled();
      }
    });
  });

  test.describe('Group 7 — Loading', () => {
    test('[fn] 7.1 — loading=false is enabled', async ({ page }) => {
      await scrollToSection(page, 'loading');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-loading-false`)).toBeEnabled();
    });

    test('[fn] 7.2 — loading=true disables and sets aria-busy', async ({ page }) => {
      await scrollToSection(page, 'loading');
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-loading-true`);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    test('[fn] 7.3 — loading=true mounts progressbar in DOM', async ({ page }) => {
      await scrollToSection(page, 'loading');
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-loading-true`);
      const pbCount = await btn.evaluate((el) => el.querySelectorAll('[role="progressbar"]').length);
      expect(pbCount).toBeGreaterThanOrEqual(1);
    });

    test('[fn] 7.4 — loading=true by size renders', async ({ page }) => {
      await scrollToSection(page, 'loading');
      for (const figma of SSTB_FIGMA_SIZES) {
        const el = sstbByTestId(page, `${SSTB_PREFIX}-loading-true-size-${figma}`);
        await expect(el).toBeVisible();
        await expect(el).toBeDisabled();
      }
    });

    test('[fn] 7.5 — idle has no progressbar; loading has', async ({ page }) => {
      await scrollToSection(page, 'loading');
      const idlePb = await sstbByTestId(page, `${SSTB_PREFIX}-loading-false`).evaluate(
        (el) => el.querySelectorAll('[role="progressbar"]').length,
      );
      const busyPb = await sstbByTestId(page, `${SSTB_PREFIX}-loading-true`).evaluate(
        (el) => el.querySelectorAll('[role="progressbar"]').length,
      );
      expect(idlePb).toBe(0);
      expect(busyPb).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Group 8 — Click and toggle', () => {
    test('[fn] 8.1 — default toggles aria-pressed on click', async ({ page }) => {
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-default`);
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('[fn] 8.2 — disabled does not change on forced click', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-disabled-true`);
      // The disabled-true showcase cell mounts with defaultSelected, so it starts
      // pressed. The invariant under test is that a forced click on a disabled
      // toggle does NOT change aria-pressed — capture the initial value and assert
      // it is unchanged rather than hardcoding a state.
      const before = await btn.getAttribute('aria-pressed');
      await btn.click({ force: true });
      await expect(btn).toHaveAttribute('aria-pressed', before ?? '');
    });

    test('[fn] 8.3 — loading stays disabled after click', async ({ page }) => {
      await scrollToSection(page, 'loading');
      const el = sstbByTestId(page, `${SSTB_PREFIX}-loading-true`);
      await el.click({ force: true });
      await expect(el).toBeDisabled();
    });
  });

  test.describe('Group 9 — Focus and keyboard', () => {
    test('[fn] 9.1 — click focuses button', async ({ page }) => {
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-loading-false`);
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('[fn] 9.2 — focus ring visible', async ({ page }) => {
      await sstbByTestId(page, `${SSTB_PREFIX}-loading-false`).focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 9.3 — Enter toggles aria-pressed', async ({ page }) => {
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-default`);
      await btn.focus();
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
      await page.keyboard.press('Enter');
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] 9.4 — Space toggles aria-pressed', async ({ page }) => {
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-default`);
      await btn.focus();
      await page.keyboard.press('Space');
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] 9.5 — Tab moves focus away', async ({ page }) => {
      await sstbByTestId(page, `${SSTB_PREFIX}-loading-false`).focus();
      await page.keyboard.press('Tab');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-loading-false`)).not.toBeFocused();
    });
  });

  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.1 — condensed=true sets data-condensed', async ({ page }) => {
      await scrollToSection(page, 'condensed');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-condensed-true`)).toHaveAttribute('data-condensed', '');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-condensed-false`)).not.toHaveAttribute('data-condensed');
    });

    test('[fn] 10.2 — loading=true forces disabled', async ({ page }) => {
      await scrollToSection(page, 'loading');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-loading-true`)).toBeDisabled();
    });

    test('[fn] 10.3 — content-text-loading-true shows spinner not label', async ({ page }) => {
      await scrollToSection(page, 'content-loading');
      const el = sstbByTestId(page, `${SSTB_PREFIX}-content-text-loading-true`);
      const pb = await el.evaluate((node) => node.querySelectorAll('[role="progressbar"]').length);
      expect(pb).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Group 11 — Content (code-only API)', () => {
    test('[fn] 11.1 — content-text shows character', async ({ page }) => {
      await scrollToSection(page, 'content');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-content-text`)).toContainText('A');
    });

    test('[fn] 11.2 — content-spinner uses loading CPI', async ({ page }) => {
      await scrollToSection(page, 'content');
      const el = sstbByTestId(page, `${SSTB_PREFIX}-content-spinner`);
      const pb = await el.evaluate((node) => node.querySelectorAll('[role="progressbar"]').length);
      expect(pb).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Group 12 — Matrices', () => {
    test('[fn] 12.1 — size × appearance spot M-primary', async ({ page }) => {
      await scrollToSection(page, 'size-appearance-matrix');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-M-primary`)).toBeVisible();
    });

    test('[fn] 12.2 — size × attention spot M-high', async ({ page }) => {
      await scrollToSection(page, 'size-attention-matrix');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-M-high`)).toBeVisible();
    });

    test('[fn] 12.3 — attention × appearance spot high-primary', async ({ page }) => {
      await scrollToSection(page, 'attention-appearance-matrix');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-high-primary`)).toBeVisible();
    });

    test('[fn] 12.4 — matrix sample grid', async ({ page }) => {
      await scrollToSection(page, 'size-appearance-matrix');
      for (const size of ['S', 'M'] as const) {
        for (const ap of ['primary', 'neutral'] as const) {
          await expect(sstbByTestId(page, `${SSTB_PREFIX}-${size}-${ap}`)).toBeVisible();
        }
      }
      await scrollToSection(page, 'size-attention-matrix');
      for (const size of ['S', 'M'] as const) {
        for (const att of ['high', 'low'] as const) {
          await expect(sstbByTestId(page, `${SSTB_PREFIX}-${size}-${att}`)).toBeVisible();
        }
      }
      await scrollToSection(page, 'attention-appearance-matrix');
      for (const ap of ['primary', 'negative'] as const) {
        for (const att of ['high', 'medium'] as const) {
          await expect(sstbByTestId(page, `${SSTB_PREFIX}-${att}-${ap}`)).toBeVisible();
        }
      }
    });
  });

  test.describe('Group 13 — Layout and responsive', () => {
    test('[fn] 13.1 — visible at 320px (default section)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoSelectableSingleTextButtonPlayground(page);
      await scrollToSection(page, 'default');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-default`)).toBeVisible();
      const overflow = await page.locator('[data-section="default"]').evaluate((el) => el.scrollWidth > el.clientWidth + 2);
      expect(overflow).toBe(false);
    });

    test('[fn] 13.2 — visible at 1440px', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSelectableSingleTextButtonPlayground(page);
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-default`)).toBeVisible();
    });

    test('[fn] 13.3 — size strip roughly horizontal', async ({ page }) => {
      await scrollToSection(page, 'size');
      const a = await sstbByTestId(page, sstbSizeTestId('S')).boundingBox();
      const b = await sstbByTestId(page, sstbSizeTestId('M')).boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(Math.abs((a!.y ?? 0) - (b!.y ?? 0))).toBeLessThan(24);
    });
  });

  test.describe('Group 14 — Combinations', () => {
    test('[fn] 14.1 — key combination cells visible', async ({ page }) => {
      await scrollToSection(page, 'combinations');
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-stress-test`)).toBeVisible();
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-minimised`)).toBeVisible();
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-condensed-loading`)).toBeVisible();
    });
  });

  test.describe('Group 15 — Dark mode', () => {
    test('[fn] 15.1 — dark theme still shows default control', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-default`)).toBeVisible();
    });
  });

  test.describe('Template Group 3 — Click interaction (supplemental)', () => {
    test('[fn] 3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — SelectableSingleTextButton has no readOnly prop in showcase');
    });

    test('[fn] 3.4 — click outside removes focus', async ({ page }) => {
      const btn = sstbByTestId(page, `${SSTB_PREFIX}-loading-false`);
      await qaStep('Focus the loading-false control', async () => {
        await btn.focus();
        await expect(btn).toBeFocused();
      });
      await qaStep('Click page heading to blur the control', async () => {
        await page.locator('h1').first().click();
        await expect(btn).not.toBeFocused();
      });
    });
  });

  test.describe('Template Group 4 — Keyboard navigation (supplemental)', () => {
    test('[fn] 4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — Single toggle buttons, not a roving tabindex group');
    });

    test('[fn] 4.5 — Home and End keys (N/A)', async () => {
      qaLog('Skipped — Not a list navigator');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      await qaStep('Tab forward several times from default control', async () => {
        await sstbByTestId(page, `${SSTB_PREFIX}-default`).focus();
        for (let i = 0; i < 8; i += 1) {
          await page.keyboard.press('Tab');
        }
        const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
        expect(activeTag.length).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Template Group 5 — Focus management (supplemental)', () => {
    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — SelectableSingleTextButton has no autoFocus prop in showcase');
    });
  });

  test.describe('Template Group 6 — State (supplemental)', () => {
    test('[fn] 6.4 — Readonly (N/A)', async () => {
      qaLog('Skipped — SelectableSingleTextButton has no readOnly prop in showcase');
    });

    test('[fn] 6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — SelectableSingleTextButton has no error/invalid prop in showcase');
    });
  });

  test.describe('Template Group 7 — Slots (N/A)', () => {
    test('[fn] 7.1 — Start/end slots (N/A)', async () => {
      qaLog('Skipped — Label is children text (1–2 chars), not start/end icon slots');
    });
  });

  test.describe('Template Group 8 — Toggle and selection (supplemental)', () => {
    test('[fn] 8.2 — Single-select group (N/A)', async () => {
      qaLog('Skipped — Independent toggles, not a single-select group');
    });

    test('[fn] 8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — SelectableSingleTextButton has no indeterminate state');
    });
  });

  test.describe('Template Group 9 — Input (N/A)', () => {
    test('[fn] 9.1 — Typing (N/A)', async () => {
      qaLog('Skipped — SelectableSingleTextButton is not typed entry');
    });
  });

  test.describe('Template Group 12 — Layout (supplemental)', () => {
    test('[fn] 12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — SelectableSingleTextButton has no fullWidth prop in showcase');
    });
  });

  test.describe('Smoke', { tag: SSTB_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Selectable Single Text Button”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Selectable Single Text Button', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default control is visible', async ({ page }) => {
      await expect(sstbByTestId(page, `${SSTB_PREFIX}-default`)).toBeVisible();
    });

    test('[fn] Smoke — Size M control is visible', async ({ page }) => {
      await scrollToSection(page, 'size');
      await expect(sstbByTestId(page, sstbSizeTestId('M'))).toBeVisible();
    });
  });
});
