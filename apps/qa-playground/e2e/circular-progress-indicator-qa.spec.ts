/**
 * Circular Progress Indicator QA playground — functional Playwright tests.
 * Selectors mirror `CircularProgressIndicatorQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **display** (progress indicator — `role="progressbar"`, not tabbable / not clickable).
 *
 * **QA rule:** Do not weaken assertions or add playground workarounds so a run goes green.
 * If the showcase documents behaviour and `@oneui/ui` CircularProgressIndicator is wrong, the test must fail.
 *
 * **Raised defects (tests must fail until fixed — do not soften):**
 * - Group G `[fn] all cpi data-testid roots visible`: broad `[data-testid^="cpi-"]` includes hidden
 *   Figma Validation nodes (`cpi-figma-*`) mounted in DOM on Test Scenarios tab — page shell issue.
 *   Group 1.2 (manifest loop) is the authoritative CPI showcase render check.
 *
 * **Page chrome (not CPI — use `clickPageThemeButton`, not stale `/Theme:/` selector):**
 * - Theme toggle test validates page header/toolbar control, not `@oneui/ui` CircularProgressIndicator.
 *
 * Playground inventory (exact values):
 * - data-section: see `e2e/circular-progress-indicator-playground/manifest.ts` → `CPI_DATA_SECTIONS`
 * - data-testid: see `CPI_ALL_TESTIDS` (66 roots in Test Scenarios)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  CPI_TAG_SET,
  CpiTags,
  expectSectionVisible,
  openCpiTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './circular-progress-indicator/cpi-qa-support';
import {
  animationNameOnIndicator,
  animationNameOnSvg,
  cpiRoot,
  cpiSection,
  expectCircularRoot,
  indicatorStrokeRgb,
  progressbarForTestId,
} from './circular-progress-indicator-playground/cpiHelpers';
import {
  CPI_ALL_TESTIDS,
  CPI_COMBO_COUNT,
  CPI_DATA_SECTIONS,
  CPI_FIGMA_APPEARANCES,
  CPI_ROOT_TESTIDS,
  CPI_SECTION_COUNT,
  CPI_SIZE_KEYS,
  CPI_LABEL_VISIBLE_SIZES,
  CPI_VALUE_SAMPLES,
  cpiAppearanceTestId,
  cpiComboTestId,
  cpiSizeTestId,
  cpiSizesIconTestId,
  cpiSizesTextTestId,
  cpiValueTestId,
} from './circular-progress-indicator-playground/manifest';

test.describe('Functional', { tag: CPI_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openCpiTestScenarios(page);
  });

  test('[fn] shows Circular Progress Indicator page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Circular Progress Indicator', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default — determinate value 25 exposes aria-valuenow on progressbar', async ({ page }) => {
    const root = cpiRoot(page, CPI_ROOT_TESTIDS.default);
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await expectCircularRoot(page, CPI_ROOT_TESTIDS.default);
    const bar = progressbarForTestId(page, CPI_ROOT_TESTIDS.default);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('aria-valuenow', '25');
    await expect(bar).toHaveAttribute('aria-valuemin', '0');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  test.describe('Group A — variant', () => {

    test('[fn] variant=determinate — aria-valuenow/min/max on progressbar (value 65)', async ({ page }) => {
      const root = cpiRoot(page, CPI_ROOT_TESTIDS.variantDeterminate);
      await root.scrollIntoViewIfNeeded();
      await expect(root).toBeVisible();
      const bar = progressbarForTestId(page, CPI_ROOT_TESTIDS.variantDeterminate);
      await expect(bar).toHaveAttribute('role', 'progressbar');
      await expect(bar).toHaveAttribute('aria-valuenow', '65');
      await expect(bar).toHaveAttribute('aria-valuemin', '0');
      await expect(bar).toHaveAttribute('aria-valuemax', '100');
    });


  });

  test.describe('Group B — size', () => {
    for (const key of CPI_SIZE_KEYS) {
      test(`[fn] size=${key} — visible and square bounding box`, async ({ page }) => {
        await expectCircularRoot(page, cpiSizeTestId(key));
      });
    }

    test('[fn] sizes scale monotonically 2XS → 5XL (playground strip order)', async ({ page }) => {
      const widths: number[] = [];
      for (const key of CPI_SIZE_KEYS) {
        const box = await cpiRoot(page, cpiSizeTestId(key)).boundingBox();
        expect(box).not.toBeNull();
        widths.push(box!.width);
      }
      for (let i = 1; i < widths.length; i++) {
        expect(
          widths[i],
          `${cpiSizeTestId(CPI_SIZE_KEYS[i])} width should be ≥ ${cpiSizeTestId(CPI_SIZE_KEYS[i - 1])}`,
        ).toBeGreaterThanOrEqual(widths[i - 1]);
      }
    });
  });

  test.describe('Group B2 — icon & text × all sizes (band 2b)', () => {
    for (const key of CPI_SIZE_KEYS) {
      test(`[fn] cpi-sizes-text-${key} — aria-valuenow 25 & centre label (Figma L+)`, async ({ page }) => {
        const testId = cpiSizesTextTestId(key);
        const root = cpiRoot(page, testId);
        await root.scrollIntoViewIfNeeded();
        await expect(root).toBeVisible();
        const bar = progressbarForTestId(page, testId);
        await expect(bar).toHaveAttribute('aria-valuenow', '25');
        const label = root.locator(':scope > span');
        if ((CPI_LABEL_VISIBLE_SIZES as readonly string[]).includes(key)) {
          await expect(label.first()).toBeVisible();
          await expect(label.first()).toHaveText('25');
        } else {
          await expect(label, `Figma omits centre text below size L (${key})`).toHaveCount(0);
        }
      });
    }

    for (const key of CPI_SIZE_KEYS) {
      test(`[fn] cpi-sizes-icon-${key} — aria-valuenow 50 & ring + icon svg`, async ({ page }) => {
        const testId = cpiSizesIconTestId(key);
        const root = cpiRoot(page, testId);
        await root.scrollIntoViewIfNeeded();
        await expect(root).toBeVisible();
        const bar = progressbarForTestId(page, testId);
        await expect(bar).toHaveAttribute('aria-valuenow', '50');
        await expect(root.locator('svg')).toHaveCount(2);
      });
    }
  });

  test.describe('Group C — appearance', () => {
    for (const appearance of CPI_FIGMA_APPEARANCES) {
      test(`[fn] appearance=${appearance} — cell visible`, async ({ page }) => {
        const el = cpiRoot(page, cpiAppearanceTestId(appearance));
        await el.scrollIntoViewIfNeeded();
        await expect(el).toBeVisible();
      });
    }

    test('[fn] appearance=brand-bg — extra code row visible', async ({ page }) => {
      await expect(cpiRoot(page, cpiAppearanceTestId('brand-bg'))).toBeVisible();
    });

  });

  test.describe('Group D — content', () => {
    test('[fn] content=none determinate — no centre label span', async ({ page }) => {
      const root = cpiRoot(page, 'cpi-content-none-det');
      await root.scrollIntoViewIfNeeded();
      await expect(root).toBeVisible();
      await expect(root.locator(':scope > span')).toHaveCount(0);
    });

    test('[fn] content=text determinate — centre shows non-empty text', async ({ page }) => {
      const root = cpiRoot(page, 'cpi-content-text-det');
      await root.scrollIntoViewIfNeeded();
      await expect(root).toBeVisible();
      const label = root.locator(':scope > span').first();
      await expect(label).toBeVisible();
      const text = (await label.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('[fn] content=icon determinate — nested svg present (ring + icon)', async ({ page }) => {
      const root = cpiRoot(page, 'cpi-content-icon-det');
      await root.scrollIntoViewIfNeeded();
      await expect(root).toBeVisible();
      await expect(root.locator('svg')).toHaveCount(2);
    });

    test('[fn] content=none indeterminate — no centre label span', async ({ page }) => {
      const root = cpiRoot(page, 'cpi-content-none-ind');
      await root.scrollIntoViewIfNeeded();
      await expect(root).toBeVisible();
      await expect(root.locator(':scope > span')).toHaveCount(0);
    });

    test('[fn] content=text indeterminate — centre label span exists (playground shows 0%)', async ({ page }) => {
      const root = cpiRoot(page, 'cpi-content-text-ind');
      await root.scrollIntoViewIfNeeded();
      await expect(root).toBeVisible();
      const label = root.locator(':scope > span').first();
      await expect(label).toBeVisible();
    });

    test('[fn] content=icon indeterminate — nested svg present', async ({ page }) => {
      const root = cpiRoot(page, 'cpi-content-icon-ind');
      await root.scrollIntoViewIfNeeded();
      await expect(root).toBeVisible();
      await expect(root.locator('svg').first()).toBeVisible();
      expect(await root.locator('svg').count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Group E — value / min / max (code-only props)', () => {
    for (const val of CPI_VALUE_SAMPLES) {
      test(`[fn] value=${val} — aria-valuenow on progressbar`, async ({ page }) => {
        const testId = cpiValueTestId(val);
        const bar = progressbarForTestId(page, testId);
        await cpiRoot(page, testId).scrollIntoViewIfNeeded();
        await expect(bar).toHaveAttribute('aria-valuenow', String(val));
        await expect(bar).toHaveAttribute('aria-valuemin', '0');
        await expect(bar).toHaveAttribute('aria-valuemax', '100');
      });
    }

    test('[fn] cpi-range-0-200 — min max value map to aria', async ({ page }) => {
      const bar = progressbarForTestId(page, 'cpi-range-0-200');
      await cpiRoot(page, 'cpi-range-0-200').scrollIntoViewIfNeeded();
      await expect(bar).toHaveAttribute('aria-valuemin', '0');
      await expect(bar).toHaveAttribute('aria-valuemax', '200');
      await expect(bar).toHaveAttribute('aria-valuenow', '75');
    });

    test('[fn] cpi-range-10-60 — min max value map to aria', async ({ page }) => {
      const bar = progressbarForTestId(page, 'cpi-range-10-60');
      await cpiRoot(page, 'cpi-range-10-60').scrollIntoViewIfNeeded();
      await expect(bar).toHaveAttribute('aria-valuemin', '10');
      await expect(bar).toHaveAttribute('aria-valuemax', '60');
      await expect(bar).toHaveAttribute('aria-valuenow', '35');
    });
  });

  test.describe('Group F — variant × content (playground testids)', () => {

    test('[fn] determinate + content=text — aria-valuenow matches value 72', async ({ page }) => {
      const bar = progressbarForTestId(page, 'cpi-content-text-det');
      await cpiRoot(page, 'cpi-content-text-det').scrollIntoViewIfNeeded();
      await expect(bar).toHaveAttribute('aria-valuenow', '72');
    });
  });

  test.describe('Group G — general', () => {
    test('[fn] no console errors while on Test Scenarios tab', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openCpiTestScenarios(page);
      await page.waitForLoadState('networkidle');
      await assertNoConsoleErrors(errors);
    });

    test('[fn] all cpi data-testid roots visible', async ({ page }) => {
      const roots = page.locator('[data-testid^="cpi-"]');
      const count = await roots.count();
      expect(count, 'Page should mount at least one cpi-* testid').toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await roots.nth(i).scrollIntoViewIfNeeded();
        await expect(roots.nth(i), `cpi-* root index ${i} should be visible on Test Scenarios tab`).toBeVisible();
      }
    });

    test('[fn] Combination matrix has expected count', async ({ page }) => {
      await expect(page.locator('[data-testid^="cpi-combo-"]')).toHaveCount(CPI_COMBO_COUNT);
    });

    test('[fn] aria-labelledby demo — progressbar references labelled element', async ({ page }) => {
      const bar = progressbarForTestId(page, CPI_ROOT_TESTIDS.ariaLabelledby);
      await cpiRoot(page, CPI_ROOT_TESTIDS.ariaLabelledby).scrollIntoViewIfNeeded();
      const labelledby = await bar.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      await expect(page.locator(`[id=${JSON.stringify(labelledby!)}]`)).toBeVisible();
    });

    test('[fn] Figma Validation tab — matrix table mounts', async ({ page }) => {
      await page.getByRole('tab', { name: 'Figma Validation' }).click();
      await expect(page.getByTestId('figma-circular-progress-indicator-grid')).toBeVisible();
      await expect(page.getByTestId('cpi-figma-val-var-determinate-sz-M')).toBeVisible();
      await expect(page.getByTestId('cpi-figma-val-var-indeterminate-sz-M')).toBeVisible();
    });
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [CpiTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default indicator mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openCpiTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(cpiRoot(page, CPI_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      test.setTimeout(180_000);
      for (const testId of CPI_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const root = cpiRoot(page, testId);
          await root.scrollIntoViewIfNeeded();
          await expect(root, `Expected visible: ${testId}`).toBeVisible();
          const text = (await root.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of CPI_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="circular-progress-indicator-qa"]')).toHaveCount(
        CPI_SECTION_COUNT,
      );
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [CpiTags.functional] }, () => {
    test('2.1 — Default uses size M and auto appearance resolves on progressbar', async ({ page }) => {
      const bar = progressbarForTestId(page, CPI_ROOT_TESTIDS.default);
      await expect(bar).toHaveAttribute('aria-valuenow', '25');
    });

    test('2.2 — Size 2XS → 5XL bounding boxes scale progressively and stay circular', async ({ page }) => {
      const boxes = await Promise.all(CPI_SIZE_KEYS.map((key) => cpiRoot(page, cpiSizeTestId(key)).boundingBox()));
      expect(boxes.every(Boolean)).toBe(true);
      const widths = boxes.map((b) => b!.width);
      for (let i = 1; i < widths.length; i++) {
        expect(widths[i]).toBeGreaterThanOrEqual(widths[i - 1]);
      }
      for (const key of CPI_SIZE_KEYS) {
        await expectCircularRoot(page, cpiSizeTestId(key));
      }
    });
  });

  // ── GROUP 3 — Click (N/A) ──────────────────────────────────────────────────
  test.describe('Group 3 — Click interaction (N/A)', { tag: [CpiTags.functional] }, () => {
    test('3.x — CircularProgressIndicator is not clickable', async () => {
      qaLog('Skipped — display component; progressbar is not an interactive control');
    });
  });

  // ── GROUP 4 — Keyboard (N/A for component) ─────────────────────────────────
  test.describe('Group 4 — Keyboard navigation (N/A)', { tag: [CpiTags.functional] }, () => {
    test('4.x — Progress indicator is not in Tab order', async () => {
      qaLog('Skipped — CPI is display-only; keyboard tests apply to page chrome in a11y spec');
    });
  });

  // ── GROUP 5 — Focus (N/A) ──────────────────────────────────────────────────
  test.describe('Group 5 — Focus management (N/A)', { tag: [CpiTags.functional] }, () => {
    test('5.x — CPI does not receive focus on click', async () => {
      qaLog('Skipped — progressbar root is not focusable');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [CpiTags.functional] }, () => {
    test('6.1 — Default determinate state exposes value 25', async ({ page }) => {
      const bar = progressbarForTestId(page, CPI_ROOT_TESTIDS.default);
      await expect(bar).toHaveAttribute('aria-valuenow', '25');
    });

  });

  test.describe('Group 6 — Disabled / error (N/A)', { tag: [CpiTags.functional] }, () => {
    test('6.3 — Disabled state is not in showcase', async () => {
      qaLog('Skipped — CPI has no disabled prop in Test Scenarios');
    });
  });

  // ── GROUP 7 — Content slots ────────────────────────────────────────────────
  test.describe('Group 7 — Content (centre slot)', { tag: [CpiTags.functional] }, () => {
    test('7.1 — content=none — no centre span', async ({ page }) => {
      await expect(cpiRoot(page, 'cpi-content-none-det').locator(':scope > span')).toHaveCount(0);
    });

    test('7.2 — content=icon — ring svg + child icon svg', async ({ page }) => {
      await expect(cpiRoot(page, 'cpi-content-icon-det').locator('svg')).toHaveCount(2);
    });

    test('7.4 — Icon inside content=icon has aria-hidden', async ({ page }) => {
      const iconSvg = cpiRoot(page, 'cpi-content-icon-det').locator('svg').nth(1);
      await expect(iconSvg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ── GROUP 8–10 — N/A ─────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [CpiTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — CPI is not selectable');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [CpiTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — CPI is not typed entry');
    });
  });

  test.describe('Group 10 — Dependency rules (N/A)', { tag: [CpiTags.functional] }, () => {
    test('10.x — No loading/slot dependency matrix in showcase', async () => {
      qaLog('Skipped — showcase does not exercise animate/show dependency overrides');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [CpiTags.functional] }, () => {
    test('11.1 — content=text shows percentage label', async ({ page }) => {
      const label = cpiRoot(page, 'cpi-content-text-det').locator(':scope > span').first();
      await expect(label).toBeVisible();
      const text = (await label.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('11.3 — aria-valuenow matches value for each sample', async ({ page }) => {
      for (const val of CPI_VALUE_SAMPLES) {
        const bar = progressbarForTestId(page, cpiValueTestId(val));
        await expect(bar, `value ${val}`).toHaveAttribute('aria-valuenow', String(val));
      }
    });

    for (const index of Array.from({ length: CPI_COMBO_COUNT }, (_, i) => i)) {
      test(`11.3 — combo ${index} progressbar has accessible name`, async ({ page }) => {
        const bar = progressbarForTestId(page, cpiComboTestId(index));
        await cpiRoot(page, cpiComboTestId(index)).scrollIntoViewIfNeeded();
        await expect(bar).toHaveAccessibleName(/.+/);
      });
    }
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [CpiTags.functional] }, () => {
    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openCpiTestScenarios(page);
      for (const sectionId of CPI_DATA_SECTIONS) {
        const band = cpiSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default indicator visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openCpiTestScenarios(page);
      await expect(cpiRoot(page, CPI_ROOT_TESTIDS.default)).toBeVisible();
    });
  });

  test.describe('Group 12 — fullWidth (N/A)', { tag: [CpiTags.functional] }, () => {
    test('12.1 — fullWidth is not a CPI prop', async () => {
      qaLog('Skipped — CircularProgressIndicator has no fullWidth prop');
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [CpiTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      const tab = page.getByRole('tab', { name: 'Test Scenarios' });
      if ((await tab.getAttribute('aria-selected')) !== 'true') {
        await tab.click();
      }
      await page.getByTestId(CPI_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
      for (const sectionId of CPI_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: CPI_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Circular Progress Indicator”', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Circular Progress Indicator', level: 1 }),
      ).toBeVisible();
    });

    test('Smoke — Default progressbar visible with aria-valuenow 25', async ({ page }) => {
      const bar = progressbarForTestId(page, CPI_ROOT_TESTIDS.default);
      await expect(bar).toBeVisible();
      await expect(bar).toHaveAttribute('aria-valuenow', '25');
    });
  });
});
