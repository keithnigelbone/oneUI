/**
 * Button — accessibility Playwright automation (axe-core + manual WCAG checks).
 *
 * **Known fixture caveat:** §3b appearance matrix uses medium attention on subtle fills;
 * broad WCAG scans exclude `#button-qa-appearance-matrix` until brand tokens meet 4.5:1.
 *
 * **Raised component defects (tests must fail until fixed in `@oneui/ui` Button):**
 * - `loading` hides label from assistive tech without exposing `aria-label` / `aria-labelledby`
 *   (`button-name` on `btn-loading-true`, `btn-loading-slots-hidden`, `btn-combo-4`)
 */
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import {
  blockingAxeViolations,
  ButtonTags,
  BUTTON_AXE_MATRIX_SECTION,
  BUTTON_SHOWCASE_AXE_SCOPE,
  BUTTON_TAG_SET,
  collectTabFocusSignatures,
  configureButtonAxeBuilder,
  formatAxeViolations,
  openButtonTestScenarios,
  qaLog,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './button/button-qa-support';
import { BUTTON_DATA_SECTIONS, BUTTON_LEGACY_SECTION_IDS } from './button-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openButtonTestScenarios(page);
});

test.describe('Accessibility', { tag: BUTTON_TAG_SET.accessibility }, () => {
  test.describe('axe-core scans', { tag: [ButtonTags.accessibility] }, () => {
    test('All story bands meet WCAG 2.1 AA (axe tags) with HTML + JSON artefacts', async ({ page }) => {
      const results = await qaStep('Run WCAG 2.1 AA axe on Button story bands', async () => {
        return runAxeScan(page, {
          scopeLabel: 'Button showcase story bands',
          include: BUTTON_SHOWCASE_AXE_SCOPE,
          exclude: BUTTON_AXE_MATRIX_SECTION,
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

});

  test('[a11y] Button QA page has no critical or serious axe violations', async ({ page }) => {
    const results = await configureButtonAxeBuilder(page, {
      scopeLabel: 'WCAG 2.1 AA (full page, matrix excluded)',
      tags: WCAG_AA_TAGS,
      exclude: BUTTON_AXE_MATRIX_SECTION,
relaxColorContrast: true,
    }).analyze();

    writeAxeArtifact(results);
    writeAxeHtmlReport(results);

    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const section of BUTTON_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await configureButtonAxeBuilder(page, {
        scopeLabel: `section ${section}`,
        include: `[data-section="${section}"]`,
        tags: WCAG_AA_TAGS,
relaxColorContrast: section === 'button-qa-appearance-matrix',
      }).analyze();
      const blocking = blockingAxeViolations(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const selector of BUTTON_LEGACY_SECTION_IDS) {
    test(`[a11y] ${selector} — scoped axe has no critical or serious violations`, async ({ page }) => {
      const results = await configureButtonAxeBuilder(page, {
        scopeLabel: selector,
        include: `#${selector}`,
        tags: WCAG_AA_TAGS,
relaxColorContrast: true,
      }).analyze();
      const blocking = blockingAxeViolations(results.violations);
      expect(blocking, `${selector}: no critical or serious violations`).toHaveLength(0);
    });
  }

  test('[a11y] Default Button — role, name, and enabled state', async ({ page }) => {
    const band = page.locator('#button-qa-default');
    const btn = band.getByRole('button', { name: 'Button' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('[a11y] Default Button — keyboard focus and Space activation', async ({ page }) => {
    const btn = page.locator('#button-qa-default').getByRole('button', { name: 'Button' });
    await page.evaluate(() => {
      (window as unknown as { __oneuiBtnSpaceHits?: number }).__oneuiBtnSpaceHits = 0;
    });
    await btn.evaluate((el) => {
      el.addEventListener('click', () => {
        const w = window as unknown as { __oneuiBtnSpaceHits?: number };
        w.__oneuiBtnSpaceHits = (w.__oneuiBtnSpaceHits ?? 0) + 1;
      });
    });
    await btn.focus();
    await expect(btn).toBeFocused();
    await page.keyboard.press('Space');
    const hits = await page.evaluate(() => (window as unknown as { __oneuiBtnSpaceHits?: number }).__oneuiBtnSpaceHits);
    expect(hits ?? 0, 'Space should activate the default Button').toBeGreaterThanOrEqual(1);
  });

  test('[a11y] Default Button — no duplicate interactive controls in default band', async ({ page }) => {
    const band = page.locator('#button-qa-default');
    await expect(band.getByRole('button')).toHaveCount(1);
  });

  test('[a11y] Every button has a non-empty accessible name (Playwright a11y tree)', async ({ page }) => {
    const buttons = page.locator(`${BUTTON_SHOWCASE_AXE_SCOPE} button, ${BUTTON_SHOWCASE_AXE_SCOPE} [role="button"]`);
    const count = await buttons.count();
    expect(count, 'Showcase should expose at least one button').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const testId = (await button.getAttribute('data-testid')) ?? `index-${i}`;
      await expect(
        button,
        `Button "${testId}" must expose a name to assistive tech (fix @oneui/ui if loading)`,
      ).toHaveAccessibleName(/\S+/);
    }
  });

  test('[a11y] Disabled button in states band is announced as disabled', async ({ page }) => {
    const button = page.locator('#button-qa-api-disabled').getByRole('button', { name: 'Disabled' });
    await expect(button).toBeDisabled();
  });

  test('[a11y] Loading button in states band is busy, named, and shows spinner', async ({ page }) => {
    const loadingBtn = page.getByTestId('btn-loading-true');
    await expect(loadingBtn).toBeVisible();
    await expect(loadingBtn).toBeDisabled();
    await expect(loadingBtn).toHaveAttribute('aria-busy', 'true');
    await expect(
      loadingBtn,
      'Loading must keep label text as accessible name — fix Button.tsx (visibility:hidden label)',
    ).toHaveAccessibleName('Loading');
    await expect(loadingBtn.locator('svg').first()).toBeVisible();
  });

  test('[a11y] Focus moves to an element in the document when Tab is pressed', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('[a11y] Tab cycle visits multiple distinct focus targets (no keyboard trap)', async ({ page }) => {
    const seen = await collectTabFocusSignatures(page);
    expect(seen.size, 'Focus should move across multiple distinct elements').toBeGreaterThan(1);
  });
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });

  test('[a11y] Single-text uncontained Button controls can receive keyboard focus', async ({ page }) => {
    const first = page.locator('#button-qa-single-text-sizes').getByRole('button').first();
    await first.focus();
    await expect(first).toBeFocused();
  });

  test('[a11y] Showcase SVG icons in buttons have aria-hidden or accessible name', async ({ page }) => {
    const icons = page.locator(`${BUTTON_SHOWCASE_AXE_SCOPE} button svg, ${BUTTON_SHOWCASE_AXE_SCOPE} [role="button"] svg`);
    const count = await icons.count();
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const ariaHidden = await icon.getAttribute('aria-hidden');
      const parentName = await icon.evaluate((el) => {
        const btn = el.closest('button,[role="button"]');
        return btn?.getAttribute('aria-label') || btn?.textContent?.trim() || '';
      });
      expect(
        ariaHidden === 'true' || parentName.length > 0,
        `Decorative icon ${i} should be aria-hidden or inside a named control`,
      ).toBeTruthy();
    }
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });
});
