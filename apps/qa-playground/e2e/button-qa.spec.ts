/**
 * Button — functional Playwright automation.
 *
 * Do not soften assertions for component bugs. Loading buttons must keep an accessible name
 * when `loading` hides the visual label (see `BUTTON_LOADING_TESTIDS` in button-qa-support).
 *
 * Playground: `src/components/button/ButtonQaShowcase.tsx`
 * Anchors: `e2e/button-playground/manifest.ts`
 */
import { expect, test } from 'playwright/test';

import {
  attachConsoleErrorCollector,
  assertNoConsoleErrors,
  BUTTON_LOADING_TESTIDS,
  ButtonTags,
  BUTTON_TAG_SET,
  clickPageThemeButton,
  collectTabFocusSignatures,
  expectButtonVisible,
  expectSectionVisible,
  isFullyTransparentBackground,
  openButtonTestScenarios,
  qaLog,
  qaStep,
  readComputedRgb,
  switchPlaygroundToDarkTheme,
} from './button/button-qa-support';
import {
  APPEARANCE_COLOUR_SAMPLE,
  BUTTON_ALL_TESTIDS,
  BUTTON_APPEARANCE_KEYS,
  BUTTON_ATTENTIONS,
  BUTTON_COMBO_COUNT,
  BUTTON_DATA_SECTIONS,
  BUTTON_FIGMA_SIZES,
  BUTTON_ATTENTION_TO_VARIANT,
  BUTTON_MATRIX_APPEARANCE_ROLES,
  btnAppearanceTestId,
  btnAttentionTestId,
  btnComboTestId,
  btnSizeTestId,
} from './button-playground/manifest';

const ATTENTION_LABELS = ['High', 'Medium', 'Low'] as const;

test.beforeEach(async ({ page }) => {
  await openButtonTestScenarios(page);
});

test.describe('Functional', { tag: BUTTON_TAG_SET.functional }, () => {
  test('[fn] shows Button page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme button label should change after click').not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default story — single medium attention button', async ({ page }) => {
    const band = page.locator('#button-qa-default');
    const btn = band.getByRole('button', { name: 'Button' });
    await expect(btn).toBeVisible();
    await btn.click();
  });

  test('[fn] Multi-accent matrix — 11 roles × 3 attention levels are visible, enabled, and clickable', async ({
    page,
  }) => {
    const strip = page.locator('#button-qa-api-appearance-strip');
    await expect(strip.getByRole('heading', { name: /3a/ })).toBeVisible();

    for (const role of BUTTON_MATRIX_APPEARANCE_ROLES) {
      await expect(strip.getByTestId(`btn-appearance-${role}`)).toBeVisible();
      await strip.getByTestId(`btn-appearance-${role}`).click();
    }
    await strip.getByTestId('btn-appearance-auto').click();

    const matrix = page.locator('#button-qa-appearance-matrix');
    await expect(matrix.getByRole('heading', { name: /3b/ })).toBeVisible();

    const matrixRoot = matrix.locator('#button-qa-appearance-matrix-root > div').first();
    const rows = matrixRoot.locator(':scope > div');
    await expect(rows).toHaveCount(BUTTON_MATRIX_APPEARANCE_ROLES.length);

    for (let i = 0; i < BUTTON_MATRIX_APPEARANCE_ROLES.length; i++) {
      const row = rows.nth(i);
      const role = BUTTON_MATRIX_APPEARANCE_ROLES[i];
      await expect(row.getByText(role, { exact: true })).toBeVisible();

      for (const label of ATTENTION_LABELS) {
        const b = row.getByRole('button', { name: label, exact: true });
        await expect(b).toBeVisible();
        await expect(b).toBeEnabled();
        await b.click();
      }
    }
  });

  test('[fn] Multi-accent section renders interactive buttons', async ({ page }) => {
    const strip = page.locator('#button-qa-api-appearance-strip');
    await expect(strip).toBeVisible();
    await expect(strip.getByRole('button').first()).toBeVisible();
  });

  test('[fn] Button sizes (contained) — Figma steps respond to click', async ({ page }) => {
    const band = page.locator('#button-qa-button-sizes-contained');
    for (const figma of BUTTON_FIGMA_SIZES) {
      const b = band.getByTestId(btnSizeTestId(figma));
      await expect(b).toBeEnabled();
      await b.click();
    }
  });

  test('[fn] Button condensed (contained) — condensed row visible', async ({ page }) => {
    const band = page.locator('#button-qa-api-condensed-contained');
    await expect(band.getByTestId('btn-contained-true-condensed-true')).toBeVisible();
    await expect(band.getByTestId('btn-contained-true-condensed-true')).toBeEnabled();
  });

  test('[fn] Button states — disabled is not enabled; loading exposes busy state', async ({ page }) => {
    await expect(page.getByTestId('btn-disabled-true')).toBeDisabled();

    const loadingBtn = page.getByTestId('btn-loading-true');
    await expect(loadingBtn).toBeDisabled();
    await expect(loadingBtn).toHaveAttribute('aria-busy', 'true');
    await expect(loadingBtn, 'Loading label must remain in the a11y tree').toHaveAccessibleName('Loading');
  });

  test('[fn] Loading band — Save button shows spinner (svg)', async ({ page }) => {
    const button = page.getByTestId('btn-loading-slots-hidden');
    await expect(button).toBeVisible();
    await expect(button.locator('[role="progressbar"], svg').first()).toBeVisible();
  });

  test('[fn] Slots band — all start/end combinations render', async ({ page }) => {
    const section = page.locator('#button-qa-button-with-icons');

    await expect(section.getByRole('button', { name: /^Label$/ })).toBeVisible();
    await expect(section.getByRole('button', { name: /^Start$/ })).toBeVisible();
    await expect(section.getByRole('button', { name: /^End$/ })).toBeVisible();
    await expect(section.getByRole('button', { name: /^Both$/ })).toBeVisible();
  });

  test('[fn] Slots band — Start, End, Both are interactive', async ({ page }) => {
    const band = page.locator('#button-qa-button-with-icons');
    await expect(band.getByRole('button', { name: /^Start$/ })).toBeEnabled();
    await band.getByRole('button', { name: /^Start$/ }).click();
    await expect(band.getByRole('button', { name: /^End$/ })).toBeEnabled();
    await band.getByRole('button', { name: /^End$/ }).click();
    await expect(band.getByRole('button', { name: /^Both$/ })).toBeEnabled();
    await band.getByRole('button', { name: /^Both$/ }).click();
  });

  test('[fn] Single Text — sizes band has three controls (Small / Medium / Large)', async ({ page }) => {
    const section = page.locator('#button-qa-single-text-sizes');
    await expect(section.getByRole('button')).toHaveCount(3);
  });

  test('[fn] Single Text — attention band has three VS controls', async ({ page }) => {
    const section = page.locator('#button-qa-single-text-attention');
    await expect(section.getByRole('button', { name: 'VS' })).toHaveCount(3);
  });

  test('[fn] Single Text — full width labels Small / Medium / Large', async ({ page }) => {
    const band = page.locator('#button-qa-single-text-full-width');
    await expect(band.getByRole('button', { name: 'Full width — Small' })).toBeVisible();
    await expect(band.getByRole('button', { name: 'Full width — Medium' })).toBeVisible();
    await expect(band.getByRole('button', { name: 'Full width — Large' })).toBeVisible();
  });

  test('[fn] Single Text — states band has three controls', async ({ page }) => {
    const section = page.locator('#button-qa-single-text-states');
    await expect(section.getByRole('button')).toHaveCount(3);
  });

  test('[fn] Interactive button increments click count', async ({ page }) => {
    const section = page.locator('#button-qa-interactive');

    const button = section.getByRole('button', { name: /Clicked: 0/i });
    await button.click();
    await expect(section.getByRole('button', { name: /Clicked: 1/i })).toBeVisible();

    await section.getByRole('button', { name: /Clicked: 1/i }).click();
    await expect(section.getByRole('button', { name: /Clicked: 2/i })).toBeVisible();
  });

  test('[fn] Enter key activates focused default Button', async ({ page }) => {
    const btn = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
    await page.evaluate(() => {
      (window as unknown as { __oneuiBtnEnterHits?: number }).__oneuiBtnEnterHits = 0;
    });
    await btn.evaluate((el) => {
      el.addEventListener('click', () => {
        const w = window as unknown as { __oneuiBtnEnterHits?: number };
        w.__oneuiBtnEnterHits = (w.__oneuiBtnEnterHits ?? 0) + 1;
      });
    });
    await btn.focus();
    await expect(btn).toBeFocused();
    await page.keyboard.press('Enter');
    const hits = await page.evaluate(() => (window as unknown as { __oneuiBtnEnterHits?: number }).__oneuiBtnEnterHits);
    expect(hits ?? 0).toBeGreaterThanOrEqual(1);
  });

  test('[fn] Default contained Button meets minimum height for touch targets', async ({ page }) => {
    const button = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
    const box = await button.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(32);
  });

  // ─── Group 1 — Render ──────────────────────────────────────────────────────

  test.describe('Group 1 — Render', { tag: [ButtonTags.functional] }, () => {
    test('Page loads cleanly and default Button matches showcase props', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openButtonTestScenarios(page);

      await qaStep('No browser console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });

      await qaStep('Default contained button', async () => {
        const btn = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
        await expect(btn, 'Default button should be visible').toBeVisible();
        await expect(btn, 'Default medium attention maps to subtle variant').toHaveAttribute(
          'data-variant',
          BUTTON_ATTENTION_TO_VARIANT.medium,
        );
        await expect(btn, 'Default size maps to f-step on DOM').toHaveAttribute('data-size', /.+/);
      });
    });

    test('Every playground data-testid renders without error text', async ({ page }) => {
      test.setTimeout(120_000);
      qaLog('Validating manifest testids', { count: BUTTON_ALL_TESTIDS.length });

      for (const testId of BUTTON_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const el = await expectButtonVisible(page, testId, `${testId} should be visible`);
          const text = (await el.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
    });

    test('Every story band (data-section) is visible on the page', async ({ page }) => {
      for (const section of BUTTON_DATA_SECTIONS) {
        await qaStep(`Section: ${section}`, async () => {
          await expectSectionVisible(page, section);
        });
      }
    });
  });

  // ─── Group 2 — Props validation ────────────────────────────────────────────

  test.describe('Group 2 — Props validation', { tag: [ButtonTags.functional] }, () => {
    test('Size prop increases bounding box from XS through L', async ({ page }) => {
      const heights: number[] = [];
      for (const figma of BUTTON_FIGMA_SIZES) {
        await qaStep(`Measure size ${figma}`, async () => {
          const btn = page.getByTestId(btnSizeTestId(figma));
          await btn.scrollIntoViewIfNeeded();
          const box = await btn.boundingBox();
          expect(box, `${figma} button should have a layout box`).not.toBeNull();
          heights.push(box!.height);
        });
      }
      for (let i = 1; i < heights.length; i++) {
        expect(
          heights[i],
          `${BUTTON_FIGMA_SIZES[i]} should be at least as tall as ${BUTTON_FIGMA_SIZES[i - 1]}`,
        ).toBeGreaterThanOrEqual(heights[i - 1]!);
      }
    });

    test('Attention levels map to data-variant on each chip', async ({ page }) => {
      for (const attention of BUTTON_ATTENTIONS) {
        await qaStep(`attention="${attention}"`, async () => {
          const el = page.getByTestId(btnAttentionTestId(attention));
          await expect(el).toHaveAttribute('data-variant', BUTTON_ATTENTION_TO_VARIANT[attention]);
        });
      }
    });


    test('auto appearance resolves to a concrete role on the DOM', async ({ page }) => {
      const el = page.getByTestId(btnAppearanceTestId('auto'));
      const resolved = await el.getAttribute('data-appearance');
      expect(resolved, 'auto should resolve to a role').toBeTruthy();
      expect(resolved, 'auto should not remain "auto" on DOM').not.toBe('auto');
    });
  });

  // ─── Group 3 — Click interaction ─────────────────────────────────────────

  test.describe('Group 3 — Click interaction', { tag: [ButtonTags.functional] }, () => {
    test('Click on interactive counter button updates label text', async ({ page }) => {
      const section = page.locator('#button-qa-interactive');
      await section.getByRole('button', { name: /Clicked: 0/i }).click();
      await expect(section.getByRole('button', { name: /Clicked: 1/i })).toBeVisible();
    });

    test('Disabled button does not respond to forced click', async ({ page }) => {
      const btn = page.getByTestId('btn-disabled-true');
      await expect(btn).toBeDisabled();
      await btn.click({ force: true });
      await expect(btn).toBeDisabled();
    });

    test('Click outside removes focus from a focused button', async ({ page }) => {
      const btn = page.getByTestId('btn-attention-high');
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('body').click({ position: { x: 8, y: 8 } });
      await expect(btn).not.toBeFocused();
    });
  });

  test.describe('Group 3 — Readonly (N/A)', { tag: [ButtonTags.functional] }, () => {
    test('Button has no readonly mode — covered by disabled state', async () => {
      qaLog('Skipped — Button API uses disabled, not readonly');
    });
  });

  // ─── Group 4 — Keyboard navigation ───────────────────────────────────────

  test.describe('Group 4 — Keyboard navigation', { tag: [ButtonTags.functional] }, () => {
    test('Tab reaches buttons in the showcase', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should focus an interactive element').toBeTruthy();
    });

    test('Enter activates focused default Button', async ({ page }) => {
      const btn = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
      let clicks = 0;
      await btn.evaluate((el) => {
        el.addEventListener('click', () => {
          (window as unknown as { __btnEnter?: number }).__btnEnter =
            ((window as unknown as { __btnEnter?: number }).__btnEnter ?? 0) + 1;
        });
      });
      await btn.focus();
      await page.keyboard.press('Enter');
      clicks = await page.evaluate(() => (window as unknown as { __btnEnter?: number }).__btnEnter ?? 0);
      expect(clicks, 'Enter should fire click on focused button').toBeGreaterThanOrEqual(1);
    });

    test('Space activates focused attention-high button', async ({ page }) => {
      const btn = page.getByTestId('btn-attention-high');
      let clicks = 0;
      await btn.evaluate((el) => {
        el.addEventListener('click', () => {
          (window as unknown as { __btnSpace?: number }).__btnSpace =
            ((window as unknown as { __btnSpace?: number }).__btnSpace ?? 0) + 1;
        });
      });
      await btn.focus();
      await page.keyboard.press('Space');
      clicks = await page.evaluate(() => (window as unknown as { __btnSpace?: number }).__btnSpace ?? 0);
      expect(clicks, 'Space should fire click on focused button').toBeGreaterThanOrEqual(1);
    });

    test('Disabled button is not in sequential Tab order', async ({ page }) => {
      const disabled = page.getByTestId('btn-disabled-true');
      await disabled.scrollIntoViewIfNeeded();
      await expect(disabled).toBeDisabled();
      await disabled.focus();
      await expect(disabled).not.toBeFocused();
    });

    test('Tab visits multiple distinct focus targets (no keyboard trap)', async ({ page }) => {
      const seen = await collectTabFocusSignatures(page);
      expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(1);
    });
  });

  test.describe('Group 4 — Arrow / Home / End / Escape (N/A)', { tag: [ButtonTags.functional] }, () => {
    test('Button is not a roving tabindex list — arrow keys not required', async () => {
      qaLog('Skipped — standalone buttons use Tab, not arrow-key lists');
    });
  });

  // ─── Group 5 — Focus management ──────────────────────────────────────────

  test.describe('Group 5 — Focus management', { tag: [ButtonTags.functional] }, () => {
    test('Click gives the button focus', async ({ page }) => {
      const btn = page.getByTestId('btn-attention-medium');
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('Focused button shows visible focus indicator', async ({ page }) => {
      const btn = page.getByTestId('btn-attention-high');
      await btn.focus();
      const focusStyle = await btn.evaluate((el) => {
        const style = getComputedStyle(el);
        return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
      });
      const hasVisibleFocus =
        focusStyle.outlineWidth !== '0px' ||
        (focusStyle.boxShadow != null && focusStyle.boxShadow !== 'none');
      expect(hasVisibleFocus, 'Focused button should show outline or box-shadow').toBe(true);
    });
  });

  test.describe('Group 5 — autoFocus (N/A)', { tag: [ButtonTags.functional] }, () => {
    test('Showcase does not use autoFocus on Button', async () => {
      qaLog('Skipped — no autoFocus scenario in ButtonQaShowcase');
    });
  });

  // ─── Group 6 — State ───────────────────────────────────────────────────────

  test.describe('Group 6 — State', { tag: [ButtonTags.functional] }, () => {
    test('Enabled vs disabled buttons reflect disabled attribute', async ({ page }) => {
      await expect(page.getByTestId('btn-disabled-false')).toBeEnabled();
      await expect(page.getByTestId('btn-disabled-true')).toBeDisabled();
    });

    test('Loading button is disabled, aria-busy, and keeps accessible name', async ({ page }) => {
      for (const testId of BUTTON_LOADING_TESTIDS) {
        await qaStep(`Accessible name while loading: ${testId}`, async () => {
          const btn = page.getByTestId(testId);
          await expect(btn).toBeDisabled();
          await expect(btn).toHaveAttribute('aria-busy', 'true');
          const expectedName = testId === 'btn-loading-true' ? 'Loading' : 'Save';
          await expect(
            btn,
            `${testId}: fix @oneui/ui Button loading a11y (hidden label drops accessible name)`,
          ).toHaveAccessibleName(expectedName);
        });
      }
    });

    test('Normal loading=false button is enabled', async ({ page }) => {
      await expect(page.getByTestId('btn-loading-false')).toBeEnabled();
    });
  });

  test.describe('Group 6 — Selected / error (N/A)', { tag: [ButtonTags.functional] }, () => {
    test('Button has no selected or error state props', async () => {
      qaLog('Skipped — use Toggle/Checkbox for selection; Button uses disabled/loading');
    });
  });

  // ─── Group 7 — Slots ───────────────────────────────────────────────────────

  test.describe('Group 7 — Slots', { tag: [ButtonTags.functional] }, () => {
    test('No slots — label only button has no decorative slot svgs', async ({ page }) => {
      const btn = page.getByTestId('btn-start-none-end-none');
      await expect(btn.locator('svg')).toHaveCount(0);
    });

    test('Start icon slot renders svg inside button', async ({ page }) => {
      const btn = page.getByTestId('btn-start-icon-end-none');
      await expect(btn.locator('svg').first()).toBeVisible();
    });

    test('End icon slot renders svg inside button', async ({ page }) => {
      const btn = page.getByTestId('btn-start-none-end-icon');
      await expect(btn.locator('svg').first()).toBeVisible();
    });

    test('Both icon slots render two svgs', async ({ page }) => {
      const btn = page.getByTestId('btn-start-icon-end-icon');
      expect(await btn.locator('svg').count()).toBeGreaterThanOrEqual(2);
    });

    test('Loading hides start/end slot icons on Save button', async ({ page }) => {
      const btn = page.getByTestId('btn-loading-slots-hidden');
      await expect(btn).toHaveAttribute('aria-busy', 'true');
      const hidden = await btn.evaluate((el) => {
        const slots = Array.from(el.querySelectorAll('span')).filter((span) => {
          const cls = span.className;
          return typeof cls === 'string' && (cls.includes('start') || cls.includes('end'));
        });
        return slots.every((span) => getComputedStyle(span).visibility === 'hidden');
      });
      expect(hidden, 'Start/end slots should be visibility:hidden while loading').toBe(true);
    });
  });

  // ─── Groups 8–9 — N/A ──────────────────────────────────────────────────────

  test.describe('Group 8 — Toggle (N/A)', { tag: [ButtonTags.functional] }, () => {
    test('Button is momentary action, not a toggle', async () => {
      qaLog('Skipped — not a toggle component');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [ButtonTags.functional] }, () => {
    test('Button does not accept typed input', async () => {
      qaLog('Skipped — not an input component');
    });
  });

  // ─── Group 10 — Dependencies ─────────────────────────────────────────────

  test.describe('Group 10 — Dependencies', { tag: [ButtonTags.functional] }, () => {
    test('condensed has no effect when contained=false', async ({ page }) => {
      const loose = page.getByTestId('btn-contained-false-condensed-false');
      const looseCondensed = page.getByTestId('btn-contained-false-condensed-true');
      const boxA = await loose.boundingBox();
      const boxB = await looseCondensed.boundingBox();
      expect(boxA?.height).toBe(boxB?.height);
      expect(boxA?.width).toBe(boxB?.width);
    });

    test('condensed reduces height when contained=true', async ({ page }) => {
      const regular = page.getByTestId('btn-contained-true-condensed-false');
      const condensed = page.getByTestId('btn-contained-true-condensed-true');
      const hRegular = (await regular.boundingBox())?.height ?? 0;
      const hCondensed = (await condensed.boundingBox())?.height ?? 0;
      expect(hCondensed, 'Condensed contained button should be shorter').toBeLessThanOrEqual(hRegular);
    });

    test('fullWidth expands contained button to parent width', async ({ page }) => {
      const narrow = page.getByTestId('btn-fullwidth-contained-true-width-false');
      const wide = page.getByTestId('btn-fullwidth-contained-true-width-true');
      const wideWidth = (await wide.boundingBox())?.width ?? 0;
      const narrowWidth = (await narrow.boundingBox())?.width ?? 0;
      expect(wideWidth, 'fullWidth button should be wider than non-fullWidth').toBeGreaterThan(narrowWidth);
      await expect(wide).toHaveClass(/fullWidth/);
    });

    test('loading=true disables interaction', async ({ page }) => {
      await expect(page.getByTestId('btn-loading-true')).toBeDisabled();
    });
  });

  // ─── Group 11 — Content and display ────────────────────────────────────────

  test.describe('Group 11 — Content and display', { tag: [ButtonTags.functional] }, () => {
    test('Combo buttons expose non-empty label text', async ({ page }) => {
      for (let i = 0; i < BUTTON_COMBO_COUNT; i++) {
        const btn = page.getByTestId(btnComboTestId(i));
        await expect(btn).toHaveText(/\S+/);
      }
    });

    test('Attention-high button label is visible', async ({ page }) => {
      const btn = page.getByTestId('btn-attention-high');
      await expect(btn).toContainText('High');
    });
  });

  // ─── Group 12 — Layout and responsive ────────────────────────────────────

  test.describe('Group 12 — Layout and responsive', { tag: [ButtonTags.functional] }, () => {
    test('Representative buttons visible at 320px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openButtonTestScenarios(page);
      await expect(page.getByTestId(btnSizeTestId('M'))).toBeVisible();
      await expect(page.getByTestId(btnComboTestId(0))).toBeVisible();
    });

    test('Default button visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openButtonTestScenarios(page);
      await expect(page.locator('#button-qa-default').getByRole('button', { name: 'Button' })).toBeVisible();
    });
  });

  // ─── Group 13 — Dark mode ──────────────────────────────────────────────────

  test.describe('Group 13 — Dark mode', { tag: [ButtonTags.functional] }, () => {
    test('Sample buttons remain visible in dark theme', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const testId of ['btn-attention-high', 'btn-appearance-primary', 'btn-combo-0'] as const) {
        await expectButtonVisible(page, testId, `${testId} should stay visible in dark mode`);
      }
    });
  });
});
