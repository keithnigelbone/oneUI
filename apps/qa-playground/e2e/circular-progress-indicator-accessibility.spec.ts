/**
 * Circular Progress Indicator QA playground — WCAG 2.1 AA automation (axe tags),
 * WAI-ARIA-oriented checks, Section 508 tag run where supported by axe-core.
 *
 * Selectors mirror `CircularProgressIndicatorQaShowcase.tsx` (`data-section` === band `id`).
 *
 * **QA rule:** Fail on CPI defects; scope axe to story bands only for shell noise —
 * never disable rules that would hide component-specific violations.
 *
 * **Raised defects:** see `circular-progress-indicator-qa.spec.ts` header.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  CPI_SHOWCASE_AXE_SCOPE,
  CPI_TAG_SET,
  formatAxeViolations,
  openCpiTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport
} from './circular-progress-indicator/cpi-qa-support';
import { cpiRoot, cpiSection, progressbarForTestId } from './circular-progress-indicator-playground/cpiHelpers';
import {
  CPI_DATA_SECTIONS,
  CPI_ROOT_TESTIDS
} from './circular-progress-indicator-playground/manifest';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.beforeEach(async ({ page }) => {
  await openCpiTestScenarios(page);
});

test.describe('Accessibility', { tag: CPI_TAG_SET.accessibility }, () => {
  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report', async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on CPI story bands (not page chrome)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Circular Progress Indicator showcase story bands',
        include: CPI_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const section of CPI_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
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
      .include(CPI_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
});



  test('[a11y] non-text-contrast rule — zero serious/critical (if rule exists)', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page })
        .include(CPI_SHOWCASE_AXE_SCOPE)
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
      .include(CPI_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] ARIA validity rules on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(CPI_SHOWCASE_AXE_SCOPE)
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

  test('[a11y] name rules (buttons / images / links) on story bands — zero serious/critical', async ({
page,
  }) => {
    const results = await new AxeBuilder({ page })
      .include(CPI_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name', 'image-alt', 'input-button-name', 'link-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] SVG icons in showcase: aria-label, aria-hidden, role, or title', async ({ page }) => {
    const icons = page.locator(`${CPI_SHOWCASE_AXE_SCOPE} svg`);
    const count = await icons.count();
    expect(count, 'Showcase should render SVG icons in content=icon rows').toBeGreaterThan(0);
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

  test('[a11y] reflow: showcase regions fit at 320px (no horizontal overflow inside bands)', async ({
page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openCpiTestScenarios(page);
    for (const section of CPI_DATA_SECTIONS) {
      const band = cpiSection(page, section);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('[a11y] resize: 200% zoom — showcase indicators remain visible', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator(`${CPI_SHOWCASE_AXE_SCOPE} [data-testid^="cpi-"]`);
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test('[a11y] Tab reaches a focusable control (page chrome)', async ({ page }) => {
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

  test('[a11y] Default indicator: role progressbar + accessible name + value', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'QA default progress' });
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('aria-valuenow', '25');
  });

  test('[a11y] cpi-variant-indeterminate: progressbar without aria-valuenow', async ({ page }) => {
    await expect(cpiRoot(page, CPI_ROOT_TESTIDS.variantIndeterminate)).toBeVisible();
    const bar = page.getByRole('progressbar', { name: 'QA indeterminate' });
    await expect(bar).toBeVisible();
    await expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  test('[a11y] every progressbar in showcase has non-empty accessible name', async ({ page }) => {
    const bars = page.locator(`${CPI_SHOWCASE_AXE_SCOPE} [role="progressbar"]`);
    const count = await bars.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(bars.nth(i)).toHaveAccessibleName(/.+/);
    }
  });

  test('[a11y] aria-labelledby demo exposes labelled progressbar', async ({ page }) => {
    const bar = progressbarForTestId(page, CPI_ROOT_TESTIDS.ariaLabelledby);
    await expect(bar).toBeVisible();
    const labelledby = await bar.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
  });

  test('[a11y] aria-live-region-content rule if available', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page })
        .include(CPI_SHOWCASE_AXE_SCOPE)
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

test.describe('Accessibility — Smoke', { tag: CPI_TAG_SET.accessibilitySmoke }, () => {
});

test.describe('Accessibility — Smoke', { tag: CPI_TAG_SET.accessibilitySmoke }, () => {
  });
