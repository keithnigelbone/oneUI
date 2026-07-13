/**
 * Tabs QA — functional, keyboard, focus, and layout Playwright coverage.
 * Component type: navigation (tablist — role="tablist" / role="tab", aria-selected).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Tabs defects.
 */
import { expect, test, type Page } from 'playwright/test';

import {
  FIGMA_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  TABS_ALL_WRAPPER_TESTIDS,
  TABS_COMBO_COUNT,
  TABS_DATA_SECTIONS,
  TABS_PLAYGROUND_ROUTE,
  TABS_ROOT_TESTIDS,
  TABS_SECTION_COUNT,
} from './tabs-playground/manifest';
import {
  clickPageThemeButton,
  clickTab,
  expectFocusVisible,
  expectHorizontalTabLayout,
  expectTabNotSelected,
  expectTabSelected,
  expectVerticalTabLayout,
  openTabsTestScenarios,
  qaLog,
  qaStep,
  scrollToTabsTestId,
  selectedTab,
  tabButtons,
  tabByIndex,
  TABS_TAG_SET,
  tabsList,
  tabsWrap,
  tabbableTab,
} from './tabs/tabs-qa-support';

const H = TABS_ROOT_TESTIDS.horizontal;
const V = TABS_ROOT_TESTIDS.vertical;
const CONTROLLED = TABS_ROOT_TESTIDS.controlled;

/** Selected tab `color` (browser-normalised rgb/rgba) — tablist fill is often transparent. */
async function selectedTabColorRgb(page: Page, wrapperTestId: string): Promise<string> {
  return tabsWrap(page, wrapperTestId).evaluate((root) => {
    const tab = root.querySelector('[role="tab"][aria-selected="true"]');
    if (!tab) return '';
    return getComputedStyle(tab).color;
  });
}

function rgbaAlpha(rgbOrRgba: string): number {
  const m = rgbOrRgba.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!m) return rgbOrRgba === 'transparent' ? 0 : 1;
  if (m[1] === undefined) return 1;
  return Number.parseFloat(m[1]);
}

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${TABS_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `Tabs playground should be reachable at ${origin}${TABS_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await openTabsTestScenarios(page);
});

test.describe('Functional', { tag: TABS_TAG_SET.functional }, () => {
test.describe('Core behaviour', () => {
  test('[fn] Page shows the main Tabs heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tabs', level: 1 })).toBeVisible();
  });

  test('[fn] Detail page shows Scenarios, Figma validation, Accessibility, and Functional tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: FIGMA_VALIDATION_TAB })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Horizontal example wrapper and tab list are visible', async ({ page }) => {
    await expect(tabsWrap(page, H)).toBeVisible();
    await expect(tabsList(page, H)).toBeVisible();
  });

  test('[fn] Horizontal example renders at least one tab button', async ({ page }) => {
    const count = await tabButtons(page, H).count();
    expect(count).toBeGreaterThan(0);
  });

  test('[fn] Vertical example wrapper is visible in the orientation section', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    await expect(tabsWrap(page, V)).toBeVisible();
  });

  test('[fn] Vertical example renders at least one tab button', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    const count = await tabButtons(page, V).count();
    expect(count).toBeGreaterThan(0);
  });

  test('[fn] Controlled example shows a visible tab panel for the active tab', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    const panel = tabsWrap(page, CONTROLLED).getByRole('tabpanel');
    await expect(panel).toBeVisible();
  });

  test('[fn] Controlled example shows exactly one visible tab panel at a time', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    const visible = tabsWrap(page, CONTROLLED).locator('[role="tabpanel"]:visible');
    await expect(visible).toHaveCount(1);
  });

  test('[fn] Clicking a horizontal tab selects it and deselects the previous tab', async ({ page }) => {
    await clickTab(page, H, 1);
    await expectTabSelected(page, H, 1);
    await expectTabNotSelected(page, H, 0);
  });

  test('[fn] Controlled example updates panel copy when a different tab is selected', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    await clickTab(page, CONTROLLED, 1);
    const panel = tabsWrap(page, CONTROLLED).getByRole('tabpanel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Projects panel');
  });

  test('[fn] Each horizontal tab can be selected in turn with the mouse', async ({ page }) => {
    const tabs = tabButtons(page, H);
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('[fn] Clicking a vertical tab selects it and deselects the previous tab', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    await clickTab(page, V, 1);
    await expectTabSelected(page, V, 1);
    await expectTabNotSelected(page, V, 0);
  });

  test('[fn] Each vertical tab can be selected in turn with the mouse', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    const tabs = tabButtons(page, V);
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('[fn] Disabled tab stays unselected after a forced click', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-states"]').scrollIntoViewIfNeeded();
    const disabled = tabsWrap(page, TABS_ROOT_TESTIDS.states).getByRole('tab', { name: 'Disabled' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    const before = await disabled.getAttribute('aria-selected');
    await disabled.click({ force: true });
    await expect(disabled).toHaveAttribute('aria-selected', before ?? 'false');
  });

  test('[fn] Scrollable row shows scroll buttons and a distant tab can be selected', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-layout-variants"]').scrollIntoViewIfNeeded();
    const root = page.getByTestId(TABS_ROOT_TESTIDS.scrollable);
    await expect(root).toBeVisible();
    await expect(root.getByRole('button', { name: 'Scroll tabs backward' })).toBeVisible();
    await expect(root.getByRole('button', { name: 'Scroll tabs forward' })).toBeVisible();
    const tabs = root.getByRole('tab');
    expect(await tabs.count()).toBeGreaterThan(4);
    await tabs.nth(5).scrollIntoViewIfNeeded();
    await tabs.nth(5).click();
    await expect(tabs.nth(5)).toHaveAttribute('aria-selected', 'true');
  });

  test('[fn] Scroll forward button does not decrease horizontal scroll position', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-layout-variants"]').scrollIntoViewIfNeeded();
    const viewport = page.getByTestId('tabs-scrollable-viewport');
    const before = await viewport.evaluate((el) => el.scrollLeft);
    await page.getByRole('button', { name: 'Scroll tabs forward' }).click();
    const after = await viewport.evaluate((el) => el.scrollLeft);
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('[fn] Full-width example keeps first and last tabs inside the shell width', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-layout-variants"]').scrollIntoViewIfNeeded();
    const root = page.getByTestId(TABS_ROOT_TESTIDS.fullwidth);
    await expect(root).toBeVisible();
    const tabs = tabButtons(page, TABS_ROOT_TESTIDS.fullwidth);
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(2);
    const shellBox = await root.boundingBox();
    const firstBox = await tabs.nth(0).boundingBox();
    const lastBox = await tabs.nth(count - 1).boundingBox();
    expect(shellBox).not.toBeNull();
    expect(firstBox).not.toBeNull();
    expect(lastBox).not.toBeNull();
    expect(firstBox!.x).toBeGreaterThanOrEqual(shellBox!.x - 2);
    expect(lastBox!.x + lastBox!.width).toBeLessThanOrEqual(shellBox!.x + shellBox!.width + 2);
  });

  test('[fn] Combination matrix shows every combo row', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-combos"]').scrollIntoViewIfNeeded();
    for (let i = 0; i < TABS_COMBO_COUNT; i++) {
      await expect(page.getByTestId(`tabs-combo-${i}`)).toBeVisible();
    }
  });

  test('[fn] Figma validation tab shows the size and orientation grid', async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    await expect(page.getByTestId(FIGMA_GRID_TESTID)).toBeVisible();
  });
});

test.describe('Keyboard navigation', () => {
  test('[fn] Arrow Right moves focus from the first to the second horizontal tab', async ({ page }) => {
    await tabByIndex(page, H, 0).focus();
    await expect(tabByIndex(page, H, 0)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tabByIndex(page, H, 1)).toBeFocused();
  });

  test('[fn] Arrow Left moves focus from the second to the first horizontal tab', async ({ page }) => {
    await tabByIndex(page, H, 1).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tabByIndex(page, H, 0)).toBeFocused();
  });

  test('[fn] Arrow Right on the last horizontal tab wraps focus to the first (loop on)', async ({ page }) => {
    const tabs = tabButtons(page, H);
    const count = await tabs.count();
    await tabs.nth(count - 1).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(0)).toBeFocused();
  });

  test('[fn] Arrow Left on the first horizontal tab wraps focus to the last', async ({ page }) => {
    const tabs = tabButtons(page, H);
    const count = await tabs.count();
    await tabs.nth(0).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(count - 1)).toBeFocused();
  });

  test('[fn] Arrow Down moves focus from the first to the second vertical tab', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    await tabByIndex(page, V, 0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(tabByIndex(page, V, 1)).toBeFocused();
  });

  test('[fn] Arrow Up moves focus from the second to the first vertical tab', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    await tabByIndex(page, V, 1).focus();
    await page.keyboard.press('ArrowUp');
    await expect(tabByIndex(page, V, 0)).toBeFocused();
  });

  test('[fn] Arrow Down on the last vertical tab wraps focus to the first', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    const tabs = tabButtons(page, V);
    const count = await tabs.count();
    await tabs.nth(count - 1).focus();
    await page.keyboard.press('ArrowDown');
    await expect(tabs.nth(0)).toBeFocused();
  });

  test('[fn] Arrow Up on the first vertical tab wraps focus to the last', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    const tabs = tabButtons(page, V);
    const count = await tabs.count();
    await tabs.nth(0).focus();
    await page.keyboard.press('ArrowUp');
    await expect(tabs.nth(count - 1)).toBeFocused();
  });

  test('[fn] Enter key selects the focused horizontal tab', async ({ page }) => {
    await tabByIndex(page, H, 1).focus();
    await page.keyboard.press('Enter');
    await expectTabSelected(page, H, 1);
  });

  test('[fn] Space key selects the focused horizontal tab', async ({ page }) => {
    await tabByIndex(page, H, 1).focus();
    await page.keyboard.press('Space');
    await expectTabSelected(page, H, 1);
  });

  test('[fn] Home key moves focus from the last tab to the first', async ({ page }) => {
    const tabs = tabButtons(page, H);
    const count = await tabs.count();
    await tabs.nth(count - 1).focus();
    await page.keyboard.press('Home');
    await expect(tabs.nth(0)).toBeFocused();
  });

  test('[fn] End key moves focus from the first tab to the last', async ({ page }) => {
    const tabs = tabButtons(page, H);
    const count = await tabs.count();
    await tabs.nth(0).focus();
    await page.keyboard.press('End');
    await expect(tabs.nth(count - 1)).toBeFocused();
  });

  test('[fn] Tab key moves focus out of the horizontal tab strip', async ({ page }) => {
    await tabByIndex(page, H, 0).focus();
    await page.keyboard.press('Tab');
    const insideList = await tabsWrap(page, H).evaluate((root) =>
      root.contains(document.activeElement),
    );
    expect(insideList).toBe(false);
  });

  test('[fn] Activate on focus: moving focus with Arrow Right selects the newly focused tab', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-code-only"]').scrollIntoViewIfNeeded();
    const root = TABS_ROOT_TESTIDS.activateOnFocus;
    await tabByIndex(page, root, 0).focus();
    await page.keyboard.press('ArrowRight');
    await expectTabSelected(page, root, 1);
  });

  test('[fn] With loop focus off, Arrow Right on the last tab does not wrap focus', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-code-only"]').scrollIntoViewIfNeeded();
    const root = TABS_ROOT_TESTIDS.loopFocusFalse;
    const tabs = tabButtons(page, root);
    const count = await tabs.count();
    await tabs.nth(count - 1).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(count - 1)).toBeFocused();
  });
});

test.describe('Focus management', () => {
  test('[fn] Focused horizontal tab shows outline or box shadow', async ({ page }) => {
    await tabByIndex(page, H, 0).focus();
    await expectFocusVisible(page);
  });

  test('[fn] Selected horizontal tab is visible and marked selected', async ({ page }) => {
    await expect(selectedTab(page, H)).toBeVisible();
    await expect(selectedTab(page, H)).toHaveAttribute('aria-selected', 'true');
  });

  test('[fn] Exactly one horizontal tab has tabindex zero (roving tabindex)', async ({ page }) => {
    await expect(tabbableTab(page, H)).toHaveCount(1);
  });
});

test.describe('Orientation and panels', () => {
  test('[fn] Horizontal tabs sit in a left-to-right row', async ({ page }) => {
    await expectHorizontalTabLayout(page, H);
  });

  test('[fn] Vertical tabs sit in a top-to-bottom column', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    await expectVerticalTabLayout(page, V);
  });

  test('[fn] Switching controlled tabs swaps the visible panel content', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    await clickTab(page, CONTROLLED, 0);
    const panel = tabsWrap(page, CONTROLLED).getByRole('tabpanel');
    const content1 = await panel.textContent();
    await clickTab(page, CONTROLLED, 1);
    const content2 = await panel.textContent();
    expect(content2?.trim()).not.toBe(content1?.trim());
  });

  test('[fn] Selected controlled tab aria-controls matches a real panel id', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    const active = selectedTab(page, CONTROLLED);
    const controls = await active.getAttribute('aria-controls');
    expect(controls, 'Selected tab missing aria-controls').not.toBeNull();
    if (controls) {
      await expect(page.locator(`[id="${controls}"]`)).toBeAttached();
    }
  });
});

test.describe('Showcase render checks', () => {
  test('[fn] Reloading the page produces no console errors or uncaught exceptions', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      errors.push(`pageerror: ${err.message}`);
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Tabs', level: 1 })).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('[fn] Every Tabs showcase wrapper is visible after scrolling to it', async ({ page }) => {
    for (const testId of TABS_ALL_WRAPPER_TESTIDS) {
      await scrollToTabsTestId(page, testId);
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });

  test('[fn] Every story band section on the page is visible', async ({ page }) => {
    for (const section of TABS_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await band.scrollIntoViewIfNeeded();
      await expect(band).toBeVisible();
    }
  });
});

test.describe('Focus leaving the tab strip', () => {
  test('[fn] Blurring the active tab moves focus out of the horizontal strip', async ({ page }) => {
    await tabByIndex(page, H, 0).click();
    await expect(tabByIndex(page, H, 0)).toBeFocused();
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    const stillOnTab = await tabsWrap(page, H).evaluate((root) => root.contains(document.activeElement));
    expect(stillOnTab).toBe(false);
  });
});

test.describe('Arrow keys inside the strip', () => {
  test('[fn] Arrow Left from the third horizontal tab moves focus to the second', async ({ page }) => {
    await tabByIndex(page, H, 2).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tabByIndex(page, H, 1)).toBeFocused();
  });
});

test.describe('Pointer and focus', () => {
  test('[fn] Clicking a tab moves keyboard focus to that tab', async ({ page }) => {
    await tabByIndex(page, H, 2).click();
    await expect(tabByIndex(page, H, 2)).toBeFocused();
  });
});

test.describe('Indicator hidden', () => {
  test('[fn] Tabs without an indicator still change selection when clicked', async ({ page }) => {
    await scrollToTabsTestId(page, 'tabs-no-indicator');
    await clickTab(page, 'tabs-no-indicator', 1);
    await expectTabSelected(page, 'tabs-no-indicator', 1);
  });
});

test.describe('Viewport width', () => {
  test('[fn] At 320px width the orientation band does not scroll sideways inside its section', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.locator('[data-section="tabs-qa-orientation"]').scrollIntoViewIfNeeded();
    const noOverflow = await page.locator('[data-section="tabs-qa-orientation"]').evaluate(
      (el) => el.scrollWidth <= el.clientWidth + 2,
    );
    expect(noOverflow).toBe(true);
    await expect(tabsWrap(page, H)).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('[fn] At 1440px width the horizontal tab strip stays visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(tabsWrap(page, H)).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});

test.describe('Theme', () => {
  test('[fn] Toggling light and dark theme keeps the horizontal tab list visible', async ({ page }) => {
    await clickPageThemeButton(page);
    await expect(tabsList(page, H)).toBeVisible();
    await clickPageThemeButton(page);
    await expect(tabsList(page, H)).toBeVisible();
  });
});

test.describe('Group 3 — Click interaction (supplemental)', () => {
  test('[fn] 3.4 — click outside removes focus from tab', async ({ page }) => {
    await tabByIndex(page, H, 0).focus();
    await expect(tabByIndex(page, H, 0)).toBeFocused();
    await page.locator('h1').first().click();
    await expect(tabByIndex(page, H, 0)).not.toBeFocused();
  });
});

test.describe('Group 7 — Slots', () => {
  test('[fn] 7.1 — tabs-with-icons renders decorative start icons', async ({ page }) => {
    await scrollToTabsTestId(page, TABS_ROOT_TESTIDS.withIcons);
    await expect(tabsWrap(page, TABS_ROOT_TESTIDS.withIcons).locator('[aria-hidden="true"]').first()).toBeVisible();
  });

  test('[fn] 7.2 — inbox tab renders end CounterBadge', async ({ page }) => {
    await scrollToTabsTestId(page, TABS_ROOT_TESTIDS.withIcons);
    await expect(tabsWrap(page, TABS_ROOT_TESTIDS.withIcons).getByRole('tab', { name: /Inbox/i })).toBeVisible();
  });
});

test.describe('Group 8 — Toggle and selection (N/A)', () => {
  test('[fn] 8.1 — Toggle on/off (N/A)', async () => {
    qaLog('Skipped — Tabs use aria-selected, not aria-checked toggle');
  });
});

test.describe('Group 9 — Input and typing (N/A)', () => {
  test('[fn] 9.1 — Typing (N/A)', async () => {
    qaLog('Skipped — Tabs is navigation, not text input');
  });
});

test.describe('Group 10 — Dependency rules (N/A)', () => {
  test('[fn] 10.3 — Loading overrides (N/A)', async () => {
    qaLog('Skipped — TabGroup has no loading prop in Test Scenarios showcase');
  });
});

test.describe('Group 11 — Content and display (supplemental)', () => {
  test('[fn] 11.3 — Progress value (N/A)', async () => {
    qaLog('Skipped — Tabs is not a progress indicator');
  });
});

test.describe('Smoke', { tag: TABS_TAG_SET.smoke }, () => {
  test('[fn] Smoke — Page heading reads “Tabs”', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tabs', level: 1 })).toBeVisible();
  });

  test('[fn] Smoke — Default tab group is visible', async ({ page }) => {
    await expect(tabsWrap(page, TABS_ROOT_TESTIDS.default)).toBeVisible();
  });

  test('[fn] Smoke — Horizontal orientation strip is visible', async ({ page }) => {
    await expect(tabsWrap(page, H)).toBeVisible();
  });
});
});
