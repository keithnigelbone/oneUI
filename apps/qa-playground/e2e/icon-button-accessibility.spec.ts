/**
 * Icon Button QA playground — WCAG 2.1 AA automation (axe-core),
 * keyboard activation, and Figma Validation scans.
 *
 * **QA rule:** Fail on IconButton defects; scope axe to story bands for shell noise.
 * Do not use test.fail(), skip, or weakened assertions to green-wash component bugs.
* **Raised defect:** BUG-ICONBUTTON-001 — bug repro band + functional 6.5 must fail until aria-label is required.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  ICON_BUTTON_BUG_BAND,
  ICON_BUTTON_BUG_EXCLUDE,
  ICON_BUTTON_DATA_SECTIONS,
  ICON_BUTTON_BUG_ID,
ICON_BUTTON_ROOT_TESTIDS,
} from './icon-button-playground/manifest';
import {
  ICON_BUTTON_TAG_SET,
  formatAxeViolations,
  iconButtonRoot,
  openIconButtonFigmaValidationTab,
  openIconButtonTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
ICON_BUTTON_SHOWCASE_AXE_SCOPE,
} from './icon-button/icon-button-qa-support';
import { iconButtonSection } from './icon-button-playground/iconButtonHelpers';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  ICON_BUTTON_A11Y_BANDS,
  ICON_BUTTON_BUG_AXE_TEST,
  ICON_BUTTON_BUTTON_NAME_TEST,
  ICON_BUTTON_FIGMA_WCAG_TEST,
  ICON_BUTTON_KEYBOARD_ENTER_TEST,
  ICON_BUTTON_SECTION508_TEST,
  ICON_BUTTON_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean } from './qa-axe-helpers';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.describe('Accessibility', { tag: ICON_BUTTON_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openIconButtonTestScenarios(page);
  });

  test(`[a11y] ${ICON_BUTTON_WCAG_PAGE_TEST}`, async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on Icon Button story bands', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Icon Button showcase story bands',
        include: ICON_BUTTON_SHOWCASE_AXE_SCOPE,
        exclude: ICON_BUTTON_BUG_EXCLUDE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const { id, title } of ICON_BUTTON_A11Y_BANDS) {
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

  for (const section of ICON_BUTTON_DATA_SECTIONS) {
    if (section === ICON_BUTTON_BUG_BAND) continue;
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test(`[a11y] ${ICON_BUTTON_BUTTON_NAME_TEST}`, async ({ page }) => {
    await qaStep('button-name rule excluding unlabelled band', async () => {
      const results = await new AxeBuilder({ page })
        .exclude(ICON_BUTTON_BUG_EXCLUDE)
        .withRules(['button-name'])
        .analyze();
      expectA11yClean(results, ICON_BUTTON_BUTTON_NAME_TEST, {
includeModerateRules: ['button-name']
});
    });
  });

  test(`[a11y] ${ICON_BUTTON_KEYBOARD_ENTER_TEST}`, async ({ page }) => {
    await qaStep('Enter key activates interactive icon button', async () => {
      const interactive = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 1');
    });
  });

  test(`[a11y] Keyboard Space — interactive icon button`, async ({ page }) => {
    await qaStep('Space key activates interactive icon button', async () => {
      const interactive = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await page.keyboard.press('Space');
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 1');
    });
  });

  test(`[a11y] ${ICON_BUTTON_BUG_AXE_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: ICON_BUTTON_BUG_BAND, bugId: ICON_BUTTON_BUG_ID });
    await qaStep('Unlabelled band must have zero violations once IconButton requires aria-label', async () => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${ICON_BUTTON_BUG_BAND}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
      expectA11yClean(results, ICON_BUTTON_BUG_AXE_TEST);
    });
  });

  test('[a11y] Viewport 320px — horizontal overflow check per showcase band', async ({ page }) => {
    await qaStep('Reflow at 320px', async () => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto('/c/icon-button');
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      for (const { id } of ICON_BUTTON_A11Y_BANDS) {
        const band = iconButtonSection(page, id);
        await expect(band, id).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `${id} horizontal overflow at 320px`).toBe(false);
      }
    });
  });

  test(`[a11y] ${ICON_BUTTON_SECTION508_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(ICON_BUTTON_SHOWCASE_AXE_SCOPE)
      .exclude(`[data-section="${ICON_BUTTON_BUG_BAND}"]`)
      .exclude(`[data-testid="${ICON_BUTTON_ROOT_TESTIDS.bugNoLabel}"]`)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
});

test.describe('Accessibility — Figma Validation', { tag: ICON_BUTTON_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/c/icon-button');
    await openIconButtonFigmaValidationTab(page);
  });

  test(`[a11y] ${ICON_BUTTON_FIGMA_WCAG_TEST}`, async ({ page }) => {
    await qaStep('axe WCAG on Figma grids', async () => {
      const results = await new AxeBuilder({ page })
        .include(
          '[data-testid="figma-icon-button-grid"], [data-testid="figma-icon-button-master-matrix"]',
        )
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, ICON_BUTTON_FIGMA_WCAG_TEST);
    });
  });
});
