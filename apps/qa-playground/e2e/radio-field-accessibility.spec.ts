/**
 * RadioField QA — WCAG 2.1 AA axe + a11y checks (`RadioFieldQaShowcase.tsx`).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` RadioField defects.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { qaAnnotate } from './qa-a11y-test-meta';
import {
  RADIO_FIELD_ARIA_VALIDITY_TEST,
  RADIO_FIELD_A11Y_BANDS,
  RADIO_FIELD_DEFAULT_NAME_TEST,
  RADIO_FIELD_DISABLED_NOT_ENABLED_TEST,
  RADIO_FIELD_FOCUS_INDICATOR_TEST,
  RADIO_FIELD_FOCUS_ORDER_TEST,
  RADIO_FIELD_FOCUS_TRAP_TEST,
  RADIO_FIELD_KEYBOARD_TAB_TEST,
  RADIO_FIELD_KEYBOARD_TEST,
  RADIO_FIELD_LABEL_RULE_TEST,
  RADIO_FIELD_NAME_RULES_TEST,
  RADIO_FIELD_PAGE_LANG_TEST,
  RADIO_FIELD_READONLY_ATTR_TEST,
  RADIO_FIELD_REFLOW_320_TEST,
  RADIO_FIELD_REQUIRED_A11Y_TEST,
  RADIO_FIELD_RESIZE_200_TEST,
  RADIO_FIELD_SECTION508_TEST,
  RADIO_FIELD_THEME_ENTER_TEST,
  RADIO_FIELD_THEME_SPACE_TEST,
  RADIO_FIELD_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS } from './qa-axe-helpers';
import {
  RADIO_FIELD_AXE_TARGET_TESTIDS,
  RADIO_FIELD_DATA_SECTIONS,
  RADIO_FIELD_REFLOW_SKIP_SECTIONS,
  RADIO_FIELD_SMOKE_TESTID,
} from './radio-field-playground/manifest';
import {
  assertThemeActivatesWithKey,
  fieldByTestId,
  firstRadioInField,
  formatAxeViolations,
  openRadioFieldTestScenarios,
  qaStep,
  RADIO_FIELD_SHOWCASE_AXE_SCOPE,
  RADIO_FIELD_TAG_SET,
  runRadioFieldAxePageScan,
  scrollToSection,
  seriousOrCritical,
  writeRadioFieldAxeArtefact,
  writeRadioFieldAxeHtmlReport,
} from './radio-field/radio-field-qa-support';

test.beforeEach(async ({ page }) => {
  await openRadioFieldTestScenarios(page);
});

test.describe('Accessibility', { tag: RADIO_FIELD_TAG_SET.accessibility }, () => {
  test(`[a11y] ${RADIO_FIELD_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runRadioFieldAxePageScan(page, RADIO_FIELD_SHOWCASE_AXE_SCOPE),
    );
    writeRadioFieldAxeArtefact(results);
    writeRadioFieldAxeHtmlReport(results);
    expectA11yClean(results, RADIO_FIELD_WCAG_PAGE_TEST);
  });

  for (const { id, title } of RADIO_FIELD_A11Y_BANDS) {
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

  for (const testId of RADIO_FIELD_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await fieldByTestId(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test(`[a11y] ${RADIO_FIELD_SECTION508_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(RADIO_FIELD_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    expectA11yClean(results, RADIO_FIELD_SECTION508_TEST);
  });

  test(`[a11y] ${RADIO_FIELD_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(RADIO_FIELD_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    expectA11yClean(results, RADIO_FIELD_LABEL_RULE_TEST);
  });

  test(`[a11y] ${RADIO_FIELD_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(RADIO_FIELD_SHOWCASE_AXE_SCOPE)
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
      ])
      .analyze();
    expectA11yClean(results, RADIO_FIELD_ARIA_VALIDITY_TEST);
  });

  test(`[a11y] ${RADIO_FIELD_NAME_RULES_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(RADIO_FIELD_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name', 'image-alt', 'link-name'])
      .analyze();
    expectA11yClean(results, RADIO_FIELD_NAME_RULES_TEST);
  });

  test(`[a11y] ${RADIO_FIELD_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${RADIO_FIELD_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openRadioFieldTestScenarios(page);
    for (const section of RADIO_FIELD_DATA_SECTIONS) {
      await page.locator(`[data-section="${section}"]`).scrollIntoViewIfNeeded();
    }
    const pageOverflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(pageOverflows, 'Page should not scroll horizontally at 320px width').toBe(false);
    for (const section of RADIO_FIELD_DATA_SECTIONS) {
      if ((RADIO_FIELD_REFLOW_SKIP_SECTIONS as readonly string[]).includes(section)) {
        continue;
      }
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
    }
  });

  test(`[a11y] ${RADIO_FIELD_RESIZE_200_TEST}`, async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator('[data-testid^="radio-field-"]');
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test(`[a11y] ${RADIO_FIELD_KEYBOARD_TAB_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test(`[a11y] ${RADIO_FIELD_FOCUS_TRAP_TEST}`, async ({ page }) => {
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

  test(`[a11y] ${RADIO_FIELD_FOCUS_INDICATOR_TEST}`, async ({ page }) => {
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

  test(`[a11y] ${RADIO_FIELD_FOCUS_ORDER_TEST}`, async ({ page }) => {
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
    expect(seen.size, 'Tab should move focus across multiple distinct elements').toBeGreaterThan(1);
  });

  test(`[a11y] ${RADIO_FIELD_THEME_ENTER_TEST}`, async ({ page }) => {
    await assertThemeActivatesWithKey(page, 'Enter');
  });

  test(`[a11y] ${RADIO_FIELD_THEME_SPACE_TEST}`, async ({ page }) => {
    await assertThemeActivatesWithKey(page, 'Space');
  });

  // ── Preserved a11y tests (do not remove) ─────────────────────────────────
  test(`[a11y] ${RADIO_FIELD_DEFAULT_NAME_TEST}`, async ({ page }) => {
    const radio = firstRadioInField(fieldByTestId(page, RADIO_FIELD_SMOKE_TESTID));
    await expect(radio).toHaveAccessibleName(/default radio/i);
  });

  test(`[a11y] ${RADIO_FIELD_REQUIRED_A11Y_TEST}`, async ({ page }) => {
    await page.locator('#radio-field-qa-required').scrollIntoViewIfNeeded();
    const field = fieldByTestId(page, 'radio-field-required');
    await expect(field.getByText('Accept Communication Preference')).toBeVisible();
  });

  test(`[a11y] ${RADIO_FIELD_KEYBOARD_TEST}`, async ({ page }) => {
    await page.locator('#radio-field-qa-a11y').scrollIntoViewIfNeeded();
    const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-keyboard'));
    await radio.focus();
    await expect(radio).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(radio).not.toBeFocused();
  });

  test('[a11y] aria-label field — radiogroup exposes accessible name', async ({ page }) => {
    await page.locator('#radio-field-qa-a11y').scrollIntoViewIfNeeded();
    await expect(
      page.getByRole('radiogroup', { name: 'Select prepaid plan' }),
      'aria-label prop should name the integrated field radiogroup',
    ).toBeVisible();
  });

  test(`[a11y] ${RADIO_FIELD_DISABLED_NOT_ENABLED_TEST}`, async ({ page }) => {
    await page.locator('#radio-field-qa-a11y').scrollIntoViewIfNeeded();
    const radio = firstRadioInField(fieldByTestId(page, 'radio-field-a11y-disabled'));
    await expect(radio).toBeDisabled();
  });

  test(`[a11y] ${RADIO_FIELD_READONLY_ATTR_TEST}`, async ({ page }) => {
    await scrollToSection(page, 'radio-field-qa-readonly');
    const radio = firstRadioInField(fieldByTestId(page, 'radio-field-readonly'));
    await expect(radio).toHaveAttribute('data-readonly', '');
  });
});
