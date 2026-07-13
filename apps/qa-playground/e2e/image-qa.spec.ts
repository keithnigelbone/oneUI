/**
 * Image QA playground — functional Playwright tests.
 * Selectors mirror `ImageQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **display** (default `role="img"`) · **interactive** (`<button>` when `interactive`).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Image defects.
 *
 * **Raised defect (tests must fail until fixed — do not soften):**
 * - BUG-IMAGE-001 — `image-bug-interactive-disabled` must expose `<button disabled>` but
 *   `useImageState` sets `isInteractive = interactive && !disabled`, so a non-interactive
 *   `role="img"` div is rendered instead (Group 3.2, a11y role test).
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `e2e/image-playground/manifest.ts` → `IMAGE_DATA_SECTIONS` (9 bands)
 * - data-testid: `IMAGE_ALL_TESTIDS` (20 image roots + click counter)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  IMAGE_SHOWCASE_AXE_SCOPE,
  IMAGE_TAG_SET,
  imageRoot,
  ImageTags,
  openImageFigmaValidationTab,
  openImageTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
  expectSectionVisible,
  waitForBrokenImageFallback,
  waitForCustomImageFallback,
} from './image/image-qa-support';
import {
  expectFocusRingVisible,
  imageBox,
  imageBorderRadius,
  imageImg,
  imageObjectFitRgb,
  imageSection,
  imageWidthHeight,
} from './image-playground/imageHelpers';
import {
  IMAGE_ALL_ROOT_TESTIDS,
  IMAGE_ALL_TESTIDS,
  IMAGE_DATA_SECTIONS,
  IMAGE_FIGMA_ASPECTS,
  IMAGE_FIT_MODES,
  IMAGE_LOADING_MODES,
  IMAGE_ROOT_TESTIDS,
  IMAGE_SECTION_COUNT,
  imageFitTestId,
  imageLoadingTestId,
} from './image-playground/manifest';
import { IMAGE_INTERACTIVE_DISABLED_BEHAVIOR_TEST } from './qa-component-test-labels';

test.describe('Functional', { tag: IMAGE_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openImageTestScenarios(page);
  });

  test('[fn] Component page shows title and all QA tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Image', level: 1 })).toBeVisible();
    for (const tab of ['Test Scenarios', 'Figma Validation', 'Accessibility', 'Functional Tests']) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }
  });

  test('[fn] Default image is visible and has aria-label “Landscape”', async ({ page }) => {
    const root = imageRoot(page, IMAGE_ROOT_TESTIDS.default);
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute('aria-label', 'Landscape');
  });

  test('[fn] Figma aspect ratios set data-aspect-ratio (auto omits the attribute)', async ({ page }) => {
    for (const { testId, ratio } of IMAGE_FIGMA_ASPECTS) {
      const root = imageRoot(page, testId);
      await expect(root).toBeVisible();
      if (ratio) {
        await expect(root).toHaveAttribute('data-aspect-ratio', ratio);
      } else {
        await expect(root).not.toHaveAttribute('data-aspect-ratio');
      }
    }
  });


  test('[fn] Interactive image acts as a button and increments click counter', async ({ page }) => {
    const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
    await expect(interactive).toHaveRole('button');
    await interactive.click();
    await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toContainText('clicks: 1');
  });

  test('[fn] Broken image URL shows default icon and custom fallback text', async ({ page }) => {
    await waitForBrokenImageFallback(page, IMAGE_ROOT_TESTIDS.fallbackDefault);
    await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.fallbackDefault).locator('svg')).toBeVisible();
    await waitForCustomImageFallback(page, IMAGE_ROOT_TESTIDS.fallbackNode, 'Custom fallback');
  });

  test('[fn] Lazy and eager loading strategies set the img loading attribute', async ({ page }) => {
    await expect(imageImg(imageRoot(page, imageLoadingTestId('lazy')))).toHaveAttribute('loading', 'lazy');
    await expect(imageImg(imageRoot(page, imageLoadingTestId('eager')))).toHaveAttribute('loading', 'eager');
  });

  test('[fn] Labelled example exposes descriptive aria-label', async ({ page }) => {
    await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.a11yLabelled)).toHaveAttribute(
      'aria-label',
      'Taj Mahal at sunrise',
    );
  });

  test('[fn] Radius token override example renders', async ({ page }) => {
    await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.radiusToken)).toBeVisible();
  });

  test('[fn] All Test Scenarios story bands are mounted on the page', async ({ page }) => {
    for (const section of IMAGE_DATA_SECTIONS) {
      await expect(page.locator(`[data-section="${section}"]`)).toBeVisible();
    }
  });

  test('[fn] Figma Validation tab shows API table and aspect-ratio grid', async ({ page }) => {
    await openImageFigmaValidationTab(page);
    await expect(page.getByTestId('image-api-validation-root')).toBeVisible();
    await expect(page.getByTestId('figma-image-aspect-grid')).toBeVisible();
    await expect(page.getByTestId('image-figma-val-16-9-cover')).toBeVisible();
    await expect(page.getByTestId('image-figma-val-16-9-cover')).toHaveAttribute('data-aspect-ratio', '16:9');
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [ImageTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default image mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openImageTestScenarios(page);
      await qaStep('Assert no unexpected console errors on load', async () => {
        await assertNoConsoleErrors(errors, { allowBrokenImageResourceErrors: true });
      });
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      for (const testId of IMAGE_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const locator = page.getByTestId(testId);
          await locator.scrollIntoViewIfNeeded();
          await expect(locator, `Expected visible: ${testId}`).toBeVisible();
          const text = (await locator.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of IMAGE_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="image-qa-"]')).toHaveCount(IMAGE_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [ImageTags.functional] }, () => {
    test('2.1 — Default image: role img, aria-label from alt', async ({ page }) => {
      const root = imageRoot(page, IMAGE_ROOT_TESTIDS.default);
      await expect(root).toHaveRole('img');
      await expect(root).toHaveAttribute('aria-label', 'Landscape');
      await expect(root).not.toHaveAttribute('data-aspect-ratio');
    });

    test('2.1 — Each aspect ratio cell emits matching data-aspect-ratio', async ({ page }) => {
      for (const { testId, ratio } of IMAGE_FIGMA_ASPECTS) {
        const root = imageRoot(page, testId);
        if (ratio) {
          await expect(root, testId).toHaveAttribute('data-aspect-ratio', ratio);
        } else {
          await expect(root, testId).not.toHaveAttribute('data-aspect-ratio');
        }
      }
    });


    test('2.1 — Lazy and eager loading attributes on img', async ({ page }) => {
      for (const mode of IMAGE_LOADING_MODES) {
        await expect(imageImg(imageRoot(page, imageLoadingTestId(mode)))).toHaveAttribute('loading', mode);
      }
    });

    test('2.2 — Aspect ratio scaling: 16:9 is wider than tall; 9:16 is taller than wide', async ({
      page,
    }) => {
      const wide = imageRoot(page, 'image-aspect-16-9');
      const tall = imageRoot(page, 'image-aspect-9-16');
      await wide.scrollIntoViewIfNeeded();
      await tall.scrollIntoViewIfNeeded();
      const wideBox = await imageWidthHeight(wide);
      const tallBox = await imageWidthHeight(tall);
      expect(wideBox.width / wideBox.height, '16:9 width/height').toBeGreaterThan(1.2);
      expect(tallBox.height / tallBox.width, '9:16 height/width').toBeGreaterThan(1.2);
    });

    test('2.3 — Appearance colour (N/A)', async () => {
      qaLog('Skipped — Image has no appearance colour prop');
    });
  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [ImageTags.functional] }, () => {
    test('3.1 — Single click on interactive image increments counter', async ({ page }) => {
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await expect(interactive).toHaveRole('button');
      await interactive.click();
      await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toContainText('clicks: 1');
      await interactive.click();
      await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toContainText('clicks: 2');
    });

    test(`3.2 — ${IMAGE_INTERACTIVE_DISABLED_BEHAVIOR_TEST}`, async ({ page }) => {
      const bug = imageRoot(page, IMAGE_ROOT_TESTIDS.bugInteractiveDisabled);
      await expect(bug, 'Interactive + disabled should render as disabled button').toHaveRole('button');
      await expect(bug).toBeDisabled();
      const countBefore = await page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount).textContent();
      await bug.click({ force: true });
      await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toHaveText(countBefore ?? '');
    });
    test('3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — Image has no readonly prop');
    });

    test('3.4 — Click outside removes focus from interactive image', async ({ page }) => {
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await expect(interactive).toBeFocused();
      await page.locator('body').click({ position: { x: 8, y: 8 } });
      await expect(interactive).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [ImageTags.functional] }, () => {
    test('4.1 — Tab reaches interactive image button', async ({ page }) => {
      await imageRoot(page, IMAGE_ROOT_TESTIDS.interactive).scrollIntoViewIfNeeded();
      await page.keyboard.press('Tab');
      let found = false;
      for (let i = 0; i < 30; i++) {
        const focused = page.locator(':focus');
        if ((await focused.getAttribute('data-testid')) === IMAGE_ROOT_TESTIDS.interactive) {
          found = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(found, 'Interactive image should be reachable via Tab').toBe(true);
    });

    test('4.2 — Enter activates interactive image', async ({ page }) => {
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toContainText('clicks: 1');
    });

    test('4.3 — Space activates interactive image', async ({ page }) => {
      await page.reload();
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await page.keyboard.press('Space');
      await expect(page.getByTestId(IMAGE_ROOT_TESTIDS.clickCount)).toContainText('clicks: 1');
    });

    test('4.4 — Arrow keys (N/A for single image)', async () => {
      qaLog('Skipped — single interactive image; no arrow-key list');
    });

    test('4.5 — Home/End (N/A)', async () => {
      qaLog('Skipped — not a list component');
    });

    test('4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — Image does not open overlay');
    });

    test('4.7 — Tab escapes interactive image without trap', async ({ page }) => {
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.focus();
      for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
      await expect(interactive).not.toBeFocused();
    });
  });

  // ── GROUP 5 — Focus management ─────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [ImageTags.functional] }, () => {
    test('5.1 — Interactive image receives focus on click', async ({ page }) => {
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.click();
      await expect(interactive).toBeFocused();
    });

    test('5.2 — Focus indicator visible on interactive image (keyboard :focus-visible)', async ({
      page,
    }) => {
      await imageRoot(page, IMAGE_ROOT_TESTIDS.interactive).scrollIntoViewIfNeeded();
      // Image.module.css paints halo on :focus-visible only — keyboard Tab, not programmatic .focus()
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        if ((await focused.getAttribute('data-testid')) === IMAGE_ROOT_TESTIDS.interactive) break;
      }
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await expect(interactive).toBeFocused();
      await expectFocusRingVisible(interactive, IMAGE_ROOT_TESTIDS.interactive);
    });

    test('5.3 — Non-interactive default image is not tabbable', async ({ page }) => {
      const root = imageRoot(page, IMAGE_ROOT_TESTIDS.default);
      await root.click();
      await expect(root).not.toBeFocused();
    });

    test('5.4 — Blur removes focus from interactive image', async ({ page }) => {
      const interactive = imageRoot(page, IMAGE_ROOT_TESTIDS.interactive);
      await interactive.focus();
      await expect(interactive).toBeFocused();
      await page.locator('body').click({ position: { x: 8, y: 8 } });
      await expect(interactive).not.toBeFocused();
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — Image showcase has no autoFocus example');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [ImageTags.functional] }, () => {
    test('6.1 — Default display image renders with role img', async ({ page }) => {
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).toHaveRole('img');
    });

    test('6.3 — Bug repro disabled image is not in Tab order as enabled control', async ({ page }) => {
      const bug = imageRoot(page, IMAGE_ROOT_TESTIDS.bugInteractiveDisabled);
      await bug.scrollIntoViewIfNeeded();
      if (await bug.evaluate((el) => el.tagName.toLowerCase() === 'button')) {
        await expect(bug).toBeDisabled();
        return;
      }
      await bug.focus();
      await expect(bug).not.toBeFocused();
    });

    test('6.6 — Loading strategy (lazy/eager) — img loading attribute present', async ({ page }) => {
      await expect(imageImg(imageRoot(page, imageLoadingTestId('lazy')))).toHaveAttribute('loading', 'lazy');
      await expect(imageImg(imageRoot(page, imageLoadingTestId('eager')))).toHaveAttribute('loading', 'eager');
    });
  });

  // ── GROUP 7 — Slots (N/A) ──────────────────────────────────────────────────
  test.describe('Group 7 — Start/end slots (N/A)', { tag: [ImageTags.functional] }, () => {
    test('7.x — Image has no start/end slot API', async () => {
      qaLog('Skipped — Image uses src/alt/fallback only');
    });
  });

  // ── GROUP 8–9 — N/A ────────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [ImageTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — Image is not selectable');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [ImageTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — Image is not typed entry');
    });
  });

  // ── GROUP 10 — Dependency rules (interactive ∧ disabled) ─────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [ImageTags.functional] }, () => {
    test('10.1 — Non-interactive images use role img (not button)', async ({ page }) => {
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).toHaveRole('img');
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).not.toHaveRole('button');
    });

    test('10.2 — Interactive without disabled renders button', async ({ page }) => {
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.interactive)).toHaveRole('button');
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.interactive)).toBeEnabled();
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [ImageTags.functional] }, () => {
    test('11.1 — aria-label reflects alt text on labelled images', async ({ page }) => {
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.a11yLabelled)).toHaveAttribute(
        'aria-label',
        'Taj Mahal at sunrise',
      );
    });

    test('11.2 — Default image renders inner img with presentation role', async ({ page }) => {
      const img = imageImg(imageRoot(page, IMAGE_ROOT_TESTIDS.default));
      await expect(img).toBeVisible();
      await expect(img).toHaveAttribute('role', 'presentation');
    });

    test('11.2 — Broken image fallback shows default SVG icon', async ({ page }) => {
      await waitForBrokenImageFallback(page, IMAGE_ROOT_TESTIDS.fallbackDefault);
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.fallbackDefault).locator('svg')).toBeVisible();
    });

    test('11.1 — Custom fallback text renders in fallback node', async ({ page }) => {
      await waitForCustomImageFallback(page, IMAGE_ROOT_TESTIDS.fallbackNode, 'Custom fallback');
    });

    test('11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — Image is not a progress indicator');
    });
  });

  // ── GROUP 12 — Layout and responsive ─────────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [ImageTags.functional] }, () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Image uses width prop, not fullWidth');
    });

    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openImageTestScenarios(page);
      for (const sectionId of IMAGE_DATA_SECTIONS) {
        const band = imageSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default image visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openImageTestScenarios(page);
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Aspect band cells in DOM order (auto before 9:16)', async ({ page }) => {
      const band = imageSection(page, 'image-qa-aspect');
      await band.scrollIntoViewIfNeeded();
      const aspectIds = await band.locator('[data-testid^="image-aspect-"]').evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-testid')).filter(Boolean),
      );
      expect(aspectIds.indexOf('image-aspect-auto')).toBeLessThan(aspectIds.indexOf('image-aspect-9-16'));
    });

    test('12.1 — Radius token override applies non-zero border-radius', async ({ page }) => {
      const root = imageRoot(page, IMAGE_ROOT_TESTIDS.radiusToken);
      const radius = await imageBorderRadius(root);
      expect(radius, 'image-radius-token border-radius').not.toBe('0px');
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [ImageTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      const tab = page.getByRole('tab', { name: 'Test Scenarios' });
      if ((await tab.getAttribute('aria-selected')) !== 'true') {
        await tab.click();
      }
      await imageRoot(page, IMAGE_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
      for (const sectionId of IMAGE_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('13.1 — Default image remains visible in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).toBeVisible();
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: IMAGE_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Image”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Image', level: 1 })).toBeVisible();
    });

    test('Smoke — Default image visible with aria-label', async ({ page }) => {
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).toBeVisible();
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.default)).toHaveAttribute('aria-label', 'Landscape');
    });

    test('Smoke — Interactive image is a button', async ({ page }) => {
      await expect(imageRoot(page, IMAGE_ROOT_TESTIDS.interactive)).toHaveRole('button');
    });

    test('Smoke — Manifest root testid count in showcase', async ({ page }) => {
      await expect(page.locator(`${IMAGE_SHOWCASE_AXE_SCOPE} [data-testid^="image-"]`)).toHaveCount(
        IMAGE_ALL_TESTIDS.length,
      );
    });
  });
});

test.describe('Functional — page chrome', { tag: IMAGE_TAG_SET.functional }, () => {
  test('[fn] theme toggle updates label', async ({ page }) => {
    await openImageTestScenarios(page);
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });
});
