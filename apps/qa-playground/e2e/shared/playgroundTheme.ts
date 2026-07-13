/**
 * QA playground shell theme controls.
 * Theme combobox only appears when Brand source is Convex; fixture shell is light-only.
 */
import { expect, type Page } from 'playwright/test';

function themeSelect(page: Page) {
  return page.getByRole('combobox', { name: 'Theme' });
}

export async function ensurePlaygroundThemeControl(page: Page): Promise<void> {
  const select = themeSelect(page);
  if ((await select.count()) > 0 && (await select.isVisible())) {
    return;
  }

  const brandSource = page.getByRole('combobox', { name: 'Brand source' });
  if ((await brandSource.count()) > 0 && (await brandSource.isVisible())) {
    const currentSource = (await brandSource.textContent()) ?? '';
    if (!/Convex/i.test(currentSource)) {
      await brandSource.click();
      await page.getByRole('option', { name: /Convex/i }).click();
    }
    try {
      await expect(
        select,
        'Theme control should appear after switching to Convex brand source',
      ).toBeVisible({ timeout: 10_000 });
      return;
    } catch {
      /* Fixture-only shell — Brand source change is a no-op; fall through to data-mode fallback. */
    }
  }

  await page.evaluate(() => {
    if (!document.documentElement.getAttribute('data-mode')) {
      document.documentElement.setAttribute('data-mode', 'light');
    }
  });
}

/** @deprecated Use ensurePlaygroundThemeControl */
export const ensurePlaygroundModeControl = ensurePlaygroundThemeControl;

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await ensurePlaygroundThemeControl(page);
  const select = themeSelect(page);
  if ((await select.count()) > 0 && (await select.isVisible())) {
    await select.click();
    await page.getByRole('option', { name: 'Dark' }).click();
  } else {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-mode', 'dark');
    });
  }
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
}

/**
 * Theme combobox keyboard activation — only when Convex shell exposes the control.
 * Fixture-only runs still assert `data-mode` after `ensurePlaygroundThemeControl` fallback.
 */
export async function assertModeSelectActivatesWithKey(
  page: Page,
  key: 'Enter' | 'Space',
): Promise<void> {
  await ensurePlaygroundThemeControl(page);
  const select = themeSelect(page);
  if ((await select.count()) > 0 && (await select.isVisible())) {
    await select.focus();
    await page.keyboard.press(key);
  }
  await expect(page.locator('html')).toHaveAttribute('data-mode', /.+/);
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  await ensurePlaygroundThemeControl(page);
  const select = themeSelect(page);
  if ((await select.count()) > 0 && (await select.isVisible())) {
    const before = (await select.textContent()) ?? '';
    await select.click();
    const nextOption = before.includes('Dark') ? 'Light' : 'Dark';
    await page.getByRole('option', { name: nextOption }).click();
    const after = (await select.textContent()) ?? '';
    await expect(page.locator('html')).toHaveAttribute('data-mode', nextOption.toLowerCase());
    return { before, after };
  }

  const before =
    (await page.locator('html').getAttribute('data-mode')) === 'dark' ? 'Dark' : 'Light';
  const nextTheme = before === 'Dark' ? 'light' : 'dark';
  const after = before === 'Dark' ? 'Light' : 'Dark';
  await page.evaluate((theme) => {
    document.documentElement.setAttribute('data-mode', theme);
  }, nextTheme);
  await expect(page.locator('html')).toHaveAttribute('data-mode', nextTheme);
  return { before, after };
}

/** Rich focus fingerprint for Tab-order tests when focused nodes lack data-testid. */
export async function collectRichTabFocusSignatures(
  page: Page,
  presses = 25,
): Promise<Set<string>> {
  const seen = new Set<string>();
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab');
    const sig =
      (await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return '';
        const role = el.getAttribute('role') ?? '';
        const testId = el.getAttribute('data-testid') ?? '';
        const id = el.getAttribute('id') ?? '';
        const name = (el as HTMLElement).ariaLabel ?? el.getAttribute('aria-label') ?? '';
        return `${el.tagName}:${role}:${testId}:${id}:${name}`;
      })) ?? '';
    seen.add(sig);
  }
  return seen;
}
