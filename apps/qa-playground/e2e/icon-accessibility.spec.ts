/**
 * Icon QA playground — WCAG 2.1 AA automation (axe-core),
 * WAI-ARIA checks, and responsive reflow validation.
 *
 * Selectors mirror `IconQaShowcase.tsx`.
 *
 * **QA rule:** Fail on Icon defects; scope axe to story bands for shell noise.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  ICON_TAG_SET,
  formatAxeViolations,
  iconRoot,
  openIconTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
ICON_SHOWCASE_AXE_SCOPE
} from './icon/icon-qa-support';
import { iconSection } from './icon-playground/iconHelpers';
import {
  ICON_DATA_SECTIONS,
  ICON_ROOT_TESTIDS
} from './icon-playground/manifest';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  ICON_ACCESSIBLE_NAME_DEFAULT_TEST,
  ICON_ACCESSIBLE_NAME_LABELLED_TEST,
  ICON_A11Y_BANDS,
  ICON_ARIA_HIDDEN_DECORATIVE_TEST,
  ICON_ARIA_VALIDITY_BAND_TEST,
  ICON_REFLOW_320_TEST,
  ICON_SVG_DECORATIVE_SCAN_TEST
} from './qa-component-test-labels';
import { blockingViolations, expectA11yClean } from './qa-axe-helpers';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.beforeEach(async ({ page }) => {
  await openIconTestScenarios(page);
});

test.describe('Accessibility', { tag: ICON_TAG_SET.accessibility }, () => {
  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report', async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on Icon story bands (Test Scenarios)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Icon showcase story bands',
        include: ICON_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const { id, title } of ICON_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      await qaStep(`axe WCAG tags on [data-section="${id}"]`, async () => {
        const results = await new AxeBuilder({ page })
          .include(`[data-section="${id}"]`)
          .withTags([...WCAG_AA_TAGS])
          .analyze();
        if (id === 'icon-qa-default') {
          writeAxeArtifact(results);
        }
        const blocking = seriousOrCritical(results.violations);
        expect(blocking, `${title}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
      });
    });
  }

  for (const section of ICON_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test(`[a11y] ${ICON_ARIA_VALIDITY_BAND_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: 'icon-qa-a11y' });
    await qaStep('ARIA validity rules on accessibility band', async () => {
      const results = await new AxeBuilder({ page })
        .include('[data-section="icon-qa-a11y"]')
        .withRules([
          'aria-roles',
          'aria-required-attr',
          'aria-valid-attr',
          'aria-valid-attr-value',
          'aria-prohibited-attr',
          'aria-required-children',
        ])
        .analyze();
      const blocking = blockingViolations(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  test(`[a11y] role-img-alt rule — labelled icons in showcase`, async ({ page }) => {
    await qaStep('role-img-alt on default labelled icon', async () => {
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${ICON_ROOT_TESTIDS.default}"]`)
        .withRules(['role-img-alt'])
        .analyze();
      expectA11yClean(results, 'icon-default role-img-alt');
    });
  });

  test(`[a11y] ${ICON_SVG_DECORATIVE_SCAN_TEST}`, async ({ page }) => {
    await qaStep('Scan SVG nodes inside showcase bands', async () => {
      const icons = page.locator(`${ICON_SHOWCASE_AXE_SCOPE} svg`);
      const count = await icons.count();
      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const ariaLabel = await icon.getAttribute('aria-label');
        const ariaHidden = await icon.getAttribute('aria-hidden');
        const role = await icon.getAttribute('role');
        const title = await icon.locator('title').count();
        expect(
          ariaLabel || ariaHidden === 'true' || role || title > 0,
          `SVG index ${i} in showcase bands must be labelled, hidden, have role, or title`,
        ).toBeTruthy();
      }
    });
  });

  test(`[a11y] ${ICON_REFLOW_320_TEST}`, async ({ page }) => {
    await qaStep('Set viewport to 320px and verify bands do not overflow', async () => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto('/c/icon');
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      for (const { id } of ICON_A11Y_BANDS) {
        const band = iconSection(page, id);
        await expect(band, id).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `${id} horizontal overflow at 320px`).toBe(false);
      }
    });
  });

  test(`[a11y] ${ICON_ACCESSIBLE_NAME_DEFAULT_TEST}`, async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.default)).toHaveAccessibleName('Heart');
  });

  test(`[a11y] ${ICON_ARIA_HIDDEN_DECORATIVE_TEST}`, async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.a11yDecorative)).toHaveAttribute('aria-hidden', 'true');
  });

  test(`[a11y] ${ICON_ACCESSIBLE_NAME_LABELLED_TEST}`, async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.a11yLabelled)).toHaveAccessibleName('Favourited');
  });

  test('[a11y] Section 508 tag run on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(ICON_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] label rule on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(ICON_SHOWCASE_AXE_SCOPE)
      .withRules(['label'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
});
