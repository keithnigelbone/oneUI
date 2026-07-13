/**
 * Switch QA — WCAG 2.1 AA axe + a11y checks.
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Switch defects.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  SWITCH_A11Y_BANDS,
  SWITCH_DEFAULT_SWITCH_NAME_TEST,
  SWITCH_DISABLED_NOT_ENABLED_TEST,
  SWITCH_FOCUS_INDICATOR_TEST,
  SWITCH_FOCUS_ORDER_TEST,
  SWITCH_FOCUS_TRAP_TEST,
  SWITCH_KEYBOARD_TAB_TEST,
  SWITCH_LABEL_RULE_TEST,
  SWITCH_NAME_RULES_TEST,
  SWITCH_PAGE_LANG_TEST,
  SWITCH_READONLY_ARIA_TEST,
  SWITCH_REFLOW_320_TEST,
  SWITCH_RESIZE_200_TEST,
  SWITCH_SECTION508_TEST,
  SWITCH_THEME_ENTER_TEST,
  SWITCH_THEME_SPACE_TEST,
SWITCH_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS } from './qa-axe-helpers';
import {
  formatAxeViolations,
  openSwitchTestScenarios,
  qaStep,
  runSwitchAxePageScan,
  seriousOrCritical,
  SWITCH_SHOWCASE_AXE_SCOPE,
  SWITCH_TAG_SET,
  switchByTestId,
  writeSwitchAxeArtefact,
writeSwitchAxeHtmlReport
} from './switch/switch-qa-support';
import {
  SWITCH_AXE_TARGET_TESTIDS,
  SWITCH_DATA_SECTIONS
} from './switch-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openSwitchTestScenarios(page);
});

test.describe('Accessibility', { tag: SWITCH_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SWITCH_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runSwitchAxePageScan(page, SWITCH_SHOWCASE_AXE_SCOPE),
    );
    writeSwitchAxeArtefact(results);
    writeSwitchAxeHtmlReport(results);
    expectA11yClean(results, SWITCH_WCAG_PAGE_TEST);
  });

  for (const { id, title } of SWITCH_A11Y_BANDS) {
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

  for (const testId of SWITCH_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await switchByTestId(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${blocking.length} serious/critical violation(s)`).toHaveLength(0);
    });
  }

  test(`[a11y] ${SWITCH_SECTION508_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(SWITCH_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    expectA11yClean(results, SWITCH_SECTION508_TEST);
  });


  test(`[a11y] ${SWITCH_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(SWITCH_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    expectA11yClean(results, SWITCH_LABEL_RULE_TEST);
  });

  test('[a11y] ARIA validity rules — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(SWITCH_SHOWCASE_AXE_SCOPE)
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

  test(`[a11y] ${SWITCH_NAME_RULES_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(SWITCH_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name', 'image-alt', 'link-name'])
      .analyze();
    expectA11yClean(results, SWITCH_NAME_RULES_TEST);
  });

  test(`[a11y] ${SWITCH_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${SWITCH_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openSwitchTestScenarios(page);
    for (const section of SWITCH_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test(`[a11y] ${SWITCH_RESIZE_200_TEST}`, async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator('[data-testid^="sw-figma-"]');
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test(`[a11y] ${SWITCH_KEYBOARD_TAB_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test(`[a11y] ${SWITCH_FOCUS_TRAP_TEST}`, async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const id =
        (await page.evaluate(() => {
          const el = document.activeElement;
          return el?.getAttribute('data-testid') ?? el?.getAttribute('id') ?? el?.tagName ?? '';
        })) ?? '';
      seen.add(id);
    }
    expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(3);
  });

  test(`[a11y] ${SWITCH_FOCUS_INDICATOR_TEST}`, async ({ page }) => {
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
    expect(hasVisibleFocus, 'No visible focus indicator on first Tab target').toBe(true);
  });

  test(`[a11y] ${SWITCH_FOCUS_ORDER_TEST}`, async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const sig =
        (await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return '';
          const role = el.getAttribute('role') ?? '';
          const name = el.getAttribute('aria-label') ?? el.textContent?.slice(0, 40) ?? '';
          return `${el.tagName}:${role}:${name}`;
        })) ?? '';
      seen.add(sig);
    }
    expect(seen.size, 'Tab should move focus across multiple distinct elements').toBeGreaterThan(2);
  });

  test(`[a11y] ${SWITCH_THEME_ENTER_TEST}`, async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test(`[a11y] ${SWITCH_THEME_SPACE_TEST}`, async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });

  // ── Preserved a11y tests (do not remove) ─────────────────────────────────
  test('[a11y] Switch QA page has no critical or serious axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags([...WCAG_AA_TAGS]).analyze();
    writeSwitchAxeArtefact(results);
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, 'no critical or serious violations').toHaveLength(0);
  });

  for (const sectionId of SWITCH_DATA_SECTIONS) {
    test(`[a11y] section "${sectionId}" has no critical or serious axe violations`, async ({ page }) => {
      const section = page.locator(`[data-section="${sectionId}"]`);
      await expect(section).toBeVisible({ timeout: 60_000 });
      const results = await new AxeBuilder({ page })
        .withTags([...WCAG_AA_TAGS])
        .include(`[data-section="${sectionId}"]`)
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${sectionId}: no critical or serious violations`).toHaveLength(0);
    });
  }

  test(`[a11y] ${SWITCH_DEFAULT_SWITCH_NAME_TEST}`, async ({ page }) => {
    const sw = page.locator('#switch-figma-default').getByRole('switch', { name: /Enable notifications/i });
    await expect(sw).toBeVisible();
  });

  test(`[a11y] ${SWITCH_DISABLED_NOT_ENABLED_TEST}`, async ({ page }) => {
    const sw = page.getByTestId('sw-figma-disabled-true-on');
    await expect(sw).toBeVisible({ timeout: 60_000 });
    await expect(sw).toBeDisabled();
  });

  test(`[a11y] ${SWITCH_READONLY_ARIA_TEST}`, async ({ page }) => {
    const sw = page.getByTestId('sw-figma-readonly-true-on');
    await expect(sw).toBeVisible({ timeout: 60_000 });
    await expect(sw).toHaveAttribute('aria-readonly', 'true');
  });
});
