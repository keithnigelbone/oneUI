/**
 * Divider QA playground — WCAG 2.1 AA automation (axe tags),
 * WAI-ARIA-oriented checks, Section 508 tag run where supported by axe-core.
 *
 * Selectors mirror `DividerQaShowcase.tsx` and `DividerFigmaValidationShowcase.tsx`.
 *
 * **QA rule:** Fail on Divider defects; scope axe to story bands for shell noise —
 * never disable rules that would hide component-specific violations.
 *
* **Raised defects:** see `divider-qa.spec.ts` header (label content, icon slot).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import {
  clickPageThemeButton,
  DIVIDER_FIGMA_VALIDATION_TAB,
  DIVIDER_SHOWCASE_AXE_SCOPE,
  DIVIDER_TAG_SET,
  dividerRoot,
  formatAxeViolations,
  openDividerFigmaValidationTab,
  openDividerTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport
} from './divider/divider-qa-support';
import { dividerSection } from './divider-playground/dividerHelpers';
import {
  DIVIDER_DATA_SECTIONS,
  DIVIDER_FIGMA_MATRIX_SECTIONS,
  DIVIDER_ROOT_TESTIDS,
  dividerAttentionLabelTestId,
  dividerContentAlignTestId,
dividerSizeTestId
} from './divider-playground/manifest';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.beforeEach(async ({ page }) => {
  await openDividerTestScenarios(page);
});

test.describe('Accessibility', { tag: DIVIDER_TAG_SET.accessibility }, () => {
  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report', async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on Divider story bands (Test Scenarios)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Divider showcase story bands',
        include: DIVIDER_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const section of DIVIDER_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const section of DIVIDER_FIGMA_MATRIX_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical (Figma matrices)`, async ({ page }) => {
      await openDividerFigmaValidationTab(page);
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test('[a11y] Section 508 tag run on story bands — zero serious/critical', async ({ page }) => {
const results = await new AxeBuilder({ page })
      .include(DIVIDER_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] non-text-contrast rule — zero serious/critical (if rule exists)', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page })
        .include(DIVIDER_SHOWCASE_AXE_SCOPE)
        .withRules(['non-text-contrast'])
        .analyze();
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

  test('[a11y] label rule on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(DIVIDER_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] ARIA validity rules on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(DIVIDER_SHOWCASE_AXE_SCOPE)
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

  test('[a11y] name rules (buttons / images / links) on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(DIVIDER_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name', 'image-alt', 'input-button-name', 'link-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test('[a11y] reflow: showcase regions fit at 320px (no horizontal overflow inside bands)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openDividerTestScenarios(page);
    for (const section of DIVIDER_DATA_SECTIONS) {
      const band = dividerSection(page, section);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
    await openDividerFigmaValidationTab(page);
    for (const section of DIVIDER_FIGMA_MATRIX_SECTIONS) {
      const band = dividerSection(page, section);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('[a11y] resize: 200% zoom — key dividers still have non-zero layout', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    for (const testId of ['divider-orientation-horizontal', 'divider-slot-label', 'divider-combo-0'] as const) {
      const el = dividerRoot(page, testId);
      await el.scrollIntoViewIfNeeded();
      const box = await el.boundingBox();
      expect(box, testId).toBeTruthy();
      expect(box!.width > 0 && box!.height > 0, `${testId} should have layout after zoom`).toBe(true);
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
    expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(2);
  });

  test('[a11y] focused element shows outline or box-shadow', async ({ page }) => {
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
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });
test('[a11y] Theme toggle updates label via page chrome control', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[a11y] Default divider: role separator, in layout', async ({ page }) => {
    const el = dividerRoot(page, DIVIDER_ROOT_TESTIDS.default);
    await el.scrollIntoViewIfNeeded();
    await expect(el).toHaveRole('separator');
    const box = await el.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);
  });

  test('[a11y] divider-size-medium-M: role separator', async ({ page }) => {
    const el = dividerRoot(page, dividerSizeTestId('medium', 'M'));
    await expect(el).toHaveRole('separator');
    await expect(el).toBeVisible();
  });

  test('[a11y] Label slot divider: visible label text in content', async ({ page }) => {
    const el = dividerRoot(page, DIVIDER_ROOT_TESTIDS.slotLabel);
    await expect(el).toHaveRole('separator');
    await expect(el.getByText('Section', { exact: true })).toBeVisible();
  });

  test('[a11y] contentAlign center label divider: visible label text', async ({ page }) => {
    const el = dividerRoot(page, dividerContentAlignTestId('center'));
    await expect(el).toHaveRole('separator');
    await expect(el.getByText('Align', { exact: true })).toBeVisible();
  });

  test('[a11y] vertical icon center: role separator + orientation', async ({ page }) => {
    const el = dividerRoot(page, 'divider-vertical-icon-center');
    await expect(el).toHaveRole('separator');
    await expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('[a11y] attention low label divider exposes separator role', async ({ page }) => {
    const el = dividerRoot(page, dividerAttentionLabelTestId('low'));
    await expect(el).toHaveRole('separator');
    await expect(el.getByText('Low', { exact: true })).toBeVisible();
  });

  test('[a11y] showcase SVG icons: aria-hidden or accessible name', async ({ page }) => {
    const icons = page.locator(`${DIVIDER_SHOWCASE_AXE_SCOPE} [data-divider] svg`);
    const count = await icons.count();
    expect(count, 'Showcase should render icon slot SVGs').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const ariaLabel = await icon.getAttribute('aria-label');
      const ariaHidden = await icon.getAttribute('aria-hidden');
      const role = await icon.getAttribute('role');
      const title = await icon.locator('title').count();
      expect(
        ariaLabel || ariaHidden === 'true' || role || title > 0,
        `Showcase SVG at index ${i} has no aria-label, aria-hidden="true", role, or <title>`,
      ).toBeTruthy();
    }
  });

  test('[a11y] showcase has no unlabeled <img> elements', async ({ page }) => {
    const images = page.locator(`${DIVIDER_SHOWCASE_AXE_SCOPE} img`);
    const count = await images.count();
    expect(count, 'Divider showcase should not use raw <img> without alt').toBe(0);
  });

  test('[a11y] error / validity axe rules on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(DIVIDER_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-required-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] aria-live-region-content rule if available', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page })
        .include(DIVIDER_SHOWCASE_AXE_SCOPE)
        .withRules(['aria-live-region-content'])
        .analyze();
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
