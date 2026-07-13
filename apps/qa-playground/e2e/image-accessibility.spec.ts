/**
 * Image QA playground — WCAG 2.1 AA automation (axe-core),
 * keyboard activation, and Figma Validation scans.
 *
 * **QA rule:** Fail on Image defects; scope axe to story bands for shell noise.
 * Do not use test.fail(), skip, or weakened assertions to green-wash component bugs.
 * **Raised defect:** BUG-IMAGE-001 — interactive+disabled must be `<button disabled>` (role test + axe).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  IMAGE_BUG_BAND,
  IMAGE_BUG_EXCLUDE,
  IMAGE_BUG_ID,
  IMAGE_DATA_SECTIONS,
IMAGE_ROOT_TESTIDS,
} from './image-playground/manifest';
import {
  formatAxeViolations,
  IMAGE_SHOWCASE_AXE_SCOPE,
  IMAGE_TAG_SET,
  imageRoot,
  openImageFigmaValidationTab,
  openImageTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './image/image-qa-support';
import { imageSection } from './image-playground/imageHelpers';
import { qaAnnotate } from './qa-a11y-test-meta';
import {
  IMAGE_A11Y_BANDS,
  IMAGE_ACCESSIBLE_NAME_LABELLED_TEST,
  IMAGE_BUG_AXE_TEST,
  IMAGE_BUG_ROLE_TEST,
IMAGE_FALLBACK_CONTRAST_TEST,
  IMAGE_FIGMA_WCAG_TEST,
  IMAGE_IMAGE_ALT_TEST,
  IMAGE_KEYBOARD_ENTER_TEST,
  IMAGE_KEYBOARD_SPACE_TEST,
IMAGE_REFLOW_320_TEST,
} from './qa-component-test-labels';
import { expectA11yClean } from './qa-axe-helpers';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.describe('Accessibility', { tag: IMAGE_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openImageTestScenarios(page);
  });

  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report (exclude bug repro)', async ({
page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Image story bands', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Image showcase story bands',
        include: IMAGE_SHOWCASE_AXE_SCOPE,
        exclude: IMAGE_BUG_EXCLUDE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const { id, title } of IMAGE_A11Y_BANDS) {
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

  for (const section of IMAGE_DATA_SECTIONS) {
    if (section === IMAGE_BUG_BAND) continue;
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

test(`[a11y] ${IMAGE_IMAGE_ALT_TEST}`, async ({ page }) => {
    await qaStep('image-alt rule excluding bug repro band', async () => {
      const results = await new AxeBuilder({ page })
        .exclude(IMAGE_BUG_EXCLUDE)
        .withRules(['image-alt'])
        .analyze();
      expectA11yClean(results, IMAGE_IMAGE_ALT_TEST, {
        includeModerateRules: ['image-alt']
});
    });
  });
  test(`[a11y] ${IMAGE_KEYBOARD_ENTER_TEST}`, async ({ page }) => {
    await qaStep('Enter key activates interactive image', async () => {
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toContainText('clicks: 1');
    });
  });

  test(`[a11y] ${IMAGE_KEYBOARD_SPACE_TEST}`, async ({ page }) => {
    await qaStep('Space key activates interactive image', async () => {
      await page.reload();
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await page.keyboard.press('Space');
      await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toContainText('clicks: 1');
    });
  });

  test(`[a11y] ${IMAGE_BUG_ROLE_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: IMAGE_BUG_BAND, bugId: IMAGE_BUG_ID });
    await qaStep('interactive + disabled must expose button disabled semantics', async () => {
      const el = imageRoot(page, IMAGE_ROOT_TESTIDS.bugInteractiveDisabled);
await expect(el, 'Interactive + disabled expected <button disabled>').toHaveRole('button');
      await expect(el).toBeDisabled();
    });
  });

  test(`[a11y] ${IMAGE_BUG_AXE_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: IMAGE_BUG_BAND, bugId: IMAGE_BUG_ID });
    await qaStep('Bug repro band must fail axe until Image fixes interactive+disabled', async () => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${IMAGE_BUG_BAND}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      writeAxeArtifact(results);
      expectA11yClean(results, IMAGE_BUG_AXE_TEST);
    });
  });

  test(`[a11y] ${IMAGE_ACCESSIBLE_NAME_LABELLED_TEST}`, async ({ page }) => {
    await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.a11yLabelled)).toHaveAttribute(
      'aria-label',
      'Taj Mahal at sunrise',
    );
  });

  test(`[a11y] ${IMAGE_REFLOW_320_TEST}`, async ({ page }) => {
    await qaStep('Set viewport to 320px and verify bands do not overflow', async () => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto('/c/image');
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      for (const { id } of IMAGE_A11Y_BANDS) {
        const band = imageSection(page, id);
        await expect(band, id).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `${id} horizontal overflow at 320px`).toBe(false);
      }
    });
  });

  test('[a11y] Section 508 tag run on story bands (exclude bug repro) — zero serious/critical', async ({
page,
  }) => {
    const results = await new AxeBuilder({ page })
      .include(IMAGE_SHOWCASE_AXE_SCOPE)
      .exclude(IMAGE_BUG_EXCLUDE)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
});

test.describe('Accessibility — Figma Validation', { tag: IMAGE_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/c/image');
    await openImageFigmaValidationTab(page);
  });

  test(`[a11y] ${IMAGE_FIGMA_WCAG_TEST}`, async ({ page }) => {
    await qaStep('WCAG 2.1 AA on Figma aspect-ratio grid', async () => {
      const results = await new AxeBuilder({ page })
        .include('[data-testid="figma-image-aspect-grid"]')
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, IMAGE_FIGMA_WCAG_TEST);
    });
  });
});
