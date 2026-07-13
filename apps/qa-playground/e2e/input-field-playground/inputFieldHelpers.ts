import { expect, type Locator, type Page } from 'playwright/test';

/** QA wrapper `data-testid` from `InputFieldScenarioGrid`. */
export function fieldWrapper(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Figma validation tab cell anchor (`InputFieldFigmaValidationShowcase`). */
export function figmaInputFieldCell(page: Page, testId: string): Locator {
  return fieldWrapper(page, testId);
}

/** Native control inside the bordered Input (`textbox` or native `input`). */
export function fieldInput(page: Page, testId: string): Locator {
  const root = fieldWrapper(page, testId);
  return root.getByRole('textbox').or(root.locator('input')).first();
}

/** Bordered `Input` shell — numeric `data-size` only (label stack uses s/m/l). */
export function fieldInputContainer(page: Page, testId: string): Locator {
  return fieldWrapper(page, testId).locator('[data-size="8"], [data-size="10"], [data-size="12"]');
}

export function fieldLabel(page: Page, testId: string): Locator {
  return fieldWrapper(page, testId).locator('label').first();
}

/** `Field.Description` copy in the label stack. */
export function fieldDescription(page: Page, testId: string): Locator {
  return fieldWrapper(page, testId).getByText(/helper description|shown under|description supplied/i).first();
}

/** Negative feedback row (`role="alert"`) or informative (`role="status"`). */
export function fieldFeedbackRow(page: Page, testId: string): Locator {
  return fieldWrapper(page, testId).locator('[role="alert"], [role="status"]').first();
}

/** Decorative icons inside the bordered input shell. */
export function fieldInputDecorativeIcons(page: Page, testId: string): Locator {
  return fieldInputContainer(page, testId).locator('[aria-hidden="true"]');
}

export async function expectFieldWrapperVisible(page: Page, testId: string): Promise<void> {
  await expect(fieldWrapper(page, testId), `Wrapper "${testId}" should be visible`).toBeVisible();
}

const PLAYGROUND_FAULT_PATTERN = /failed to (load|render)|something went wrong|unhandled runtime/i;

export async function expectNoPlaygroundFault(locator: Locator): Promise<void> {
  await expect(locator, 'Mount should not show playground fault copy').not.toContainText(PLAYGROUND_FAULT_PATTERN);
}

export function iffSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  const section = iffSection(page, sectionId);
  await expect(section, `Story band "${sectionId}" should exist`).toBeAttached();
  // Native scroll avoids Playwright stability waits when bands contain motion or sticky chrome.
  await section.evaluate((el) => el.scrollIntoView({ block: 'start', inline: 'nearest' }));
  await expect(section, `Story band "${sectionId}" should be visible`).toBeVisible();
}

export function iffControlsSection(page: Page): Locator {
  return iffSection(page, 'input-field-qa-controls');
}

export function iffControlsCheckbox(page: Page, name: string | RegExp): Locator {
  return iffControlsSection(page).getByRole('checkbox', { name });
}

export function iffControlsButton(page: Page, name: string | RegExp): Locator {
  return iffControlsSection(page).getByRole('button', { name });
}

export function iffControlsLabelTextInput(page: Page): Locator {
  return iffControlsSection(page).getByRole('textbox', { name: /label text/i });
}

export async function computedInputFontSize(page: Page, testId: string): Promise<string> {
  return fieldInputContainer(page, testId).evaluate((el) => getComputedStyle(el as HTMLElement).fontSize);
}

export async function computedInputBackgroundRgb(page: Page, testId: string): Promise<string> {
  return fieldInputContainer(page, testId).evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}

/** Medium-attention inputs use transparent fill; appearance reads via border colour. */
export async function computedInputBorderRgb(page: Page, testId: string): Promise<string> {
  return fieldInputContainer(page, testId).evaluate((el) => getComputedStyle(el as HTMLElement).borderColor);
}

export function parseRgbAlpha(rgb: string): number {
  const m = rgb.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
  if (m) return Number(m[1]);
  return rgb.includes('rgba') ? 0 : 1;
}

export async function expectNonTransparentInputBackground(
  page: Page,
  testId: string,
  label: string,
): Promise<void> {
  const bg = await computedInputBackgroundRgb(page, testId);
  const alpha = parseRgbAlpha(bg);
  expect(alpha, `${label} input background should not be transparent (${bg})`).toBeGreaterThan(0.05);
}

export async function expectDistinctInputBorder(
  page: Page,
  testId: string,
  label: string,
): Promise<void> {
  const border = await computedInputBorderRgb(page, testId);
  expect(border, `${label} border colour should be resolved`).not.toMatch(/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/);
  expect(border, `${label} border should not be fully transparent`).not.toBe('transparent');
}

/** Decorative `<svg>` icons in the bordered input shell (start/end slots). */
export function fieldInputSlotSvgs(page: Page, testId: string) {
  return fieldInputContainer(page, testId).locator('svg');
}

export async function computedSlotIconColorRgb(page: Page, testId: string): Promise<string> {
  return fieldInputSlotSvgs(page, testId)
    .first()
    .evaluate((svg) => {
      const target = svg.querySelector('path, circle, rect') ?? svg;
      const style = getComputedStyle(target as Element);
      const fill = style.fill;
      if (fill && fill !== 'none') return fill;
      return style.color;
    });
}

export async function expectWrapperFillsParentCell(page: Page, testId: string): Promise<void> {
  const ratio = await fieldWrapper(page, testId).evaluate((el) => {
    const parent = el.parentElement;
    if (!parent) return 0;
    const w = el.getBoundingClientRect().width;
    const pw = parent.getBoundingClientRect().width;
    return pw > 0 ? w / pw : 0;
  });
  expect(ratio, `Mount "${testId}" should fill its scenario cell width`).toBeGreaterThan(0.9);
}

export async function expectFocusRingVisible(page: Page): Promise<void> {
  const focusStyle = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = getComputedStyle(el);
    return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
  });
  const hasVisibleFocus =
    focusStyle?.outlineWidth !== '0px' ||
    (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
  expect(hasVisibleFocus, 'Focused element should show outline or box-shadow').toBe(true);
}
