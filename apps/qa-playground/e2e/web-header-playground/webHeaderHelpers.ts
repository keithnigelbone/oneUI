import { expect, type Locator, type Page } from 'playwright/test';

/** `data-testid` wraps each `WebHeader` mount in `WebHeaderQaShowcase.tsx`. */
export function webHeaderByTestId(page: Page, testId: string): Locator {
  return page.getByTestId(testId);
}

export function primaryNavInMount(mount: Locator): Locator {
  return mount.getByRole('navigation', { name: /primary navigation/i });
}

export function searchInMount(mount: Locator): Locator {
  return mount.getByRole('search');
}

export function searchboxInMount(mount: Locator): Locator {
  return mount.getByRole('searchbox');
}

export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
}

export async function expectNavItemVisible(mount: Locator, name: string): Promise<void> {
  await expect(mount.getByRole('button', { name })).toBeVisible();
}

export async function expectNavItemHidden(mount: Locator, name: string): Promise<void> {
  await expect(mount.getByRole('button', { name })).toHaveCount(0);
}

export async function clickNavItem(mount: Locator, name: string): Promise<void> {
  await mount.getByRole('button', { name }).click();
}

export async function expectActiveNavItem(mount: Locator, name: string): Promise<void> {
  await expect(mount.getByRole('button', { name })).toHaveAttribute('data-active', 'true');
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
  expect(hasVisibleFocus, 'Focused control should show outline or box-shadow').toBe(true);
}

export async function expectAvatarVisible(mount: Locator): Promise<void> {
  await expect(mount.locator('[data-oneui-component="Avatar"]')).toBeVisible();
}

export async function expectAvatarHidden(mount: Locator): Promise<void> {
  await expect(mount.locator('[data-oneui-component="Avatar"]')).toHaveCount(0);
}

export async function expectEndIconButtonsVisible(mount: Locator): Promise<void> {
  await expect(mount.getByRole('button', { name: 'Ask HelloJio' })).toBeVisible();
}

export async function expectEndButtonVisible(mount: Locator, name: string): Promise<void> {
  await expect(mount.getByRole('button', { name })).toBeVisible();
}

export async function expectMenuButtonVisible(mount: Locator): Promise<void> {
  await expect(mount.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
}

export async function expectMenuButtonHidden(mount: Locator): Promise<void> {
  await expect(mount.getByRole('button', { name: 'Open navigation menu' })).toHaveCount(0);
}

export async function expectLogoVisible(mount: Locator): Promise<void> {
  await expect(mount.locator('[data-oneui-component="Logo"]')).toBeVisible();
}

export async function expectLogoHidden(mount: Locator): Promise<void> {
  await expect(mount.locator('[data-oneui-component="Logo"]')).toHaveCount(0);
}

export async function expectPrimaryNavType(mount: Locator, type: string): Promise<void> {
  await expect(mount.locator('nav[data-type]')).toHaveAttribute('data-type', type);
}

export async function expectPrimaryNavMiddle(mount: Locator, middle: string): Promise<void> {
  await expect(mount.locator('nav[data-middle]')).toHaveAttribute('data-middle', middle);
}
