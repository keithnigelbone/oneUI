/**
 * DOM locator helpers for Text Playwright automation.
 *
 * **DOM contract:** `<Text>` does NOT spread `...rest` to the DOM, so
 * `data-testid` on `<Text>` is silently dropped. Tests use:
 *   - `[data-section="..."]` band scoping (primary)
 *   - `data-variant` / `data-size` / `data-appearance` attribute selectors
 *   - `data-testid` on wrapping `<span>` elements in `TextQaShowcase`
 */
import type { Page, Locator } from 'playwright/test';
import type { TextSection } from './manifest';

/** Locate a story band by its `data-section` id. */
export function textSection(page: Page, sectionId: TextSection): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** Locate the first Text element with a given variant inside a band. */
export function textByVariant(page: Page, sectionId: TextSection, variant: string): Locator {
  return textSection(page, sectionId).locator(`[data-variant="${variant}"]`).first();
}

/** Locate a Text element by data-size inside a band. */
export function textBySize(page: Page, sectionId: TextSection, size: string): Locator {
  return textSection(page, sectionId).locator(`[data-size="${size}"]`).first();
}

/** Locate a Text element by data-appearance inside a band. */
export function textByAppearance(page: Page, sectionId: TextSection, appearance: string): Locator {
  return textSection(page, sectionId).locator(`[data-appearance="${appearance}"]`).first();
}

/** Locate content within a band by partial visible text. */
export function textInSection(
  page: Page,
  sectionId: TextSection,
  content: string,
): Locator {
  return textSection(page, sectionId).getByText(content, { exact: false });
}

/** Locate an element by testid within a band. */
export function elementByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/**
 * Assert a visible focus indicator (outline or box-shadow) on the active element.
 * WCAG 2.4.7 Focus Visible.
 */
export async function expectFocusVisible(page: Page): Promise<void> {
  const focusStyle = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      outline: cs.outline,
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
      boxShadow: cs.boxShadow,
    };
  });

  const hasVisibleFocus =
    (focusStyle?.outlineWidth != null &&
      focusStyle.outlineWidth !== '0px' &&
      focusStyle.outlineStyle !== 'none') ||
    (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');

  if (!hasVisibleFocus) {
    throw new Error(
      `No visible focus indicator found on active element.\noutline: ${focusStyle?.outline ?? 'n/a'}\nboxShadow: ${focusStyle?.boxShadow ?? 'n/a'}`,
    );
  }
}

/** Get the computed accessible name of a locator. */
export async function textAccessibleName(locator: Locator): Promise<string> {
  const el = locator.first();
  return (await el.getAttribute('aria-label')) ?? (await el.innerText()) ?? '';
}
