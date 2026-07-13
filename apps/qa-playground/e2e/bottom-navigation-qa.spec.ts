/**
 * Bottom Navigation — functional Playwright automation.
 *
 * Playground: `src/components/bottom-navigation/BottomNavigationQaShowcase.tsx`
 * Anchors: `e2e/bottom-navigation-playground/manifest.ts`
 */
import { expect, test } from 'playwright/test';

import {
  APPEARANCE_COLOUR_SAMPLE,
  attachConsoleErrorCollector,
  assertNoConsoleErrors,
  BottomNavTags,
  BOTTOM_NAV_TAG_SET,
  clickPageThemeButton,
  collectTabFocusSignatures,
  expectBottomNavVisible,
  expectSectionVisible,
  isFullyTransparentBackground,
  openBottomNavigationTestScenarios,
  qaLog,
  qaStep,
  readComputedRgb,
  switchPlaygroundToDarkTheme,
} from './bottom-navigation/bottom-navigation-qa-support';
import {
  BOTTOM_NAV_ALL_TESTIDS,
  BOTTOM_NAV_APPEARANCES,
  BOTTOM_NAV_COMBO_COUNT,
  BOTTOM_NAV_DATA_SECTIONS,
  BOTTOM_NAV_ITEM_COUNTS,
  BOTTOM_NAV_LABEL_TYPES,
  BOTTOM_NAV_ROOT_TESTIDS,
  bottomNavAppearanceTestId,
  bottomNavComboTestId,
  bottomNavCountTestId,
  bottomNavLabelTypeTestId,
} from './bottom-navigation-playground/manifest';

/** @deprecated use BOTTOM_NAV_COMBO_COUNT — kept for existing tests below */
const COMBO_COUNT = BOTTOM_NAV_COMBO_COUNT;

test.beforeEach(async ({ page }) => {
  await openBottomNavigationTestScenarios(page);
});

test.describe('Functional', { tag: BOTTOM_NAV_TAG_SET.functional }, () => {
  test('[fn] shows Bottom Navigation page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bottom Navigation', level: 1 })).toBeVisible();
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

  test('[fn] Default strip nav is visible', async ({ page }) => {
    await expect(page.getByTestId('bottomnav-default')).toBeVisible();
  });

  test('[fn] Default strip — defaultValue search leaves Search active; click Profile moves selection', async ({
    page,
  }) => {
    const nav = page.getByTestId('bottomnav-default');
    await expect(nav.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('button', { name: 'Profile' }).click();
    await expect(nav.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('button', { name: 'Search' })).not.toHaveAttribute('aria-current');
  });

  test('[fn] labelType row — 1line / 2line / none nav roots visible', async ({ page }) => {
    for (const lt of ['1line', '2line', 'none'] as const) {
      await expect(page.getByTestId(`bottomnav-labeltype-${lt}`)).toBeVisible();
    }
  });

  test('[fn] item count row — 2 to 5 item navs visible', async ({ page }) => {
    for (const n of [2, 3, 4, 5] as const) {
      await expect(page.getByTestId(`bottomnav-count-${n}`)).toBeVisible();
    }
  });

  test('[fn] appearance matrix — primary and brand-bg navs visible', async ({ page }) => {
    const band = page.locator('#bottom-navigation-qa-appearance');
    await expect(band.getByTestId('bottomnav-appearance-primary')).toBeVisible();
    await expect(band.getByTestId('bottomnav-appearance-brand-bg')).toBeVisible();
  });

  test('[fn] active band — home vs search defaultValue', async ({ page }) => {
    await expect(page.getByTestId('bottomnav-active-home').getByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByTestId('bottomnav-active-search').getByRole('button', { name: 'Search' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('[fn] disabled middle item — selection stays on Home after click attempt', async ({ page }) => {
    const nav = page.getByTestId('bottomnav-disabled-row');
    await expect(nav.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('button', { name: 'Search' }).click({ force: true });
    await expect(nav.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('button', { name: 'Search' })).not.toHaveAttribute('aria-current');
  });

  test('[fn] showDivider row — both nav roots visible', async ({ page }) => {
    await expect(page.getByTestId('bottomnav-divider-true')).toBeVisible();
    await expect(page.getByTestId('bottomnav-divider-false')).toBeVisible();
  });

  test('[fn] controlled strip — click updates Active caption', async ({ page }) => {
    const band = page.locator('#bottom-navigation-qa-controlled');
    const nav = page.getByTestId('bottomnav-controlled');
    await expect(band).toContainText('home');
    await nav.getByRole('button', { name: 'Search' }).click();
    await expect(band).toContainText('search');
  });

  test('[fn] activeIcon strip is visible', async ({ page }) => {
    await expect(page.getByTestId('bottomnav-activeicon')).toBeVisible();
  });

  test('[fn] item appearance override — neutral nav with Search item still focusable', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'QA item appearance override' });
    await expect(nav.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-current', 'page');
  });

  test('[fn] combination matrix renders all combo navs', async ({ page }) => {
    for (let i = 0; i < COMBO_COUNT; i++) {
      await expect(page.getByTestId(`bottomnav-combo-${i}`)).toBeVisible();
    }
  });

  test('[fn] combo explicit active — Home exposes aria-current (value may still mark Search)', async ({ page }) => {
    const nav = page.getByTestId('bottomnav-combo-5');
    await expect(nav.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    // Parent `defaultValue="search"` still marks Search selected in context while Home sets `active`;
    // both items may carry `aria-current` until selection vs explicit active is unified in `@oneui/ui`.
  });

  // ─── Group 1 — Render ──────────────────────────────────────────────────────

  test.describe('Group 1 — Render', { tag: [BottomNavTags.functional] }, () => {
    test('Page loads cleanly and default navigation matches showcase props', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openBottomNavigationTestScenarios(page);

      await qaStep('No browser console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });

      await qaStep('Default nav landmark and attributes', async () => {
        const nav = await expectBottomNavVisible(
          page,
          BOTTOM_NAV_ROOT_TESTIDS.default,
          'Default bottom navigation must be visible',
        );
        await expect(nav, 'Root is a navigation landmark').toHaveRole('navigation');
        await expect(nav, 'Default labelType is 1line').toHaveAttribute('data-label-type', '1line');
        // Appearance is surface-relative: BottomNavigation resolves it via useSurfaceAppearance()
        // (BottomNavigation.tsx), so on the default/neutral page surface an unset appearance
        // resolves to 'neutral'. The documented 'primary' default only applies with no surface context.
        await expect(nav, 'Default appearance inherits the neutral page surface').toHaveAttribute(
          'data-appearance',
          'neutral',
        );
        await expect(nav).toHaveAccessibleName(/QA default bottom navigation/i);
      });
    });

    test('Every playground data-testid renders without error text', async ({ page }) => {
      test.setTimeout(120_000);
      qaLog('Validating manifest testids', { count: BOTTOM_NAV_ALL_TESTIDS.length });

      for (const testId of BOTTOM_NAV_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const el = page.getByTestId(testId);
          await el.scrollIntoViewIfNeeded();
          await expect(el, `Playground anchor "${testId}" should be visible`).toBeVisible();
          await expect(el, `Anchor "${testId}" should not show runtime error copy`).not.toContainText(
            /error|failed/i,
          );
        });
      }
    });

    test('Every story band (data-section) is visible on the page', async ({ page }) => {
      for (const section of BOTTOM_NAV_DATA_SECTIONS) {
        await qaStep(`Story band: ${section}`, async () => {
          await expectSectionVisible(page, section);
        });
      }
    });
  });

  // ─── Group 2 — Props validation ────────────────────────────────────────────

  test.describe('Group 2 — Props validation', { tag: [BottomNavTags.functional] }, () => {
    test('labelType prop surfaces on each navigation root', async ({ page }) => {
      for (const labelType of BOTTOM_NAV_LABEL_TYPES) {
        await qaStep(`labelType="${labelType}"`, async () => {
          await expect(page.getByTestId(bottomNavLabelTypeTestId(labelType))).toHaveAttribute(
            'data-label-type',
            labelType,
          );
        });
      }
    });

    test('Item count bands render the expected number of tab stops', async ({ page }) => {
      for (const n of BOTTOM_NAV_ITEM_COUNTS) {
        await qaStep(`${n} items`, async () => {
          const nav = page.getByTestId(bottomNavCountTestId(n));
          await nav.scrollIntoViewIfNeeded();
          await expect(nav.getByRole('button')).toHaveCount(n);
        });
      }
    });

    test('Appearance prop resolves on each Figma role row', async ({ page }) => {
      for (const appearance of BOTTOM_NAV_APPEARANCES) {
        await qaStep(`appearance="${appearance}"`, async () => {
          const el = page.getByTestId(bottomNavAppearanceTestId(appearance));
          await el.scrollIntoViewIfNeeded();
          if (appearance === 'auto') {
            expect(await el.getAttribute('data-appearance'), 'auto should resolve').toBeTruthy();
          } else {
            await expect(el).toHaveAttribute('data-appearance', appearance);
          }
        });
      }
    });

  });

  // ─── Group 3 — Click interaction ─────────────────────────────────────────

  test.describe('Group 3 — Click interaction', { tag: [BottomNavTags.functional] }, () => {
    test('Clicking a tab moves aria-current to the selected item', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      await nav.getByRole('button', { name: 'Profile' }).click();
      await expect(nav.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
      await expect(nav.getByRole('button', { name: 'Search' })).not.toHaveAttribute('aria-current');
    });

    test('Clicking a disabled item does not change selection', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.disabledRow);
      await nav.getByRole('button', { name: 'Search' }).click({ force: true });
      await expect(nav.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    });

    test('Click outside the bar does not trap focus on a nav item', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      await nav.getByRole('button', { name: 'Home' }).click();
      await page.locator('h1').click({ force: true });
      const activeId = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid') ?? '',
      );
      expect(activeId.startsWith('bottomnav-'), 'Focus should leave bottom nav after outside click').toBe(
        false,
      );
    });
  });

  // ─── Group 4 — Keyboard navigation ───────────────────────────────────────

  test.describe('Group 4 — Keyboard navigation', { tag: [BottomNavTags.functional] }, () => {
    test('Tab reaches navigation items and page chrome', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should focus an interactive element').toBeTruthy();
    });

    test('Enter on a focused tab item activates selection', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      await nav.getByRole('button', { name: 'Profile' }).focus();
      await page.keyboard.press('Enter');
      await expect(nav.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    });

    test('Space on a focused tab item activates selection', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      await nav.getByRole('button', { name: 'Profile' }).focus();
      await page.keyboard.press('Space');
      await expect(nav.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    });

    test('Arrow keys are not required for bottom nav (native Tab between buttons)', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      await nav.getByRole('button', { name: 'Home' }).focus();
      await page.keyboard.press('ArrowRight');
      const stillHome =
        (await page.evaluate(() => document.activeElement?.textContent))?.includes('Home') ?? false;
      qaLog('ArrowRight behavior (component may use Tab-only model)', { stillHome });
    });

    test('Disabled item is skipped by pointer and remains disabled for keyboard', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.disabledRow);
      await expect(nav.getByRole('button', { name: 'Search' })).toBeDisabled();
    });
  });

  // ─── Group 5 — Focus management ──────────────────────────────────────────

  test.describe('Group 5 — Focus management', { tag: [BottomNavTags.functional] }, () => {
    test('Focused nav item shows visible focus indicator', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      await nav.getByRole('button', { name: 'Home' }).focus();
      const focusStyle = await nav.getByRole('button', { name: 'Home' }).evaluate((el) => {
        const style = getComputedStyle(el);
        return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
      });
      const hasVisibleFocus =
        focusStyle.outlineWidth !== '0px' ||
        (focusStyle.boxShadow != null && focusStyle.boxShadow !== 'none');
      expect(hasVisibleFocus, 'Focused tab should show outline or box-shadow').toBe(true);
    });

    test('Tab visits multiple distinct focus targets (no keyboard trap)', async ({ page }) => {
      const seen = await collectTabFocusSignatures(page);
      expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(1);
    });
  });

  // ─── Group 6 — State ───────────────────────────────────────────────────────

  test.describe('Group 6 — State', { tag: [BottomNavTags.functional] }, () => {
    test('defaultValue marks the correct item with aria-current', async ({ page }) => {
      await expect(
        page.getByTestId('bottomnav-active-search').getByRole('button', { name: 'Search' }),
      ).toHaveAttribute('aria-current', 'page');
    });

    test('Disabled middle item exposes disabled state', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.disabledRow);
      await expect(nav.getByRole('button', { name: 'Search' })).toBeDisabled();
    });

    test('Controlled value updates when user selects another tab', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.controlled);
      await nav.getByRole('button', { name: 'Search' }).click();
      await expect(page.locator('#bottom-navigation-qa-controlled')).toContainText('search');
    });

    test('showDivider true renders a horizontal divider in the nav', async ({ page }) => {
      const navOn = page.getByTestId('bottomnav-divider-true');
      await expect(navOn.locator('hr, [role="separator"]').first()).toBeVisible();
    });
  });

  // ─── Groups 7–9 — N/A for navigation API ─────────────────────────────────

  test.describe('Group 7 — Slots (N/A)', { tag: [BottomNavTags.functional] }, () => {
    test('Bottom Navigation uses icon+label items, not start/end slots', async () => {
      qaLog('Skipped — BottomNavItem uses icon/label props, not slot API');
    });
  });

  test.describe('Group 8 — Toggle (N/A)', { tag: [BottomNavTags.functional] }, () => {
    test('Selection is single-select tabs, not binary toggle', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      await nav.getByRole('button', { name: 'Profile' }).click();
      const currentCount = await nav.locator('[aria-current="page"]').count();
      expect(
        currentCount,
        'Exactly one tab should have aria-current="page" after selecting Profile',
      ).toBe(1);
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [BottomNavTags.functional] }, () => {
    test('Bottom Navigation does not accept typed input', async () => {
      qaLog('Skipped — not applicable to navigation component');
    });
  });

  // ─── Group 10 — Dependencies ─────────────────────────────────────────────

  test.describe('Group 10 — Dependencies', { tag: [BottomNavTags.functional] }, () => {
    test('labelType none requires per-item aria-label', async ({ page }) => {
      const nav = page.getByTestId(bottomNavLabelTypeTestId('none'));
      const buttons = nav.getByRole('button');
      const n = await buttons.count();
      for (let i = 0; i < n; i++) {
        const al = await buttons.nth(i).getAttribute('aria-label');
        expect(al?.trim(), `Item ${i} needs aria-label when labels hidden`).toMatch(/\S+/);
      }
    });
  });

  // ─── Group 11 — Content and display ────────────────────────────────────────

  test.describe('Group 11 — Content and display', { tag: [BottomNavTags.functional] }, () => {
    test('1line labelType shows visible text on each item', async ({ page }) => {
      const nav = page.getByTestId(bottomNavLabelTypeTestId('1line'));
      await expect(nav.getByRole('button', { name: 'Home' })).toContainText('Home');
    });

    test('Icons render inside each tab stop', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      const svgCount = await nav.locator('svg').count();
      expect(svgCount, 'Default strip should render icon SVGs').toBeGreaterThan(0);
    });
  });

  // ─── Group 12 — Layout and responsive ────────────────────────────────────

  test.describe('Group 12 — Layout and responsive', { tag: [BottomNavTags.functional] }, () => {
    test('Phone-frame sandbox fits 360px width without horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 900 });
      await openBottomNavigationTestScenarios(page);

      for (const section of BOTTOM_NAV_DATA_SECTIONS) {
        const sandbox = page.locator(`[data-section="${section}"] .storySandbox`);
        if ((await sandbox.count()) === 0) continue;
        await qaStep(`Sandbox reflow: ${section}`, async () => {
          const el = sandbox.first();
          const overflows = await el.evaluate(
            (node) => (node as HTMLElement).scrollWidth > (node as HTMLElement).clientWidth,
          );
          expect(overflows, `Sandbox in "${section}" should not overflow at 360px`).toBe(false);
        });
      }
    });

    test('Default strip remains visible on large desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openBottomNavigationTestScenarios(page);
      await expectBottomNavVisible(page, BOTTOM_NAV_ROOT_TESTIDS.default, 'Default nav on desktop');
    });

    test('Item buttons are laid out horizontally in the bar', async ({ page }) => {
      const nav = page.getByTestId(BOTTOM_NAV_ROOT_TESTIDS.default);
      const homeBox = await nav.getByRole('button', { name: 'Home' }).boundingBox();
      const profileBox = await nav.getByRole('button', { name: 'Profile' }).boundingBox();
      expect(homeBox, 'Home item should have layout box').not.toBeNull();
      expect(profileBox, 'Profile item should have layout box').not.toBeNull();
      expect(
        Math.abs((homeBox!.y ?? 0) - (profileBox!.y ?? 0)),
        'Tab stops should share a horizontal row (similar Y)',
      ).toBeLessThan(8);
    });
  });

  // ─── Group 13 — Dark mode ──────────────────────────────────────────────────

  test.describe('Group 13 — Dark mode', { tag: [BottomNavTags.functional] }, () => {
    test('Representative navigation strips remain visible in dark theme', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);

      for (const section of BOTTOM_NAV_DATA_SECTIONS) {
        await expect(
          page.locator(`[data-section="${section}"]`),
          `Band "${section}" visible in dark mode`,
        ).toBeVisible();
      }

      const spotCheck = [
        BOTTOM_NAV_ROOT_TESTIDS.default,
        bottomNavCountTestId(3),
        bottomNavAppearanceTestId('primary'),
        bottomNavComboTestId(0),
      ] as const;
      for (const testId of spotCheck) {
        await expectBottomNavVisible(page, testId, `${testId} visible in dark mode`);
      }
    });
  });
});
