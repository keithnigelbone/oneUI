/**
 * Stepper QA playground — WCAG 2.1 AA automation (axe tags), WAI-ARIA-oriented checks,
 * Section 508 tag run where supported by axe-core.
 *
 * Selectors mirror `StepperQaShowcase.tsx` and `QaShowcaseLayout.tsx` (`data-section` === band `id`).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Stepper defects.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  STEPPER_A11Y_BANDS,
  STEPPER_ALL_FIELDS_NAMED_TEST,
STEPPER_ARROW_DOWN_FIELD_TEST,
  STEPPER_ARROW_UP_FIELD_TEST,
  STEPPER_DEFAULT_FIELD_NAME_TEST,
  STEPPER_ERROR_ARIA_INVALID_TEST,
  STEPPER_FOCUS_INDICATOR_TEST,
  STEPPER_FOCUS_ORDER_TEST,
  STEPPER_FOCUS_TRAP_TEST,
  STEPPER_KEYBOARD_TAB_TEST,
  STEPPER_LABEL_RULE_TEST,
  STEPPER_NAME_RULES_TEST,
STEPPER_NON_TEXT_CONTRAST_TEST,
  STEPPER_PAGE_LANG_TEST,
  STEPPER_REFLOW_320_TEST,
  STEPPER_RESIZE_200_TEST,
  STEPPER_SECTION508_TEST,
  STEPPER_SIZE_M_FIELD_NAME_TEST,
  STEPPER_SKIP_LINK_TEST,
  STEPPER_SVG_ICONS_TEST,
  STEPPER_THEME_ENTER_TEST,
  STEPPER_THEME_SPACE_TEST,
STEPPER_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS } from './qa-axe-helpers';
import {
  allStepperValueFields,
expectStepperDefaultFieldInitial,
  formatAxeViolations,
  openStepperTestScenarios,
  qaStep,
  runStepperAxePageScan,
  seriousOrCritical,
  STEPPER_SHOWCASE_AXE_SCOPE,
  STEPPER_TAG_SET,
  stepperByTestId,
  stepperValueField,
  writeStepperAxeArtefact,
writeStepperAxeHtmlReport
} from './stepper/stepper-qa-support';
import {
  STEPPER_AXE_TARGET_TESTIDS,
  STEPPER_DATA_SECTIONS
} from './stepper-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openStepperTestScenarios(page);
});

test.describe('Accessibility', { tag: STEPPER_TAG_SET.accessibility }, () => {
  test(`[a11y] ${STEPPER_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runStepperAxePageScan(page, STEPPER_SHOWCASE_AXE_SCOPE),
    );
    writeStepperAxeArtefact(results);
    writeStepperAxeHtmlReport(results);
    expectA11yClean(results, STEPPER_WCAG_PAGE_TEST);
  });

  for (const { id, title } of STEPPER_A11Y_BANDS) {
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

  for (const testId of STEPPER_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await stepperByTestId(page, testId).scrollIntoViewIfNeeded();
const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${blocking.length} serious/critical violation(s)`).toHaveLength(0);
    });
  }

  test(`[a11y] ${STEPPER_SECTION508_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(STEPPER_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    expectA11yClean(results, STEPPER_SECTION508_TEST);
  });


  test(`[a11y] ${STEPPER_NON_TEXT_CONTRAST_TEST}`, async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page })
        .include(STEPPER_SHOWCASE_AXE_SCOPE)
        .withRules(['non-text-contrast'])
        .analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) {
        return;
      }
      throw e;
    }
    expectA11yClean(results, STEPPER_NON_TEXT_CONTRAST_TEST);
  });

  test(`[a11y] ${STEPPER_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(STEPPER_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    expectA11yClean(results, STEPPER_LABEL_RULE_TEST);
  });

  test('[a11y] ARIA validity rules — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(STEPPER_SHOWCASE_AXE_SCOPE)
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
        'aria-required-children',
        'aria-command-name',
      ])
      .analyze();
    expectA11yClean(results, 'ARIA validity rules');
  });

  test(`[a11y] ${STEPPER_NAME_RULES_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(STEPPER_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name', 'image-alt', 'input-button-name', 'link-name'])
      .analyze();
    expectA11yClean(results, STEPPER_NAME_RULES_TEST);
  });

  test('[a11y] scrollable regions focusable — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(STEPPER_SHOWCASE_AXE_SCOPE)
      .withRules(['scrollable-region-focusable'])
      .analyze();
    expectA11yClean(results, 'scrollable-region-focusable');
  });

  test('[a11y] images: if present, every <img> has alt attribute', async ({ page }) => {
    const images = page.locator(`${STEPPER_SHOWCASE_AXE_SCOPE} img`);
    const count = await images.count();
    if (count === 0) {
      return;
    }
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image at index ${i} missing alt attribute`).not.toBeNull();
    }
  });

  test(`[a11y] ${STEPPER_SVG_ICONS_TEST}`, async ({ page }) => {
    const icons = page.locator(`${STEPPER_SHOWCASE_AXE_SCOPE} svg`);
    const count = await icons.count();
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const ariaLabel = await icon.getAttribute('aria-label');
      const ariaHidden = await icon.getAttribute('aria-hidden');
      const role = await icon.getAttribute('role');
      const title = await icon.locator('title').count();
      expect(
        ariaLabel || ariaHidden === 'true' || role || title > 0,
        `SVG at index ${i} has no aria-label, aria-hidden="true", role, or <title>`,
      ).toBeTruthy();
    }
  });

  test(`[a11y] ${STEPPER_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${STEPPER_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openStepperTestScenarios(page);
    for (const section of STEPPER_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test(`[a11y] ${STEPPER_RESIZE_200_TEST}`, async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator('[data-testid^="stepper-"]');
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test(`[a11y] ${STEPPER_KEYBOARD_TAB_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test(`[a11y] ${STEPPER_FOCUS_TRAP_TEST}`, async ({ page }) => {
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

  test(`[a11y] ${STEPPER_FOCUS_INDICATOR_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow
};
    });
    const hasVisibleFocus =
      focusStyle?.outlineWidth !== '0px' ||
      (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
    expect(hasVisibleFocus, 'No visible focus indicator on first Tab target').toBe(true);
  });

  test(`[a11y] ${STEPPER_FOCUS_ORDER_TEST}`, async ({ page }) => {
    // Retry the whole traversal: reading document.activeElement immediately after each Tab can
    // race Base UI's focus settling, occasionally collapsing every signature to one. .toPass()
    // re-runs from a fresh focus state until the keyboard order is observed correctly.
    await expect(async () => {
      await page.locator('body').click({ position: { x: 0, y: 0 } });
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
      expect(
        seen.size,
        'Tab should move focus across multiple distinct elements',
      ).toBeGreaterThan(2);
    }).toPass({ timeout: 15_000 });
  });

  test(`[a11y] ${STEPPER_SKIP_LINK_TEST}`, async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a[href*="#main"]');
    const count = await skipLink.count();
    if (count > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test(`[a11y] ${STEPPER_THEME_ENTER_TEST}`, async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test(`[a11y] ${STEPPER_THEME_SPACE_TEST}`, async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });

  test(`[a11y] ${STEPPER_DEFAULT_FIELD_NAME_TEST}`, async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-default');
    const field = stepperValueField(root);
    await expect(field).toBeVisible();
    await expect(field).toHaveAccessibleName(/.+/);
  });

  test(`[a11y] ${STEPPER_SIZE_M_FIELD_NAME_TEST}`, async ({ page }) => {
    const field = stepperValueField(stepperByTestId(page, 'stepper-size-M'));
    await expect(field).toHaveAccessibleName(/.+/);
  });

  test(`[a11y] ${STEPPER_ALL_FIELDS_NAMED_TEST}`, async ({ page }) => {
    const fields = allStepperValueFields(page);
    const count = await fields.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(fields.nth(i)).toHaveAccessibleName(/.+/);
    }
  });

  test(`[a11y] ${STEPPER_ERROR_ARIA_INVALID_TEST}`, async ({ page }) => {
    await expect(stepperValueField(stepperByTestId(page, 'stepper-error'))).toHaveAttribute('aria-invalid', 'true');
  });

  test(`[a11y] ${STEPPER_ARROW_UP_FIELD_TEST}`, async ({ page }) => {
    const field = stepperValueField(stepperByTestId(page, 'stepper-default'));
    await field.focus();
    await expectStepperDefaultFieldInitial(field);
    await page.keyboard.press('ArrowUp');
    await expect(field).toHaveValue('0');
  });

  test(`[a11y] ${STEPPER_ARROW_DOWN_FIELD_TEST}`, async ({ page }) => {
    const field = stepperValueField(stepperByTestId(page, 'stepper-default'));
    await field.focus();
    await expectStepperDefaultFieldInitial(field);
    await page.keyboard.press('ArrowDown');
    await expect(field).toHaveValue('0');
  });

  test('[a11y] aria-live-region-content rule if available', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page })
        .include(STEPPER_SHOWCASE_AXE_SCOPE)
        .withRules(['aria-live-region-content'])
        .analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) {
        return;
      }
      throw e;
    }
    expectA11yClean(results, 'aria-live-region-content');
  });
});
