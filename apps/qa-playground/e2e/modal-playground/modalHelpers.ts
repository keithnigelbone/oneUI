import { expect, type Locator, type Page } from 'playwright/test';

/** Click trigger inside ModalCell wrapper (`data-testid` on wrapper div). */
export async function clickModalTrigger(page: Page, triggerTestId: string): Promise<void> {
  await page.getByTestId(triggerTestId).getByRole('button').click();
}

export function modalSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

export function modalDialog(page: Page): Locator {
  return page.getByRole('dialog');
}

export async function openModalViaTrigger(page: Page, triggerTestId: string): Promise<void> {
  await clickModalTrigger(page, triggerTestId);
  await expect(modalDialog(page)).toBeVisible();
}

export async function closeModalViaEscape(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(modalDialog(page)).toHaveCount(0);
}

export async function dialogBackgroundRgb(page: Page): Promise<string> {
  return modalDialog(page).evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
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

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await modalSection(page, sectionId).scrollIntoViewIfNeeded();
}

function isTransparentRgb(rgb: string): boolean {
  return rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)';
}

export { isTransparentRgb };
