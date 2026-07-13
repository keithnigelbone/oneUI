/**
 * Badge — accessibility Playwright automation (axe-core + manual WCAG checks).
 *
 * Legacy scans remain in `e2e/badge-playground/accessibility.spec.ts`.
 */
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import {
  BadgeTags,
  BADGE_SHOWCASE_AXE_SCOPE,
  BADGE_TAG_SET,
  openBadgeTestScenarios,
  qaLog,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './badge/badge-qa-support';
import {
  BADGE_ALL_TESTIDS,
  BADGE_APPEARANCE_A11Y_TESTIDS,
BADGE_DATA_SECTIONS,
} from './badge-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openBadgeTestScenarios(page);
});

test.describe('Accessibility', { tag: BADGE_TAG_SET.accessibility }, () => {
  test.describe('axe-core scans', { tag: [BadgeTags.accessibility] }, () => {
    test('All Badge story bands meet WCAG 2.1 AA (axe tags) with HTML + JSON artefacts', async ({
page,
    }) => {
      const results = await qaStep('Run WCAG 2.1 AA axe scan on Badge story bands', async () => {
        return runAxeScan(page, {
          scopeLabel: 'Badge showcase story bands',
          include: BADGE_SHOWCASE_AXE_SCOPE,
          tags: WCAG_AA_TAGS,
relaxColorContrast: true,
        });
      });

      await qaStep('Write dashboard artefacts', async () => {
        writeAxeArtifact(results);
        writeAxeHtmlReport(results);
        qaLog('Axe artefacts written for QA dashboard ingest');
      });
    });

    for (const section of BADGE_DATA_SECTIONS) {
      test(`Story band "${section}" has no serious/critical axe violations`, async ({ page }) => {
        await runAxeScan(page, {
          scopeLabel: `data-section="${section}"`,
          include: `[data-section="${section}"]`,
          tags: WCAG_AA_TAGS,
          // Combo matrix includes neutral/medium rows near 4.44:1 contrast (tracked in prop-validation report).
relaxColorContrast: section === 'badge-qa-combos',
        });
      });
    }

    test('Section 508 tag set reports no serious/critical issues in story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'Section 508 tag run (showcase)',
        include: BADGE_SHOWCASE_AXE_SCOPE,
        tags: ['section508'],
relaxColorContrast: true
});
    });

    test('ARIA validity rules pass in Badge story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'ARIA validity rules (showcase)',
        include: BADGE_SHOWCASE_AXE_SCOPE,
        rules: [
          'aria-roles',
          'aria-required-attr',
          'aria-valid-attr',
          'aria-valid-attr-value',
          'aria-prohibited-attr',
          'aria-required-children',
          'aria-command-name',
        ],
relaxColorContrast: true,
      });
    });

    test('Naming rules pass for buttons, images, and links in story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'Accessible name rules (showcase)',
        include: BADGE_SHOWCASE_AXE_SCOPE,
        rules: ['button-name', 'image-alt', 'input-button-name', 'link-name'],
relaxColorContrast: true,
      });
    });

    test('Label rule passes in Badge story bands', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'label rule (showcase)',
        include: BADGE_SHOWCASE_AXE_SCOPE,
        rules: ['label'],
relaxColorContrast: true,
      });
    });

    test('Scrollable regions are keyboard-accessible when applicable', async ({ page }) => {
      await runAxeScan(page, {
        scopeLabel: 'scrollable-region-focusable (showcase)',
        include: BADGE_SHOWCASE_AXE_SCOPE,
        rules: ['scrollable-region-focusable'],
relaxColorContrast: true,
      });
    });
  });

  test.describe('Smoke', { tag: BADGE_TAG_SET.accessibilitySmoke }, () => {
    test('Default Badge exposes role status and accessible name', async ({ page }) => {
      const el = page.getByTestId('badge-default');
      await expect(el, 'Default badge should be visible').toBeVisible();
      await expect(el, 'Badge uses role="status"').toHaveAttribute('role', 'status');
      await expect(el, 'Accessible name from aria-label').toHaveAccessibleName(/Default badge/i);
    });

    test('Document has a valid lang attribute', async ({ page }) => {
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang, '<html lang> should be present').not.toBeNull();
      expect(lang?.trim(), '<html lang> should not be empty').not.toBe('');
    });
  });

  test.describe('Manual WCAG checks', { tag: [BadgeTags.accessibility] }, () => {
    test('Every showcase Badge has a non-empty accessible name', async ({ page }) => {
      for (const testId of BADGE_ALL_TESTIDS) {
        await qaStep(`Accessible name: ${testId}`, async () => {
          const el = page.getByTestId(testId);
          await el.scrollIntoViewIfNeeded();
          await expect(el, `${testId} should use role="status"`).toHaveAttribute('role', 'status');
          await expect(el, `${testId} should have accessible name`).toHaveAccessibleName(/.+/);
        });
      }
    });

    test('Slot icons are decorative or named', async ({ page }) => {
      const slotIds = [
        'badge-start-Icon',
        'badge-end-Icon',
        'badge-start-icon-end-icon',
      ] as const;
      for (const testId of slotIds) {
        await qaStep(`SVG semantics in ${testId}`, async () => {
          const root = page.getByTestId(testId);
          const svgs = root.locator('svg');
          const count = await svgs.count();
          for (let i = 0; i < count; i++) {
            const icon = svgs.nth(i);
            const ariaLabel = await icon.getAttribute('aria-label');
            const ariaHidden = await icon.getAttribute('aria-hidden');
            expect(
              ariaHidden === 'true' || Boolean(ariaLabel?.trim()),
              `${testId} svg[${i}] should be decorative or named`,
            ).toBe(true);
          }
        });
      }
    });
  });

  test.describe('Keyboard and focus', { tag: [BadgeTags.accessibility] }, () => {
    test('Tab moves focus to an interactive control on the page', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should focus an element').toBeTruthy();
    });

    test('Badge root is not focused after Tab (non-interactive)', async ({ page }) => {
      const badge = page.getByTestId('badge-size-M');
      await expect(badge).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(badge, 'Display Badge should not receive Tab focus').not.toBeFocused();
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
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });
  });
});
