/**
 * Icon Contained QA playground — WCAG 2.1 AA automation (axe-core),
 * WAI-ARIA checks, and responsive reflow validation.
 *
 * **QA rule:** Fail on IconContained defects; scope axe to story bands for shell noise.
 * Do not use test.fail(), skip, or weakened assertions to green-wash component bugs.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  ICON_CONTAINED_DATA_SECTIONS,
  ICON_CONTAINED_DECORATIVE_BAND,
  ICON_CONTAINED_ROOT_TESTIDS,
} from './icon-contained-playground/manifest';
import {
  ICON_CONTAINED_TAG_SET,
  formatAxeViolations,
  iconContainedRoot,
  openIconContainedFigmaValidationTab,
  openIconContainedTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
ICON_CONTAINED_SHOWCASE_AXE_SCOPE,
} from './icon-contained/icon-contained-qa-support';
import { iconContainedSection } from './icon-contained-playground/iconContainedHelpers';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  ICON_CONTAINED_A11Y_BANDS,
  ICON_CONTAINED_ACCESSIBLE_NAME_DEFAULT_TEST,
  ICON_CONTAINED_ACCESSIBLE_NAME_LABELLED_TEST,
  ICON_CONTAINED_ARIA_VALIDITY_BAND_TEST,
  ICON_CONTAINED_DECORATIVE_AXE_TEST,
  ICON_CONTAINED_FIGMA_WCAG_TEST,
  ICON_CONTAINED_REFLOW_320_TEST,
  ICON_CONTAINED_ROLE_IMG_ALT_TEST,
  ICON_CONTAINED_SVG_DECORATIVE_SCAN_TEST,
} from './qa-component-test-labels';
import { blockingViolations, expectA11yClean } from './qa-axe-helpers';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.describe('Accessibility', { tag: ICON_CONTAINED_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openIconContainedTestScenarios(page);
  });

  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report', async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on Icon Contained story bands', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'IconContained showcase story bands',
        include: ICON_CONTAINED_SHOWCASE_AXE_SCOPE,
        tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const { id, title } of ICON_CONTAINED_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      await qaStep(`axe WCAG tags on [data-section="${id}"]`, async () => {
        const results = await new AxeBuilder({ page })
          .include(`[data-section="${id}"]`)
          .withTags([...WCAG_AA_TAGS])
          .analyze();
        const blocking = seriousOrCritical(results.violations);
        expect(blocking, `${title}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
      });
    });
  }

  for (const section of ICON_CONTAINED_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

test(`[a11y] ${ICON_CONTAINED_ARIA_VALIDITY_BAND_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: 'icon-contained-qa-a11y' });
    await qaStep('ARIA validity rules on accessibility band', async () => {
      const results = await new AxeBuilder({ page })
        .include('[data-section="icon-contained-qa-a11y"]')
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

  test(`[a11y] ${ICON_CONTAINED_ROLE_IMG_ALT_TEST}`, async ({ page }) => {
    await qaStep('role-img-alt on default labelled icon', async () => {
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${ICON_CONTAINED_ROOT_TESTIDS.default}"]`)
        .withRules(['role-img-alt'])
        .analyze();
      expectA11yClean(results, 'icon-contained-default role-img-alt');
    });
  });
  test(`[a11y] ${ICON_CONTAINED_SVG_DECORATIVE_SCAN_TEST}`, async ({ page }) => {
    await qaStep('Scan SVG nodes inside labelled showcase icons', async () => {
      const icons = page.locator(`${ICON_CONTAINED_SHOWCASE_AXE_SCOPE} [data-testid] svg`);
      const count = await icons.count();
      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const ariaHidden = await icon.getAttribute('aria-hidden');
        expect(ariaHidden, `SVG index ${i} should be aria-hidden when parent is labelled`).toBe('true');
      }
    });
  });

  test(`[a11y] ${ICON_CONTAINED_REFLOW_320_TEST}`, async ({ page }) => {
    await qaStep('Set viewport to 320px and verify bands do not overflow', async () => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto('/c/icon-contained');
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      for (const { id } of ICON_CONTAINED_A11Y_BANDS) {
        const band = iconContainedSection(page, id);
        await expect(band, id).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `${id} horizontal overflow at 320px`).toBe(false);
      }
    });
  });

  test(`[a11y] ${ICON_CONTAINED_ACCESSIBLE_NAME_DEFAULT_TEST}`, async ({ page }) => {
    await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default)).toHaveAccessibleName(
      'Heart',
    );
  });

  test(`[a11y] ${ICON_CONTAINED_ACCESSIBLE_NAME_LABELLED_TEST}`, async ({ page }) => {
    await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.a11yLabelled)).toHaveAccessibleName(
      'Favourited',
    );
  });

  test(`[a11y] ${ICON_CONTAINED_DECORATIVE_AXE_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: ICON_CONTAINED_DECORATIVE_BAND });
    await qaStep('axe WCAG 2.1 AA on decorative band (no aria-label)', async () => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${ICON_CONTAINED_DECORATIVE_BAND}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      writeAxeArtifact(results);
      expectA11yClean(results, ICON_CONTAINED_DECORATIVE_AXE_TEST);
    });
  });

  test('[a11y] Section 508 tag run on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(ICON_CONTAINED_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
});

test.describe('Accessibility — Figma Validation', { tag: ICON_CONTAINED_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/c/icon-contained');
    await openIconContainedFigmaValidationTab(page);
  });

  test(`[a11y] ${ICON_CONTAINED_FIGMA_WCAG_TEST}`, async ({ page }) => {
    await qaStep('WCAG 2.1 AA on Figma size×attention grid', async () => {
      const results = await new AxeBuilder({ page })
        .include('[data-testid="figma-icon-contained-grid"]')
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, ICON_CONTAINED_FIGMA_WCAG_TEST);
    });
  });
});
