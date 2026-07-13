/**
 * sync-jio-theme-snapshot.mts
 *
 * Snapshots the *full* Jio brand payload from Convex so the integration_test
 * and widget-test harnesses can route through the exact production resolution
 * pipeline (resolveDesignSystemForBrand / resolveNativeTypographyForBrand)
 * instead of a synthetic palette. Tests then render byte-identical to the
 * qa-playground:flutter web app — no algorithmic drift, no false confidence.
 *
 * Fetches the same three Convex queries OneUiBrandScope hits at startup:
 *
 *   - brands:list                            → find Jio's _id
 *   - nativeTheme:getNativeThemeSnapshot     → theme/appearances/surfaces
 *   - foundations:getBrandOverviewData       → platforms/typography/fonts
 *
 * Writes:
 *
 *   apps/qa-playground-flutter/assets/qa-fixtures/jio/theme-snapshot.json
 *   apps/qa-playground-flutter/assets/qa-fixtures/jio/brand-overview.json
 *   apps/qa-playground-flutter/assets/qa-fixtures/jio/manifest.json
 *
 * Re-run whenever the Jio brand changes in Convex:
 *   pnpm sync:jio-theme-snapshot
 *
 * Behind a corporate cert? Add `ALLOW_INSECURE_TLS=1` to the command.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const FIXTURE_DIR = join(
  REPO_ROOT,
  'apps/qa-playground-flutter/assets/qa-fixtures/jio',
);

interface ConvexBrand {
  _id: string;
  name: string;
  slug: string;
  primaryHue?: number;
  primaryChroma?: number;
}

function readDotEnv(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function resolveConvexUrl(): string {
  const envOrder = ['CONVEX_URL', 'STORYBOOK_CONVEX_URL', 'NEXT_PUBLIC_CONVEX_URL'];
  for (const k of envOrder) {
    const v = process.env[k];
    if (v && v.length > 0) return v;
  }
  const dotenv = readDotEnv(join(REPO_ROOT, '.env.local'));
  for (const k of envOrder) {
    const v = dotenv[k];
    if (v && v.length > 0) return v;
  }
  return '';
}

function maybeRelaxTls() {
  if (
    process.env.ALLOW_INSECURE_TLS === '1' ||
    process.env.QA_INSECURE_TLS === '1'
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

async function convexQuery<T>(
  convexUrl: string,
  path: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(`${convexUrl}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  });
  if (!res.ok) {
    throw new Error(`${path} HTTP ${res.status} — ${await res.text()}`);
  }
  const data = (await res.json()) as { status: string; value: T };
  if (data.status !== 'success') {
    throw new Error(`${path} non-success: ${JSON.stringify(data).slice(0, 400)}`);
  }
  return data.value;
}

function findJio(brands: ConvexBrand[]): ConvexBrand | null {
  for (const b of brands) if (b.slug === 'jio-default') return b;
  for (const b of brands) if (b.slug === 'jio') return b;
  for (const b of brands) {
    const n = (b.name ?? '').toLowerCase().trim();
    if (n === 'jio' || n === 'jio default') return b;
  }
  return null;
}

async function main() {
  maybeRelaxTls();
  const url = resolveConvexUrl();
  if (!url) {
    console.error(
      '❌ No Convex URL found. Set CONVEX_URL / STORYBOOK_CONVEX_URL or add it to .env.local.',
    );
    process.exit(1);
  }

  console.log(`→ Fetching brands:list from ${url}`);
  const brands = await convexQuery<ConvexBrand[]>(url, 'brands:list');
  console.log(`→ Got ${brands.length} brand(s)`);

  const jio = findJio(brands);
  if (!jio) {
    console.error(
      '❌ No Jio brand found. Available: ' +
        brands.map((b) => `${b.slug || '(empty)'}/${b.name}`).join(', '),
    );
    process.exit(1);
  }
  console.log(
    `→ Jio = ${jio._id} (slug=${jio.slug}, hue=${jio.primaryHue}, chroma=${jio.primaryChroma})`,
  );

  // Match OneUiBrandScope defaults — light theme, default density, mobile platform.
  // Tests can re-sync with different args later if they need dark/desktop variants.
  console.log('→ Fetching nativeTheme:getNativeThemeSnapshot (light/default/mobile)');
  const themeSnapshot = await convexQuery(url, 'nativeTheme:getNativeThemeSnapshot', {
    brandId: jio._id,
    theme: 'light',
    density: 'default',
    platform: 'mobile',
  });

  console.log('→ Fetching foundations:getBrandOverviewData');
  const brandOverview = await convexQuery(url, 'foundations:getBrandOverviewData', {
    brandId: jio._id,
  });

  mkdirSync(FIXTURE_DIR, { recursive: true });
  writeFileSync(
    join(FIXTURE_DIR, 'theme-snapshot.json'),
    JSON.stringify(themeSnapshot, null, 2),
    'utf8',
  );
  writeFileSync(
    join(FIXTURE_DIR, 'brand-overview.json'),
    JSON.stringify(brandOverview, null, 2),
    'utf8',
  );
  writeFileSync(
    join(FIXTURE_DIR, 'manifest.json'),
    JSON.stringify(
      {
        brandId: jio._id,
        brandSlug: jio.slug,
        brandName: jio.name,
        primaryHue: jio.primaryHue,
        primaryChroma: jio.primaryChroma,
        theme: 'light',
        density: 'default',
        platform: 'mobile',
        convexUrl: url,
        syncedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`✓ Wrote fixtures to ${FIXTURE_DIR}`);
}

main().catch((e) => {
  console.error('❌ sync-jio-theme-snapshot failed:', e);
  process.exit(1);
});
