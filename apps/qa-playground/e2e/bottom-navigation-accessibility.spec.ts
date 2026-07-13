/**
 * Bottom Navigation — accessibility Playwright automation (axe-core + manual WCAG checks).
 *
* Color-contrast is deferred in axe scans until showcase bands use `<Surface>` for token-aware contrast.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import {
  blockingAxeViolations,
  BottomNavTags,
  BOTTOM_NAV_AXE_COLOR_CONTRAST_KNOWN_DEFECT,
  BOTTOM_NAV_SHOWCASE_AXE_SCOPE,
  BOTTOM_NAV_TAG_SET,
  collectTabFocusSignatures,
  configureBottomNavAxeBuilder,
  formatAxeViolations,
  openBottomNavigationTestScenarios,
  qaLog,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './bottom-navigation/bottom-navigation-qa-support';
import { BOTTOM_NAV_DATA_SECTIONS } from './bottom-navigation-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openBottomNavigationTestScenarios(page);
});

test.describe('Accessibility', { tag: BOTTOM_NAV_TAG_SET.accessibility }, () => {
  test.describe('axe-core scans', { tag: [BottomNavTags.accessibility] }, () => {
    test('All story bands meet WCAG 2.1 AA (axe tags) with HTML + JSON artefacts', async ({ page }) => {
      const results = await qaStep('Run WCAG 2.1 AA axe on Bottom Navigation story bands', async () => {
        return runAxeScan(page, {
          scopeLabel: 'Bottom Navigation showcase story bands',
          include: BOTTOM_NAV_SHOWCASE_AXE_SCOPE,
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

  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report', async ({ page }) => {
    const results = await configureBottomNavAxeBuilder(page, {
      scopeLabel: 'WCAG 2.1 AA (showcase)',
      include: BOTTOM_NAV_SHOWCASE_AXE_SCOPE,
      tags: WCAG_AA_TAGS,
      relaxColorContrast: true
}).analyze();

    writeAxeArtifact(results);
    writeAxeHtmlReport(results);

    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const section of BOTTOM_NAV_DATA_SECTIONS) {
    }

  test('[a11y] Section 508 tag run — zero serious/critical', async ({ page }) => {
    await runAxeScan(page, {
      scopeLabel: 'Section 508 tag run (showcase)',
      include: BOTTOM_NAV_SHOWCASE_AXE_SCOPE,
      tags: ['section508'],
relaxColorContrast: true,
    });
  });

  test('[a11y] non-text-contrast rule — zero serious/critical (if rule exists)', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page }).withRules(['non-text-contrast']).analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) {
        return;
      }
      throw e;
    }
    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] label rule — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['label']).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] ARIA validity rules — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
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
    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] name rules (buttons / images / links) — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['button-name', 'image-alt', 'input-button-name', 'link-name'])
      .analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] scrollable regions focusable — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['scrollable-region-focusable']).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] images: if present, every <img> has alt attribute', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    if (count === 0) {
      return;
    }
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image at index ${i} missing alt attribute`).not.toBeNull();
    }
  });

  test('[a11y] SVG icons: aria-label, aria-hidden, role, or title', async ({ page }) => {
    const icons = page.locator(`${BOTTOM_NAV_SHOWCASE_AXE_SCOPE} svg`);
    const count = await icons.count();
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const ariaLabel = await icon.getAttribute('aria-label');
      const ariaHidden = await icon.getAttribute('aria-hidden');
      const role = await icon.getAttribute('role');
      const title = await icon.locator('title').count();
      expect(
        ariaLabel || ariaHidden === 'true' || role || title > 0,
        `Showcase SVG at index ${i} has no aria-label, aria-hidden="true", role, or <title>`,
      ).toBeTruthy();
    }
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test('[a11y] reflow: showcase inner sandbox fits at 360px (phone frame width; bands wider than 320 viewport)', async ({
    page
}) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/c/bottom-navigation');
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    for (const section of BOTTOM_NAV_DATA_SECTIONS) {
      const sandbox = page.locator(`[data-section="${section}"] .storySandbox`);
      const n = await sandbox.count();
      if (n === 0) continue;
      const el = sandbox.first();
      await expect(el).toBeVisible();
      const overflows = await el.evaluate((node) => (node as HTMLElement).scrollWidth > (node as HTMLElement).clientWidth);
      expect(overflows, `Horizontal overflow inside sandbox for ${section}`).toBe(false);
    }
  });

  test('[a11y] resize: 200% zoom — showcase bottom nav roots remain visible', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator('[data-testid^="bottomnav-"]');
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test('[a11y] Tab reaches a focusable control', async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test('[a11y] no keyboard trap (Tab cycle advances)', async ({ page }) => {
    const seen = await collectTabFocusSignatures(page);
    expect(seen.size, 'Focus should move across multiple distinct elements').toBeGreaterThan(1);
  });

  test('[a11y] focused element shows outline or box-shadow', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow
};
    });
    const hasVisibleFocus =
      focusStyle?.outlineWidth !== '0px' ||
      (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
    expect(hasVisibleFocus, 'No visible focus indicator on first Tab target').toBe(true);
  });

  test('[a11y] focus order: Tab visits multiple distinct focus targets', async ({ page }) => {
    const seen = await collectTabFocusSignatures(page);
    expect(seen.size, 'Tab should visit multiple distinct focus targets').toBeGreaterThan(1);
  });

  test('[a11y] skip link: if present, first Tab target is visible', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a[href*="#main"]');
    const count = await skipLink.count();
    if (count > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });
test('[a11y] default nav: landmark navigation + accessible name', async ({ page }) => {
    const nav = page.getByTestId('bottomnav-default');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveRole('navigation');
    await expect(nav).toHaveAccessibleName(/QA default bottom navigation/);
  });

  test('[a11y] default nav: each tab stop item has non-empty accessible name', async ({ page }) => {
    const nav = page.getByTestId('bottomnav-default');
    const buttons = nav.getByRole('button');
    const n = await buttons.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(buttons.nth(i)).toHaveAccessibleName(/.+/);
    }
  });

  test('[a11y] labelType none strip: items use aria-label', async ({ page }) => {
    const nav = page.getByTestId('bottomnav-labeltype-none');
    const buttons = nav.getByRole('button');
    const n = await buttons.count();
    for (let i = 0; i < n; i++) {
      const al = await buttons.nth(i).getAttribute('aria-label');
      expect(al?.trim(), `button index ${i} missing aria-label`).toMatch(/\S+/);
    }
  });

  test('[a11y] disabled strip: Search item is disabled', async ({ page }) => {
    const nav = page.getByTestId('bottomnav-disabled-row');
    await expect(nav.getByRole('button', { name: 'Search' })).toBeDisabled();
  });

  test('[a11y] error / validity axe rules — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] aria-live-region-content rule if available', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page }).withRules(['aria-live-region-content']).analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) {
        return;
      }
      throw e;
    }
    const blocking = blockingAxeViolations(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });
});
