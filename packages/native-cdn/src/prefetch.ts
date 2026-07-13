/**
 * Build-time brand-data prefetch for @oneui/native-cdn — the React Native
 * counterpart of `@oneui/vite-plugin`'s `syncCache`.
 *
 * Metro has no virtual-module / `load()` hook, so (unlike Vite) it can't read a
 * cache folder and synthesise modules from it at build time. The cached JSON
 * only reaches the device if it's a REAL file Metro can statically import.
 * So this step does two things:
 *
 *   1. Fetch each brand's `latest.json` from the CDN and write it into
 *      `.oneui-cached/brand-data/<brand>/…` (mirrors the CDN path layout).
 *   2. Generate a real `.ts` manifest that statically imports those JSON files
 *      and exposes `getCdnBrandData(brand, variant)` — Metro bundles it, the
 *      app imports it, zero runtime network needed for first paint.
 *
 * Run it before the bundler, e.g. in package.json:
 *
 *   "dev": "oneui-native-cdn prefetch && expo start"
 *
 * Config (default `oneui.brands.json`, same shape as the web plugin):
 *
 *   {
 *     "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS/ReactNative",
 *     "brands": {
 *       "jio":  { "subBrands": ["jiomart"] },
 *       "tira": "latest"
 *     }
 *   }
 *
 * Sync policy mirrors the web plugin: force-fetch each build; on 5xx / network
 * error the existing cache file is reused (with a warning); `offline: true`
 * skips the network entirely. The prefetch NEVER throws on a fetch failure — a
 * transient outage must not break `expo start`.
 *
 * On a 404 (most sub-brands aren't published to the CDN yet), the stale cache
 * file is deleted and the prefetch falls back to a bundled DEFAULT snapshot
 * baked into this package at `src/defaultBrandData/` (generated from
 * `apps/native-components-sample/brand-data` via
 * `scripts/generate-default-brand-data.mjs` — re-run that script whenever the
 * sample data changes). Only if neither the CDN nor a bundled default has the
 * brand/sub-brand is it actually skipped. This means every `oneui.brands.json`
 * entry resolves to SOME real theme data, not a silent fall-through to plain
 * Jio inside `OneUIBrandProvider`.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBrandUrl } from './urls';

// ─── Bundled default brand-data (fallback for CDN 404s) ─────────────────────

// Resolves next to THIS module's own file — works identically in dev
// (src/prefetch.ts ↔ src/defaultBrandData) and the published package
// (dist/prefetch.cjs|mjs ↔ dist/defaultBrandData), since tsup.config.ts copies
// src/defaultBrandData → dist/defaultBrandData on every build.
// `typeof __dirname` is a safe check even in real ESM: `typeof` never throws
// on an undeclared identifier, it just reports `'undefined'`.
declare const __dirname: string | undefined;
const CURRENT_DIR =
  typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url));
const DEFAULT_BRAND_DATA_DIR = join(CURRENT_DIR, 'defaultBrandData');

/** Read the bundled default JSON text for a brand (or brand+sub-brand), if baked. */
function readDefaultBrandData(brand: string, sub?: string): string | null {
  const file = sub
    ? join(DEFAULT_BRAND_DATA_DIR, brand, 'sub-brands', sub, 'latest.json')
    : join(DEFAULT_BRAND_DATA_DIR, brand, 'latest.json');
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

/** Per-brand entry in `oneui.brands.json` — string version or object with sub-brands. */
export type BrandConfigEntry = string | { version?: string; subBrands?: string[] };

export interface PrefetchLogger {
  info(message: string): void;
  warn(message: string): void;
}

export interface PrefetchOptions {
  /** CDN base up to (not including) `brand-data`. Falls back to env `ONEUI_CDN_URL` then config file. */
  cdnUrl?: string;
  /** Brand slug → version or `{ version, subBrands }`. Falls back to config file. */
  brands?: Record<string, BrandConfigEntry>;
  /** Brand config file, relative to `projectRoot`. Default `oneui.brands.json`. */
  configFile?: string;
  /** Project root. Default `process.cwd()`. */
  projectRoot?: string;
  /**
   * Cache directory. Default: `node_modules/.oneui-cached` (relative to `projectRoot`).
   * Brand JSON files land in `<cacheDir>/brand-data/` and the manifest at
   * `<cacheDir>/index.js`, making it importable as `'.oneui-cached'` by Metro.
   */
  cacheDir?: string;
  /** Generated manifest path, relative to `projectRoot`. Default `<cacheDir>/index.js`. */
  manifestFile?: string;
  /** Skip the network; use whatever is already cached. Default `false`. */
  offline?: boolean;
  /**
   * Auto-inject `import '.oneui-cached';` into the app entry file so Metro
   * statically includes the cache in the bundle without any manual edits.
   * Default `true`. Pass `false` (or `--no-inject` on the CLI) to skip.
   */
  inject?: boolean;
  /**
   * Path to the app entry file to inject into, relative to `projectRoot`.
   * When omitted the CLI auto-detects in priority order:
   *   app/_layout.tsx|ts|jsx|js → App.tsx|ts|jsx|js → index.tsx|ts|jsx|js
   */
  entryFile?: string;
  /** Defaults to `console`. */
  logger?: PrefetchLogger;
}

export interface PrefetchVariantResult {
  brand: string;
  variant: string;
  /** `true` when a JSON file is present on disk after this run. */
  ok: boolean;
  bytes: number;
}

export interface PrefetchResult {
  variants: PrefetchVariantResult[];
  cacheDir: string;
  manifestFile: string;
  /** Absolute path to the entry file that was injected, or `null` if injection was skipped/not found. */
  injectedEntry: string | null;
}

interface ResolvedEntry {
  version: string;
  subBrands: string[];
}

interface ResolvedOptions {
  cdnUrl: string;
  brands: Record<string, ResolvedEntry>;
  cacheDir: string;
  manifestFile: string;
  offline: boolean;
  inject: boolean;
  projectRoot: string;
  entryFile: string | undefined;
  logger: PrefetchLogger;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function readJSON<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function normalizeEntry(raw: BrandConfigEntry): ResolvedEntry {
  if (typeof raw === 'string') return { version: raw || 'latest', subBrands: [] };
  return {
    version: raw.version ?? 'latest',
    subBrands: Array.isArray(raw.subBrands) ? [...raw.subBrands] : [],
  };
}

function resolveOptions(opts: PrefetchOptions): ResolvedOptions {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const configPath = resolve(projectRoot, opts.configFile ?? 'oneui.brands.json');
  const fileCfg = readJSON<{ cdnUrl?: string; brands?: Record<string, BrandConfigEntry> }>(
    configPath
  );

  const cdnUrl = opts.cdnUrl ?? process.env.ONEUI_CDN_URL ?? fileCfg?.cdnUrl ?? '';
  if (!cdnUrl) {
    throw new Error(
      `[@oneui/native-cdn] cdnUrl not set. Pass it inline, set ONEUI_CDN_URL, or add it to ${configPath}.`
    );
  }

  const rawBrands = opts.brands ?? fileCfg?.brands ?? {};
  if (Object.keys(rawBrands).length === 0) {
    throw new Error(
      `[@oneui/native-cdn] no brands configured. Pass { brands } or list them in ${configPath}.`
    );
  }

  const brands: Record<string, ResolvedEntry> = {};
  for (const [slug, entry] of Object.entries(rawBrands)) brands[slug] = normalizeEntry(entry);

  const cacheDir = opts.cacheDir
    ? resolve(projectRoot, opts.cacheDir)
    : resolve(projectRoot, 'node_modules', '.oneui-cached');
  return {
    cdnUrl,
    brands,
    cacheDir,
    manifestFile: resolve(projectRoot, opts.manifestFile ?? join(cacheDir, 'index.js')),
    offline: opts.offline ?? false,
    inject: opts.inject ?? true,
    projectRoot,
    entryFile: opts.entryFile,
    logger: opts.logger ?? console,
  };
}

// ─── Local cache paths (mirror the CDN layout) ───────────────────────────────

function brandDataRoot(cacheDir: string): string {
  return join(cacheDir, 'brand-data');
}
function brandJsonPath(cacheDir: string, brand: string): string {
  return join(brandDataRoot(cacheDir), brand, 'latest.json');
}
function subBrandJsonPath(cacheDir: string, brand: string, sub: string): string {
  return join(brandDataRoot(cacheDir), brand, 'sub-brands', sub, 'latest.json');
}

/**
 * Write a minimal `package.json` inside `cacheDir` so that Metro (and any
 * Node-compliant resolver) treats `.oneui-cached` as a valid importable package.
 * Always overwritten so the `main` field stays correct after a re-prefetch.
 */
function writePackageJson(cacheDir: string): void {
  ensureDir(cacheDir);
  const pkg = {
    name: '.oneui-cached',
    version: '0.0.0',
    private: true,
    main: './index.js',
    types: './index.d.ts',
    'react-native': './index.js',
  };
  writeFileSync(join(cacheDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  // Generate a TypeScript declaration so `import '.oneui-cached'` type-checks
  // cleanly in the consumer's project (no TS "cannot find module" error).
  const dts = [
    '/** AUTO-GENERATED by `oneui-native-cdn prefetch` — do not edit. */',
    '',
    '/** Brand + component data snapshot for a single brand slug. */',
    'export declare const CDN_BRAND_DATA: Record<string, unknown>;',
    '',
    '/** Sub-brand accent theme deltas keyed by "brand::variant". */',
    'export declare const CDN_THEME_DATA: Record<string, unknown>;',
    '',
    '/** All prefetched (brand, variant) pairs. variant is "base" for the parent brand. */',
    'export declare const CDN_BRANDS: Array<{ brand: string; variant: string }>;',
    '',
    'export declare function getCdnBrandData(brand: string): unknown | undefined;',
    'export declare function getCdnThemeData(brand: string, variant?: string): unknown | undefined;',
    '',
  ].join('\n');
  writeFileSync(join(cacheDir, 'index.d.ts'), dts);
}

/** Drop brand / sub-brand folders no longer present in the config. */
function pruneOrphans(r: ResolvedOptions): void {
  const root = brandDataRoot(r.cacheDir);
  if (!existsSync(root)) return;
  const wanted = new Set(Object.keys(r.brands));
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!wanted.has(entry.name)) {
      try {
        rmSync(join(root, entry.name), { recursive: true, force: true });
        r.logger.info(`  ✗ pruned ${entry.name} (not in config)`);
      } catch {
        /* best effort */
      }
      continue;
    }
    const subRoot = join(root, entry.name, 'sub-brands');
    if (!existsSync(subRoot)) continue;
    const wantedSubs = new Set(r.brands[entry.name].subBrands);
    for (const subEntry of readdirSync(subRoot, { withFileTypes: true })) {
      if (!subEntry.isDirectory() || wantedSubs.has(subEntry.name)) continue;
      try {
        rmSync(join(subRoot, subEntry.name), { recursive: true, force: true });
        r.logger.info(`  ✗ pruned ${entry.name}/${subEntry.name} (not in config)`);
      } catch {
        /* best effort */
      }
    }
  }
}

// ─── Fetch one JSON, with cache fallback ─────────────────────────────────────

/** Parent files carry `foundation`; sub-brand files carry `themeData`. */
function hasKey(text: string, key: 'foundation' | 'themeData'): boolean {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null && key in parsed;
  } catch {
    return false;
  }
}

/**
 * Returns the JSON text to persist, or `null` when unavailable. Never throws.
 * 404 → delete stale cache + skip; 5xx / network / invalid → reuse cache if any.
 */
async function fetchJsonText(
  url: string,
  cacheFile: string,
  expectKey: 'foundation' | 'themeData',
  r: ResolvedOptions
): Promise<string | null> {
  if (r.offline) {
    if (existsSync(cacheFile)) return readFileSync(cacheFile, 'utf8');
    r.logger.warn(`[@oneui/native-cdn] offline: no cache for ${url}`);
    return null;
  }

  try {
    const res = await fetch(url);
    if (res.status === 404) {
      if (existsSync(cacheFile)) rmSync(cacheFile, { force: true });
      r.logger.warn(`[@oneui/native-cdn] ${url} → 404 (absent on CDN); skipped`);
      return null;
    }
    if (!res.ok) {
      r.logger.warn(
        `[@oneui/native-cdn] ${url} → HTTP ${res.status}; ${existsSync(cacheFile) ? 'using cache' : 'skipped'}`
      );
    } else {
      const text = await res.text();
      if (hasKey(text, expectKey)) return text;
      r.logger.warn(
        `[@oneui/native-cdn] ${url} missing "${expectKey}"; ${existsSync(cacheFile) ? 'using cache' : 'skipped'}`
      );
    }
  } catch (e) {
    r.logger.warn(
      `[@oneui/native-cdn] ${url} fetch failed: ${(e as Error).message}; ${existsSync(cacheFile) ? 'using cache' : 'skipped'}`
    );
  }

  return existsSync(cacheFile) ? readFileSync(cacheFile, 'utf8') : null;
}

// ─── Manifest generation ─────────────────────────────────────────────────────

function importIdentifier(brand: string, variant: string): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_');
  return `brand_${safe(brand)}_${safe(variant)}`;
}

interface PresentEntry {
  brand: string;
  variant: string;
  /** `'brand'` = parent ({ foundation, components }); `'theme'` = sub-brand ({ themeData }). */
  kind: 'brand' | 'theme';
  file: string;
}

function generateManifest(r: ResolvedOptions, present: PresentEntry[]): void {
  const dir = dirname(r.manifestFile);
  // Plain CJS JavaScript — no TypeScript syntax so Metro processes it without a TS transformer.
  const requireLine = (importName: string, file: string): string => {
    const rel = relative(dir, file).split(sep).join('/');
    return `const ${importName} = require('${rel.startsWith('.') ? rel : `./${rel}`}');`;
  };

  const rows = [...present]
    .sort((a, b) => `${a.brand}::${a.variant}`.localeCompare(`${b.brand}::${b.variant}`))
    .map((e) => ({ ...e, importName: importIdentifier(e.brand, e.variant) }));

  const parents = rows.filter((e) => e.kind === 'brand');
  const subs = rows.filter((e) => e.kind === 'theme');

  const lines = [
    '/** AUTO-GENERATED by `oneui-native-cdn prefetch` — do not edit. */',
    '/**',
    ' * Add this single import in your app entry file (App.tsx or _layout.tsx):',
    " *   import '.oneui-cached';",
    ' * Metro detects it statically and registers all prefetched brand data with',
    ' * OneUIBrandProvider — no metro.config.js changes required.',
    ' */',
    '',
    '// Parent-brand snapshots — { foundation, components }',
    ...parents.map((e) => requireLine(e.importName, e.file)),
    ...(subs.length ? ['', '// Sub-brand accent deltas — { themeData }'] : []),
    ...subs.map((e) => requireLine(e.importName, e.file)),
    '',
    '/** Parent-brand data keyed by brand slug. */',
    'const CDN_BRAND_DATA = {',
    ...parents.map((e) => `  '${e.brand}': ${e.importName},`),
    '};',
    '',
    '/** Sub-brand accent deltas keyed by "brand::variant". */',
    'const CDN_THEME_DATA = {',
    ...subs.map((e) => `  '${e.brand}::${e.variant}': ${e.importName},`),
    '};',
    '',
    '/** Every prefetched (brand, variant) pair. variant is "base" for the parent. */',
    'const CDN_BRANDS = [',
    ...rows
      .filter((e) => e.kind === 'brand')
      .map((e) => `  { brand: '${e.brand}', variant: 'base' },`),
    ...subs.map((e) => `  { brand: '${e.brand}', variant: '${e.variant}' },`),
    '];',
    '',
    '// Register all brand/theme data with @oneui/ui-native at import time.',
    '// This runs synchronously when the consumer imports this file, so',
    '// OneUIBrandProvider can resolve brand slugs before the first render.',
    "const { registerBrandCache } = require('@oneui/ui-native');",
    'registerBrandCache(CDN_BRAND_DATA, CDN_THEME_DATA);',
    '',
    'function getCdnBrandData(brand) { return CDN_BRAND_DATA[brand]; }',
    '',
    'function getCdnThemeData(brand, variant) {',
    "  variant = variant || 'base';",
    "  if (variant === 'base') return undefined;",
    "  return CDN_THEME_DATA[brand + '::' + variant];",
    '}',
    '',
    'module.exports = { CDN_BRAND_DATA, CDN_THEME_DATA, CDN_BRANDS, getCdnBrandData, getCdnThemeData };',
    '',
  ];

  ensureDir(dir);
  writeFileSync(r.manifestFile, lines.join('\n'));
}

// ─── Entry-file injection ─────────────────────────────────────────────────────

/**
 * In priority order, return the absolute path of the first likely app-entry
 * file found under `projectRoot`, or `null` if none can be found.
 *
 * Priority:
 *   1. Expo Router root layout: app/_layout.{tsx,ts,jsx,js}
 *   2. Plain Expo / React Native: App.{tsx,ts,jsx,js}
 *   3. Generic index:             index.{tsx,ts,jsx,js}
 *   4. Explicit override (honoured first when passed)
 */
function detectEntryFile(projectRoot: string, explicit?: string): string | null {
  if (explicit) {
    const abs = resolve(projectRoot, explicit);
    return existsSync(abs) ? abs : null;
  }
  const candidates = [
    // Expo Router — preferred
    join('app', '_layout.tsx'),
    join('app', '_layout.ts'),
    join('app', '_layout.jsx'),
    join('app', '_layout.js'),
    join('src', 'app', '_layout.tsx'),
    join('src', 'app', '_layout.ts'),
    // Plain Expo / RN
    'App.tsx',
    'App.ts',
    'App.jsx',
    'App.js',
    join('src', 'App.tsx'),
    join('src', 'App.ts'),
    // Generic
    'index.tsx',
    'index.ts',
    'index.jsx',
    'index.js',
  ];
  for (const c of candidates) {
    const abs = join(projectRoot, c);
    if (existsSync(abs)) return abs;
  }
  return null;
}

const INJECT_MARKER = "import '.oneui-cached'";
const INJECT_LINE = `// Managed by oneui-native-cdn prefetch — do not remove.\nimport '.oneui-cached';\n`;

/**
 * Prepend `import '.oneui-cached';` to `entryPath` if not already present.
 * Idempotent: safe to call on every prefetch run.
 * Preserves any leading shebang, `'use client'`, or `'use strict'` directive.
 */
function injectCachedImport(entryPath: string): void {
  const src = readFileSync(entryPath, 'utf8');

  // Already injected — nothing to do.
  if (src.includes(INJECT_MARKER)) return;

  // Detect a leading directive or shebang that must stay first.
  let insertAt = 0;
  const shebangMatch = /^#![^\n]*\n/.exec(src);
  if (shebangMatch) insertAt = shebangMatch[0].length;
  // 'use client' / 'use strict' / 'use server'
  const directiveMatch = /^(['"]use [a-z]+['"];?\n?)/.exec(src.slice(insertAt));
  if (directiveMatch) insertAt += directiveMatch[0].length;

  const updated = src.slice(0, insertAt) + INJECT_LINE + src.slice(insertAt);
  writeFileSync(entryPath, updated, 'utf8');
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function prefetchBrandData(opts: PrefetchOptions = {}): Promise<PrefetchResult> {
  const r = resolveOptions(opts);
  ensureDir(brandDataRoot(r.cacheDir));
  writePackageJson(r.cacheDir);
  pruneOrphans(r);

  r.logger.info(
    `[@oneui/native-cdn] prefetching brand-data → ${relative(process.cwd(), r.cacheDir) || r.cacheDir}${r.offline ? ' (offline)' : ''}`
  );

  const variants: PrefetchVariantResult[] = [];
  const present: PresentEntry[] = [];

  for (const [brand, entry] of Object.entries(r.brands)) {
    // Parent brand — { foundation, components }
    const parentFile = brandJsonPath(r.cacheDir, brand);
    let parentText = await fetchJsonText(
      resolveBrandUrl(r.cdnUrl, brand, undefined, entry.version),
      parentFile,
      'foundation',
      r
    );
    let parentIsDefault = false;
    if (!parentText) {
      parentText = readDefaultBrandData(brand);
      parentIsDefault = !!parentText;
    }
    if (parentText) {
      ensureDir(dirname(parentFile));
      writeFileSync(parentFile, parentText);
      present.push({ brand, variant: 'base', kind: 'brand', file: parentFile });
    }
    variants.push({
      brand,
      variant: 'base',
      ok: !!parentText,
      bytes: parentText ? Buffer.byteLength(parentText) : 0,
    });
    r.logger.info(
      `  ${parentText ? (parentIsDefault ? '↩' : '✓') : '✗'} ${brand}/latest.json${parentIsDefault ? ' (bundled default — CDN unavailable)' : ''}`
    );

    // Sub-brands — { themeData }
    for (const sub of entry.subBrands) {
      const subFile = subBrandJsonPath(r.cacheDir, brand, sub);
      let subText = await fetchJsonText(
        resolveBrandUrl(r.cdnUrl, brand, sub, entry.version),
        subFile,
        'themeData',
        r
      );
      let subIsDefault = false;
      if (!subText) {
        subText = readDefaultBrandData(brand, sub);
        subIsDefault = !!subText;
      }
      if (subText) {
        ensureDir(dirname(subFile));
        writeFileSync(subFile, subText);
        present.push({ brand, variant: sub, kind: 'theme', file: subFile });
      }
      variants.push({
        brand,
        variant: sub,
        ok: !!subText,
        bytes: subText ? Buffer.byteLength(subText) : 0,
      });
      r.logger.info(
        `    ${subText ? (subIsDefault ? '↩' : '✓') : '✗'} ${brand}/sub-brands/${sub}/latest.json${subIsDefault ? ' (bundled default — CDN unavailable)' : ''}`
      );
    }
  }

  generateManifest(r, present);

  const ok = variants.filter((v) => v.ok).length;
  r.logger.info(
    `[@oneui/native-cdn] ${ok}/${variants.length} variant(s) ready → manifest ${relative(process.cwd(), r.manifestFile) || r.manifestFile}`
  );

  // ── Auto-inject the import into the app entry file ──────────────────────
  let injectedEntry: string | null = null;
  if (r.inject && ok > 0) {
    const entry = detectEntryFile(r.projectRoot, r.entryFile);
    if (entry) {
      injectCachedImport(entry);
      injectedEntry = entry;
      r.logger.info(
        `[@oneui/native-cdn] ✓ wired import into ${relative(r.projectRoot, entry) || entry}`,
      );
    } else {
      r.logger.info(
        `[@oneui/native-cdn] Could not detect an app entry file. Add  import '.oneui-cached';  manually to your App.tsx / app/_layout.tsx to enable brand resolution.`,
      );
    }
  } else if (!r.inject) {
    r.logger.info(
      `[@oneui/native-cdn] Auto-inject skipped (--no-inject). Add  import '.oneui-cached';  manually to your app entry to enable brand resolution.`,
    );
  }

  return { variants, cacheDir: r.cacheDir, manifestFile: r.manifestFile, injectedEntry };
}
