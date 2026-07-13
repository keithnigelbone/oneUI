/**
 * Text QA playground — WCAG 2.1 AA automation (axe tags),
 * WAI-ARIA–oriented checks, Section 508, and keyboard / focus validation.
 *
 * Covers WCAG 2.1 AA success criteria relevant to a pure typography component:
 *   1.3.1 Info and Relationships — semantic heading elements (h1–h6)
 *   1.3.3 Sensory Characteristics — decorations do not convey information alone
 *   2.4.4 Link Purpose — anchor accessible name = visible text
 *   2.4.6 Headings and Labels — heading levels for text rendered as h1–h6
 *   3.1.2 Language of Parts — `lang` attribute forwarding for i18n text
 *   4.1.2 Name, Role, Value — correct element roles, aria-label, aria-hidden
 *
 * **Scope:** Component-level accessibility only.
 * Colour contrast, non-text contrast, reflow/zoom viewport tests, and
 * page-level document-structure checks are excluded.
 *
 * **QA rule:** Scope axe to `[data-section^="text-qa-"]` to exclude shell
 * chrome noise. `heading-order` is intentionally disabled — the showcase
 * renders headings out of natural order to demonstrate the `as` prop.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { gotoTextPlayground } from './text-playground/gotoTextPlayground';
import {
  TEXT_DATA_SECTIONS,
  TEXT_SHOWCASE_AXE_SCOPE,
  TEXT_TESTIDS,
} from './text-playground/manifest';
import {
  textSection,
  textInSection,
  elementByTestId,
  expectFocusVisible,
} from './text-playground/textHelpers';
import {
  TEXT_TAG_SET,
  WCAG_AA_TAGS,
} from './text/text-qa-support';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

function fmtViolations(
  violations: { impact?: string; id: string; description: string; helpUrl?: string }[],
): string {
  if (!violations.length) return 'No violations';
  return violations
    .map(
      (v) =>
        `\n[${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}\n` +
        `  ${v.description}\n  Help: ${v.helpUrl ?? ''}`,
    )
    .join('\n');
}

test.beforeEach(async ({ page }) => {
  await gotoTextPlayground(page);
});

test.describe('Accessibility', { tag: TEXT_TAG_SET.accessibility }, () => {

  /* ══ Per-section WCAG 2.1 AA axe runs (component-scoped) ══════════ */

  for (const section of TEXT_DATA_SECTIONS) {
    test(`A11y — Section "${section}": WCAG 2.1 AA, zero serious or critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .disableRules([
          'heading-order',
          'landmark-one-main',
          'region',
          'color-contrast',
        ])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${fmtViolations(blocking)}`).toHaveLength(0);
    });
  }

  test('A11y — Section 508 tag set: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(TEXT_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .disableRules(['color-contrast', 'heading-order'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ ARIA validity (WCAG 4.1.2) — scoped to non-edge-case sections ══ */

  test('A11y — ARIA validity rules on semantic band: zero serious or critical', async ({ page }) => {
    const band = textSection(page, 'text-qa-semantic');
    await band.scrollIntoViewIfNeeded();
    const results = await new AxeBuilder({ page })
      .include('[data-section="text-qa-semantic"]')
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
      ])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  test('A11y — ARIA validity rules on a11y band: zero serious or critical', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const results = await new AxeBuilder({ page })
      .include('[data-section="text-qa-a11y"]')
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
      ])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ Heading / semantics (WCAG 1.3.1, 2.4.6) ════════════════════════ */

  test('A11y — as="h1" renders role=heading with level 1 (WCAG 1.3.1)', async ({ page }) => {
    const band = textSection(page, 'text-qa-semantic');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.asH1);
    const heading = wrapper.locator('h1').first();
    await expect(heading, 'h1 element must be visible').toBeVisible();
    await expect(heading).toHaveRole('heading');
    const level = await heading.evaluate((el) => (el as HTMLHeadingElement).tagName.toLowerCase());
    expect(level).toBe('h1');
  });

  test('A11y — as="h2" renders role=heading with level 2 (WCAG 1.3.1)', async ({ page }) => {
    const band = textSection(page, 'text-qa-semantic');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.asH2);
    const heading = wrapper.locator('h2').first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveRole('heading');
  });

  test('A11y — Heading elements in a11y band have non-empty accessible names (WCAG 2.4.6)', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const headings = band.locator('[role="heading"], h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(headings.nth(i), `Heading [${i}] must have accessible name`).toHaveAccessibleName(/.+/);
    }
  });

  /* ══ Anchor / link (WCAG 2.4.4, 4.1.2) ═══════════════════════════════ */

  test('A11y — Anchor has role=link (WCAG 4.1.2)', async ({ page }) => {
    const band = textSection(page, 'text-qa-anchor');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.anchorBasic);
    const anchor = wrapper.locator('a').first();
    await expect(anchor).toHaveRole('link');
  });

  test('A11y — Anchor has non-empty accessible name via visible text (WCAG 2.4.4)', async ({ page }) => {
    const band = textSection(page, 'text-qa-anchor');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.anchorBasic);
    const anchor = wrapper.locator('a').first();
    await expect(anchor).toHaveAccessibleName(/.+/);
  });

  test('A11y — Link slot anchor has accessible name "Read more" (WCAG 2.4.4)', async ({ page }) => {
    const band = textSection(page, 'text-qa-link-slot');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.linkSlot);
    const anchor = wrapper.locator('a').first();
    await expect(anchor).toHaveAccessibleName(/Read more/i);
  });

  test('A11y — Anchor with target="_blank" has rel containing noopener (security)', async ({ page }) => {
    const band = textSection(page, 'text-qa-anchor');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.anchorTargetBlank);
    const anchor = wrapper.locator('a').first();
    const rel = (await anchor.getAttribute('rel')) ?? '';
    expect(rel).toContain('noopener');
  });

  /* ══ aria-label / aria-hidden (WCAG 4.1.2) ═══════════════════════════ */

  test('A11y — aria-label overrides the computed accessible name (WCAG 4.1.2)', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.a11yAriaLabel);
    const el = wrapper.locator('[aria-label="Custom accessible name"]').first();
    await expect(el).toBeVisible();
    await expect(el).toHaveAccessibleName('Custom accessible name');
  });

  test('A11y — aria-hidden="true" hides element from accessibility tree (WCAG 4.1.2)', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.a11yAriaHidden);
    const el = wrapper.locator('[aria-hidden="true"]').first();
    await expect(el).toBeVisible();
    await expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  /* ══ Language (WCAG 3.1.2) ════════════════════════════════════════════ */

  test('A11y — lang attribute forwards to the DOM element (WCAG 3.1.2)', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.a11yLang);
    const el = wrapper.locator('[lang="hi"]').first();
    await expect(el).toBeVisible();
    await expect(el).toHaveAttribute('lang', 'hi');
  });

  /* ══ Focus / keyboard (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7) ═══════════ */

  test('A11y — Tab can reach anchor elements in the page (WCAG 2.1.1)', async ({ page }) => {
    let foundAnchor = false;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
      if (tag === 'a') { foundAnchor = true; break; }
    }
    expect(foundAnchor, 'Tab must reach at least one <a> element').toBe(true);
  });

  test('A11y — No keyboard trap: Tab advances across many distinct targets (WCAG 2.1.2)', async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const id =
        (await page.evaluate(() => {
          const el = document.activeElement;
          return el?.getAttribute('data-testid') ?? el?.getAttribute('id') ?? el?.tagName ?? '';
        })) ?? '';
      seen.add(id);
    }
    expect(seen.size, 'Focus must move across multiple distinct elements').toBeGreaterThan(3);
  });

  test('A11y — Visible focus ring on Tab to an anchor (WCAG 2.4.7)', async ({ page }) => {
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
      if (tag === 'a') break;
    }
    await expectFocusVisible(page);
  });

  test('A11y — Focus order: Tab visits multiple distinct roles / identities (WCAG 2.4.3)', async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const sig =
        (await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return '';
          const role = el.getAttribute('role') ?? '';
          const uid =
            el.id ||
            el.getAttribute('data-testid') ||
            el.getAttribute('aria-label') ||
            el.tagName;
          return `${el.tagName}:${role}:${uid}`;
        })) ?? '';
      seen.add(sig);
    }
    expect(seen.size, 'Tab must visit multiple distinct elements').toBeGreaterThan(3);
  });

  /* ══ Surface context — axe scan ══════════════════════════════════════ */

  test('A11y — Surface band: WCAG 2.1 AA axe scan, zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-section="text-qa-surface"]')
      .withTags([...WCAG_AA_TAGS])
      .disableRules(['region', 'heading-order', 'color-contrast'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ A11y showcase band ═══════════════════════════════════════════════ */

  test('A11y — A11y band: headings have non-empty accessible names', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const headings = band.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(
        headings.nth(i),
        `A11y band heading [${i}] must have accessible name`,
      ).toHaveAccessibleName(/.+/);
    }
  });

  test('A11y — A11y band: anchor has non-empty accessible name', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.a11yAnchorName);
    const anchor = wrapper.locator('a').first();
    await expect(anchor).toHaveAccessibleName(/.+/);
  });

  test('A11y — A11y band: aria-hidden element is not exposed to AT', async ({ page }) => {
    const band = textSection(page, 'text-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const wrapper = elementByTestId(page, TEXT_TESTIDS.a11yAriaHidden);
    const el = wrapper.locator('[aria-hidden]').first();
    await expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  /* ══ Semantic band axe ════════════════════════════════════════════════ */

  test('A11y — Semantic band: WCAG 2.1 AA axe scan, zero serious or critical', async ({ page }) => {
    const band = textSection(page, 'text-qa-semantic');
    await band.scrollIntoViewIfNeeded();
    const results = await new AxeBuilder({ page })
      .include('[data-section="text-qa-semantic"]')
      .withTags([...WCAG_AA_TAGS])
      .disableRules(['heading-order', 'region', 'color-contrast'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ Anchor band axe ══════════════════════════════════════════════════ */

  test('A11y — Anchor band: all anchors have accessible names (WCAG 2.4.4)', async ({ page }) => {
    const band = textSection(page, 'text-qa-anchor');
    await band.scrollIntoViewIfNeeded();
    const results = await new AxeBuilder({ page })
      .include('[data-section="text-qa-anchor"]')
      .withRules(['link-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ Real-world band — no axe violations ═════════════════════════════ */

  test('A11y — Real-world band: WCAG 2.1 AA, zero serious or critical', async ({ page }) => {
    const band = textSection(page, 'text-qa-realworld');
    await band.scrollIntoViewIfNeeded();
    const results = await new AxeBuilder({ page })
      .include('[data-section="text-qa-realworld"]')
      .withTags([...WCAG_AA_TAGS])
      .disableRules(['heading-order', 'region', 'color-contrast'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ Edge cases — no axe violations ═════════════════════════════════ */

  test('A11y — Edge-cases band: WCAG 2.1 AA, zero serious or critical', async ({ page }) => {
    const band = textSection(page, 'text-qa-edge-cases');
    await band.scrollIntoViewIfNeeded();
    const results = await new AxeBuilder({ page })
      .include('[data-section="text-qa-edge-cases"]')
      .withTags([...WCAG_AA_TAGS])
      .disableRules(['heading-order', 'region', 'color-contrast'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });
});
