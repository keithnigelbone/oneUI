/**
 * Tabs QA — WCAG 2.1 AA axe automation + ARIA / keyboard a11y checks.
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Tabs defects.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { qaAnnotate } from './qa-a11y-test-meta';
import {
  TABS_A11Y_BANDS,
  TABS_FOCUS_TRAP_TEST,
  TABS_KEYBOARD_TAB_TEST,
  TABS_PAGE_LANG_TEST,
  TABS_REFLOW_320_TEST,
TABS_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS } from './qa-axe-helpers';
import {
  formatAxeViolations,
  openTabsTestScenarios,
  qaStep,
  runTabsAxePageScan,
  seriousOrCritical,
  TABS_SHOWCASE_AXE_SCOPE,
  TABS_TAG_SET,
  writeTabsAxeArtefact,
writeTabsAxeHtmlReport,
} from './tabs/tabs-qa-support';
import {
  FIGMA_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  TABS_ALL_WRAPPER_TESTIDS,
  TABS_AXE_TARGET_TESTIDS,
  TABS_DATA_SECTIONS,
  TABS_ROOT_TESTIDS
} from './tabs-playground/manifest';
import {
  expectFocusVisible,
  scrollToTabsTestId,
  tabButtons,
  tabByIndex,
  tabsList,
tabsWrap,
} from './tabs-playground/tabsHelpers';

const H = TABS_ROOT_TESTIDS.horizontal;
const CONTROLLED = TABS_ROOT_TESTIDS.controlled;

test.beforeEach(async ({ page }) => {
  await openTabsTestScenarios(page);
});

test.describe('Accessibility', { tag: TABS_TAG_SET.accessibility }, () => {
  test(`[a11y] ${TABS_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runTabsAxePageScan(page, TABS_SHOWCASE_AXE_SCOPE),
    );
    writeTabsAxeArtefact(results);
    writeTabsAxeHtmlReport(results);
    expectA11yClean(results, TABS_WCAG_PAGE_TEST);
  });

  for (const { id, title } of TABS_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      await page.locator(`[data-section="${id}"]`).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${id}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, title);
    });
  }

  for (const testId of TABS_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await scrollToTabsTestId(page, testId);
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${blocking.length} serious/critical violation(s)`).toHaveLength(0);
    });
  }

  test('[a11y] Full page WCAG 2.1 AA scan has no serious or critical issues (report saved)', async ({ page }) => {
    const results = await runTabsAxePageScan(page);
    writeTabsAxeArtefact(results);
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const section of TABS_DATA_SECTIONS) {
    test(`[a11y] section "${section}" has no critical or serious axe violations`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const testId of TABS_ALL_WRAPPER_TESTIDS) {
    test(`[a11y] Showcase "${testId}": WCAG 2.1 AA scan has no serious or critical issues`, async ({ page }) => {
      const el = page.getByTestId(testId);
      await expect(el, `Playground must define data-testid="${testId}" (sync manifest with TabsQaShowcase)`).toHaveCount(1);
      await scrollToTabsTestId(page, testId);
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId} violations:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test('[a11y] Horizontal example exposes a visible tab list', async ({ page }) => {
    await expect(tabsList(page, H)).toBeVisible();
  });

  test('[a11y] Horizontal example tab buttons use the tab role', async ({ page }) => {
    const count = await tabButtons(page, H).count();
    expect(count).toBeGreaterThan(0);
  });

  test('[a11y] Controlled example exposes tab panels', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    const panels = tabsWrap(page, CONTROLLED).getByRole('tabpanel');
    expect(await panels.count()).toBeGreaterThan(0);
  });

  test('[a11y] Horizontal example marks the active tab with aria-selected true', async ({ page }) => {
    await expect(tabsWrap(page, H).locator('[role="tab"][aria-selected="true"]').first()).toBeAttached();
  });

  test('[a11y] Horizontal example marks inactive tabs with aria-selected false', async ({ page }) => {
    const inactive = tabsWrap(page, H).locator('[role="tab"][aria-selected="false"]');
    expect(await inactive.count()).toBeGreaterThan(0);
  });

  test('[a11y] Controlled example links the selected tab to its panel via aria-controls', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    const active = tabsWrap(page, CONTROLLED).locator('[role="tab"][aria-selected="true"]');
    const controls = await active.getAttribute('aria-controls');
    expect(controls, 'Selected tab missing aria-controls').not.toBeNull();
    if (controls) {
      await expect(page.locator(`[id="${controls}"]`)).toBeAttached();
    }
  });

  test('[a11y] Controlled example panels have an accessible name (aria-labelledby or aria-label)', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    const panels = tabsWrap(page, CONTROLLED).getByRole('tabpanel');
    const count = await panels.count();
    for (let i = 0; i < count; i++) {
      const labelledBy = await panels.nth(i).getAttribute('aria-labelledby');
      const ariaLabel = await panels.nth(i).getAttribute('aria-label');
      expect(labelledBy || ariaLabel, `Panel at index ${i} missing accessible name`).not.toBeNull();
    }
  });

  test('[a11y] Disabled tab in states example exposes aria-disabled', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-states"]').scrollIntoViewIfNeeded();
    const disabled = tabsWrap(page, TABS_ROOT_TESTIDS.states).getByRole('tab', { name: 'Disabled' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  });

test('[a11y] Page passes axe ARIA validity rules with no serious or critical issues', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(TABS_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-roles', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

test('[a11y] Page passes axe ARIA validity rules with no serious or critical issues', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(TABS_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-roles', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
  test('[a11y] Enter key on a focused tab selects that tab', async ({ page }) => {
    await tabByIndex(page, H, 1).focus();
    await page.keyboard.press('Enter');
    await expect(tabByIndex(page, H, 1)).toHaveAttribute('aria-selected', 'true');
  });

  test(`[a11y] ${TABS_KEYBOARD_TAB_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    await expectFocusVisible(page);
  });

  test(`[a11y] ${TABS_FOCUS_TRAP_TEST}`, async ({ page }) => {
    await tabByIndex(page, H, 0).focus();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
    }
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test('[a11y] Every horizontal tab has a non-empty accessible name', async ({ page }) => {
    const tabs = tabButtons(page, H);
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const ariaLabel = await tabs.nth(i).getAttribute('aria-label');
      const text = (await tabs.nth(i).textContent())?.trim();
      expect(ariaLabel || text, `Tab at index ${i} has no accessible name`).toBeTruthy();
    }
  });

  test('[a11y] Visible controlled tab panel has an accessible name', async ({ page }) => {
    await page.locator('[data-section="tabs-qa-controlled"]').scrollIntoViewIfNeeded();
    const panel = tabsWrap(page, CONTROLLED).getByRole('tabpanel');
    const labelledBy = await panel.getAttribute('aria-labelledby');
    const ariaLabel = await panel.getAttribute('aria-label');
    expect(labelledBy || ariaLabel).not.toBeNull();
  });

  test('[a11y] Figma validation grid passes WCAG 2.1 AA with no serious or critical issues', async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    const results = await new AxeBuilder({ page })
      .include(`[data-testid="${FIGMA_GRID_TESTID}"]`)
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${TABS_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${TABS_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openTabsTestScenarios(page);
    for (const section of TABS_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });
});
