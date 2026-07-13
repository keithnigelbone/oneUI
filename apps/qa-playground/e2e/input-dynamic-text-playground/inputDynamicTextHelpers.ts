import { expect, type Locator, type Page } from 'playwright/test';

export function dynamicTextByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function dynamicTextEndButton(page: Page, testId: string): Locator {
  return dynamicTextByTestId(page, testId).getByRole('button');
}

export function dynamicTextContent(page: Page, testId: string): Locator {
  return dynamicTextByTestId(page, testId).locator('p').first();
}

export async function expectDynamicTextVisible(page: Page, testId: string): Promise<void> {
  await expect(dynamicTextByTestId(page, testId)).toBeVisible();
}

export async function expectNoErrorText(locator: Locator): Promise<void> {
  await expect(locator).not.toContainText(/error|failed|exception/i);
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

export async function computedContentFontSize(page: Page, testId: string): Promise<string> {
  return dynamicTextContent(page, testId).evaluate((el) => getComputedStyle(el).fontSize);
}

export async function computedContentColor(page: Page, testId: string): Promise<string> {
  return dynamicTextContent(page, testId).evaluate((el) => getComputedStyle(el).color);
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
}

export function idtSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export async function computedRootBackgroundRgb(page: Page, testId: string): Promise<string> {
  return dynamicTextByTestId(page, testId).evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}
