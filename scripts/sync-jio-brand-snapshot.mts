/**
 * sync-jio-brand-snapshot.mts
 *
 * Fetches the Jio brand row from the configured Convex deployment via the same
 * HTTP query (`brands:list`) used by the qa-playground:flutter web app, then
 * writes its `primaryHue` / `primaryChroma` into a generated Dart constants
 * file at:
 *
 *   packages/ui_flutter/lib/foundations/jio_brand_snapshot.dart
 *
 * The integration_test and widget-test harnesses read this snapshot so the
 * on-device button renders the same brand colour as the live web app, without
 * requiring network access from the emulator/simulator at test time.
 *
 * Re-run whenever the Jio brand's hue/chroma changes in Convex:
 *   pnpm sync:jio-snapshot
 *
 * Brand matching order (variant-tolerant):
 *   1. slug === 'jio-default'   (canonical kJioAlphaBrandSlug)
 *   2. slug === 'jio'           (common Convex seed)
 *   3. name (case-insensitive) === 'jio' || 'jio default'
 *
 * Reads the Convex URL the same way main.dart does — first
 * `CONVEX_URL`, then `STORYBOOK_CONVEX_URL`, then `NEXT_PUBLIC_CONVEX_URL`,
 * falling back to `.env.local`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

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

async function fetchBrands(convexUrl: string): Promise<ConvexBrand[]> {
  // Some Convex deployments sit behind a corporate proxy whose cert isn't in
  // Node's CA bundle. The Flutter app handles this via
  // `enableInsecureTlsForConvexIfRequested`. Mirror that opt-in here when
  // the user explicitly asks for it via `ALLOW_INSECURE_TLS=1`.
  if (
    process.env.ALLOW_INSECURE_TLS === '1' ||
    process.env.QA_INSECURE_TLS === '1'
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  const res = await fetch(`${convexUrl}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'brands:list', args: {}, format: 'json' }),
  });
  if (!res.ok) {
    throw new Error(`brands:list HTTP ${res.status} — ${await res.text()}`);
  }
  const data = (await res.json()) as { status: string; value: unknown };
  if (data.status !== 'success') {
    throw new Error(`brands:list non-success: ${JSON.stringify(data)}`);
  }
  if (!Array.isArray(data.value)) {
    throw new Error(`brands:list value is not an array`);
  }
  return data.value as ConvexBrand[];
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

function writeSnapshot(jio: ConvexBrand): string {
  const path = join(
    REPO_ROOT,
    'packages/ui_flutter/lib/foundations/jio_brand_snapshot.dart',
  );
  // Dart `const double` requires a double literal — `280` is treated as int.
  // Force a decimal suffix so the generated file always compiles.
  const fmt = (n: number): string =>
    Number.isInteger(n) ? `${n}.0` : `${n}`;
  const hue = fmt(jio.primaryHue ?? 17);
  const chroma = fmt(jio.primaryChroma ?? 0.18);
  const generatedAt = new Date().toISOString();
  const contents = `// GENERATED FILE — do not edit by hand.
// Regenerate with:  pnpm sync:jio-snapshot
//
// Snapshots the Jio brand's primaryHue / primaryChroma from the configured
// Convex deployment so the integration_test + widget-test harnesses can
// render the same colour as the qa-playground:flutter web app without
// requiring network access from the emulator/simulator at test time.
//
// Source: brands:list (Convex HTTP)
// Brand:  ${jio.name} (slug=${jio.slug}, _id=${jio._id})
// Synced: ${generatedAt}
library;

/// Jio brand primary hue in degrees (0-360), mirrored from Convex.
const double kJioBrandSnapshotPrimaryHue = ${hue};

/// Jio brand primary chroma (0-0.4), mirrored from Convex.
const double kJioBrandSnapshotPrimaryChroma = ${chroma};
`;
  writeFileSync(path, contents, 'utf8');
  return path;
}

async function main() {
  const url = resolveConvexUrl();
  if (!url) {
    console.error(
      '❌ No Convex URL found. Set CONVEX_URL / STORYBOOK_CONVEX_URL or add it to .env.local.',
    );
    process.exit(1);
  }
  console.log(`→ Fetching brands:list from ${url}`);
  const brands = await fetchBrands(url);
  console.log(`→ Got ${brands.length} brand(s)`);
  const jio = findJio(brands);
  if (!jio) {
    console.error(
      '❌ No Jio brand found. Available slugs: ' +
        brands.map((b) => `${b.slug || '(empty)'}/${b.name}`).join(', '),
    );
    process.exit(1);
  }
  if (jio.primaryHue == null || jio.primaryChroma == null) {
    console.error(
      `❌ Jio brand ${jio._id} (${jio.name}) is missing primaryHue or primaryChroma.`,
    );
    process.exit(1);
  }
  const path = writeSnapshot(jio);
  console.log(
    `✓ Wrote ${path}\n   hue=${jio.primaryHue}, chroma=${jio.primaryChroma}, ` +
      `slug=${jio.slug}, name=${jio.name}`,
  );
}

main().catch((e) => {
  console.error('❌ sync-jio-brand-snapshot failed:', e);
  process.exit(1);
});
