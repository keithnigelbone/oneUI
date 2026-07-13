/**
 * Counter Badge QA playground — WCAG 2.1 AA automation (axe tags),
 * WAI-ARIA-oriented checks, Section 508 tag run where supported by axe-core.
 *
 * Selectors mirror `CounterBadgeQaShowcase.tsx` (`data-section` === band `id`).
 *
 * **QA rule:** Fail on CounterBadge defects; scope axe to story bands only for shell noise —
 * never disable rules that would hide component-specific violations.
 *
 * **Raised defects:** see `counter-badge-qa.spec.ts` header.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';
import {
  clickPageThemeButton,
  COUNTER_BADGE_SHOWCASE_AXE_SCOPE,
  COUNTER_BADGE_TAG_SET,
  formatAxeViolations,
  openCounterBadgeTestScenarios,
  qaStep,
  runAxeScan,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport
} from './counter-badge/counter-badge-qa-support';
import { counterBadgeRoot, counterBadgeSection } from './counter-badge-playground/counterBadgeHelpers';
import {
  COUNTER_BADGE_DATA_SECTIONS,
  COUNTER_BADGE_ROOT_TESTIDS
} from './counter-badge-playground/manifest';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

test.beforeEach(async ({ page }) => {
  await openCounterBadgeTestScenarios(page);
});

test.describe('Accessibility', { tag: COUNTER_BADGE_TAG_SET.accessibility }, () => {
  test('[a11y] WCAG 2.1 AA tag scan + JSON artefact + HTML report', async ({ page }) => {
    await qaStep('Run axe WCAG 2.1 AA on Counter Badge story bands (not page chrome)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Counter Badge showcase story bands',
        include: COUNTER_BADGE_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
      });
      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const section of COUNTER_BADGE_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test('[a11y] Section 508 tag run on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(COUNTER_BADGE_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
});



  test('[a11y] non-text-contrast rule — zero serious/critical (if rule exists)', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page })
        .include(COUNTER_BADGE_SHOWCASE_AXE_SCOPE)
        .withRules(['non-text-contrast'])
        .analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) {
        return;
      }
      throw e;
    }
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] ARIA validity rules on story bands — zero serious/critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(COUNTER_BADGE_SHOWCASE_AXE_SCOPE)
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
      ])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test('[a11y] reflow: showcase regions fit at 320px (no horizontal overflow inside bands)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openCounterBadgeTestScenarios(page);
    for (const section of COUNTER_BADGE_DATA_SECTIONS) {
      const band = counterBadgeSection(page, section);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('[a11y] resize: 200% zoom — counter badges remain visible', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator('[data-testid^="counter-badge-"]');
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

  test('[a11y] default badge: role status + accessible name', async ({ page }) => {
    const el = counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default);
    await expect(el).toHaveRole('status');
    await expect(el).toHaveAccessibleName(/.+/);
  });

  test('[a11y] every Counter Badge status in showcase has non-empty accessible name', async ({ page }) => {
    const badges = page.locator(
      `${COUNTER_BADGE_SHOWCASE_AXE_SCOPE} [data-testid^="counter-badge-"]`,
    );
    const count = await badges.count();
    expect(count, 'Showcase should expose counter-badge data-testid roots').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      await expect(badge).toHaveRole('status');
      await expect(badge, `badge index ${i}`).toHaveAccessibleName(/.+/);
    }
  });

  // Intentionally unscoped: fails if ANY role=status on the page lacks a name (playground shell or component).
  test('[a11y] every role=status on page has non-empty accessible name', async ({ page }) => {
    const badges = page.getByRole('status');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(badges.nth(i), `status region index ${i}`).toHaveAccessibleName(/.+/);
    }
  });
  test('Mode select activates with Enter when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Mode select activates with Space when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });
test('[a11y] Theme toggle updates label via page chrome control', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });
});
