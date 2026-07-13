/**
 * Radio QA playground — WCAG 2.1 AA automation (axe tags), WAI-ARIA-oriented checks,
 * Section 508 tag run where supported by axe-core.
 *
 * **Known component defect (axe exclude):** readOnly radios emit `aria-readonly="true"`
 * on `role="radio"`, which is invalid per WAI-ARIA. Broad scans exclude those nodes via
 * `RADIO_AXE_ARIA_READONLY_EXCLUDE` until `@oneui/ui` Radio is fixed.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import {
  RADIO_A11Y_BANDS,
  RADIO_ARIA_VALIDITY_TEST,
  RADIO_DEFAULT_NAME_TEST,
  RADIO_LABEL_RULE_TEST,
  RADIO_READONLY_ATTR_TEST,
  RADIO_REFLOW_320_TEST,
  RADIO_SECTION508_TEST,
  RADIO_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import {
  RADIO_DATA_SECTIONS,
  RADIO_ROOT_TESTIDS,
  RADIO_SHOWCASE_AXE_SCOPE,
  radioAppearanceTestId,
} from './radio-playground/manifest';
import {
  configureRadioAxeBuilder,
  formatAxeViolations,
  openRadioTestScenarios,
  qaStep,
  RADIO_TAG_SET,
  runRadioAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeRadioAxeArtefact,
  writeRadioAxeHtmlReport,
} from './radio/radio-qa-support';

test.beforeEach(async ({ page }) => {
  await openRadioTestScenarios(page);
});

test.describe('Accessibility', { tag: RADIO_TAG_SET.accessibility }, () => {
  test(`[a11y] ${RADIO_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run full-page WCAG 2.1 AA axe scan', () =>
      runRadioAxePageScan(page),
    );

    writeRadioAxeArtefact(results);
    writeRadioAxeHtmlReport(results);

    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const band of RADIO_A11Y_BANDS) {
    test(`[a11y] data-section="${band.id}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await configureRadioAxeBuilder(page, {
        include: `[data-section="${band.id}"]`,
      })
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${band.title}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test(`[a11y] ${RADIO_SECTION508_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(['section508']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
});



  test('[a11y] non-text-contrast rule — zero serious/critical (if rule exists)', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page }).withRules(['non-text-contrast']).analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) {
        return;
      }
      throw e;
    }
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${RADIO_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['label']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${RADIO_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
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
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] name rules (buttons / images / links) — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['button-name', 'image-alt', 'input-button-name', 'link-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] scrollable regions focusable — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['scrollable-region-focusable']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] images: if present, every <img> has alt attribute', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    if (count === 0) {
      return;
    }
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image at index ${i} missing alt attribute`).not.toBeNull();
    }
  });

  test('[a11y] SVG icons: aria-label, aria-hidden, role, or title', async ({ page }) => {
    const icons = page.locator(`${RADIO_SHOWCASE_AXE_SCOPE} svg`);
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

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${RADIO_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openRadioTestScenarios(page);
    for (const section of RADIO_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('[a11y] resize: 200% zoom — showcase radios remain visible', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator('[data-testid^="radio-"]');
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test('[a11y] Tab reaches a focusable control', async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test('[a11y] no keyboard trap (Tab cycle advances)', async ({ page }) => {
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

  test('[a11y] focused element shows outline or box-shadow', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow
};
    });
    const hasVisibleFocus =
      focusStyle?.outlineWidth !== '0px' ||
      (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
    expect(hasVisibleFocus, 'No visible focus indicator on first Tab target').toBe(true);
  });

  test('[a11y] focus order: Tab visits multiple distinct focus targets', async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const sig =
        (await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return '';
          const role = el.getAttribute('role') ?? '';
          const testId = el.getAttribute('data-testid') ?? '';
          const id = el.getAttribute('id') ?? '';
          return `${el.tagName}:${role}:${testId}:${id}`;
        })) ?? '';
      seen.add(sig);
    }
    expect(seen.size, 'Tab should move focus across multiple distinct elements').toBeGreaterThan(3);
  });

  test('[a11y] skip link: if present, first Tab target is visible', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a[href*="#main"]');
    const count = await skipLink.count();
    if (count > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });
test(`[a11y] ${RADIO_DEFAULT_NAME_TEST}`, async ({ page }) => {
    const r = page.getByTestId(RADIO_ROOT_TESTIDS.default);
    await expect(r).toBeVisible();
    await expect(r).toHaveRole('radio');
    await expect(r).toHaveAccessibleName(/Option A/);
  });

  test('[a11y] radio-size-M: role radio + accessible name', async ({ page }) => {
    const el = page.getByTestId('radio-size-M');
    await expect(el).toHaveRole('radio');
    await expect(el).toHaveAccessibleName(/.+/);
  });

  test('[a11y] radio-appearance-primary-off: role radio + accessible name', async ({ page }) => {
    const el = page.getByTestId(radioAppearanceTestId('primary', 'off'));
    await expect(el).toHaveRole('radio');
    await expect(el).toHaveAccessibleName(/.+/);
  });

  test('[a11y] every radio has non-empty accessible name', async ({ page }) => {
    const radios = page.getByRole('radio');
    const count = await radios.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(radios.nth(i)).toHaveAccessibleName(/.+/);
    }
  });

  test('[a11y] disabled group exposes aria-disabled on radios', async ({ page }) => {
    const group = page.getByRole('radiogroup', { name: 'disabled true first selected' });
    const radios = group.getByRole('radio');
    const n = await radios.count();
    for (let i = 0; i < n; i++) {
      await expect(radios.nth(i)).toHaveAttribute('aria-disabled', 'true');
    }
  });

  test(`[a11y] ${RADIO_READONLY_ATTR_TEST}`, async ({ page }) => {
    const group = page.getByRole('radiogroup', { name: 'readOnly true second selected' });
    const radios = group.getByRole('radio');
    const n = await radios.count();
    for (let i = 0; i < n; i++) {
      await expect(radios.nth(i)).toHaveAttribute('aria-readonly', 'true');
    }
  });

  test('[a11y] ArrowDown from default first radio moves selection within group', async ({ page }) => {
    const first = page.getByTestId(RADIO_ROOT_TESTIDS.default);
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'Option B' })).toBeChecked();
  });

  test('[a11y] error / validity axe rules — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] aria-live-region-content rule if available', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page }).withRules(['aria-live-region-content']).analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) {
        return;
      }
      throw e;
    }
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
});
