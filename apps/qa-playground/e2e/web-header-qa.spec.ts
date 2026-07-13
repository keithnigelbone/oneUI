/**
 * Web Header QA — functional coverage (`WebHeaderQaShowcase.tsx` + Figma Validation tab).
 * Component type: navigation (responsive web header — banner + primary nav).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` WebHeader defects.
 */
import { expect, test } from 'playwright/test';

import {
  FIGMA_COMBO_GRID_TESTID,
  FIGMA_PROPERTY_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  WEB_HEADER_ALL_TESTIDS,
  WEB_HEADER_DATA_SECTIONS,
  WEB_HEADER_FIGMA_PLATFORMS,
  WEB_HEADER_PLAYGROUND_ROUTE,
  WEB_HEADER_RESPONSIVE_WIDTHS,
  WEB_HEADER_ROOT_TESTIDS,
  WEB_HEADER_SECTION_COUNT,
  webHeaderPlatformTestId,
} from './web-header-playground/manifest';
import {
  attachConsoleErrorCollector,
  assertNoConsoleErrors,
  clickNavItem,
  clickPageThemeButton,
  expectActiveNavItem,
  expectAvatarHidden,
  expectAvatarVisible,
  expectEndButtonVisible,
  expectEndIconButtonsVisible,
  expectFocusRingVisible,
  expectLogoHidden,
  expectLogoVisible,
  expectMenuButtonHidden,
  expectMenuButtonVisible,
  expectNavItemHidden,
  expectNavItemVisible,
  expectPrimaryNavMiddle,
  expectPrimaryNavType,
  gotoWebHeaderPlayground,
  openWebHeaderFigmaValidationTab,
  openWebHeaderTestScenarios,
  primaryNavInMount,
  qaLog,
  qaStep,
  scrollToSection,
  searchboxInMount,
  searchInMount,
  WEB_HEADER_TAG_SET,
  webHeaderByTestId,
} from './web-header/web-header-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${WEB_HEADER_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `Web Header playground reachable at ${origin}${WEB_HEADER_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.describe('Functional', { tag: WEB_HEADER_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openWebHeaderTestScenarios(page);
  });

  test('[fn] shows Web Header page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Web Header', level: 1 })).toBeVisible();
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: FIGMA_VALIDATION_TAB })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] theme toggle updates data-mode', async ({ page }) => {
    const before = await page.locator('html').getAttribute('data-mode');
    await clickPageThemeButton(page);
    const after = await page.locator('html').getAttribute('data-mode');
    expect(before, 'data-mode should change after theme toggle').not.toEqual(after);
  });

  test('[fn] default header mount is visible', async ({ page }) => {
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default)).toBeVisible();
  });

  test('[fn] default mount exposes primary navigation landmark', async ({ page }) => {
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default);
    await expect(primaryNavInMount(mount)).toBeVisible();
  });

  test('[fn] default mount — four nav items render', async ({ page }) => {
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default);
    await expectNavItemVisible(mount, 'Home');
    await expectNavItemVisible(mount, 'Products');
    await expectNavItemVisible(mount, 'Solutions');
    await expectNavItemVisible(mount, 'Resources');
  });

  test('[fn] default mount — clicking Products updates active item', async ({ page }) => {
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default);
    await clickNavItem(mount, 'Products');
    await expectActiveNavItem(mount, 'Products');
  });

  test('[fn] homeBar mounts are visible', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-home-bar');
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.homeFluidSearchEnd)).toBeVisible();
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.homeFluidSearchMiddle)).toBeVisible();
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.homeCentredNoSearch)).toBeVisible();
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.homeNoHamburger)).toBeVisible();
  });

  test('[fn] contextBar mounts are visible', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-context-bar');
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.contextNoNav)).toBeVisible();
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.contextWithNav)).toBeVisible();
  });

  test('[fn] searchBar mounts are visible', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-search-bar');
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.searchMiddle)).toBeVisible();
    await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.searchEnd)).toBeVisible();
  });

  test('[fn] start=true shows logo', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-start');
    await expectLogoVisible(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.startTrue));
  });

  test('[fn] start=false hides logo', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-start');
    await expectLogoHidden(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.startFalse));
  });

  test('[fn] middle=fluid data attribute', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-middle');
    await expectPrimaryNavMiddle(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.middleFluid), 'fluid');
  });

  test('[fn] middle=centred data attribute', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-middle');
    await expectPrimaryNavMiddle(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.middleCentred), 'centred');
  });

  test('[fn] primaryNavItems=false hides nav buttons', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-primary-nav');
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.primaryNavFalse);
    await expectNavItemHidden(mount, 'Home');
  });

  test('[fn] primaryNavItems=true shows nav buttons', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-primary-nav');
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.primaryNavTrue);
    await expectNavItemVisible(mount, 'Home');
  });

  test('[fn] end=true shows IconButton actions', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-end');
    await expectEndIconButtonsVisible(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.endTrue));
  });

  test('[fn] end=false hides end actions', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-end');
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.endFalse);
    await expect(mount.getByRole('button', { name: 'Ask HelloJio' })).toHaveCount(0);
  });

  test('[fn] avatar=true shows avatar', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-avatar');
    await expectAvatarVisible(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.avatarTrue));
  });

  test('[fn] avatar=false hides avatar', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-api-avatar');
    await expectAvatarHidden(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.avatarFalse));
  });

  test('[fn] EndActions Button slot renders', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-end-actions');
    await expectEndButtonVisible(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.endButton), 'Sign in');
  });

  test('[fn] EndActions IconButton cluster renders', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-end-actions');
    await expectEndIconButtonsVisible(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.endIconButtons));
  });

  test('[fn] Header.Item slot — nav items clickable', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-header-item');
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.headerItemSlot);
    await clickNavItem(mount, 'Beta');
    await expectActiveNavItem(mount, 'Beta');
  });

  test('[fn] searchBar middle — search landmark visible', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-search-bar');
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.searchMiddle);
    await expect(searchInMount(mount)).toBeVisible();
    await expect(searchboxInMount(mount)).toBeVisible();
  });

  test('[fn] contextBar without nav — no Home button', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-context-bar');
    await expectNavItemHidden(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.contextNoNav), 'Home');
  });

  test('[fn] responsive band — all Figma platform mounts visible', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-responsive');
    for (const width of WEB_HEADER_FIGMA_PLATFORMS) {
      await expect(webHeaderByTestId(page, webHeaderPlatformTestId(width))).toBeVisible();
    }
  });

  test('[fn] platform 360 — hamburger menu button visible', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-responsive');
    await expectMenuButtonVisible(webHeaderByTestId(page, webHeaderPlatformTestId(360)));
  });

  test('[fn] platform 1024 — expanded search input visible', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-responsive');
    const mount = webHeaderByTestId(page, webHeaderPlatformTestId(1024));
    await expect(searchboxInMount(mount)).toBeVisible();
  });

  test('[fn] platform 360 — search hidden on mobile', async ({ page }) => {
    await scrollToSection(page, 'web-header-qa-responsive');
    const mount = webHeaderByTestId(page, webHeaderPlatformTestId(360));
    await expect(searchboxInMount(mount)).toHaveCount(0);
  });

  test('[fn] figma validation tab mounts property × platform grid', async ({ page }) => {
    await openWebHeaderFigmaValidationTab(page);
    await expect(page.getByTestId(FIGMA_PROPERTY_GRID_TESTID)).toBeVisible();
    await expect(page.getByTestId(FIGMA_COMBO_GRID_TESTID)).toBeVisible();
    await expect(page.locator('[data-testrow="type: homeBar"]')).toBeVisible();
    await expect(page.locator('[data-testrow="avatar: false"]')).toBeVisible();
  });

  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — Page loads without console errors', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openWebHeaderTestScenarios(page);
      await assertNoConsoleErrors(errors);
    });

    test('[fn] 1.2 — manifest section count matches showcase bands', async () => {
      expect(WEB_HEADER_SECTION_COUNT).toBe(WEB_HEADER_DATA_SECTIONS.length);
      qaLog('Section manifest', { count: WEB_HEADER_SECTION_COUNT });
    });

    test('[fn] 1.3 — every manifest testid is visible', async ({ page }) => {
      await qaStep('Validate all manifest testids', async () => {
        for (const testId of WEB_HEADER_ALL_TESTIDS) {
          if (testId.startsWith('web-header-platform-')) {
            await scrollToSection(page, 'web-header-qa-responsive');
          }
          await expect(webHeaderByTestId(page, testId)).toBeVisible({ timeout: 60_000 });
        }
      });
    });

    test('[fn] 1.4 — every data-section band is visible', async ({ page }) => {
      for (const section of WEB_HEADER_DATA_SECTIONS) {
        const band = page.locator(`[data-section="${section}"]`);
        await band.scrollIntoViewIfNeeded();
        await expect(band).toBeVisible();
      }
    });
  });

  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — homeBar type attribute', async ({ page }) => {
      await expectPrimaryNavType(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default), 'homeBar');
    });

    test('[fn] 2.2 — contextBar type attribute', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-context-bar');
      await expectPrimaryNavType(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.contextWithNav), 'contextBar');
    });

    test('[fn] 2.3 — searchBar type attribute', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-search-bar');
      await expectPrimaryNavType(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.searchMiddle), 'searchBar');
    });
  });

  test.describe('Group 3 — Negative / edge', () => {
    test('[fn] 3.1 — empty navigation band renders without crash', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-negative');
      await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.negativeEmptyNav)).toBeVisible();
    });

    test('[fn] 3.2 — no end + no avatar band renders', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-negative');
      const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.negativeNoEndNoAvatar);
      await expectAvatarHidden(mount);
      await expect(mount.getByRole('button', { name: 'Ask HelloJio' })).toHaveCount(0);
    });

    test('[fn] 3.3 — searchBar without search input band renders', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-negative');
      await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.negativeSearchbarNoSearch)).toBeVisible();
    });
  });

  test.describe('Group 4 — Responsive', () => {
    test('[fn] 4.1 — mobile layout (360)', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-responsive');
      const mount = webHeaderByTestId(page, webHeaderPlatformTestId(WEB_HEADER_RESPONSIVE_WIDTHS.mobile));
      await expectMenuButtonVisible(mount);
      await expect(searchboxInMount(mount)).toHaveCount(0);
    });

    test('[fn] 4.2 — tablet layout (768)', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-responsive');
      const mount = webHeaderByTestId(page, webHeaderPlatformTestId(WEB_HEADER_RESPONSIVE_WIDTHS.tablet));
      await expectMenuButtonVisible(mount);
    });

    test('[fn] 4.3 — desktop layout (1024)', async ({ page }) => {
      await scrollToSection(page, 'web-header-qa-responsive');
      const mount = webHeaderByTestId(page, webHeaderPlatformTestId(WEB_HEADER_RESPONSIVE_WIDTHS.desktop));
      await expectMenuButtonHidden(mount);
      await expect(searchboxInMount(mount)).toBeVisible();
    });
  });

  test.describe('Group 5 — Keyboard', () => {
    test('[fn] 5.1 — Tab reaches focusable controls in default header', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(tag).not.toBe('BODY');
    });

    test('[fn] 5.2 — focus indicator visible after Tab', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expectFocusRingVisible(page);
    });
  });

  test.describe('Smoke', { tag: WEB_HEADER_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads "Web Header"', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Web Header', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default mount visible', async ({ page }) => {
      await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('[fn] Smoke — goto helper reaches default mount', async ({ page }) => {
      await gotoWebHeaderPlayground(page);
      await expect(webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default)).toBeVisible();
    });
  });
});
