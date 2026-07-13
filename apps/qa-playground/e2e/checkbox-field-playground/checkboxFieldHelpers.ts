/**
 * DOM helpers for CheckboxField Playwright automation.
 *
 * **Why section-scope?** `<CheckboxField>` does not spread `...rest` onto any root
 * DOM element, so `data-testid` passed to it is silently dropped. The reliable
 * locator contract is:
 *   - `[data-section="<band-id>"]` for field containers (from `QaStoryBand id`)
 *   - `[role="checkbox"]` inside a section for the inner Checkbox control(s)
 *   - `data-testid` on standalone `<Checkbox>` children (those DO reach the DOM)
 *   - `data-testid` on plain `<span>` elements (state displays, etc.)
 */
import { expect, type Locator, type Page } from 'playwright/test';

/* ─── Section locators ─────────────────────────────────────────── */

export function fieldSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** All `[role="checkbox"]` controls within a QA story band. */
export function checkboxesInSection(page: Page, sectionId: string): Locator {
  return fieldSection(page, sectionId).locator('[role="checkbox"]');
}

/** First `[role="checkbox"]` inside a section. */
export function firstCheckboxInSection(page: Page, sectionId: string): Locator {
  return checkboxesInSection(page, sectionId).first();
}

/* ─── Control locators ─────────────────────────────────────────── */

/** Checkbox control found by its `data-testid` (only for <Checkbox> children). */
export function checkboxByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Field container (`Field.Root` = `[role="radiogroup"]`) scoped to a section. */
export function fieldRootInSection(page: Page, sectionId: string): Locator {
  return fieldSection(page, sectionId).locator('[role="radiogroup"]').first();
}

/** `<fieldset>` element wrapping a multi-option group (for legend assertions). */
export function fieldsetInSection(page: Page, sectionId: string): Locator {
  return fieldSection(page, sectionId).locator('fieldset').first();
}

/** `<legend>` text inside a fieldset in the given section. */
export function legendInSection(page: Page, sectionId: string): Locator {
  return fieldsetInSection(page, sectionId).locator('legend');
}

/* ─── Feedback / label locators ──────────────────────────────── */

/** Visible label text element for a single-field CheckboxField. */
export function fieldLabelInSection(page: Page, sectionId: string): Locator {
  return fieldSection(page, sectionId).locator('[data-field-label], [class*="label"]').first();
}

/** Find any element with the given text inside a section (for feedback/error assertions). */
export function textInSection(page: Page, sectionId: string, text: string): Locator {
  return fieldSection(page, sectionId).getByText(text, { exact: false });
}

/** Figma Validation tab table by `data-testid` on `<table>`. */
export function figmaGrid(page: Page, tableTestId: string): Locator {
  return page.getByTestId(tableTestId);
}

/**
 * One appearance row in band 2 — the flex row whose direct child `<span>` is the appearance label.
 * Avoids matching the outer column wrapper (which would include every row's checkboxes).
 */
export function appearanceRowInSection(
  page: Page,
  sectionId: string,
  appearance: string,
): Locator {
  return fieldSection(page, sectionId).locator(`div:has(> span:text-is("${appearance}"))`);
}

/**
 * Multi-option field: `CheckboxGroup` exposes `aria-describedby` when a header description is set.
 * Asserts the description id is referenced (Figma `descriptionText` / WCAG 1.3.1).
 */
export async function expectDescriptionLinkedViaDescribedBy(
  page: Page,
  sectionId: string,
  descriptionSnippet: string,
): Promise<void> {
  const band = fieldSection(page, sectionId);
  const desc = band.locator('[id^="oneui-checkboxfield-desc-"]').filter({
    hasText: descriptionSnippet,
  });
  await expect(desc.first(), 'Description element must be visible').toBeVisible();
  const descId = await desc.first().getAttribute('id');
  expect(descId, 'Description must have a stable id').toBeTruthy();
  const describedByHost = band.locator('[aria-describedby]').first();
  await expect(describedByHost, 'Group must expose aria-describedby').toBeVisible();
  const describedBy = (await describedByHost.getAttribute('aria-describedby')) ?? '';
  expect(
    describedBy.split(/\s+/).filter(Boolean),
    `aria-describedby must reference description id "${descId}"`,
  ).toContain(descId!);
}

/* ─── Computed style helpers ─────────────────────────────────── */

export async function getCheckboxFillRgb(page: Page, locator: Locator): Promise<string> {
  return locator.evaluate((el: Element) => {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    const indicator =
      el.querySelector('[class*="indicator"]') ??
      el.querySelector('.indicator') ??
      el.firstElementChild ??
      el;
    return getComputedStyle(indicator as Element).backgroundColor;
  });
}

export function rgbaAlpha(rgb: string): number {
  const m = rgb.match(
    /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*([\d.]+))?\s*\)/i,
  );
  if (!m) return rgb === 'transparent' ? 0 : 1;
  if (m[1] === undefined) return 1;
  return parseFloat(m[1]);
}

/* ─── Focus helpers ──────────────────────────────────────────── */

export async function expectFocusVisible(page: Page): Promise<void> {
  const style = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const s = getComputedStyle(el);
    return { outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
  });
  const visible =
    style?.outlineWidth !== '0px' ||
    (style?.boxShadow != null && style.boxShadow !== 'none');
  expect(visible, 'Focused CheckboxField control should show outline or box-shadow').toBe(true);
}

/* ─── Label text ─────────────────────────────────────────────── */

/**
 * Accessible name for a checkbox control — mirrors Playwright `toHaveAccessibleName` enough
 * for CheckboxField (sibling `Field.Label` + `aria-labelledby`, or `label[for]` → hidden input).
 */
export async function checkboxAccessibleName(locator: Locator): Promise<string> {
  return locator.evaluate((node: Element) => {
    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
    const textOf = (el: Element | null | undefined) =>
      el ? normalize(el.textContent ?? '') : '';

    const labelledBy = node.getAttribute('aria-labelledby')?.trim();
    if (labelledBy) {
      const parts = labelledBy
        .split(/\s+/)
        .map((id) => textOf(node.ownerDocument.getElementById(id)))
        .filter(Boolean);
      if (parts.length > 0) return parts.join(' ');
    }

    const ariaLabel = node.getAttribute('aria-label')?.trim();
    if (ariaLabel) return normalize(ariaLabel);

    const wrappingLabel = node.closest('label');
    if (wrappingLabel) return textOf(wrappingLabel);

    const controlId = node.getAttribute('id')?.trim();
    if (controlId) {
      const forLabel = node.ownerDocument.querySelector(`label[for="${CSS.escape(controlId)}"]`);
      if (forLabel) return textOf(forLabel);
    }

    const hiddenInput =
      node.querySelector('input[type="checkbox"]') ??
      node.parentElement?.querySelector('input[type="checkbox"]');
    const inputId = hiddenInput?.getAttribute('id')?.trim();
    if (inputId) {
      const forLabel = node.ownerDocument.querySelector(`label[for="${CSS.escape(inputId)}"]`);
      if (forLabel) return textOf(forLabel);
    }

    return '';
  });
}
