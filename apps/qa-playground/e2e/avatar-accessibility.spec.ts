/**
 * Avatar — accessibility Playwright automation (axe-core + manual WCAG checks).
 *
 * Playground source: `src/components/avatar/AvatarQaShowcase.tsx`
 * Dashboard ingest maps the top-level `Accessibility` describe to the Accessibility tab.
 *
 * Tags: @Accessibility @Smoke (subset)
 * Artefacts: `test-results/avatar-axe-violations.json`, `avatar-accessibility-axe-report.html`
 */
import { expect, test } from 'playwright/test';

import {
  AvatarTags,
  AVATAR_APPEARANCE_A11Y_TESTIDS,
  AVATAR_SHOWCASE_AXE_SCOPE,
  AVATAR_TAG_SET,
  openAvatarTestScenarios,
  qaLog,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './avatar/avatar-qa-support';
import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import { AVATAR_ALL_TESTIDS, AVATAR_DATA_SECTIONS } from './avatar-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openAvatarTestScenarios(page);
});

test.describe('Accessibility', { tag: AVATAR_TAG_SET.accessibility }, () => {
  // ─── axe-core — WCAG 2.1 AA ───────────────────────────────────────────────

  test.describe('axe-core scans', { tag: [AvatarTags.accessibility] }, () => {
    test('All Avatar story bands meet WCAG 2.1 AA (axe tags) with HTML + JSON artefacts', async ({
page,
    }) => {
      const results = await qaStep('Run WCAG 2.1 AA axe scan on Avatar story bands', async () => {
        return runAxeScan(page, {
          scopeLabel: 'Avatar showcase story bands',
          include: AVATAR_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
        });
      });

      await qaStep('Write dashboard artefacts', async () => {
        writeAxeArtifact(results);
        writeAxeHtmlReport(results);
        qaLog('Axe artefacts written for QA dashboard ingest');
      });
    });

    for (const section of AVATAR_DATA_SECTIONS) {
      test(`Story band "${section}" has no serious/critical axe violations`, async ({ page }) => {
        await runAxeScan(page, {
          scopeLabel: `data-section="${section}"`,
          include: `[data-section="${section}"]`,
tags: WCAG_AA_TAGS
});
      });
    }

    test('Section 508 tag set reports no serious/critical issues in story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'Section 508 tag run (showcase)',
        include: AVATAR_SHOWCASE_AXE_SCOPE,
        tags: ['section508']
});
    });

    test('ARIA validity rules pass in Avatar story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'ARIA validity rules (showcase)',
        include: AVATAR_SHOWCASE_AXE_SCOPE,
        rules: [
          'aria-roles',
          'aria-required-attr',
          'aria-valid-attr',
          'aria-valid-attr-value',
          'aria-prohibited-attr',
          'aria-required-children',
          'aria-command-name',
        ]
});
    });

    test('Naming rules pass for buttons, images, and links in story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'Accessible name rules (showcase)',
        include: AVATAR_SHOWCASE_AXE_SCOPE,
        rules: ['button-name', 'image-alt', 'input-button-name', 'link-name']
});
    });

    test('Label rule passes in Avatar story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'label rule (showcase)',
        include: AVATAR_SHOWCASE_AXE_SCOPE,
        rules: ['label']
});
    });

    test('Scrollable regions are keyboard-accessible when applicable', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'scrollable-region-focusable (showcase)',
        include: AVATAR_SHOWCASE_AXE_SCOPE,
        rules: ['scrollable-region-focusable']
});
    });

    test('Non-text contrast rule passes when supported by axe-core', async ({ page }) => {
      await qaStep('Run non-text-contrast (skip if rule unavailable)', async () => {
        try {
          await runAxeScan(page, {
            scopeLabel: 'non-text-contrast (showcase)',
            include: AVATAR_SHOWCASE_AXE_SCOPE,
            rules: ['non-text-contrast']
});
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes('unknown rule')) {
            qaLog('Skipped non-text-contrast — rule not in axe version');
            return;
          }
          throw e;
        }
      });
    });

    test('aria-live-region-content rule passes when supported', async ({ page }) => {
      await qaStep('Run aria-live-region-content (skip if unavailable)', async () => {
        try {
          await runAxeScan(page, {
            scopeLabel: 'aria-live-region-content (showcase)',
            include: AVATAR_SHOWCASE_AXE_SCOPE,
            rules: ['aria-live-region-content']
});
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes('unknown rule')) {
            qaLog('Skipped aria-live-region-content — rule not in axe version');
            return;
          }
          throw e;
        }
      });
    });
  });

  // ─── Smoke — fast a11y confidence ─────────────────────────────────────────

  test.describe('Smoke', { tag: AVATAR_TAG_SET.accessibilitySmoke }, () => {
    test('Default Avatar exposes role img and accessible name', async ({ page }) => {
      await qaStep('Verify default profile avatar semantics', async () => {
        const el = page.getByTestId('avatar-default');
        await expect(el, 'Default avatar should be visible').toBeVisible();
        await expect(el, 'Avatar uses role="img"').toHaveAttribute('role', 'img');
        await expect(el, 'Accessible name should include alt text').toHaveAccessibleName(/John Doe/);
      });
    });

    test('Document has a valid lang attribute', async ({ page }) => {
      await qaStep('Check html[lang]', async () => {
        const lang = await page.locator('html').getAttribute('lang');
        expect(lang, '<html lang> should be present').not.toBeNull();
        expect(lang?.trim(), '<html lang> should not be empty').not.toBe('');
      });
    });
  });

  // ─── Manual WCAG-oriented checks ─────────────────────────────────────────

  test.describe('Manual WCAG checks', { tag: [AvatarTags.accessibility] }, () => {
    test('Every showcase avatar has a non-empty accessible name', async ({ page }) => {
      for (const testId of AVATAR_ALL_TESTIDS) {
        await qaStep(`Accessible name: ${testId}`, async () => {
          const el = page.getByTestId(testId);
          await el.scrollIntoViewIfNeeded();
          await expect(el, `${testId} should use role="img"`).toHaveAttribute('role', 'img');
          await expect(el, `${testId} should have accessible name from alt`).toHaveAccessibleName(/.+/);
        });
      }
    });

test('Decorative images inside avatars declare alt (may be empty)', async ({ page }) => {
      await qaStep('Scan img elements for alt attribute presence', async () => {
        const images = page.locator('img');
        const count = await images.count();
        expect(count, 'Playground should render at least one image avatar').toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const alt = await images.nth(i).getAttribute('alt');
          expect(alt, `Image index ${i} must have alt attribute (can be empty when decorative)`).not.toBeNull();
        }
      });
    });

test('SVG icons inside avatars are decorative or named', async ({ page }) => {
      for (const testId of AVATAR_ALL_TESTIDS) {
        await qaStep(`SVG semantics in ${testId}`, async () => {
          const root = page.getByTestId(testId);
          const svgs = root.locator('svg');
          const count = await svgs.count();
          for (let i = 0; i < count; i++) {
            const icon = svgs.nth(i);
            const ariaLabel = await icon.getAttribute('aria-label');
            const ariaHidden = await icon.getAttribute('aria-hidden');
            const role = await icon.getAttribute('role');
            const title = await icon.locator('title').count();
            expect(
              Boolean(ariaLabel || ariaHidden === 'true' || role || title > 0),
              `${testId} svg[${i}] needs aria-label, aria-hidden="true", role, or <title>`,
            ).toBeTruthy();
          }
        });
      }
    });

    test('Disabled avatar row remains accessible (visual disabled only)', async ({ page }) => {
      await expect(
        page.getByTestId('avatar-disabled-true'),
        'Disabled avatar should still expose accessible name',
      ).toHaveAccessibleName(/.+/);
    });
  });

  // ─── Keyboard & focus (page chrome) ───────────────────────────────────────

  test.describe('Keyboard and focus', { tag: [AvatarTags.accessibility] }, () => {
    test('Tab moves focus to an interactive control on the page', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should focus an element').toBeTruthy();
    });
    test('Tab cycle visits multiple distinct targets (no keyboard trap)', async ({ page }) => {
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
      expect(
        seen.size,
        'Focus should visit at least three distinct targets when tabbing',
      ).toBeGreaterThanOrEqual(3);
    });

    test('First tab stop shows a visible focus indicator', async ({ page }) => {
      await page.keyboard.press('Tab');
      const focusStyle = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const style = getComputedStyle(el);
        return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
      });
      const hasVisibleFocus =
        focusStyle?.outlineWidth !== '0px' ||
        (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
      expect(hasVisibleFocus, 'First focused control should show outline or box-shadow').toBe(true);
    });
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });
  });

  // ─── Reflow & resize ───────────────────────────────────────────────────────

  test.describe('Reflow and resize', { tag: [AvatarTags.accessibility] }, () => {
    test('Story bands fit within 320px width without horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openAvatarTestScenarios(page);

      for (const section of AVATAR_DATA_SECTIONS) {
        await qaStep(`Reflow check: ${section}`, async () => {
          const band = page.locator(`[data-section="${section}"]`);
          await expect(band).toBeVisible();
          const overflows = await band.evaluate(
            (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
          );
          expect(overflows, `Band "${section}" should not overflow at 320px`).toBe(false);
        });
      }
    });

    test('Avatars remain visible at 200% browser zoom', async ({ page }) => {
      await page.evaluate(() => {
        (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
      });
      const components = page.locator('[data-testid^="avatar-"]');
      const count = await components.count();
      expect(count, 'Avatar anchors should exist after zoom').toBeGreaterThan(0);
      for (let i = 0; i < Math.min(count, 30); i++) {
        await expect(components.nth(i), `avatar anchor ${i} visible at 200% zoom`).toBeVisible();
      }
    });
  });
});
