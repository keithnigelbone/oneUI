import { expect, type Locator, type Page } from 'playwright/test';

export function chipGroupSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export function chipGroupWrapper(page: Page, testId: string, sectionId?: string): Locator {
  const root = sectionId ? chipGroupSection(page, sectionId) : page;
  return root.getByTestId(testId);
}

export function chipsInWrapper(page: Page, testId: string, sectionId?: string): Locator {
  return chipGroupWrapper(page, testId, sectionId).getByRole('button');
}

export function chipGroupRootEl(page: Page, testId: string, sectionId?: string): Locator {
  return chipGroupWrapper(page, testId, sectionId).locator('[role="group"]').first();
}

export async function scrollToChipGroupTestId(
  page: Page,
  testId: string,
  sectionId?: string,
): Promise<void> {
  await chipGroupWrapper(page, testId, sectionId).scrollIntoViewIfNeeded();
}

export async function firstChipBox(page: Page, testId: string, sectionId?: string) {
  const chip = chipsInWrapper(page, testId, sectionId).first();
  await chip.scrollIntoViewIfNeeded();
  return chip.boundingBox();
}

export async function chipButtonFillRgb(page: Page, chip: Locator): Promise<string> {
  return chip.evaluate((el) => getComputedStyle(el).backgroundColor);
}

export async function expectChipFocusRing(page: Page, chip: Locator): Promise<void> {
  await chip.focus();
  const focusStyle = await chip.evaluate((el) => {
    const style = getComputedStyle(el);
    return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
  });
  const hasVisibleFocus =
    focusStyle.outlineWidth !== '0px' ||
    (focusStyle.boxShadow != null && focusStyle.boxShadow !== 'none');
  expect(hasVisibleFocus, 'Focused chip should show outline or box-shadow').toBe(true);
}

export async function chipGroupFlexWrap(page: Page, testId: string, sectionId?: string): Promise<string> {
  return chipGroupRootEl(page, testId, sectionId).evaluate((el) => getComputedStyle(el).flexWrap);
}
