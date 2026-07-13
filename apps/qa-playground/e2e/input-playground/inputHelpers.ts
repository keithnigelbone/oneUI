import { expect, type Locator, type Page } from 'playwright/test';

export function inputSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-section="${sectionId}"]`);
}

/** `data-testid` is forwarded to the native `<input>` by `Input`. */
export function inputByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

/** Bordered shell wrapping the control (`data-invalid`, slot chrome). */
export function inputShellByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId).locator('xpath=..');
}

export async function inputShellBackgroundRgb(page: Page, testId: string): Promise<string> {
  const shell = inputShellByTestId(page, testId);
  return shell.evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);
}

/** Medium-attention inputs use transparent fill; appearance often reads via border. */
export async function inputShellBorderRgb(page: Page, testId: string): Promise<string> {
  const shell = inputShellByTestId(page, testId);
  return shell.evaluate((el) => getComputedStyle(el as HTMLElement).borderColor);
}

export async function expectFocusVisible(page: Page): Promise<void> {
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

/** Home/End are unreliable in headless macOS; set caret via the DOM selection API instead. */
export async function moveInputCaretToStart(input: Locator): Promise<void> {
  await input.evaluate((el) => {
    const node = el as HTMLInputElement;
    node.focus();
    node.setSelectionRange(0, 0);
  });
}

export async function moveInputCaretToEnd(input: Locator): Promise<void> {
  await input.evaluate((el) => {
    const node = el as HTMLInputElement;
    node.focus();
    const end = node.value.length;
    node.setSelectionRange(end, end);
  });
}
