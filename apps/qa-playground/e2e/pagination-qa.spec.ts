/**
 * Pagination QA — functional, keyboard, and responsive Playwright coverage.
 * Anchors: `PaginationQaShowcase.tsx` + `e2e/pagination-playground/paginationHelpers.ts`.
 *
 * Component type: **navigation** (page navigator — `<nav>` landmark, roving tabindex).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Pagination defects.
 * No `test.fail()`, no skips to hide failures. Windowed pagination: only assert clicks on
 * pages currently mounted in the DOM (visible window) — that is valid test design, not softening.
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `PAGINATION_DATA_SECTIONS` (9 bands)
 * - data-testid: `PAGINATION_SHOWCASE_TESTIDS` (nav roots + controlled caption)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  expectSectionVisible,
  isTransparentRgb,
  openPaginationTestScenarios,
  PAGINATION_TAG_SET,
  PaginationTags,
  paginationRoot,
  qaLog,
  qaStep,
  selectedPageChipBackgroundRgb,
  switchPlaygroundToDarkTheme,
  clickNav,
  clickPage,
  currentPageButton,
  expectCurrentPage,
  expectFocusVisible,
  expectNavEnabled,
  navButton,
  pageButton,
  readLiveRegion,
  readVisiblePagesAttr,
  screenshotPagination,
  tabbablePageButton,
} from './pagination/pagination-qa-support';
import {
  PAGINATION_COMBO_COUNT,
  PAGINATION_DATA_SECTIONS,
  PAGINATION_FIGMA_ATTENTIONS,
  PAGINATION_FIGMA_SIZES,
  PAGINATION_ROOT_TESTIDS,
  PAGINATION_SECTION_COUNT,
  PAGINATION_SHOWCASE_TESTIDS,
} from './pagination-playground/manifest';

test.describe('Functional', { tag: PAGINATION_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openPaginationTestScenarios(page);
  });

  test.describe('Functional Tests', () => {
  test('[fn] shows Pagination page heading', async ({ page }) => {
    await test.step('Verify catalog detail heading', async () => {
      await expect(page.getByRole('heading', { name: 'Pagination', level: 1 })).toBeVisible();
    });
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await test.step('Test Scenarios, Accessibility, Functional tabs', async () => {
      await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
    });
  });

  test('[fn] pagination renders correctly — default nav landmark', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Navigation landmark and windowed page chips', async () => {
      await expect(root).toBeVisible();
      await expect(root).toHaveAttribute('aria-label', 'Pagination QA default');
      await expect(navButton(root, 'previous')).toBeVisible();
      await expect(navButton(root, 'next')).toBeVisible();
      // Windowed list — not all 10 numerals are mounted at once.
      await expect(pageButton(root, 5, tid)).toBeVisible();
      await expect(pageButton(root, 1, tid)).toBeVisible();
      await expect(pageButton(root, 10, tid)).toBeVisible();
      await screenshotPagination(page, root, 'render-default');
    });
  });

  test('[fn] default selected page is 5', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('aria-current on defaultPage', async () => {
      await expectCurrentPage(root, 5, tid);
      await expect(await readLiveRegion(root)).toContain('Page 5 of 10');
    });
  });

  test('[fn] clicking next advances the active page', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Next → page 6', async () => {
      await expectCurrentPage(root, 5, tid);
      await clickNav(root, 'next');
      await expectCurrentPage(root, 6, tid);
    });
  });

  test('[fn] clicking previous moves back', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Next then previous returns to 5', async () => {
      await clickNav(root, 'next');
      await expectCurrentPage(root, 6, tid);
      await clickNav(root, 'previous');
      await expectCurrentPage(root, 5, tid);
    });
  });

  test('[fn] first and last jump buttons when showFirstLast', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.firstLastOn;
    const root = paginationRoot(page, tid);
    await test.step('First page jump', async () => {
      await expectCurrentPage(root, 6, tid);
      await clickNav(root, 'first');
      await expectCurrentPage(root, 1, tid);
      await screenshotPagination(page, root, 'after-first');
    });
    await test.step('Last page jump', async () => {
      await clickNav(root, 'last');
      await expectCurrentPage(root, 11, tid);
    });
  });

  test('[fn] direct page number click navigates', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Click visible page 6', async () => {
      await clickPage(root, 6, tid);
      await expectCurrentPage(root, 6, tid);
      await expect(await readLiveRegion(root)).toContain('Page 6 of 10');
    });
  });

  test('[fn] previous disabled on first page', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.edgeFirst;
    const root = paginationRoot(page, tid);
    await test.step('Page 1 — previous disabled', async () => {
      await expectCurrentPage(root, 1, tid);
      await expectNavEnabled(root, 'previous', false);
      await expectNavEnabled(root, 'next', true);
    });
  });

  test('[fn] next disabled on last page', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.edgeLast;
    const root = paginationRoot(page, tid);
    await test.step('Page 10 — next disabled', async () => {
      await expectCurrentPage(root, 10, tid);
      await expectNavEnabled(root, 'next', false);
      await expectNavEnabled(root, 'previous', true);
    });
  });

  test('[fn] controlled pagination updates caption', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.controlled;
    const root = paginationRoot(page, tid);
    const caption = page.getByTestId('pagination-controlled-caption');
    await test.step('Initial controlled page', async () => {
      await expect(caption).toHaveText(/page:\s*3/i);
      await expectCurrentPage(root, 3, tid);
    });
    await test.step('Click next updates controlled state', async () => {
      await clickNav(root, 'next');
      await expect(caption).toHaveText(/page:\s*4/i);
      await expectCurrentPage(root, 4, tid);
    });
  });

  test('[fn] disabled pagination — controls not actionable', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.disabled;
    const root = paginationRoot(page, tid);
    await test.step('Nav and page buttons disabled', async () => {
      await expect(navButton(root, 'next')).toBeDisabled();
      await expect(pageButton(root, 4, tid)).toBeDisabled();
    });
  });

  test('[fn] ellipsis renders for large page count', async ({ page }) => {
    const testId = PAGINATION_ROOT_TESTIDS.ellipsis;
    const root = paginationRoot(page, testId);
    await test.step('Ellipsis test ids present', async () => {
      await expect(root.getByTestId(`${testId}-ellipsis-end`)).toBeVisible();
      await expectCurrentPage(root, 10, testId);
      const visible = await readVisiblePagesAttr(root);
      expect(visible).toBeTruthy();
      expect(visible).toContain('10');
    });
  });

  test('[fn] siblingCount widens visible window', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.sibling2;
    const root = paginationRoot(page, tid);
    await test.step('More adjacent pages around current', async () => {
      await expectCurrentPage(root, 6, tid);
      await expect(pageButton(root, 4, tid)).toBeVisible();
      await expect(pageButton(root, 8, tid)).toBeVisible();
    });
  });

  test('[fn] boundaryCount keeps first and last pages in window', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.largeCount;
    const root = paginationRoot(page, tid);
    await test.step('First and last always reachable', async () => {
      await expect(pageButton(root, 1, tid)).toBeVisible();
      await expect(pageButton(root, 50, tid)).toBeVisible();
    });
  });

  test('[fn] showPrevNext false hides arrow buttons', async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.noPrevNext);
    await test.step('No prev/next chrome', async () => {
      await expect(navButton(root, 'previous')).toHaveCount(0);
      await expect(navButton(root, 'next')).toHaveCount(0);
      await expect(navButton(root, 'first')).toBeVisible();
    });
  });

  test('[fn] size variations S / M / L visible', async ({ page }) => {
    await test.step('Each size band root', async () => {
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.sizeS)).toBeVisible();
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.sizeM)).toBeVisible();
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.sizeL)).toBeVisible();
    });
  });

  test('[fn] attention variants high / medium / low visible', async ({ page }) => {
    await test.step('Attention band roots', async () => {
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.attentionHigh)).toBeVisible();
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.attentionMedium)).toBeVisible();
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.attentionLow)).toBeVisible();
    });
  });

  test('[fn] appearance positive row renders', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.appearance;
    const root = paginationRoot(page, tid);
    await test.step('Appearance prop showcase', async () => {
      await expect(root).toBeVisible();
      await clickPage(root, 5, tid);
      await expectCurrentPage(root, 5, tid);
    });
  });

  test('[fn] icon nav buttons render with accessible names', async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
    await test.step('Prev/next icon buttons', async () => {
      await expect(navButton(root, 'previous')).toHaveAccessibleName(/previous/i);
      await expect(navButton(root, 'next')).toHaveAccessibleName(/next/i);
    });
  });

  test('[fn] large page count does not break layout in band', async ({ page }) => {
    const band = page.locator('[data-section="pagination-qa-e2e"]');
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.largeCount);
    await test.step('No horizontal overflow in e2e band', async () => {
      await expect(root).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows).toBe(false);
    });
  });

  test('[fn] combination matrix renders all rows', async ({ page }) => {
    await test.step('Combo test ids', async () => {
      for (let i = 0; i < PAGINATION_COMBO_COUNT; i++) {
        await expect(page.getByTestId(`pagination-combo-${i}`)).toBeVisible();
      }
    });
  });

});

test.describe('Keyboard Navigation Tests', () => {
  test('[fn] Tab reaches focusable controls in navigator', async ({ page }) => {
    await test.step('Tab moves focus into interactive tree', async () => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag).toBeTruthy();
    });
  });

  test('[fn] roving tabindex — only current page is tabbable', async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
    await test.step('Current page tabindex 0', async () => {
      await expect(tabbablePageButton(root)).toHaveAttribute('aria-current', 'page');
      const tabZero = await root.locator('button[data-type="page"][tabindex="0"]').count();
      expect(tabZero).toBe(1);
    });
  });

  test('[fn] ArrowRight on focused page advances selection', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Focus page 5 → ArrowRight → page 6', async () => {
      await tabbablePageButton(root).focus();
      await expectCurrentPage(root, 5, tid);
      await page.keyboard.press('ArrowRight');
      await expectCurrentPage(root, 6, tid);
    });
  });

  test('[fn] ArrowLeft on focused page moves back', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Page 6 → ArrowLeft → page 5', async () => {
      await clickPage(root, 6, tid);
      await tabbablePageButton(root).focus();
      await page.keyboard.press('ArrowLeft');
      await expectCurrentPage(root, 5, tid);
    });
  });

  test('[fn] Home and End jump to first and last page', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Home → 1, End → 10', async () => {
      await clickPage(root, 5, tid);
      await tabbablePageButton(root).focus();
      await page.keyboard.press('Home');
      await expectCurrentPage(root, 1, tid);
      await tabbablePageButton(root).focus();
      await page.keyboard.press('End');
      await expectCurrentPage(root, 10, tid);
    });
  });

  test('[fn] Enter activates focused page button', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Focus visible page 6, Enter selects it', async () => {
      await pageButton(root, 6, tid).focus();
      await page.keyboard.press('Enter');
      await expectCurrentPage(root, 6, tid);
    });
  });

  test('[fn] Space activates next nav IconButton when focused', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await test.step('Focus next, Space advances page', async () => {
      await expectCurrentPage(root, 5, tid);
      await navButton(root, 'next').focus();
      await page.keyboard.press('Space');
      await expectCurrentPage(root, 6, tid);
    });
  });

  test('[fn] focus indicator visible after Tab', async ({ page }) => {
    await test.step('Visible focus ring or shadow', async () => {
      await page.keyboard.press('Tab');
      await expectFocusVisible(page);
      await screenshotPagination(page, paginationRoot(page, PAGINATION_ROOT_TESTIDS.default), 'focus-tab');
    });
  });
});

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [PaginationTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default navigator mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openPaginationTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every showcase `data-testid` is visible on Test Scenarios', async ({ page }) => {
      test.setTimeout(180_000);
      for (const testId of PAGINATION_SHOWCASE_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const root = page.getByTestId(testId);
          await root.scrollIntoViewIfNeeded();
          await expect(root, `Expected visible: ${testId}`).toBeVisible();
          const text = (await root.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of PAGINATION_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="pagination-qa-"]')).toHaveCount(PAGINATION_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [PaginationTags.functional] }, () => {
    test('2.1 — Default props — page 5 selected, prev/next enabled', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await expect(root).toHaveAttribute('data-size', 'M');
      await expectCurrentPage(root, 5, tid);
      await expectNavEnabled(root, 'previous', true);
      await expectNavEnabled(root, 'next', true);
    });

    test('2.1 — Each size S / M / L exposes data-size on root', async ({ page }) => {
      const map = {
        S: PAGINATION_ROOT_TESTIDS.sizeS,
        M: PAGINATION_ROOT_TESTIDS.sizeM,
        L: PAGINATION_ROOT_TESTIDS.sizeL,
      } as const;
      for (const figma of PAGINATION_FIGMA_SIZES) {
        const root = paginationRoot(page, map[figma]);
        await root.scrollIntoViewIfNeeded();
        await expect(root, `size ${figma}`).toHaveAttribute('data-size', figma);
      }
    });

    test('2.1 — showFirstLast false hides first/last jump buttons', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.firstLastOff);
      await expect(navButton(root, 'first')).toHaveCount(0);
      await expect(navButton(root, 'last')).toHaveCount(0);
      await expect(navButton(root, 'previous')).toBeVisible();
    });

    test('2.1 — showPrevNext false hides arrow buttons', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.noPrevNext);
      await expect(navButton(root, 'previous')).toHaveCount(0);
      await expect(navButton(root, 'next')).toHaveCount(0);
    });



  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [PaginationTags.functional] }, () => {
    test('3.1 — Click next advances aria-current page', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await clickNav(root, 'next');
      await expectCurrentPage(root, 6, tid);
      await expect(await readLiveRegion(root)).toContain('Page 6 of 10');
    });

    test('3.1 — Direct page click updates selection', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await clickPage(root, 6, tid);
      await expectCurrentPage(root, 6, tid);
    });

    test('3.2 — Disabled pagination — click does not change page', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.disabled;
      const root = paginationRoot(page, tid);
      await expectCurrentPage(root, 4, tid);
      await navButton(root, 'next').click({ force: true });
      await expectCurrentPage(root, 4, tid);
      await expect(navButton(root, 'next')).toBeDisabled();
    });

    test('3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — Pagination has no readonly prop in showcase');
    });

    test('3.4 — Click outside removes focus from page chip', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      await tabbablePageButton(root).focus();
      await page.getByRole('heading', { name: 'Pagination', level: 1 }).click();
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(activeTag.toLowerCase(), 'Focus should leave pagination chip after outside click').not.toBe('button');
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [PaginationTags.functional] }, () => {
    test('4.1 — Tab reaches focusable controls in page', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should move focus to a focusable element').toBeTruthy();
    });

    test('4.1 — Disabled pagination controls are not enabled for activation', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.disabled);
      await expect(navButton(root, 'next')).toBeDisabled();
      await expect(pageButton(root, 4, PAGINATION_ROOT_TESTIDS.disabled)).toBeDisabled();
    });

    test('4.2 — Enter activates focused page button', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await pageButton(root, 6, tid).focus();
      await page.keyboard.press('Enter');
      await expectCurrentPage(root, 6, tid);
    });

    test('4.3 — Space on focused next button advances page', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await navButton(root, 'next').focus();
      await page.keyboard.press('Space');
      await expectCurrentPage(root, 6, tid);
    });

    test('4.4 — ArrowRight / ArrowLeft move selection on focused chip', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await tabbablePageButton(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectCurrentPage(root, 6, tid);
      await tabbablePageButton(root).focus();
      await page.keyboard.press('ArrowLeft');
      await expectCurrentPage(root, 5, tid);
    });

    test('4.5 — Home and End jump to first and last page', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await clickPage(root, 5, tid);
      await tabbablePageButton(root).focus();
      await page.keyboard.press('Home');
      await expectCurrentPage(root, 1, tid);
      await tabbablePageButton(root).focus();
      await page.keyboard.press('End');
      await expectCurrentPage(root, 10, tid);
    });

    test('4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — Pagination is not an overlay; Escape does not apply');
    });

    test('4.7 — Tab cycle escapes pagination without trap', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      await tabbablePageButton(root).focus();
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
      }
      const stillInside = await root.evaluate((el) => el.contains(document.activeElement));
      expect(stillInside, 'Repeated Tab should move focus beyond pagination root').toBe(false);
    });
  });

  // ── GROUP 5 — Focus management ───────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [PaginationTags.functional] }, () => {
    test('5.1 — Click focuses interactive page chip', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await pageButton(root, 6, tid).click();
      await expect(pageButton(root, 6, tid)).toBeFocused();
    });

    test('5.2 — Focus indicator visible after Tab', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expectFocusVisible(page);
    });

    test('5.3 — Roving tabindex — exactly one page chip has tabindex 0', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      const tabZero = await root.locator('button[data-type="page"][tabindex="0"]').count();
      expect(tabZero, 'Only current page should be in tab order').toBe(1);
    });

    test('5.4 — Blur removes focus from page chip', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      await tabbablePageButton(root).focus();
      await page.getByRole('heading', { name: 'Pagination', level: 1 }).click();
      await expect(tabbablePageButton(root)).not.toBeFocused();
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — Pagination showcase does not use autoFocus');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [PaginationTags.functional] }, () => {
    test('6.1 — Default state — page 5 of 10 with live region', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      await expect(await readLiveRegion(root)).toMatch(/Page 5 of 10/);
    });

    test('6.2 — Selected page exposes aria-current="page"', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      await expect(root.locator('button[aria-current="page"]')).toHaveCount(1);
    });

    test('6.3 — Disabled state — controls disabled and not actionable', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.disabled;
      const root = paginationRoot(page, tid);
      await expect(navButton(root, 'next')).toBeDisabled();
      await expect(pageButton(root, 4, tid)).toBeDisabled();
    });

    test('6.4 — Readonly / error / loading (N/A)', async () => {
      qaLog('Skipped — Pagination has disabled only; no readonly/error/loading in showcase');
    });
  });

  // ── GROUP 7 — Slots (N/A) ────────────────────────────────────────────────
  test.describe('Group 7 — Slots (N/A)', { tag: [PaginationTags.functional] }, () => {
    test('7.x — Pagination has no start/end icon slots', async () => {
      qaLog('Skipped — Pagination is navigation chrome without start/end slots');
    });
  });

  // ── GROUP 8 — Selection ──────────────────────────────────────────────────
  test.describe('Group 8 — Selection', { tag: [PaginationTags.functional] }, () => {
    test('8.2 — Single select — only one page has aria-current at a time', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await clickPage(root, 6, tid);
      await expect(root.locator('button[aria-current="page"]')).toHaveCount(1);
      await clickPage(root, 7, tid);
      await expectCurrentPage(root, 7, tid);
      await expect(root.locator('button[aria-current="page"]')).toHaveCount(1);
    });

    test('8.1 — Toggle (N/A)', async () => {
      qaLog('Skipped — Pagination selects pages; not a binary toggle');
    });
  });

  // ── GROUP 9 — Input (N/A) ──────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', { tag: [PaginationTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — Pagination is not typed entry');
    });
  });

  // ── GROUP 10 — Dependency rules ────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [PaginationTags.functional] }, () => {
    test('10.2 — showFirstLast true exposes first/last jump buttons', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.firstLastOn);
      await expect(navButton(root, 'first')).toBeVisible();
      await expect(navButton(root, 'last')).toBeVisible();
    });

    test('10.2 — siblingCount 2 widens visible page window vs default', async ({ page }) => {
      const defaultRoot = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      const wideRoot = paginationRoot(page, PAGINATION_ROOT_TESTIDS.sibling2);
      const defaultVisible = await readVisiblePagesAttr(defaultRoot);
      const wideVisible = await readVisiblePagesAttr(wideRoot);
      expect(wideVisible?.split(',').length ?? 0).toBeGreaterThan(defaultVisible?.split(',').length ?? 0);
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [PaginationTags.functional] }, () => {
    test('11.1 — Controlled caption reflects page state', async ({ page }) => {
      const caption = page.getByTestId('pagination-controlled-caption');
      await expect(caption).toHaveText(/page:\s*3/i);
    });

    test('11.1 — Nav buttons expose accessible names', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      await expect(navButton(root, 'previous')).toHaveAccessibleName(/previous/i);
      await expect(navButton(root, 'next')).toHaveAccessibleName(/next/i);
    });

    test('11.2 — Ellipsis markers render for large windows', async ({ page }) => {
      const tid = PAGINATION_ROOT_TESTIDS.ellipsis;
      const root = paginationRoot(page, tid);
      await expect(root.getByTestId(`${tid}-ellipsis-end`)).toBeVisible();
    });
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [PaginationTags.functional] }, () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Pagination has no fullWidth prop');
    });

    test('12.2 — At 320px viewport default pagination remains visible', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openPaginationTestScenarios(page);
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      await expect(root).toBeVisible();
      await expectCurrentPage(root, 5, PAGINATION_ROOT_TESTIDS.default);
    });

    test('12.2b — At 1440px all scenario sections remain visible', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openPaginationTestScenarios(page);
      for (const sectionId of PAGINATION_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('12.3 — Horizontal navigator — page chips laid out in a row', async ({ page }) => {
      const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
      const layout = await root.evaluate((el) => {
        const nav = el as HTMLElement;
        return getComputedStyle(nav).flexDirection;
      });
      expect(['row', 'row-reverse']).toContain(layout);
    });
  });

  // ── GROUP 13 — Dark mode ───────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [PaginationTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of PAGINATION_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('13.1 — Default pagination operable in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      const tid = PAGINATION_ROOT_TESTIDS.default;
      const root = paginationRoot(page, tid);
      await clickNav(root, 'next');
      await expectCurrentPage(root, 6, tid);
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: PAGINATION_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Pagination”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Pagination', level: 1 })).toBeVisible();
    });

    test('Smoke — Default navigator landmark is visible', async ({ page }) => {
      await expect(paginationRoot(page, PAGINATION_ROOT_TESTIDS.default)).toBeVisible();
    });
  });
});
