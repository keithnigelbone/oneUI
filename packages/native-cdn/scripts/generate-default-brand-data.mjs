#!/usr/bin/env node
/**
 * Bakes bundled DEFAULT brand-data into @oneui/native-cdn's package source, so
 * `prefetchBrandData()` has a real fallback for any brand/sub-brand the CDN
 * 404s on (today that's most sub-brands — the CDN currently only serves a
 * handful of variants).
 *
 * Source: apps/native-components-sample/brand-data/**\/latest.json — this is
 * already in the EXACT CDN response shape + path layout
 * (`<brand>/latest.json`, `<brand>/sub-brands/<sub>/latest.json`), so files are
 * copied verbatim, no reshaping.
 *
 * Output: packages/native-cdn/src/defaultBrandData/** (same relative layout).
 * `tsup.config.ts` copies this directory next to the compiled `dist/prefetch.*`
 * on every build, so the published package carries it too.
 *
 * Re-run whenever apps/native-components-sample/brand-data changes:
 *   node scripts/generate-default-brand-data.mjs
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');
const REPO = resolve(PKG, '..', '..');
const SOURCE_ROOT = join(REPO, 'apps', 'native-components-sample', 'brand-data');
const OUT_ROOT = join(PKG, 'src', 'defaultBrandData');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.name === 'latest.json') out.push(abs);
  }
  return out;
}

if (!existsSync(SOURCE_ROOT)) {
  console.error(`[generate-default-brand-data] source not found: ${SOURCE_ROOT}`);
  process.exit(1);
}

// Clean so removed/renamed brands don't linger as stale defaults.
if (existsSync(OUT_ROOT)) rmSync(OUT_ROOT, { recursive: true, force: true });
mkdirSync(OUT_ROOT, { recursive: true });

const files = walk(SOURCE_ROOT);
const manifest = [];
for (const src of files) {
  const rel = relative(SOURCE_ROOT, src); // e.g. "jio/sub-brands/jiomart/latest.json"
  const dest = join(OUT_ROOT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  const text = readFileSync(src, 'utf8');
  // Sanity-check shape matches what prefetch.ts validates (`foundation` for a
  // parent brand, `themeData` for a sub-brand) — skip anything malformed
  // rather than baking bad data silently.
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.warn(`[generate-default-brand-data] skipped (invalid JSON): ${rel}`);
    continue;
  }
  const kind = 'foundation' in parsed ? 'brand' : 'themeData' in parsed ? 'theme' : null;
  if (!kind) {
    console.warn(`[generate-default-brand-data] skipped (no foundation/themeData key): ${rel}`);
    continue;
  }
  writeFileSync(dest, text);
  manifest.push({ path: rel.split('\\').join('/'), kind, bytes: statSync(src).size });
}

writeFileSync(join(OUT_ROOT, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), files: manifest }, null, 2) + '\n');

console.log(`[generate-default-brand-data] baked ${manifest.length} file(s) → ${relative(PKG, OUT_ROOT)}/`);
