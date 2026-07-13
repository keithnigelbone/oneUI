import { expect, test } from 'playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'test-results', 'figma-pipeline-2459-24856-screenshots');
const STYLES_JSON = path.join(process.cwd(), 'test-results', 'figma-pipeline-2459-24856-computed-styles.json');

function slugify(label: string | null, i: number) {
  const base = (label ?? `region-${i}`).replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
  return base.slice(0, 96) || `region_${i}`;
}

test.describe('Figma 2459:24856 Container pipeline', () => {
  test.beforeAll(async () => {
    await mkdir(OUT_DIR, { recursive: true });
  });

  test('Button QA canvas — regions + representative computed styles', async ({ page }) => {
    await page.goto('/figma-pipeline/2459-24856');
    await expect(page.getByRole('heading', { name: /2459:24856/ })).toBeVisible();

    const regions = page.getByRole('region');
    const n = await regions.count();
    expect(n).toBeGreaterThan(5);

    const rows: Array<{ region: string | null; notes: string[] }> = [];

    for (let i = 0; i < n; i += 1) {
      const r = regions.nth(i);
      const label = await r.locator('h3').first().textContent();
      await expect(r).toBeVisible();
      const safe = slugify(label, i);
      await r.screenshot({ path: path.join(OUT_DIR, `${safe}.png`) });
      rows.push({ region: label, notes: ['screenshot'] });
    }

    const attention = page.locator('#button-qa-button-attention');
    await expect(attention).toBeVisible();

    const highBg = await attention
      .getByRole('button', { name: 'High' })
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const lowBg = await attention
      .getByRole('button', { name: 'Low' })
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(highBg === 'rgba(0, 0, 0, 0)' || highBg === 'transparent').toBe(false);
    expect(lowBg === 'rgba(0, 0, 0, 0)' || lowBg === 'transparent').toBe(true);

    rows.push({
      region: 'spot-check:#button-qa-button-attention',
      notes: [`high attention fill: ${highBg}`, `low attention (ghost) transparent: ${lowBg}`],
    });

    await writeFile(STYLES_JSON, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  });
});
