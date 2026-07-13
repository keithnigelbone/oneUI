/**
 * snapshot-brands.ts — CLI entry-point. Reads every active brand from
 * Convex and emits @jds/kb-core/dist/brands/<slug>.json. Pure projections
 * live in snapshot-brands.lib.ts so they can be unit-tested without a
 * Convex client.
 *
 * Run in OneUI CI immediately before publishing @jds/kb-core.
 */

import { ConvexHttpClient } from 'convex/browser';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api } from '@oneui/convex';
import {
  projectBrand,
  type ConvexBrandRow,
  type ConvexColorScaleRow,
  type ConvexFoundationOverview,
} from './snapshot-brands.lib';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const CONVEX_URL = process.env.CONVEX_URL;
  if (!CONVEX_URL) throw new Error('CONVEX_URL is required.');
  const DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;
  const ONLY_BRAND = process.argv.find((a) => a.startsWith('--brand='))?.split('=')[1];
  const brandSetVersion = process.env.BRAND_SET_VERSION ?? '3.0.0-wip.0';

  const client = new ConvexHttpClient(CONVEX_URL);
  if (DEPLOY_KEY) (client as unknown as { setAuth: (k: string) => void }).setAuth(DEPLOY_KEY);

  const repoRoot = resolve(__dirname, '..');
  const distDir = join(repoRoot, 'packages', 'kb-core', 'dist', 'brands');
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

  const brands = (await client.query(api.brands.list as never, {})) as ConvexBrandRow[];
  const targets = brands.filter((b) => b.status === 'active' && (!ONLY_BRAND || b.slug === ONLY_BRAND));
  const snapshottedAt = new Date().toISOString();
  const slugs: string[] = [];

  for (const row of targets) {
    const overview = (await client.query(api.foundations.getBrandOverviewData as never, {
      brandId: row._id,
    })) as ConvexFoundationOverview | null;
    const scales = (await client.query(api.colorScales.list as never, {
      brandId: row._id,
    })) as ConvexColorScaleRow[];
    const brand = projectBrand({ row, overview, scales, brandSetVersion, snapshottedAt });
    writeFileSync(join(distDir, `${row.slug}.json`), JSON.stringify(brand, null, 2) + '\n', 'utf8');
    slugs.push(row.slug);
  }

  const bundleHash = createHash('sha256').update(slugs.sort().join('|')).digest('hex').slice(0, 8);
  writeFileSync(
    join(distDir, '_index.json'),
    JSON.stringify({ snapshottedAt, brandSlugs: slugs.sort(), bundleHash, brandSetVersion }, null, 2) + '\n',
  );
  // eslint-disable-next-line no-console
  console.log(`[snapshot-brands] wrote ${slugs.length} brands to ${distDir} (bundle ${bundleHash})`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
