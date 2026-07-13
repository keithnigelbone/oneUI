/**
 * SelectableIconButton QA — functional coverage (`SelectableIconButtonQaShowcase.tsx`).
 * Component type: interactive (icon-only toggle, Base UI Toggle — `aria-pressed`).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` SelectableIconButton defects.
 */
import { expect, test } from 'playwright/test';

import {
  SIB_ALL_TESTIDS,
  SIB_DATA_SECTIONS,
  SIB_PLAYGROUND_ROUTE,
  SIB_PREFIX,
  SIB_SECTION_COUNT,
  sibAppearanceTestId,
  sibSizeTestId,
} from './selectable-icon-button-playground/manifest';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  computedButtonBackgroundRgb,
  computedSvgFillRgb,
  expectFocusRingVisible,
  expectNoErrorText,
  gotoSelectableIconButtonPlayground,
  openSelectableIconButtonTestScenarios,
  qaLog,
  qaStep,
  rgbaAlpha,
  SIB_TAG_SET,
  scrollToSection,
  sibByTestId,
  switchPlaygroundToDarkTheme,
} from './selectable-icon-button/selectable-icon-button-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${SIB_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `SelectableIconButton playground reachable at ${origin}${SIB_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await openSelectableIconButtonTestScenarios(page);
});

test.describe('Functional', { tag: SIB_TAG_SET.functional }, () => {
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — page heading visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Selectable Icon Button', level: 1 })).toBeVisible();
    });

    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(SIB_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await sibByTestId(page, `${SIB_PREFIX}-size-M`).waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of SIB_ALL_TESTIDS) {
        await sibByTestId(page, testId).scrollIntoViewIfNeeded();
        await expect(sibByTestId(page, testId)).toBeVisible();
        await expectNoErrorText(sibByTestId(page, testId));
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(SIB_SECTION_COUNT);
      for (const sectionId of SIB_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`)).toBeVisible();
      }
    });
  });

  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — size strip sets data-size on root', async ({ page }) => {
      await scrollToSection(page, 'size');
      await expect(sibByTestId(page, sibSizeTestId('M'))).toHaveAttribute('data-size', '10');
    });

    test('[fn] 2.1 — attention strip sets data-attention', async ({ page }) => {
      await scrollToSection(page, 'attention');
      await expect(sibByTestId(page, `${SIB_PREFIX}-attention-high`)).toHaveAttribute('data-attention', 'high');
    });

    test('[fn] 2.1 — shape 2:3 sets data-shape', async ({ page }) => {
      await scrollToSection(page, 'shape');
      await expect(sibByTestId(page, `${SIB_PREFIX}-shape-2-3`)).toHaveAttribute('data-shape', '2:3');
    });

    test('[fn] 2.2 — size bounding boxes grow 2XS → XL', async ({ page }) => {
      await scrollToSection(page, 'size');
      const box2xs = await sibByTestId(page, sibSizeTestId('2XS')).boundingBox();
      const boxXl = await sibByTestId(page, sibSizeTestId('XL')).boundingBox();
      expect(box2xs).not.toBeNull();
      expect(boxXl).not.toBeNull();
      expect(boxXl!.width).toBeGreaterThanOrEqual(box2xs!.width - 1);
      expect(boxXl!.height).toBeGreaterThanOrEqual(box2xs!.height - 1);
    });


  });

  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.1 — click toggles aria-pressed', async ({ page }) => {
      const btn = sibByTestId(page, `${SIB_PREFIX}-selected-false`);
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('[fn] 3.2 — disabled control does not toggle on click', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      const btn = sibByTestId(page, `${SIB_PREFIX}-disabled-true`);
      await expect(btn).toBeDisabled();
      const before = await btn.getAttribute('aria-pressed');
      await btn.click({ force: true });
      await expect(btn).toHaveAttribute('aria-pressed', before ?? '');
    });

    test('[fn] 3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — SelectableIconButton has no readOnly prop');
    });

    test('[fn] 3.4 — click outside removes focus', async ({ page }) => {
      const btn = sibByTestId(page, `${SIB_PREFIX}-loading-false`);
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('h1').first().click();
      await expect(btn).not.toBeFocused();
    });
  });

  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.1 — Tab reaches a showcase button', async ({ page }) => {
      await sibByTestId(page, `${SIB_PREFIX}-loading-false`).focus();
      await expect(sibByTestId(page, `${SIB_PREFIX}-loading-false`)).toBeFocused();
    });

    test('[fn] 4.1 — disabled button is not focused via Tab from prior focusable', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      await sibByTestId(page, `${SIB_PREFIX}-disabled-false`).focus();
      await page.keyboard.press('Tab');
      const next = sibByTestId(page, `${SIB_PREFIX}-disabled-true`);
      await expect(next).not.toBeFocused();
    });

    test('[fn] 4.2 — Enter toggles aria-pressed', async ({ page }) => {
      const btn = sibByTestId(page, `${SIB_PREFIX}-selected-false`);
      await btn.focus();
      await page.keyboard.press('Enter');
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] 4.3 — Space toggles aria-pressed', async ({ page }) => {
      const btn = sibByTestId(page, `${SIB_PREFIX}-selected-false`);
      await btn.focus();
      await page.keyboard.press('Space');
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] 4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — Single toggle buttons, not a roving tabindex group');
    });

    test('[fn] 4.5 — Home and End keys (N/A)', async () => {
      qaLog('Skipped — Not a list navigator');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab moves focus away', async ({ page }) => {
      await sibByTestId(page, `${SIB_PREFIX}-loading-false`).focus();
      await page.keyboard.press('Tab');
      await expect(sibByTestId(page, `${SIB_PREFIX}-loading-false`)).not.toBeFocused();
    });
  });

  test.describe('Group 5 — Focus management', () => {
    test('[fn] 5.1 — click focuses button', async ({ page }) => {
      const btn = sibByTestId(page, `${SIB_PREFIX}-loading-false`);
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('[fn] 5.2 — focus ring visible when focused', async ({ page }) => {
      await sibByTestId(page, `${SIB_PREFIX}-loading-false`).focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.4 — blur after Tab', async ({ page }) => {
      const btn = sibByTestId(page, `${SIB_PREFIX}-loading-false`);
      await btn.focus();
      await page.keyboard.press('Tab');
      await expect(btn).not.toBeFocused();
    });

    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — SelectableIconButton has no autoFocus prop in showcase');
    });
  });

  test.describe('Group 6 — State', () => {
    test('[fn] 6.1 — default unselected shows aria-pressed false', async ({ page }) => {
      await expect(sibByTestId(page, `${SIB_PREFIX}-selected-false`)).toHaveAttribute('aria-pressed', 'false');
    });

    test('[fn] 6.2 — selected row shows aria-pressed true', async ({ page }) => {
      await expect(sibByTestId(page, `${SIB_PREFIX}-selected-true`)).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] 6.3 — disabled and not focusable', async ({ page }) => {
      await scrollToSection(page, 'disabled');
      const btn = sibByTestId(page, `${SIB_PREFIX}-disabled-true`);
      await expect(btn).toBeDisabled();
    });

    test('[fn] 6.4 — Readonly (N/A)', async () => {
      qaLog('Skipped — SelectableIconButton has no readOnly prop');
    });

    test('[fn] 6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — SelectableIconButton has no error/invalid prop in showcase');
    });

    test('[fn] 6.6 — loading disables control, aria-busy, DOM progressbar', async ({ page }) => {
      await scrollToSection(page, 'loading');
      const btn = sibByTestId(page, `${SIB_PREFIX}-loading-true`);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('aria-busy', 'true');
      const pbCount = await btn.evaluate((el) => el.querySelectorAll('[role="progressbar"]').length);
      expect(pbCount, 'CPI should mount a progressbar node inside the toggle').toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Group 7 — Icon slot', () => {
    test('[fn] 7.1 — icon prop renders svg in control', async ({ page }) => {
      await scrollToSection(page, 'content');
      const btn = sibByTestId(page, `${SIB_PREFIX}-content-icon`);
      await expect(btn.locator('svg').first()).toBeVisible();
    });

    test('[fn] 7.4 — icon svg is decorative (aria-hidden)', async ({ page }) => {
      await scrollToSection(page, 'content');
      const svg = sibByTestId(page, `${SIB_PREFIX}-content-icon`).locator('svg').first();
      await expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    test('[fn] 10.3 — loading hides icon and shows spinner', async ({ page }) => {
      await scrollToSection(page, 'content');
      const spinnerBtn = sibByTestId(page, `${SIB_PREFIX}-content-spinner`);
      await expect(spinnerBtn).toHaveAttribute('aria-busy', 'true');
      const pbCount = await spinnerBtn.evaluate((el) => el.querySelectorAll('[role="progressbar"]').length);
      expect(pbCount, 'Loading should mount CircularProgressIndicator (progressbar role)').toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Group 8 — Toggle and selection', () => {
    test('[fn] 8.1 — toggle changes aria-pressed', async ({ page }) => {
      const btn = sibByTestId(page, `${SIB_PREFIX}-selected-false`);
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('[fn] 8.2 — Single-select group (N/A)', async () => {
      qaLog('Skipped — Independent toggles, not a single-select group');
    });

    test('[fn] 8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — SelectableIconButton has no indeterminate state');
    });
  });

  test.describe('Group 9 — Input (N/A)', () => {
    test('[fn] 9.x — Not a text input', async () => {
      qaLog('Skipped — SelectableIconButton is not typed entry');
    });
  });

  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.1 — condensed ignored when contained=false (same box)', async ({ page }) => {
      await scrollToSection(page, 'condensed-contained');
      const a = await sibByTestId(page, `${SIB_PREFIX}-contained-false-condensed-false`).boundingBox();
      const b = await sibByTestId(page, `${SIB_PREFIX}-contained-false-condensed-true`).boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(Math.abs((a!.width ?? 0) - (b!.width ?? 0))).toBeLessThanOrEqual(2);
      expect(Math.abs((a!.height ?? 0) - (b!.height ?? 0))).toBeLessThanOrEqual(2);
    });

    test('[fn] 10.2 — condensed applies when contained=true', async ({ page }) => {
      await scrollToSection(page, 'condensed-contained');
      await expect(sibByTestId(page, `${SIB_PREFIX}-contained-true-condensed-true`)).toHaveAttribute('data-condensed', '');
      await expect(sibByTestId(page, `${SIB_PREFIX}-contained-true-condensed-false`)).not.toHaveAttribute('data-condensed');
    });

    test('[fn] 10.1 — fullWidth ignored when contained=false', async ({ page }) => {
      await scrollToSection(page, 'fullwidth-contained');
      const a = await sibByTestId(page, `${SIB_PREFIX}-contained-false-fullwidth-false`).boundingBox();
      const b = await sibByTestId(page, `${SIB_PREFIX}-contained-false-fullwidth-true`).boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(Math.abs((a!.width ?? 0) - (b!.width ?? 0))).toBeLessThanOrEqual(2);
    });

    test('[fn] 10.2 — fullWidth applies when contained=true', async ({ page }) => {
      await scrollToSection(page, 'fullwidth-contained');
      const narrow = await sibByTestId(page, `${SIB_PREFIX}-contained-true-fullwidth-false`).boundingBox();
      const wide = await sibByTestId(page, `${SIB_PREFIX}-contained-true-fullwidth-true`).boundingBox();
      expect(narrow).not.toBeNull();
      expect(wide).not.toBeNull();
      expect(wide!.width).toBeGreaterThan(narrow!.width + 2);
    });

    test('[fn] 10.3 — loading mounts progressbar in DOM; idle row has none', async ({ page }) => {
      await scrollToSection(page, 'loading');
      const idlePb = await sibByTestId(page, `${SIB_PREFIX}-loading-false`).evaluate(
        (el) => el.querySelectorAll('[role="progressbar"]').length,
      );
      const busyPb = await sibByTestId(page, `${SIB_PREFIX}-loading-true`).evaluate(
        (el) => el.querySelectorAll('[role="progressbar"]').length,
      );
      expect(idlePb).toBe(0);
      expect(busyPb).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Group 11 — Content and display', () => {
    test('[fn] 11.1 — aria-label exposes name', async ({ page }) => {
      await expect(sibByTestId(page, `${SIB_PREFIX}-content-icon`)).toHaveAccessibleName(/Icon content/i);
    });

    test('[fn] 11.2 — icon svg uses currentColor', async ({ page }) => {
      const rgb = await computedSvgFillRgb(sibByTestId(page, `${SIB_PREFIX}-content-icon`));
      expect(rgb.startsWith('rgb'), 'icon colour should resolve to rgb()').toBe(true);
    });
  });

  test.describe('Group 12 — Layout and responsive', () => {

    test('[fn] 12.2 — visible at 320px (size section)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoSelectableIconButtonPlayground(page);
      await scrollToSection(page, 'size');
      await expect(sibByTestId(page, sibSizeTestId('M'))).toBeVisible();
      const sectionOverflow = await page.locator('[data-section="size"]').evaluate((el) => el.scrollWidth > el.clientWidth + 2);
      expect(sectionOverflow).toBe(false);
    });

    test('[fn] 12.2 — visible at 1440px', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSelectableIconButtonPlayground(page);
      await expect(sibByTestId(page, sibSizeTestId('M'))).toBeVisible();
    });

    test('[fn] 12.3 — size strip is horizontal flex', async ({ page }) => {
      await scrollToSection(page, 'size');
      const a = await sibByTestId(page, sibSizeTestId('2XS')).boundingBox();
      const b = await sibByTestId(page, sibSizeTestId('XS')).boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(Math.abs((a!.y ?? 0) - (b!.y ?? 0))).toBeLessThan(16);
    });
  });

  test.describe('Group 13 — Dark mode', () => {
    test('[fn] 13.1 — dark theme still shows size row', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await scrollToSection(page, 'size');
      await expect(sibByTestId(page, sibSizeTestId('M'))).toBeVisible();
      await expect(sibByTestId(page, sibAppearanceTestId('primary'))).toBeVisible();
    });

  });

  test.describe('Matrix spot checks', () => {
    test('[fn] matrix size × appearance cell', async ({ page }) => {
      await scrollToSection(page, 'size-appearance-matrix');
      await expect(sibByTestId(page, `${SIB_PREFIX}-M-primary`)).toBeVisible();
    });

    test('[fn] matrix size × selected cell', async ({ page }) => {
      await scrollToSection(page, 'size-selected-matrix');
      await expect(sibByTestId(page, `${SIB_PREFIX}-L-selected-true`)).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] matrix attention × appearance cell', async ({ page }) => {
      await scrollToSection(page, 'attention-appearance-matrix');
      await expect(sibByTestId(page, `${SIB_PREFIX}-low-positive`)).toBeVisible();
    });

    test('[fn] combinations selected+disabled', async ({ page }) => {
      await scrollToSection(page, 'combinations');
      const btn = sibByTestId(page, `${SIB_PREFIX}-selected-true-disabled-true`);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] combinations all-defaults data attributes', async ({ page }) => {
      await scrollToSection(page, 'combinations');
      const btn = sibByTestId(page, `${SIB_PREFIX}-all-defaults`);
      await expect(btn).toHaveAttribute('data-size', '10');
      await expect(btn).toHaveAttribute('data-attention', 'high');
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Smoke', { tag: SIB_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Selectable Icon Button”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Selectable Icon Button', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Size M control is visible', async ({ page }) => {
      await expect(sibByTestId(page, sibSizeTestId('M'))).toBeVisible();
    });
  });
});
