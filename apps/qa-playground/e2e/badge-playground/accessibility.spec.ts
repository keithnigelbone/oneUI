import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { axeBadgePlayground, BADGE_PLAYGROUND_AXE_SHELL_DISABLE } from './axeBadgePlayground';
import { BADGE_PLAYGROUND_SECTION_IDS } from './manifest';
import { gotoBadgePlayground } from './gotoBadgePlayground';

test.beforeAll(async ({ request }) => {
  const res = await request.get('http://localhost:5180/c/badge').catch(() => null);
  if (!res || (!res.ok() && res.status() !== 304)) {
    throw new Error(
      'Badge QA playground not reachable at http://localhost:5180/c/badge — ensure Vite is running on 5180 (Playwright webServer should start it).',
    );
  }
});

test.beforeEach(async ({ page }) => {
  await gotoBadgePlayground(page);
});

test('full playground page has no axe violations', async ({ page }) => {
  const results = await axeBadgePlayground(new AxeBuilder({ page })).analyze();
  expect(
    results.violations,
    results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n'),
  ).toHaveLength(0);
});

for (const sectionId of BADGE_PLAYGROUND_SECTION_IDS) {
  test(`section "${sectionId}" has no axe violations`, async ({ page }) => {
    const section = page.locator(`[data-section="${sectionId}"]`);
    await expect(section).toBeVisible({ timeout: 60_000 });
    const results = await axeBadgePlayground(new AxeBuilder({ page }).include(`[data-section="${sectionId}"]`)).analyze();
    expect(
      results.violations,
      results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n'),
    ).toHaveLength(0);
  });
}

test('Badge root exposes expected ARIA role', async ({ page }) => {
  const badge = page.getByTestId('badge-size-M');
  await expect(badge).toBeVisible({ timeout: 60_000 });
  const role = await badge.getAttribute('role');
  expect(['status', 'img', null]).toContain(role);
});

test('Badge is not focused after Tab (non-interactive)', async ({ page }) => {
  const badge = page.getByTestId('badge-size-M');
  await expect(badge).toBeVisible({ timeout: 60_000 });
  await page.keyboard.press('Tab');
  await expect(badge).not.toBeFocused();
});
