/**
 * Web Header QA — WCAG 2.1 AA automation (axe tags), WAI-ARIA-oriented checks.
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` WebHeader defects.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  WEB_HEADER_A11Y_BANDS,
  WEB_HEADER_AVATAR_ALT_TEST,
  WEB_HEADER_FIGMA_GRID_AXE_TEST,
  WEB_HEADER_FOCUS_INDICATOR_TEST,
  WEB_HEADER_FOCUS_ORDER_TEST,
  WEB_HEADER_FOCUS_TRAP_TEST,
  WEB_HEADER_ICON_BUTTON_NAME_TEST,
  WEB_HEADER_KEYBOARD_TAB_TEST,
  WEB_HEADER_LABEL_RULE_TEST,
  WEB_HEADER_NAME_RULES_TEST,
  WEB_HEADER_PAGE_LANG_TEST,
  WEB_HEADER_PRIMARY_NAV_LANDMARK_TEST,
  WEB_HEADER_REFLOW_320_TEST,
  WEB_HEADER_RESIZE_200_TEST,
  WEB_HEADER_SEARCH_LABEL_TEST,
  WEB_HEADER_SECTION508_TEST,
  WEB_HEADER_THEME_ENTER_TEST,
  WEB_HEADER_THEME_SPACE_TEST,
  WEB_HEADER_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS } from './qa-axe-helpers';
import {
  FIGMA_PROPERTY_GRID_TESTID,
  formatAxeViolations,
  openWebHeaderFigmaValidationTab,
  openWebHeaderTestScenarios,
  qaStep,
  runWebHeaderAxePageScan,
  seriousOrCritical,
  WEB_HEADER_SHOWCASE_AXE_SCOPE,
  WEB_HEADER_TAG_SET,
  webHeaderByTestId,
  writeWebHeaderAxeArtefact,
  writeWebHeaderAxeHtmlReport,
} from './web-header/web-header-qa-support';
import {
  WEB_HEADER_AXE_TARGET_TESTIDS,
  WEB_HEADER_DATA_SECTIONS,
  WEB_HEADER_ROOT_TESTIDS,
} from './web-header-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openWebHeaderTestScenarios(page);
});

test.describe('Accessibility', { tag: WEB_HEADER_TAG_SET.accessibility }, () => {
  test(`[a11y] ${WEB_HEADER_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runWebHeaderAxePageScan(page, WEB_HEADER_SHOWCASE_AXE_SCOPE),
    );
    writeWebHeaderAxeArtefact(results);
    writeWebHeaderAxeHtmlReport(results);
    expectA11yClean(results, WEB_HEADER_WCAG_PAGE_TEST);
  });

  for (const { id, title } of WEB_HEADER_A11Y_BANDS) {
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

  for (const testId of WEB_HEADER_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      if (testId.startsWith('web-header-platform-')) {
        await page.locator('[data-section="web-header-qa-responsive"]').scrollIntoViewIfNeeded();
      }
      await webHeaderByTestId(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test(`[a11y] ${WEB_HEADER_FIGMA_GRID_AXE_TEST}`, async ({ page }) => {
    await openWebHeaderFigmaValidationTab(page);
    const results = await new AxeBuilder({ page })
      .include(`[data-testid="${FIGMA_PROPERTY_GRID_TESTID}"]`)
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    expectA11yClean(results, WEB_HEADER_FIGMA_GRID_AXE_TEST);
  });

  test(`[a11y] ${WEB_HEADER_SECTION508_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(WEB_HEADER_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    expectA11yClean(results, WEB_HEADER_SECTION508_TEST);
  });

  test(`[a11y] ${WEB_HEADER_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(WEB_HEADER_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    expectA11yClean(results, WEB_HEADER_LABEL_RULE_TEST);
  });

  test('[a11y] ARIA validity rules — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(WEB_HEADER_SHOWCASE_AXE_SCOPE)
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
        'aria-command-name',
      ])
      .analyze();
    expectA11yClean(results, 'ARIA validity rules');
  });

  test(`[a11y] ${WEB_HEADER_NAME_RULES_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(WEB_HEADER_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name', 'image-alt', 'link-name'])
      .analyze();
    expectA11yClean(results, WEB_HEADER_NAME_RULES_TEST);
  });

  test(`[a11y] ${WEB_HEADER_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${WEB_HEADER_PRIMARY_NAV_LANDMARK_TEST}`, async ({ page }) => {
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default);
    await expect(mount.getByRole('navigation', { name: /primary navigation/i })).toBeVisible();
  });

  test(`[a11y] ${WEB_HEADER_SEARCH_LABEL_TEST}`, async ({ page }) => {
    await page.locator('[data-section="web-header-qa-search-bar"]').scrollIntoViewIfNeeded();
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.searchMiddle);
    const searchbox = mount.getByRole('searchbox');
    await expect(searchbox).toBeVisible();
    const label =
      (await searchbox.getAttribute('aria-label')) ??
      (await searchbox.getAttribute('aria-labelledby'));
    expect(label?.trim()).not.toBe('');
  });

  test(`[a11y] ${WEB_HEADER_ICON_BUTTON_NAME_TEST}`, async ({ page }) => {
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default);
    await expect(mount.getByRole('button', { name: 'Ask HelloJio' })).toBeVisible();
    await expect(mount.getByRole('button', { name: 'Notifications' })).toBeVisible();
  });

  test(`[a11y] ${WEB_HEADER_AVATAR_ALT_TEST}`, async ({ page }) => {
    const mount = webHeaderByTestId(page, WEB_HEADER_ROOT_TESTIDS.default);
    await expect(mount.getByRole('img', { name: 'Jane Doe' })).toBeVisible();
  });

  test(`[a11y] ${WEB_HEADER_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openWebHeaderTestScenarios(page);
    for (const section of WEB_HEADER_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await band.scrollIntoViewIfNeeded();
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test(`[a11y] ${WEB_HEADER_RESIZE_200_TEST}`, async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const mounts = page.locator('[data-testid^="web-header-"]');
    const count = await mounts.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(mounts.nth(i)).toBeVisible();
    }
  });

  test(`[a11y] ${WEB_HEADER_KEYBOARD_TAB_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(tag).not.toBe('BODY');
  });

  test(`[a11y] ${WEB_HEADER_FOCUS_TRAP_TEST}`, async ({ page }) => {
    const signatures: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const sig = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return 'none';
        return `${el.tagName}:${el.getAttribute('data-testid') ?? el.getAttribute('aria-label') ?? el.textContent?.slice(0, 20)}`;
      });
      signatures.push(sig);
      if (signatures.length > 3 && new Set(signatures.slice(-4)).size > 1) return;
    }
    expect(new Set(signatures).size).toBeGreaterThan(1);
  });

  test(`[a11y] ${WEB_HEADER_FOCUS_ORDER_TEST}`, async ({ page }) => {
    const visited = new Set<string>();
    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press('Tab');
      const sig = await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 80) ?? '');
      visited.add(sig);
      if (visited.size >= 3) break;
    }
    expect(visited.size).toBeGreaterThanOrEqual(3);
  });

  test(`[a11y] ${WEB_HEADER_FOCUS_INDICATOR_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const style = getComputedStyle(el);
      return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
    });
    const hasVisibleFocus =
      focusStyle?.outlineWidth !== '0px' ||
      (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
    expect(hasVisibleFocus).toBe(true);
  });

  test(`[a11y] ${WEB_HEADER_THEME_ENTER_TEST}`, async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test(`[a11y] ${WEB_HEADER_THEME_SPACE_TEST}`, async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, ' ');
  });
});
