import { expect, test } from 'playwright/test';

import {
  BADGE_APPEARANCE_KEYS,
  BADGE_PLAYGROUND_DATA_TESTIDS,
  BADGE_SIZE_ORDER_FIGMA,
} from './manifest';
import { gotoBadgePlayground } from './gotoBadgePlayground';

function isFullyTransparentBackground(bg: string): boolean {
  const t = bg.trim().toLowerCase();
  if (t === 'transparent') return true;
  const m = t.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
  if (m) {
    const a = parseFloat(m[4]);
    return a === 0;
  }
  return false;
}

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

for (const testId of BADGE_PLAYGROUND_DATA_TESTIDS) {
  test(`renders: ${testId}`, async ({ page }) => {
    const el = page.getByTestId(testId);
    await expect(el).toBeVisible({ timeout: 60_000 });
  });
}

test('sizes increase progressively XS→XL', async ({ page }) => {
  const widths: number[] = [];
  for (const size of BADGE_SIZE_ORDER_FIGMA) {
    const id = `badge-size-${size}`;
    const el = page.getByTestId(id);
    await expect(el).toBeVisible({ timeout: 60_000 });
    const box = await el.boundingBox();
    expect(box, `bounding box for ${id}`).toBeTruthy();
    widths.push(box!.width);
  }
  for (let i = 1; i < widths.length; i++) {
    expect(widths[i], `width[${i}] >= width[${i - 1}]`).toBeGreaterThanOrEqual(widths[i - 1]!);
  }
});

test('start=none has only label wrapper (no start slot span)', async ({ page }) => {
  const el = page.getByTestId('badge-start-none');
  await expect(el).toBeVisible({ timeout: 60_000 });
  await expect(el.locator(':scope > span')).toHaveCount(1);
});

test('start=Icon renders svg in first slot span', async ({ page }) => {
  const el = page.getByTestId('badge-start-Icon');
  await expect(el).toBeVisible({ timeout: 60_000 });
  const first = el.locator(':scope > span').first();
  await expect(first.locator('svg')).toBeVisible();
});

test('start=Avatar renders avatar content in first slot span', async ({ page }) => {
  const el = page.getByTestId('badge-start-Avatar');
  await expect(el).toBeVisible({ timeout: 60_000 });
  const first = el.locator(':scope > span').first();
  await expect(first).toBeVisible();
  const hasImg = (await first.locator('img').count()) > 0;
  const hasSvg = (await first.locator('svg').count()) > 0;
  expect(hasImg || hasSvg).toBe(true);
});

test('start=CounterBadge shows counter value in first slot span', async ({ page }) => {
  const el = page.getByTestId('badge-start-CounterBadge');
  await expect(el).toBeVisible({ timeout: 60_000 });
  const first = el.locator(':scope > span').first();
  await expect(first.getByText('3', { exact: true })).toBeVisible();
});

test('start=IndicatorBadge renders indicator in start slot', async ({ page }) => {
  const el = page.getByTestId('badge-start-IndicatorBadge');
  await expect(el).toBeVisible({ timeout: 60_000 });
  await expect(el.getByLabel('Alert')).toBeVisible();
});

test('end=none has only label wrapper (no end slot span)', async ({ page }) => {
  const el = page.getByTestId('badge-end-none');
  await expect(el).toBeVisible({ timeout: 60_000 });
  await expect(el.locator(':scope > span')).toHaveCount(1);
});

test('end=Icon renders svg in last slot span', async ({ page }) => {
  const el = page.getByTestId('badge-end-Icon');
  await expect(el).toBeVisible({ timeout: 60_000 });
  const last = el.locator(':scope > span').last();
  await expect(last.locator('svg')).toBeVisible();
});

test('end=Avatar renders avatar content in last slot span', async ({ page }) => {
  const el = page.getByTestId('badge-end-Avatar');
  await expect(el).toBeVisible({ timeout: 60_000 });
  const last = el.locator(':scope > span').last();
  const hasImg = (await last.locator('img').count()) > 0;
  const hasSvg = (await last.locator('svg').count()) > 0;
  expect(hasImg || hasSvg).toBe(true);
});

test('end=CounterBadge shows counter value in last slot span', async ({ page }) => {
  const el = page.getByTestId('badge-end-CounterBadge');
  await expect(el).toBeVisible({ timeout: 60_000 });
  const last = el.locator(':scope > span').last();
  await expect(last.getByText('3', { exact: true })).toBeVisible();
});

test('end=IndicatorBadge renders indicator in end slot', async ({ page }) => {
  const el = page.getByTestId('badge-end-IndicatorBadge');
  await expect(el).toBeVisible({ timeout: 60_000 });
  await expect(el.getByLabel('Alert')).toBeVisible();
});

test('start=Icon end=Icon: first and last direct spans contain svg', async ({ page }) => {
  const el = page.getByTestId('badge-start-icon-end-icon');
  await expect(el).toBeVisible({ timeout: 60_000 });
  const first = el.locator(':scope > span').first();
  const last = el.locator(':scope > span').last();
  await expect(first.locator('svg')).toBeVisible();
  await expect(last.locator('svg')).toBeVisible();
});



for (const appearance of BADGE_APPEARANCE_KEYS) {
}

for (const accent of ['primary', 'secondary', 'sparkle'] as const) {
  test(`accent stand-in renders: badge-accent-${accent}`, async ({ page }) => {
    const id = `badge-accent-${accent}`;
    const el = page.getByTestId(id);
    await expect(el).toBeVisible({ timeout: 60_000 });
    await expect(el).toBeVisible();
  });
}

test('content=text (children) renders non-empty text', async ({ page }) => {
  const el = page.getByTestId('badge-content-text');
  await expect(el).toBeVisible({ timeout: 60_000 });
  await expect(el).toBeVisible();
  await expect(el).toContainText('Text Content');
});
