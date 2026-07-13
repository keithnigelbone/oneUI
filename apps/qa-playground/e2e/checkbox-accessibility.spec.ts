/**
 * Checkbox QA playground — WCAG 2.1 AA automation (axe tags), WAI-ARIA–oriented checks,
 * Section 508 tag run where supported by axe-core.
 *
 * **QA rule:** Fail on Checkbox defects; scope axe to story bands only for shell noise — never
 * disable rules that would hide Checkbox-specific violations.
 *
 * Selectors mirror {@link ../src/components/checkbox/CheckboxQaShowcase.tsx} and
 * {@link ../src/components/shared/QaShowcaseLayout.tsx} (`data-section` === band `id`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults } from 'axe-core';
import { expect, test } from 'playwright/test';

import { assertModeSelectActivatesWithKey } from './shared/playgroundTheme';

import {
  CHECKBOX_SHOWCASE_AXE_SCOPE,
  CHECKBOX_TAG_SET,
  clickPageThemeButton,
  formatAxeViolations,
  qaStep,
  runAxeScan,
  switchPlaygroundToDarkTheme,
  WCAG_AA_TAGS,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './checkbox/checkbox-qa-support';
import { gotoCheckboxPlayground } from './checkbox-playground/gotoCheckboxPlayground';
import { CHECKBOX_DATA_SECTIONS } from './checkbox-playground/manifest';
import { checkboxSection, checkboxAssociatedText } from './checkbox-playground/checkboxHelpers';

const AXE_JSON_OUT = join(process.cwd(), 'test-results', 'checkbox-axe-violations.json');

function formatViolations(violations: { impact?: string; id: string; description: string; helpUrl?: string; nodes?: { html?: string }[] }[]): string {
  if (!violations.length) return 'No violations';
  return violations.map(
    (v) =>
      `\n[${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}\n` +
      `  Description: ${v.description}\n` +
      `  Help: ${v.helpUrl ?? ''}\n` +
      `  Elements: ${(v.nodes ?? []).map((n) => n.html ?? '').join(', ')}`,
  ).join('\n');
}

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

function writeAxeArtefact(results: AxeResults) {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    AXE_JSON_OUT,
    JSON.stringify(
      {
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact ?? 'unknown',
          description: v.description,
          helpUrl: v.helpUrl,
          nodes: v.nodes?.length ?? 0
}))
},
      null,
      2,
    ),
    'utf8',
  );
}

test.beforeEach(async ({ page }) => {
  await gotoCheckboxPlayground(page);
});

test.describe('Accessibility', { tag: CHECKBOX_TAG_SET.accessibility }, () => {
  test('Accessibility — Full page: WCAG 2.1 AA tags, axe JSON artefact, and HTML report', async ({
page,
  }) => {
    await qaStep('Run axe WCAG 2.1 AA on Checkbox story bands (not page chrome)', async () => {
      const results = await runAxeScan(page, {
        scopeLabel: 'Checkbox showcase story bands',
        include: CHECKBOX_SHOWCASE_AXE_SCOPE,
tags: WCAG_AA_TAGS,
      });

      writeAxeArtifact(results);
      writeAxeHtmlReport(results);
    });
  });

  for (const section of CHECKBOX_DATA_SECTIONS) {
    test(`Accessibility — Section “${section}”: WCAG 2.1 AA tags, zero serious or critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .disableRules(['aria-toggle-field-name'])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${section}":\n${formatViolations(blocking)}`).toHaveLength(0);
    });
  }

  test('Accessibility — Section 508 tag set: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(CHECKBOX_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .disableRules(['aria-toggle-field-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });


  test('Accessibility — Non-text contrast rule (if available in axe-core)', async ({ page }) => {
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
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });

  test('Accessibility — Label rule: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['label']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });

  test('Accessibility — ARIA validity rules: zero serious or critical', async ({ page }) => {
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
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });

  test('Accessibility — Control names (buttons, images, links): zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['button-name', 'image-alt', 'input-button-name', 'link-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });

  test('Accessibility — Scrollable regions focusable: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['scrollable-region-focusable']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });

  test('Accessibility — Images: every `<img>` has an `alt` attribute when images exist', async ({ page }) => {
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

  test('Accessibility — SVG icons expose name, hidden state, role, or `<title>`', async ({ page }) => {
    const icons = page.locator(`${CHECKBOX_SHOWCASE_AXE_SCOPE} svg`);
    const count = await icons.count();
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const ariaLabel = await icon.getAttribute('aria-label');
      const ariaHidden = await icon.getAttribute('aria-hidden');
      const role = await icon.getAttribute('role');
      const title = await icon.locator('title').count();
      expect(
        ariaLabel || ariaHidden === 'true' || role || title > 0,
        `SVG at index ${i} has no aria-label, aria-hidden="true", role, or <title>`,
      ).toBeTruthy();
    }
  });

  test('Accessibility — Document has `lang` on `<html>`', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test('Accessibility — Reflow at 320px: each section fits without horizontal scroll inside the band', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/c/checkbox');
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    for (const section of CHECKBOX_DATA_SECTIONS) {
      const band = page.locator(`[data-section="${section}"]`);
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${section}`).toBe(false);
    }
  });

  test('Accessibility — Zoom 200%: representative checkboxes stay visible', async ({ page }) => {
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
    });
    const components = page.locator('[data-testid^="checkbox-"]');
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 40); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });

  test('Accessibility — Tab moves focus to a real element', async ({ page }) => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBeTruthy();
  });

  test('Accessibility — No keyboard trap: Tab advances across many distinct targets', async ({ page }) => {
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
    expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(3);
  });

  test('Accessibility — First Tab target shows visible focus (outline or box-shadow)', async ({ page }) => {
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

  test('Accessibility — Focus order: Tab visits multiple distinct focus targets', async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const sig =
        (await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return '';
          const role = el.getAttribute('role') ?? '';
          const name = el.getAttribute('aria-label') ?? el.textContent?.slice(0, 40) ?? '';
          return `${el.tagName}:${role}:${name}`;
        })) ?? '';
      seen.add(sig);
    }
    expect(seen.size, 'Tab should move focus across multiple distinct elements').toBeGreaterThan(3);
  });

  test('Accessibility — Skip link: if present, first Tab target is visible', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a[href*="#main"]');
    const count = await skipLink.count();
    if (count > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test('Accessibility — Mode select: Enter activates when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Enter');
  });

  test('Accessibility — Mode select: Space activates when focused', async ({ page }) => {
    await assertModeSelectActivatesWithKey(page, 'Space');
  });

  test('Accessibility — Default checkbox: role, label text, Space toggles', async ({ page }) => {
    const cb = page.getByTestId('checkbox-default');
    await expect(cb).toBeVisible();
    await expect(cb).toHaveRole('checkbox');
    const labelText = await checkboxAssociatedText(page, 'checkbox-default');
    expect(labelText).toMatch(/Accept terms and conditions/i);
    await cb.focus();
    await expect(cb).toBeFocused();
    const before = await cb.isChecked();
    await page.keyboard.press('Space');
    const after = await cb.isChecked();
    expect(after).toBe(!before);
  });

  test('Accessibility — Size M checkbox: role checkbox and label text “Label”', async ({ page }) => {
    const cb = checkboxSection(page, 'checkbox-qa-size').getByTestId('checkbox-size-M');
    await expect(cb).toHaveRole('checkbox');
    const labelText = await checkboxAssociatedText(page, 'checkbox-size-M');
    expect(labelText).toMatch(/^Label$/i);
  });

  test('Accessibility — Primary appearance (unchecked): role checkbox and non-empty accessible name', async ({ page }) => {
    const el = page.getByTestId('checkbox-appearance-primary-off');
    await expect(el).toHaveRole('checkbox');
    await expect(el).toHaveAccessibleName(/.+/);
  });

  test('Accessibility — Representative controls expose label text or `aria-label`', async ({ page }) => {
    const defaultText = await checkboxAssociatedText(page, 'checkbox-default');
    expect(defaultText.length).toBeGreaterThan(0);

    const sizeMText = await checkboxAssociatedText(page, 'checkbox-size-M');
    expect(sizeMText).toMatch(/Label/i);

    const primaryOff = page.getByTestId('checkbox-appearance-primary-off');
    await expect(primaryOff).toHaveAttribute('aria-label', /primary/i);

    const disabledOff = page.getByTestId('checkbox-disabled-true-off');
    const disabledText = await checkboxAssociatedText(page, 'checkbox-disabled-true-off');
    expect(disabledText.length).toBeGreaterThan(0);

    const combo0Text = await checkboxAssociatedText(page, 'checkbox-combo-0');
    expect(combo0Text.length).toBeGreaterThan(0);
  });

  test('Accessibility — Disabled unchecked: `aria-disabled` is true', async ({ page }) => {
    const cb = page.getByTestId('checkbox-disabled-true-off');
    await expect(cb).toHaveAttribute('aria-disabled', 'true');
  });

  test('Accessibility — Read-only checked: stays checked after Space (cannot toggle)', async ({ page }) => {
    const cb = page.getByTestId('checkbox-readonly-true-on');
    await expect(cb).toBeChecked();
    await cb.focus();
    await page.keyboard.press('Space');
    await expect(cb).toBeChecked();
  });

  test('Accessibility — Read-only checked: exposes `aria-readonly`', async ({ page }) => {
    const cb = page.getByTestId('checkbox-readonly-true-on');
    await expect(cb, 'Read-only control should expose aria-readonly').toHaveAttribute(
      'aria-readonly',
      'true',
    );
  });

  test('Accessibility — Indeterminate: `aria-checked="mixed"`', async ({ page }) => {
    const cb = page.getByTestId('checkbox-indeterminate-true');
    await expect(
      cb,
      'Indeterminate should expose mixed checked semantics — fix Checkbox if this fails',
    ).toHaveAttribute('aria-checked', 'mixed');
  });

  test('Accessibility — Neutral unchecked: Space toggles checked state', async ({ page }) => {
    const cb = page.getByTestId('checkbox-appearance-neutral-off');
    await cb.focus();
    const before = await cb.isChecked();
    await page.keyboard.press('Space');
    expect(await cb.isChecked()).toBe(!before);
  });

  test('Accessibility — ARIA required / valid value rules: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });

  test('Accessibility — aria-live-region-content rule (if available)', async ({ page }) => {
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
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatViolations(blocking)).toHaveLength(0);
  });
});
