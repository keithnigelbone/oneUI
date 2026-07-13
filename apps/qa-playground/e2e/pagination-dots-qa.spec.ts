/**
 * PaginationDots QA — functional, keyboard, and responsive Playwright coverage.
 * Anchors: `PaginationDotsQaShowcase.tsx` + `e2e/pagination-dots-playground/`.
 *
 * Component type: **interactive** (tablist dot navigator — roving tabindex, single select).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` PaginationDots defects.
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `PAGINATION_DOTS_DATA_SECTIONS` (6 bands)
 * - data-testid: `PAGINATION_DOTS_SHOWCASE_TESTIDS` (14 wrappers)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickDot,
  clickPageThemeButton,
  dotsSection,
  dotsStatus,
  dotsTablist,
  dotsWrap,
  expectActivePage,
  expectFocusVisible,
  expectSectionVisible,
  isTransparentRgb,
  openPaginationDotsFigmaValidationTab,
  openPaginationDotsTestScenarios,
  PAGINATION_DOTS_TAG_SET,
  PaginationDotsTags,
  qaLog,
  qaStep,
  screenshotDots,
  switchPlaygroundToDarkTheme,
  tabbableDot,
  activeDotBackgroundRgb,
  activeDotTab,
} from './pagination-dots/pagination-dots-qa-support';
import {
  FIGMA_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  PAGINATION_DOTS_ARIA,
  PAGINATION_DOTS_COMBO_COUNT,
  PAGINATION_DOTS_COMBO_TESTIDS,
  PAGINATION_DOTS_DATA_SECTIONS,
  PAGINATION_DOTS_FIGMA_APPEARANCES,
  PAGINATION_DOTS_ROOT_TESTIDS,
  PAGINATION_DOTS_SECTION_COUNT,
  PAGINATION_DOTS_SHOWCASE_TESTIDS,
  paginationDotsAppearanceAria,
} from './pagination-dots-playground/manifest';

test.describe('Functional', { tag: PAGINATION_DOTS_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openPaginationDotsTestScenarios(page);
  });

  test.describe('Functional Tests', () => {
  test('[fn] shows Pagination Dots page heading', async ({ page }) => {
    await test.step('Verify catalog detail heading', async () => {
      await expect(page.getByRole('heading', { name: 'Pagination Dots', level: 1 })).toBeVisible();
    });
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await test.step('Test Scenarios, Figma Validation, Accessibility, Functional tabs', async () => {
      await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
      await expect(page.getByRole('tab', { name: FIGMA_VALIDATION_TAB })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
    });
  });

  test('[fn] default tablist renders with first page active', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.default,
      PAGINATION_DOTS_ROOT_TESTIDS.default,
    );
    await test.step('Eight-page window, page 1 selected', async () => {
      await expect(root).toBeVisible();
      await expectActivePage(root, 1, 8);
      await expect(root.getByRole('tab')).toHaveCount(5);
      await screenshotDots(page, dotsWrap(page, PAGINATION_DOTS_ROOT_TESTIDS.default), 'render-default');
    });
  });

  test('[fn] selecting a dot advances the active page', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.uncontrolled0,
      PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
    );
    await test.step('Focus active tab, ArrowRight → page 2', async () => {
      await expectActivePage(root, 1, 5);
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 5);
    });
    await test.step('Click page 3 (controlled band pattern)', async () => {
      const controlled = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.controlled,
        PAGINATION_DOTS_ROOT_TESTIDS.controlled,
      );
      await clickDot(controlled, 5, 8);
      await expect(page.getByText(/currentPage:\s*5/i)).toBeVisible();
    });
  });

  test('[fn] controlled demo updates caption on dot click', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.controlled,
      PAGINATION_DOTS_ROOT_TESTIDS.controlled,
    );
    await test.step('Initial currentPage 3', async () => {
      await expect(page.getByText(/currentPage:\s*3/i)).toBeVisible();
      await expectActivePage(root, 3, 8);
    });
    await test.step('Click page 5', async () => {
      await clickDot(root, 5, 8);
      await expect(page.getByText(/currentPage:\s*5/i)).toBeVisible();
      await expectActivePage(root, 5, 8);
    });
  });

  test('[fn] readOnly renders status role and disabled dots', async ({ page }) => {
    const status = dotsStatus(
      page,
      PAGINATION_DOTS_ARIA.readOnly,
      PAGINATION_DOTS_ROOT_TESTIDS.readOnly,
    );
    await test.step('Non-interactive indicator', async () => {
      await expect(status).toBeVisible();
      await expect(status.locator('button[disabled]')).toHaveCount(await status.locator('button').count());
    });
  });

  test('[fn] loop true — two-dot sequence wraps on keyboard', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.loopTrue,
      PAGINATION_DOTS_ROOT_TESTIDS.loopTrue,
    );
    await test.step('Page 1 active, ArrowRight → page 2', async () => {
      await expectActivePage(root, 1, 2);
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 2);
    });
    await test.step('ArrowRight wraps to page 1', async () => {
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 1, 2);
    });
  });

  test('[fn] loop false — keyboard clamps at last page', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.uncontrolled0,
      PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
    );
    await test.step('At page 5, ArrowRight stays on last page', async () => {
      await clickDot(root, 5, 5);
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 5, 5);
    });
  });

  test('[fn] appearance sparkle row renders', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.appearanceSparkle,
      PAGINATION_DOTS_ROOT_TESTIDS.appearanceSparkle,
    );
    await test.step('Sparkle appearance tablist', async () => {
      const wrap = dotsWrap(page, PAGINATION_DOTS_ROOT_TESTIDS.appearanceSparkle);
      await expect(root).toBeVisible();
      await expect(wrap).toHaveAttribute('data-appearance', 'sparkle');
    });
  });

  test('[fn] degenerate count 0 and 1', async ({ page }) => {
    const band = page.locator('[data-section="pagination-dots-qa-degenerate"]');
    await band.scrollIntoViewIfNeeded();
    await test.step('Empty count — no tabs', async () => {
      const empty = dotsTablist(page, PAGINATION_DOTS_ARIA.empty, PAGINATION_DOTS_ROOT_TESTIDS.empty);
      await expect(empty).toBeAttached();
      await expect(empty.getByRole('tab')).toHaveCount(0);
    });
    await test.step('Single dot', async () => {
      const single = dotsTablist(page, PAGINATION_DOTS_ARIA.single, PAGINATION_DOTS_ROOT_TESTIDS.single);
      await expect(single).toBeVisible();
      await expect(single.getByRole('tab')).toHaveCount(1);
      await expectActivePage(single, 1, 1);
    });
  });

  test('[fn] combination matrix renders all rows', async ({ page }) => {
    await test.step('Five combo wrappers', async () => {
      expect(PAGINATION_DOTS_COMBO_TESTIDS).toHaveLength(PAGINATION_DOTS_COMBO_COUNT);
      for (const id of PAGINATION_DOTS_COMBO_TESTIDS) {
        await expect(page.getByTestId(id)).toBeVisible();
      }
    });
  });

  test('[fn] figma validation tab mounts pageCount × loop grid', async ({ page }) => {
    await test.step('Figma matrix table', async () => {
      await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
      await expect(page.getByTestId(FIGMA_GRID_TESTID)).toBeVisible();
      await expect(page.getByText('pageCount: 5+')).toBeVisible();
    });
  });
});

test.describe('Keyboard Navigation Tests', () => {
  test('[fn] Tab reaches focusable controls', async ({ page }) => {
    await test.step('Tab moves focus into page', async () => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag).toBeTruthy();
    });
  });

  test('[fn] roving tabindex — only active dot is tabbable', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.default,
      PAGINATION_DOTS_ROOT_TESTIDS.default,
    );
    await test.step('One tabindex=0 tab', async () => {
      await expect(tabbableDot(root)).toHaveAttribute('aria-selected', 'true');
      const tabZero = await root.locator('button[role="tab"][tabindex="0"]').count();
      expect(tabZero).toBe(1);
    });
  });

  test('[fn] ArrowRight advances active index', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.uncontrolled0,
      PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
    );
    await test.step('Page 1 → page 2', async () => {
      await expectActivePage(root, 1, 5);
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 5);
    });
  });

  test('[fn] ArrowLeft moves back', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.uncontrolled0,
      PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
    );
    await test.step('Page 2 → page 1', async () => {
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowLeft');
      await expectActivePage(root, 1, 5);
    });
  });

  test('[fn] Home and End jump to first and last page', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.uncontrolled2,
      PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled2,
    );
    await test.step('Home → 1, End → 5', async () => {
      await expectActivePage(root, 3, 5);
      await tabbableDot(root).focus();
      await page.keyboard.press('End');
      await expectActivePage(root, 5, 5);
      await tabbableDot(root).focus();
      await page.keyboard.press('Home');
      await expectActivePage(root, 1, 5);
    });
  });

  test('[fn] focus indicator visible after Tab', async ({ page }) => {
    await test.step('Visible focus ring or shadow', async () => {
      await page.keyboard.press('Tab');
      await expectFocusVisible(page);
    });
  });
});

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [PaginationDotsTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default tablist mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openPaginationDotsTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(dotsWrap(page, PAGINATION_DOTS_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every showcase `data-testid` is visible on Test Scenarios', async ({ page }) => {
      test.setTimeout(180_000);
      for (const testId of PAGINATION_DOTS_SHOWCASE_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const root = page.getByTestId(testId);
          await root.scrollIntoViewIfNeeded();
          if (testId === PAGINATION_DOTS_ROOT_TESTIDS.empty) {
            await expect(root, `Expected attached: ${testId}`).toBeAttached();
          } else {
            await expect(root, `Expected visible: ${testId}`).toBeVisible();
          }
          const text = (await root.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of PAGINATION_DOTS_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="pagination-dots-qa-"]')).toHaveCount(
        PAGINATION_DOTS_SECTION_COUNT,
      );
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [PaginationDotsTags.functional] }, () => {
    test('2.1 — Default — page 1 active, primary appearance on tablist', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await expect(root).toHaveAttribute('data-appearance', 'primary');
      await expectActivePage(root, 1, 8);
    });

    test('2.1 — defaultActiveIndex 0 vs 2 selects correct starting page', async ({ page }) => {
      const root0 = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled0,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
      );
      const root2 = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled2,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled2,
      );
      await expectActivePage(root0, 1, 5);
      await expectActivePage(root2, 3, 5);
    });

    test('2.1 — appearance sparkle exposes data-appearance on tablist', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.appearanceSparkle,
        PAGINATION_DOTS_ROOT_TESTIDS.appearanceSparkle,
      );
      await expect(root).toHaveAttribute('data-appearance', 'sparkle');
    });

    test('2.2 — Size prop (N/A — Figma M only; no public size prop)', async () => {
      qaLog('Skipped — PaginationDots has no size prop in showcase');
    });

    test('2.2b — Active dot is pill-shaped (width > height); inactive dot is circular', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      const activeBox = await activeDotTab(root).boundingBox();
      expect(activeBox?.width, 'Active pill width').toBeGreaterThan(activeBox?.height ?? 0);

      const inactive = root.locator('button[role="tab"][data-state="regular"]').first();
      const inactiveBox = await inactive.boundingBox();
      expect(inactiveBox?.width, 'Inactive dot width').toBeGreaterThan(0);
      expect(Math.abs(inactiveBox!.width - inactiveBox!.height)).toBeLessThanOrEqual(
        inactiveBox!.width * 0.2,
      );
    });


  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [PaginationDotsTags.functional] }, () => {
    test('3.1 — Click dot updates aria-selected page (controlled)', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.controlled,
        PAGINATION_DOTS_ROOT_TESTIDS.controlled,
      );
      await clickDot(root, 5, 8);
      await expectActivePage(root, 5, 8);
      await expect(page.getByText(/currentPage:\s*5/i)).toBeVisible();
    });

    test('3.2 — Readonly dots — click does not change aria-current', async ({ page }) => {
      const status = dotsStatus(
        page,
        PAGINATION_DOTS_ARIA.readOnly,
        PAGINATION_DOTS_ROOT_TESTIDS.readOnly,
      );
      const current = status.locator('button[aria-current="true"]');
      const before = await current.getAttribute('aria-label');
      await status.locator('button').first().click({ force: true });
      const after = await current.getAttribute('aria-label');
      expect(after, 'Read-only active dot should not change on click').toBe(before);
    });

    test('3.3 — Readonly is non-interactive (status role)', async ({ page }) => {
      const status = dotsStatus(
        page,
        PAGINATION_DOTS_ARIA.readOnly,
        PAGINATION_DOTS_ROOT_TESTIDS.readOnly,
      );
      await expect(status).toHaveAttribute('role', 'status');
    });

    test('3.4 — Click outside removes focus from active dot', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await tabbableDot(root).focus();
      await page.getByRole('heading', { name: 'Pagination Dots', level: 1 }).click();
      await expect(tabbableDot(root)).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [PaginationDotsTags.functional] }, () => {
    test('4.1 — Tab reaches focusable controls', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should move focus to a focusable element').toBeTruthy();
    });

    test('4.2 — Enter on focused dot keeps selection actionable', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled0,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
      );
      await tabbableDot(root).focus();
      await page.keyboard.press('Enter');
      await expectActivePage(root, 1, 5);
    });

    test('4.3 — Space on focused dot (N/A — dots use arrows)', async () => {
      qaLog('Skipped — PaginationDots advances via Arrow keys, not Space toggle');
    });

    test('4.4 — ArrowRight / ArrowLeft move selection', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled0,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
      );
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 5);
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowLeft');
      await expectActivePage(root, 1, 5);
    });

    test('4.5 — Home and End jump to first and last page', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled2,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled2,
      );
      await tabbableDot(root).focus();
      await page.keyboard.press('End');
      await expectActivePage(root, 5, 5);
      await tabbableDot(root).focus();
      await page.keyboard.press('Home');
      await expectActivePage(root, 1, 5);
    });

    test('4.4b — loop true wraps from last to first', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.loopTrue,
        PAGINATION_DOTS_ROOT_TESTIDS.loopTrue,
      );
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 2);
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 1, 2);
    });

    test('4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — PaginationDots is not an overlay');
    });

    test('4.7 — Tab cycle escapes tablist without trap', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await tabbableDot(root).focus();
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
      }
      const stillInside = await root.evaluate((el) => el.contains(document.activeElement));
      expect(stillInside, 'Repeated Tab should move focus beyond tablist').toBe(false);
    });
  });

  // ── GROUP 5 — Focus management ───────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [PaginationDotsTags.functional] }, () => {
    test('5.1 — Keyboard focus lands on active dot tab', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled0,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
      );
      await tabbableDot(root).focus();
      await expect(tabbableDot(root)).toBeFocused();
    });

    test('5.2 — Focus indicator visible after Tab', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expectFocusVisible(page);
    });

    test('5.3 — Roving tabindex — exactly one dot has tabindex 0', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await expect(root.locator('button[role="tab"][tabindex="0"]')).toHaveCount(1);
    });

    test('5.4 — Blur removes focus from dot', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await tabbableDot(root).focus();
      await page.getByRole('heading', { name: 'Pagination Dots', level: 1 }).click();
      await expect(tabbableDot(root)).not.toBeFocused();
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — showcase does not use autoFocus');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [PaginationDotsTags.functional] }, () => {
    test('6.1 — Default state — page 1 of 8 selected', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await expectActivePage(root, 1, 8);
    });

    test('6.2 — aria-selected true on active dot only', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await expect(root.locator('button[aria-selected="true"]')).toHaveCount(1);
    });

    test('6.3 — Disabled (N/A — no disabled prop on PaginationDots)', async () => {
      qaLog('Skipped — PaginationDots has readOnly, not disabled');
    });

    test('6.4 — Readonly — status role, all buttons disabled', async ({ page }) => {
      const status = dotsStatus(
        page,
        PAGINATION_DOTS_ARIA.readOnly,
        PAGINATION_DOTS_ROOT_TESTIDS.readOnly,
      );
      await expect(status.locator('button[disabled]')).toHaveCount(await status.locator('button').count());
    });

    test('6.5 — Error / loading (N/A)', async () => {
      qaLog('Skipped — PaginationDots has no error/loading props in showcase');
    });
  });

  // ── GROUP 7 — Slots (N/A) ────────────────────────────────────────────────
  test.describe('Group 7 — Slots (N/A)', { tag: [PaginationDotsTags.functional] }, () => {
    test('7.x — PaginationDots has no start/end slots', async () => {
      qaLog('Skipped — dot navigator has no icon/content slots');
    });
  });

  // ── GROUP 8 — Selection ──────────────────────────────────────────────────
  test.describe('Group 8 — Selection', { tag: [PaginationDotsTags.functional] }, () => {
    test('8.2 — Single select — only one dot has aria-selected at a time', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.controlled,
        PAGINATION_DOTS_ROOT_TESTIDS.controlled,
      );
      await clickDot(root, 5, 8);
      await expect(root.locator('button[aria-selected="true"]')).toHaveCount(1);
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 6, 8);
      await expect(root.locator('button[aria-selected="true"]')).toHaveCount(1);
    });
  });

  // ── GROUP 9 — Input (N/A) ──────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', { tag: [PaginationDotsTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — PaginationDots is not typed entry');
    });
  });

  // ── GROUP 10 — Dependency rules ────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [PaginationDotsTags.functional] }, () => {
    test('10.2 — loop true wraps; loop false clamps at last page', async ({ page }) => {
      const loopRoot = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.loopTrue,
        PAGINATION_DOTS_ROOT_TESTIDS.loopTrue,
      );
      await tabbableDot(loopRoot).focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await expectActivePage(loopRoot, 1, 2);

      const clampRoot = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled0,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
      );
      await clickDot(clampRoot, 5, 5);
      await tabbableDot(clampRoot).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(clampRoot, 5, 5);
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [PaginationDotsTags.functional] }, () => {
    test('11.1 — Controlled caption reflects currentPage (1-based)', async ({ page }) => {
      await expect(page.getByText(/currentPage:\s*3/i)).toBeVisible();
    });

    test('11.1 — Dot tabs expose Page N of M accessible names', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.uncontrolled2,
        PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled2,
      );
      await expect(root.getByRole('tab', { name: 'Page 3 of 5' })).toBeVisible();
    });

    test('11.1 — Empty count renders tablist with zero tabs', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.empty,
        PAGINATION_DOTS_ROOT_TESTIDS.empty,
      );
      await expect(root.getByRole('tab')).toHaveCount(0);
    });
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [PaginationDotsTags.functional] }, () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — PaginationDots has no fullWidth prop');
    });

    test('12.2 — At 320px viewport default dots remain operable', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openPaginationDotsTestScenarios(page);
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await expect(root).toBeVisible();
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 8);
    });

    test('12.2b — At 1440px all scenario sections remain visible', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openPaginationDotsTestScenarios(page);
      for (const sectionId of PAGINATION_DOTS_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('12.3 — Dots laid out horizontally in tablist', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      const flexDirection = await root.evaluate((el) => getComputedStyle(el as HTMLElement).flexDirection);
      expect(['row', 'row-reverse']).toContain(flexDirection);
    });
  });

  // ── GROUP 13 — Dark mode ───────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [PaginationDotsTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of PAGINATION_DOTS_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('13.1 — Default dots operable in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 8);
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: PAGINATION_DOTS_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Pagination Dots”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Pagination Dots', level: 1 })).toBeVisible();
    });

    test('Smoke — Default tablist is visible with page 1 selected', async ({ page }) => {
      const root = dotsTablist(
        page,
        PAGINATION_DOTS_ARIA.default,
        PAGINATION_DOTS_ROOT_TESTIDS.default,
      );
      await expect(root).toBeVisible();
      await expectActivePage(root, 1, 8);
    });
  });
});
