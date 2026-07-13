/**
 * Text QA — functional coverage aligned to `TextQaShowcase.tsx`.
 *
 * Component type: **display** (Text is a pure typography primitive — no interaction state,
 * no role="checkbox", no Base UI event handling).
 *
 * **DOM contract:**
 * `<Text>` does NOT spread `...rest` onto its root element, so `data-testid` passed
 * directly to `<Text>` is silently dropped. Tests therefore use:
 *   - `[data-section="<band-id>"]` scoping (primary approach)
 *   - `data-variant` / `data-size` / `data-appearance` CSS attribute selectors
 *   - `data-testid` on wrapping `<span>` elements from `TextQaShowcase`
 *
 * **Scope:** API-based rendering, props, data attributes, semantic elements,
 * truncation, alignment, real-world compositions, and edge-case resilience.
 * Colour, layout/responsive, dark-mode, and performance tests are intentionally excluded.
 */
import { expect, test } from 'playwright/test';

import { gotoTextPlayground } from './text-playground/gotoTextPlayground';
import {
  TEXT_DATA_SECTIONS,
  TEXT_SECTION_COUNT,
  TEXT_VARIANTS,
  TEXT_BODY_SIZES,
  TEXT_LABEL_SIZES,
  TEXT_DISPLAY_SIZES,
  TEXT_CODE_SIZES,
  TEXT_APPEARANCES,
  TEXT_COMBO_COUNT,
  TEXT_TESTIDS,
} from './text-playground/manifest';
import {
  textSection,
  textByVariant,
  textBySize,
  textByAppearance,
  textInSection,
  elementByTestId,
} from './text-playground/textHelpers';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  TEXT_TAG_SET,
  TextTags,
  expectSectionVisible,
  openTextTestScenarios,
  qaStep,
} from './text/text-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/text`);
  expect(
    res.ok(),
    `Text playground must be reachable at ${origin}/c/text`,
  ).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await gotoTextPlayground(page);
});

test.describe('Functional', { tag: TEXT_TAG_SET.functional }, () => {

  /* ══ SMOKE ══════════════════════════════════════════════════════════ */
  test.describe('Smoke', { tag: TEXT_TAG_SET.smoke }, () => {
    test('Smoke — Default band renders a Text element with data-variant', async ({ page }) => {
      const band = textSection(page, 'text-qa-default');
      await expect(band).toBeVisible();
      const el = band.locator('[data-variant]').first();
      await expect(el).toBeVisible();
    });

    test('Smoke — Variants band renders all 6 typography roles', async ({ page }) => {
      const band = textSection(page, 'text-qa-variants');
      await band.scrollIntoViewIfNeeded();
      for (const variant of TEXT_VARIANTS) {
        const el = band.locator(`[data-variant="${variant}"]`).first();
        await expect(el, `Variant "${variant}" must be visible`).toBeVisible();
      }
    });

    test('Smoke — Combination matrix band renders expected number of combos', async ({ page }) => {
      const band = textSection(page, 'text-qa-combos');
      await band.scrollIntoViewIfNeeded();
      const els = band.locator('[data-variant]');
      expect(await els.count()).toBeGreaterThanOrEqual(TEXT_COMBO_COUNT);
    });
  });

  /* ══ GROUP 1 — Render ═══════════════════════════════════════════════ */
  test.describe('Group 1 — Render', { tag: [TextTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default band mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openTextTestScenarios(page);
      await qaStep('Assert no console errors', async () => assertNoConsoleErrors(errors));
      await expect(textSection(page, 'text-qa-default')).toBeVisible();
    });

    test('1.2 — Every `data-section` story band is visible', async ({ page }) => {
      test.setTimeout(120_000);
      for (const sectionId of TEXT_DATA_SECTIONS) {
        await qaStep(`Visible: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
    });

    test('1.3 — Section count matches showcase band count', async ({ page }) => {
      const sections = page.locator('[data-section^="text-qa-"]');
      await expect(sections).toHaveCount(TEXT_SECTION_COUNT);
    });

    test('1.4 — Default band: Text element has data-variant="body" and data-size="M"', async ({ page }) => {
      const el = textSection(page, 'text-qa-default').locator('[data-variant="body"]').first();
      await expect(el).toHaveAttribute('data-variant', 'body');
      await expect(el).toHaveAttribute('data-size', 'M');
    });

    test('1.5 — Default band renders expected sample content', async ({ page }) => {
      await expect(
        textInSection(page, 'text-qa-default', 'quick brown fox'),
      ).toBeVisible();
    });
  });

  /* ══ GROUP 2 — Variants ═════════════════════════════════════════════ */
  test.describe('Group 2 — Variants', { tag: [TextTags.functional] }, () => {
    for (const variant of TEXT_VARIANTS) {
      test(`2.1 — Variant "${variant}" renders element with data-variant="${variant}"`, async ({ page }) => {
        const band = textSection(page, 'text-qa-variants');
        await band.scrollIntoViewIfNeeded();
        const el = band.locator(`[data-variant="${variant}"]`).first();
        await expect(el).toBeVisible();
        await expect(el).toHaveAttribute('data-variant', variant);
      });
    }

    test('2.2 — Code variant element has monospace content', async ({ page }) => {
      const band = textSection(page, 'text-qa-variants');
      await band.scrollIntoViewIfNeeded();
      const codeEl = band.locator('[data-variant="code"]').first();
      await expect(codeEl).toBeVisible();
      await expect(codeEl).toHaveAttribute('data-variant', 'code');
    });

    test('2.3 — Display variant element has data-size="L" (largest default)', async ({ page }) => {
      const band = textSection(page, 'text-qa-variants');
      await band.scrollIntoViewIfNeeded();
      const displayEl = band.locator('[data-variant="display"]').first();
      await expect(displayEl).toHaveAttribute('data-size', 'L');
    });
  });

  /* ══ GROUP 3 — Body sizes ═══════════════════════════════════════════ */
  test.describe('Group 3 — Body Sizes', { tag: [TextTags.functional] }, () => {
    for (const size of TEXT_BODY_SIZES) {
      test(`3.1 — Body size "${size}" renders with data-size="${size}"`, async ({ page }) => {
        const band = textSection(page, 'text-qa-body-sizes');
        await band.scrollIntoViewIfNeeded();
        const el = band.locator(`[data-variant="body"][data-size="${size}"]`).first();
        await expect(el).toBeVisible();
      });
    }

    test('3.2 — Body size 3XS is clamped to 2XS (invalid size fallback)', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      const el = elementByTestId(page, TEXT_TESTIDS.edgeSizeFallback).locator('[data-variant="body"]').first();
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute('data-size', '2XS');
    });
  });

  /* ══ GROUP 4 — Label sizes ═══════════════════════════════════════════ */
  test.describe('Group 4 — Label Sizes', { tag: [TextTags.functional] }, () => {
    for (const size of TEXT_LABEL_SIZES) {
      test(`4.1 — Label size "${size}" renders with data-size="${size}"`, async ({ page }) => {
        const band = textSection(page, 'text-qa-label-sizes');
        await band.scrollIntoViewIfNeeded();
        const el = band.locator(`[data-variant="label"][data-size="${size}"]`).first();
        await expect(el).toBeVisible();
      });
    }

    test('4.2 — Label 3XS element is smaller than label 2XL (progressive scale)', async ({ page }) => {
      const band = textSection(page, 'text-qa-label-sizes');
      await band.scrollIntoViewIfNeeded();
      const small = band.locator('[data-variant="label"][data-size="3XS"]').first();
      const large = band.locator('[data-variant="label"][data-size="2XL"]').first();
      const smallBox = await small.boundingBox();
      const largeBox = await large.boundingBox();
      expect(smallBox).not.toBeNull();
      expect(largeBox).not.toBeNull();
      expect(smallBox!.height).toBeLessThanOrEqual(largeBox!.height + 2);
    });
  });

  /* ══ GROUP 5 — Display / Headline / Title sizes ═══════════════════ */
  test.describe('Group 5 — Display · Headline · Title Sizes', { tag: [TextTags.functional] }, () => {
    for (const variant of ['display', 'headline', 'title'] as const) {
      for (const size of TEXT_DISPLAY_SIZES) {
        test(`5.1 — ${variant} size "${size}" renders with data-size="${size}"`, async ({ page }) => {
          const band = textSection(page, 'text-qa-display-sizes');
          await band.scrollIntoViewIfNeeded();
          const testId = `text-${variant}-${size.toLowerCase()}`;
          const wrapper = elementByTestId(page, testId);
          const el = wrapper.locator('[data-variant]').first();
          await expect(el).toBeVisible();
          await expect(el).toHaveAttribute('data-variant', variant);
          await expect(el).toHaveAttribute('data-size', size);
        });
      }
    }
  });

  /* ══ GROUP 6 — Code sizes ════════════════════════════════════════════ */
  test.describe('Group 6 — Code Sizes', { tag: [TextTags.functional] }, () => {
    for (const size of TEXT_CODE_SIZES) {
      test(`6.1 — Code size "${size}" renders with data-size="${size}"`, async ({ page }) => {
        const band = textSection(page, 'text-qa-code-sizes');
        await band.scrollIntoViewIfNeeded();
        const el = band.locator(`[data-variant="code"][data-size="${size}"]`).first();
        await expect(el).toBeVisible();
      });
    }
  });

  /* ══ GROUP 7 — Attention and Weight ════════════════════════════════ */
  test.describe('Group 7 — Attention · Weight', { tag: [TextTags.functional] }, () => {
    test('7.1 — attention="high" element has data-attention="high"', async ({ page }) => {
      const band = textSection(page, 'text-qa-attention-weight');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-attention="high"]').first();
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute('data-attention', 'high');
    });

    test('7.2 — attention="medium" element has data-attention="medium"', async ({ page }) => {
      const band = textSection(page, 'text-qa-attention-weight');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-attention="medium"]').first();
      await expect(el).toHaveAttribute('data-attention', 'medium');
    });

    test('7.3 — attention="low" element has data-attention="low"', async ({ page }) => {
      const band = textSection(page, 'text-qa-attention-weight');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-attention="low"]').first();
      await expect(el).toHaveAttribute('data-attention', 'low');
    });

    test('7.4 — attention="tintedA11y" element has data-attention="tintedA11y"', async ({ page }) => {
      const band = textSection(page, 'text-qa-attention-weight');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-attention="tintedA11y"]').first();
      await expect(el).toHaveAttribute('data-attention', 'tintedA11y');
    });

    test('7.5 — attention="none" resolves to data-attention="high"', async ({ page }) => {
      const band = textSection(page, 'text-qa-default');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-variant="body"]').first();
      await expect(el).toHaveAttribute('data-attention', 'high');
    });

    test('7.6 — weight prop emits data-weight attribute', async ({ page }) => {
      const band = textSection(page, 'text-qa-attention-weight');
      await band.scrollIntoViewIfNeeded();
      for (const weight of ['high', 'medium', 'low']) {
        const el = band.locator(`[data-weight="${weight}"]`).first();
        await expect(el).toHaveAttribute('data-weight', weight);
      }
    });
  });

  /* ══ GROUP 8 — Appearances ══════════════════════════════════════════ */
  test.describe('Group 8 — Appearances', { tag: [TextTags.functional] }, () => {
    for (const appearance of TEXT_APPEARANCES) {
      test(`8.1 — appearance="${appearance}" renders with data-appearance`, async ({ page }) => {
        const band = textSection(page, 'text-qa-appearances');
        await band.scrollIntoViewIfNeeded();
        const resolvedAppearance = appearance === 'auto' ? 'neutral' : appearance;
        const el = band.locator(`[data-appearance="${resolvedAppearance}"]`).first();
        await expect(el).toBeVisible();
        await expect(el).toHaveAttribute('data-appearance', resolvedAppearance);
      });
    }

    test('8.2 — appearance="auto" resolves to data-appearance="neutral"', async ({ page }) => {
      const band = textSection(page, 'text-qa-appearances');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, 'text-appearance-auto-high');
      const el = wrapper.locator('[data-appearance="neutral"]').first();
      await expect(el).toHaveAttribute('data-appearance', 'neutral');
    });
  });

  /* ══ GROUP 9 — Decorations ══════════════════════════════════════════ */
  test.describe('Group 9 — Decorations', { tag: [TextTags.functional] }, () => {
    test('9.1 — italic=true emits data-italic="true"', async ({ page }) => {
      const band = textSection(page, 'text-qa-decorations');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-italic="true"]').first();
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute('data-italic', 'true');
    });

    test('9.2 — underline=true emits data-underline="true"', async ({ page }) => {
      const band = textSection(page, 'text-qa-decorations');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-underline="true"]').first();
      await expect(el).toHaveAttribute('data-underline', 'true');
    });

    test('9.3 — strikethrough=true emits data-strikethrough="true"', async ({ page }) => {
      const band = textSection(page, 'text-qa-decorations');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-strikethrough="true"]').first();
      await expect(el).toHaveAttribute('data-strikethrough', 'true');
    });

    test('9.4 — Combined decorations: element has all three data attributes', async ({ page }) => {
      const band = textSection(page, 'text-qa-decorations');
      await band.scrollIntoViewIfNeeded();
      const el = band
        .locator('[data-italic="true"][data-underline="true"][data-strikethrough="true"]')
        .first();
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute('data-italic', 'true');
      await expect(el).toHaveAttribute('data-underline', 'true');
      await expect(el).toHaveAttribute('data-strikethrough', 'true');
    });

    test('9.5 — No decoration flags: element has no data-italic / data-underline / data-strikethrough', async ({ page }) => {
      const band = textSection(page, 'text-qa-default');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-variant="body"]').first();
      await expect(el).not.toHaveAttribute('data-italic');
      await expect(el).not.toHaveAttribute('data-underline');
      await expect(el).not.toHaveAttribute('data-strikethrough');
    });
  });

  /* ══ GROUP 10 — Text Alignment ══════════════════════════════════════ */
  test.describe('Group 10 — Text Alignment', { tag: [TextTags.functional] }, () => {
    test('10.1 — textAlign="left" emits data-align="left"', async ({ page }) => {
      const band = textSection(page, 'text-qa-alignment');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-align="left"]').first();
      await expect(el).toHaveAttribute('data-align', 'left');
    });

    test('10.2 — textAlign="center" emits data-align="center"', async ({ page }) => {
      const band = textSection(page, 'text-qa-alignment');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-align="center"]').first();
      await expect(el).toHaveAttribute('data-align', 'center');
    });

    test('10.3 — textAlign="right" emits data-align="right"', async ({ page }) => {
      const band = textSection(page, 'text-qa-alignment');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-align="right"]').first();
      await expect(el).toHaveAttribute('data-align', 'right');
    });

    test('10.4 — No textAlign: element has no data-align attribute', async ({ page }) => {
      const band = textSection(page, 'text-qa-default');
      await band.scrollIntoViewIfNeeded();
      const el = band.locator('[data-variant="body"]').first();
      await expect(el).not.toHaveAttribute('data-align');
    });
  });

  /* ══ GROUP 11 — Truncation (maxLines) ══════════════════════════════ */
  test.describe('Group 11 — Truncation (maxLines)', { tag: [TextTags.functional] }, () => {
    test('11.1 — maxLines=1: element has data-max-lines="1"', async ({ page }) => {
      const band = textSection(page, 'text-qa-truncation');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.maxlines1);
      const el = wrapper.locator('[data-max-lines="1"]').first();
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute('data-max-lines', '1');
    });

    test('11.2 — maxLines=3: element has data-max-lines="3"', async ({ page }) => {
      const band = textSection(page, 'text-qa-truncation');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.maxlines3);
      const el = wrapper.locator('[data-max-lines="3"]').first();
      await expect(el).toHaveAttribute('data-max-lines', '3');
    });

    test('11.3 — maxLines=1: element is visually shorter than unrestricted element', async ({ page }) => {
      const band = textSection(page, 'text-qa-truncation');
      await band.scrollIntoViewIfNeeded();
      const clamped = elementByTestId(page, TEXT_TESTIDS.maxlines1).locator('[data-max-lines]').first();
      const unclamped = elementByTestId(page, TEXT_TESTIDS.maxlinesNone).locator('[data-variant]').first();
      const clampedBox = await clamped.boundingBox();
      const unclampedBox = await unclamped.boundingBox();
      expect(clampedBox).not.toBeNull();
      expect(unclampedBox).not.toBeNull();
      expect(clampedBox!.height).toBeLessThan(unclampedBox!.height);
    });

    test('11.4 — maxLines=0: element has no data-max-lines attribute (no clamp)', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.edgeMaxlinesZero);
      const el = wrapper.locator('[data-variant]').first();
      await expect(el).not.toHaveAttribute('data-max-lines');
    });
  });

  /* ══ GROUP 12 — Semantic / polymorphic `as` ════════════════════════ */
  test.describe('Group 12 — Semantic Elements (as prop)', { tag: [TextTags.functional] }, () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      test(`12.1 — as="h${level}" renders a role=heading level ${level}`, async ({ page }) => {
        const band = textSection(page, 'text-qa-semantic');
        await band.scrollIntoViewIfNeeded();
        const wrapper = elementByTestId(page, `text-as-h${level}`);
        const el = wrapper.locator(`h${level}`).first();
        await expect(el).toBeVisible();
        await expect(el).toHaveRole('heading');
      });
    }

    test('12.2 — as="p" renders a <p> element', async ({ page }) => {
      const band = textSection(page, 'text-qa-semantic');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.asP);
      const el = wrapper.locator('p').first();
      await expect(el).toBeVisible();
    });

    test('12.3 — as="code" renders a <code> element', async ({ page }) => {
      const band = textSection(page, 'text-qa-semantic');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.asCode);
      const el = wrapper.locator('code').first();
      await expect(el).toBeVisible();
    });

    test('12.4 — default (no as) renders a <span> element', async ({ page }) => {
      const band = textSection(page, 'text-qa-semantic');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.asSpan);
      const el = wrapper.locator('span[data-variant]').first();
      await expect(el).toBeVisible();
    });
  });

  /* ══ GROUP 13 — Anchor (as="a") ══════════════════════════════════════ */
  test.describe('Group 13 — Anchor (as="a")', { tag: [TextTags.functional] }, () => {
    test('13.1 — as="a" with href renders a native anchor element', async ({ page }) => {
      const band = textSection(page, 'text-qa-anchor');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.anchorBasic);
      const el = wrapper.locator('a[href]').first();
      await expect(el).toBeVisible();
      await expect(el).toHaveRole('link');
    });

    test('13.2 — Anchor with target="_blank" has the correct target attribute', async ({ page }) => {
      const band = textSection(page, 'text-qa-anchor');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.anchorTargetBlank);
      const el = wrapper.locator('a').first();
      await expect(el).toHaveAttribute('target', '_blank');
    });

    test('13.3 — Anchor with rel has the rel attribute forwarded', async ({ page }) => {
      const band = textSection(page, 'text-qa-anchor');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.anchorTargetBlank);
      const el = wrapper.locator('a').first();
      await expect(el).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('13.4 — In-page anchor (href="#section") does not navigate away', async ({ page }) => {
      const band = textSection(page, 'text-qa-anchor');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.anchorHash);
      const el = wrapper.locator('a[href="#section"]').first();
      await expect(el).toBeVisible();
    });
  });

  /* ══ GROUP 14 — Link slot ════════════════════════════════════════════ */
  test.describe('Group 14 — Link slot', { tag: [TextTags.functional] }, () => {
    test('14.1 — link slot renders an anchor after the main content', async ({ page }) => {
      const band = textSection(page, 'text-qa-link-slot');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.linkSlot);
      await expect(wrapper.locator('a').first()).toBeVisible();
    });

    test('14.2 — link slot anchor has visible text "Read more"', async ({ page }) => {
      const band = textSection(page, 'text-qa-link-slot');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.linkSlot);
      await expect(wrapper.getByRole('link', { name: 'Read more' })).toBeVisible();
    });

    test('14.3 — No link prop: no extra anchor rendered after main content', async ({ page }) => {
      const band = textSection(page, 'text-qa-link-slot');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.linkSlotNull);
      const anchors = wrapper.locator('a');
      await expect(anchors).toHaveCount(0);
    });
  });

  /* ══ GROUP 15 — Surface context ════════════════════════════════════ */
  test.describe('Group 15 — Surface Context', { tag: [TextTags.functional] }, () => {
    for (const mode of ['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const) {
      test(`15.1 — Text renders on "${mode}" surface without errors`, async ({ page }) => {
        const band = textSection(page, 'text-qa-surface');
        await band.scrollIntoViewIfNeeded();
        const surface = page.getByTestId(`text-surface-${mode}`);
        await expect(surface).toBeVisible();
        await expect(surface).toHaveAttribute('data-surface', mode);
        const textEls = surface.locator('[data-variant]');
        expect(await textEls.count()).toBeGreaterThanOrEqual(3);
      });
    }
  });

  /* ══ GROUP 16 — Real-world scenarios ════════════════════════════════ */
  test.describe('Group 16 — Real-world Scenarios', { tag: [TextTags.functional] }, () => {
    test('16.1 — Article header composition renders display/body/label correctly', async ({ page }) => {
      const band = textSection(page, 'text-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.realworldArticle);
      await expect(wrapper.locator('[data-variant="display"]').first()).toBeVisible();
      await expect(wrapper.locator('[data-variant="body"]').first()).toBeVisible();
      await expect(wrapper.locator('[data-variant="label"]').first()).toBeVisible();
    });

    test('16.2 — Error state uses negative appearance on title and body', async ({ page }) => {
      const band = textSection(page, 'text-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.realworldError);
      const els = wrapper.locator('[data-appearance="negative"]');
      expect(await els.count()).toBeGreaterThanOrEqual(2);
    });

    test('16.3 — Pricing block has strikethrough element', async ({ page }) => {
      const band = textSection(page, 'text-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.realworldPricing);
      const strikethrough = wrapper.locator('[data-strikethrough="true"]').first();
      await expect(strikethrough).toBeVisible();
    });

    test('16.4 — Success message uses positive appearance', async ({ page }) => {
      const band = textSection(page, 'text-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.realworldSuccess);
      const el = wrapper.locator('[data-appearance="positive"]').first();
      await expect(el).toBeVisible();
    });
  });

  /* ══ GROUP 17 — Edge cases ════════════════════════════════════════ */
  test.describe('Group 17 — Edge Cases', { tag: [TextTags.functional] }, () => {
    test('17.1 — Edge-cases band mounts without errors', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      await expect(band).toBeVisible();
    });

    test('17.2 — Empty children renders without crash (no content visible)', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.edgeEmpty);
      const el = wrapper.locator('[data-variant]').first();
      await expect(el).toBeAttached();
    });

    test('17.3 — Very long single word renders within its container', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.edgeLongWord);
      await expect(wrapper).toBeVisible();
      await expect(textInSection(page, 'text-qa-edge-cases', 'Supercalifragilisticexpialidocious')).toBeVisible();
    });

    test('17.4 — Emoji in content renders without crash', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      await expect(textInSection(page, 'text-qa-edge-cases', 'Emoji support')).toBeVisible();
    });

    test('17.5 — text prop alias renders content without children prop', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'text-qa-edge-cases', 'Content via text prop'),
      ).toBeVisible();
    });

    test('17.6 — Body variant with invalid size "3XS" falls back to "2XS"', async ({ page }) => {
      const band = textSection(page, 'text-qa-edge-cases');
      await band.scrollIntoViewIfNeeded();
      const wrapper = elementByTestId(page, TEXT_TESTIDS.edgeSizeFallback);
      const el = wrapper.locator('[data-variant="body"]').first();
      await expect(el).toHaveAttribute('data-size', '2XS');
    });
  });

  /* ══ GROUP 18 — Content and display ════════════════════════════════ */
  test.describe('Group 18 — Content and Display', { tag: [TextTags.functional] }, () => {
    test('18.1 — Default band sample text is fully visible', async ({ page }) => {
      await expect(
        textInSection(page, 'text-qa-default', 'The quick brown fox'),
      ).toBeVisible();
    });

    test('18.2 — Variants band contains display and headline variant elements', async ({ page }) => {
      const band = textSection(page, 'text-qa-variants');
      await band.scrollIntoViewIfNeeded();
      await expect(band.locator('[data-variant="display"]').first()).toBeVisible();
      await expect(band.locator('[data-variant="headline"]').first()).toBeVisible();
    });

    test('18.3 — Real-world article has visible heading "Article Headline"', async ({ page }) => {
      const band = textSection(page, 'text-qa-realworld');
      await band.scrollIntoViewIfNeeded();
      await expect(
        textInSection(page, 'text-qa-realworld', 'Article Headline'),
      ).toBeVisible();
    });

    test('18.4 — Combination matrix renders all 8 combo items', async ({ page }) => {
      const band = textSection(page, 'text-qa-combos');
      await band.scrollIntoViewIfNeeded();
      const items = band.locator('[data-testid^="text-combo-"]');
      expect(await items.count()).toBeGreaterThanOrEqual(TEXT_COMBO_COUNT);
    });
  });
});
