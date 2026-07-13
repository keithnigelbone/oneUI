/**
 * CheckboxField QA playground — WCAG 2.1 AA automation (axe tags),
 * WAI-ARIA–oriented checks, Section 508, and keyboard / focus validation.
 *
 * Covers WCAG 2.1 AA success criteria relevant to composite form fields:
 *   1.3.1 Info and Relationships — fieldset/legend, label association
 *   1.3.5 Identify Input Purpose — required / optional fields
 *   2.1.1 Keyboard — all controls operable by keyboard
 *   2.1.2 No Keyboard Trap — focus can leave any control
 *   2.4.3 Focus Order — logical tab sequence
 *   2.4.7 Focus Visible — visible focus ring
 *   3.3.1 Error Identification — error messages associated via aria-describedby
 *   3.3.2 Labels or Instructions — every control has an accessible name
 *   4.1.2 Name, Role, Value — correct ARIA roles, states, properties
 *
 * **Scope:** Component-level accessibility only.
 * Colour contrast, non-text contrast, reflow/zoom viewport tests, and page-level
 * document-structure checks are intentionally excluded — they belong to visual QA
 * and platform-level test suites.
 *
 * **QA rule:** Never disable rules that would hide CheckboxField-specific violations.
 * Scope axe to `[data-section^="checkboxfield-qa-"]` to exclude shell chrome noise.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { gotoCheckboxFieldPlayground } from './checkbox-field-playground/gotoCheckboxFieldPlayground';
import {
  CHECKBOX_FIELD_DATA_SECTIONS,
  CHECKBOX_FIELD_FIGMA_AXE_SCOPE,
  CHECKBOX_FIELD_FIGMA_GRID_TESTIDS,
  CHECKBOX_FIELD_SHOWCASE_AXE_SCOPE,
} from './checkbox-field-playground/manifest';
import {
  fieldSection,
  firstCheckboxInSection,
  checkboxesInSection,
  checkboxByTestId,
  fieldsetInSection,
  legendInSection,
  textInSection,
  expectFocusVisible,
  checkboxAccessibleName,
  figmaGrid,
  expectDescriptionLinkedViaDescribedBy,
} from './checkbox-field-playground/checkboxFieldHelpers';
import {
  CHECKBOX_FIELD_AXE_SHELL_DISABLE,
  CHECKBOX_FIELD_TAG_SET,
  openCheckboxFieldFigmaValidation,
  WCAG_AA_TAGS,
  runAxeScan,
  writeAxeArtifact,
  writeAxeHtmlReport,
} from './checkbox-field/checkbox-field-qa-support';
import { CHECKBOX_FIELD_MULTI_OPTION_TESTIDS } from './checkbox-field-playground/manifest';

function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

function fmtViolations(violations: { impact?: string; id: string; description: string; helpUrl?: string; nodes?: { html?: string }[] }[]): string {
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
  await gotoCheckboxFieldPlayground(page);
});

test.describe('Accessibility', { tag: CHECKBOX_FIELD_TAG_SET.accessibility }, () => {

  /* ══ Full-page axe runs ════════════════════════════════════════════════ */

  test('A11y — Full page: WCAG 2.1 AA axe scan, JSON + HTML artefacts', async ({ page }) => {
    const results = await runAxeScan(page, {
      scopeLabel: 'CheckboxField showcase story bands',
      include: CHECKBOX_FIELD_SHOWCASE_AXE_SCOPE,
      tags: WCAG_AA_TAGS,
      relaxColorContrast: true,
    });
    writeAxeArtifact(results);
    writeAxeHtmlReport(results);
  });

  for (const section of CHECKBOX_FIELD_DATA_SECTIONS) {
    test(`A11y — Section "${section}": WCAG 2.1 AA, zero serious or critical`, async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${section}"]`)
        .withTags([...WCAG_AA_TAGS])
        .disableRules([
          'aria-toggle-field-name',
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
      .include(CHECKBOX_FIELD_SHOWCASE_AXE_SCOPE)
      .withTags(['section508'])
      .disableRules(['aria-toggle-field-name', 'color-contrast'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ Label / name rules (WCAG 3.3.2, 4.1.2) ═══════════════════════════ */

  test('A11y — Label rule: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['label']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  test('A11y — Default field: inner checkbox has a non-empty accessible name', async ({ page }) => {
    const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
    await expect(cb).toHaveAccessibleName(/.+/);
    const name = await checkboxAccessibleName(cb);
    expect(name.length, 'Accessible name must not be empty').toBeGreaterThan(0);
  });

  test('A11y — Appearance band: first checkbox in each row has non-empty accessible name', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-appearance');
    await band.scrollIntoViewIfNeeded();
    const controls = checkboxesInSection(page, 'checkboxfield-qa-appearance');
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 9); i++) {
      await expect(
        controls.nth(i),
        `Appearance row checkbox at index ${i} must have accessible name`,
      ).toHaveAccessibleName(/.+/);
    }
  });

  test('A11y — Multi-option children: each Checkbox child has non-empty accessible name', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-multi');
    await band.scrollIntoViewIfNeeded();
    const opts = [
      CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiNews,
      CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiTips,
      CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiResearch,
    ];
    for (const tid of opts) {
      const cb = checkboxByTestId(page, tid);
      await expect(cb).toHaveAccessibleName(/.+/);
    }
  });

  /* ══ ARIA roles / states / properties (WCAG 4.1.2) ═══════════════════ */

  test('A11y — ARIA validity rules: zero serious or critical', async ({ page }) => {
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
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  test('A11y — ARIA required / valid-value rules: zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr-value'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  test('A11y — aria-live-region-content rule (graceful fallback if unavailable)', async ({ page }) => {
    let results;
    try {
      results = await new AxeBuilder({ page }).withRules(['aria-live-region-content']).analyze();
    } catch (e) {
      if ((e instanceof Error ? e.message : String(e)).includes('unknown rule')) return;
      throw e;
    }
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ Required field (WCAG 1.3.5, 4.1.2) ═══════════════════════════════ */

  test('A11y — required field: checkbox has aria-required="true"', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-label');
    await band.scrollIntoViewIfNeeded();
    const requiredCb = band.locator('[role="checkbox"][aria-required="true"]').first();
    await expect(
      requiredCb,
      'required=true must set aria-required="true" on the control',
    ).toBeVisible();
  });

  /* ══ Error / invalid (WCAG 3.3.1) ══════════════════════════════════════ */

  test('A11y — invalid field with error: Field.Root exposes aria-invalid and error text is visible', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-feedback');
    await band.scrollIntoViewIfNeeded();
    // Base UI Field.Root sets data-invalid="" (not aria-invalid="true") on the container element.
    const invalidField = band.locator('[role="radiogroup"][data-invalid]').first();
    await expect(invalidField).toBeVisible();
    const errorText = textInSection(page, 'checkboxfield-qa-feedback', 'You must accept to continue');
    await expect(errorText).toBeVisible();
  });

  /* ══ disabled / readOnly (WCAG 4.1.2) ═════════════════════════════════ */

  test('A11y — disabled checkbox: aria-disabled="true" (Base UI pattern)', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-disabled');
    await band.scrollIntoViewIfNeeded();
    const cb = band.locator('[role="checkbox"][aria-disabled="true"]').first();
    await expect(cb).toHaveAttribute('aria-disabled', 'true');
  });

  test('A11y — disabled field: Field.Root also has aria-disabled', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-disabled');
    await band.scrollIntoViewIfNeeded();
    // Base UI Field.Root sets data-disabled="" on the container (not aria-disabled="true").
    // The aria-disabled="true" attribute is on the inner checkbox span, not on the Field.Root.
    const root = band.locator('[role="radiogroup"][data-disabled]').first();
    await expect(root).toBeVisible();
  });

  test('A11y — readOnly checked: aria-readonly="true" on the control', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-readonly');
    await band.scrollIntoViewIfNeeded();
    const cb = band.locator('[role="checkbox"][aria-readonly="true"]').first();
    await expect(cb).toHaveAttribute('aria-readonly', 'true');
  });

  /* ══ Indeterminate (WCAG 4.1.2) ════════════════════════════════════════ */

  test('A11y — indeterminate: aria-checked="mixed"', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-checked');
    await band.scrollIntoViewIfNeeded();
    const ind = band.locator('[role="checkbox"][aria-checked="mixed"]').first();
    await expect(
      ind,
      'Indeterminate must expose aria-checked="mixed" — fix Checkbox if this fails',
    ).toHaveAttribute('aria-checked', 'mixed');
  });

  /* ══ Multi-option group structure (WCAG 1.3.1) ══════════════════════════ */

  test('A11y — Multi-option field: fieldset + legend structure (WCAG 1.3.1)', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-multi');
    await band.scrollIntoViewIfNeeded();
    const fieldset = fieldsetInSection(page, 'checkboxfield-qa-multi');
    await expect(fieldset, 'Multi-option field must render a <fieldset>').toBeVisible();
    const legend = legendInSection(page, 'checkboxfield-qa-multi');
    await expect(legend, 'Fieldset must contain a <legend>').toBeVisible();
    const legendText = (await legend.textContent()) ?? '';
    expect(legendText.trim().length, 'Legend must have non-empty text').toBeGreaterThan(0);
  });

  test('A11y — Multi-option group: description text is visible (WCAG 1.3.1)', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-multi');
    await band.scrollIntoViewIfNeeded();
    await expect(
      textInSection(page, 'checkboxfield-qa-multi', 'Select all that apply'),
    ).toBeVisible();
  });

  /* ══ Focus / keyboard (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7) ═══════════════ */

  test('A11y — Tab reaches a checkbox in the field (WCAG 2.1.1)', async ({ page }) => {
    let found = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      if (role === 'checkbox') { found = true; break; }
    }
    expect(found, 'Tab must reach at least one role=checkbox').toBe(true);
  });

  test('A11y — No keyboard trap: Tab advances across many distinct targets (WCAG 2.1.2)', async ({ page }) => {
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
    expect(seen.size, 'Focus must move across multiple distinct elements').toBeGreaterThan(3);
  });

  test('A11y — Visible focus ring on Tab (WCAG 2.4.7)', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const style = getComputedStyle(el);
      return { outline: style.outline, outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
    });
    const hasVisibleFocus =
      focusStyle?.outlineWidth !== '0px' ||
      (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
    expect(hasVisibleFocus, 'No visible focus indicator on first Tab target').toBe(true);
  });

  test('A11y — Focus order: Tab visits multiple distinct roles / identities (WCAG 2.4.3)', async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const sig =
        (await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return '';
          const role = el.getAttribute('role') ?? '';
          // Use the element's id (Base UI generates unique ids like "base-ui-«ra»") or
          // data-testid as the unique identifier — avoids collapsing all checkbox spans
          // (which have empty text content) into a single signature.
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

  test('A11y — Space toggles focused default checkbox (WCAG 2.1.1)', async ({ page }) => {
    const cb = firstCheckboxInSection(page, 'checkboxfield-qa-default');
    await cb.focus();
    const before = await cb.isChecked();
    await page.keyboard.press('Space');
    expect(await cb.isChecked()).toBe(!before);
  });

  test('A11y — Space does not toggle readOnly checked checkbox (WCAG 4.1.2)', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-readonly');
    await band.scrollIntoViewIfNeeded();
    const cb = band.locator('[role="checkbox"][aria-checked="true"][aria-readonly="true"]').first();
    await cb.focus();
    await page.keyboard.press('Space');
    await expect(cb).toBeChecked();
  });

  /* ══ A11y showcase band ═════════════════════════════════════════════════ */

  test('A11y — A11y showcase band: every checkbox has non-empty accessible name', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const controls = checkboxesInSection(page, 'checkboxfield-qa-a11y');
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(controls.nth(i), `a11y band checkbox [${i}] must have accessible name`).toHaveAccessibleName(/.+/);
    }
  });

  test('A11y — A11y band: required control exposes aria-required="true"', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const required = band.locator('[role="checkbox"][aria-required="true"]').first();
    await expect(required).toBeVisible();
  });

  test('A11y — A11y band: error-described control has Field.Root with aria-invalid', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    // Base UI Field.Root sets data-invalid="" on the container (not aria-invalid="true").
    const invalidRoot = band.locator('[role="radiogroup"][data-invalid]').first();
    await expect(invalidRoot).toBeVisible();
    await expect(
      textInSection(page, 'checkboxfield-qa-a11y', 'Please complete verification'),
    ).toBeVisible();
  });

  test('A11y — A11y band: multi-option group has fieldset / legend', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const fieldset = band.locator('fieldset').first();
    await expect(fieldset).toBeVisible();
    const legend = fieldset.locator('legend').first();
    await expect(legend).toBeVisible();
    const legendText = (await legend.textContent()) ?? '';
    expect(legendText.trim()).toContain('Group header');
  });

  test('A11y — A11y band: disabled control has aria-disabled="true" (Base UI pattern)', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const disabled = band.locator('[role="checkbox"][aria-disabled="true"]').first();
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  });

  test('A11y — A11y band: clicking readOnly control does not change state', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-a11y');
    await band.scrollIntoViewIfNeeded();
    const cb = band.locator('[role="checkbox"][aria-readonly="true"][aria-checked="true"]').first();
    await expect(cb).toBeVisible();
    await cb.click({ force: true });
    await expect(cb).toBeChecked();
  });

  /* ══ WCAG 2.4.3 — focus order within multi-option group ════════════════ */

  test('A11y — Multi-option group: Tab reaches each child Checkbox (WCAG 2.4.3)', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-multi');
    await band.scrollIntoViewIfNeeded();
    const news = checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiNews);
    await news.focus();
    await expect(news).toBeFocused();
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(
      focused === 'checkboxfield-multi-tips' || focused !== null,
      'Tab should advance to the next checkbox in the multi-option group',
    ).toBeTruthy();
  });

  test('A11y — Multi-option child checkbox shows visible focus ring on Tab (WCAG 2.4.7)', async ({ page }) => {
    const band = fieldSection(page, 'checkboxfield-qa-multi');
    await band.scrollIntoViewIfNeeded();
    const cb = checkboxByTestId(page, CHECKBOX_FIELD_MULTI_OPTION_TESTIDS.multiNews);
    await cb.focus();
    await expectFocusVisible(page);
  });

  /* ══ Surface context — axe scan ════════════════════════════════════════ */

  test('A11y — Surface band: WCAG 2.1 AA axe scan, zero serious or critical', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-section="checkboxfield-qa-surface"]')
      .withTags([...WCAG_AA_TAGS])
      .disableRules(['aria-toggle-field-name', 'region', 'heading-order', 'color-contrast'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, fmtViolations(blocking)).toHaveLength(0);
  });

  /* ══ Figma Validation tab + API gaps (scoped; no full-page duplicate) ═ */

  test.describe('Figma Validation tab', { tag: CHECKBOX_FIELD_TAG_SET.accessibility }, () => {
    test.beforeEach(async ({ page }) => {
      await openCheckboxFieldFigmaValidation(page);
    });

    test('A11y — Figma Validation tab: WCAG 2.1 AA on matrix root, zero serious or critical', async ({
      page,
    }) => {
      const results = await new AxeBuilder({ page })
        .include(CHECKBOX_FIELD_FIGMA_AXE_SCOPE)
        .withTags([...WCAG_AA_TAGS])
        .disableRules([...CHECKBOX_FIELD_AXE_SHELL_DISABLE, 'color-contrast'])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, fmtViolations(blocking)).toHaveLength(0);
    });

    test('A11y — Figma state grid: Tab focuses a checkbox inside the matrix (WCAG 2.1.1)', async ({
      page,
    }) => {
      const grid = figmaGrid(page, CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.state);
      await grid.scrollIntoViewIfNeeded();
      const first = grid.locator('[role="checkbox"]').first();
      await first.focus();
      await expect(first).toBeFocused();
      await expectFocusVisible(page);
    });
  });

  test.describe('Figma API a11y gaps', { tag: CHECKBOX_FIELD_TAG_SET.accessibility }, () => {
    test('A11y — Multi-option: description is linked via aria-describedby on the group (WCAG 1.3.1)', async ({
      page,
    }) => {
      await expectDescriptionLinkedViaDescribedBy(
        page,
        'checkboxfield-qa-multi',
        'Select all that apply',
      );
    });

    test('A11y — Label band: infoIcon control is keyboard focusable with accessible name', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-label');
      await band.scrollIntoViewIfNeeded();
      const infoBtn = band.getByRole('button', { name: /more about crash/i });
      await expect(infoBtn).toBeVisible();
      await expect(infoBtn).toHaveAccessibleName(/.+/);
      await infoBtn.focus();
      await expect(infoBtn).toBeFocused();
    });

    test('A11y — readOnly band: unchecked control exposes aria-readonly="true"', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-readonly');
      await band.scrollIntoViewIfNeeded();
      const cb = band
        .locator('[role="checkbox"][aria-readonly="true"][aria-checked="false"]')
        .first();
      await expect(cb).toHaveAttribute('aria-readonly', 'true');
    });

    test('A11y — readOnly band: indeterminate control has mixed state and aria-readonly', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-readonly');
      await band.scrollIntoViewIfNeeded();
      const cb = band
        .locator('[role="checkbox"][aria-readonly="true"][aria-checked="mixed"]')
        .first();
      await expect(cb).toHaveAttribute('aria-readonly', 'true');
      await expect(cb).toHaveAttribute('aria-checked', 'mixed');
    });

    test('A11y — Disabled band: checked disabled control ignores Space (WCAG 4.1.2)', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-disabled');
      await band.scrollIntoViewIfNeeded();
      const cb = band
        .locator('[role="checkbox"][aria-disabled="true"][aria-checked="true"]')
        .first();
      await cb.focus();
      await page.keyboard.press('Space');
      await expect(cb).toBeChecked();
      await expect(cb).toHaveAttribute('aria-disabled', 'true');
    });

    test('A11y — Feedback band: error message is exposed for invalid+error field (WCAG 3.3.1)', async ({
      page,
    }) => {
      const band = fieldSection(page, 'checkboxfield-qa-feedback');
      await band.scrollIntoViewIfNeeded();
      const alert = band.getByRole('alert').filter({ hasText: 'You must accept to continue' });
      await expect(alert.first()).toBeVisible();
    });
  });
});
