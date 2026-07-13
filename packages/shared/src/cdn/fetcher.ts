/**
 * CDN fetcher — fetches the new v2 layout (brand.json + brand.css per version),
 * then splits the combined `brand.json` back into the legacy per-sidecar files
 * on disk. Sync policy: always fetch, fall back to cache on network/HTTP/parse
 * failure, treat 404 as "intentionally absent" (clears cache + uses defaults).
 *
 * New CDN URL shape:
 *
 *   <cdnUrl>/brands/<slug>/index.json
 *   <cdnUrl>/brands/<slug>/<version>/brand.json
 *   <cdnUrl>/brands/<slug>/<version>/brand.css
 *   <cdnUrl>/brands/<slug>/latest.{json,css}                  (version === 'latest')
 *   <cdnUrl>/brands/<slug>/themes/<sub>/<version>/brand.{json,css}
 *   <cdnUrl>/brands/<slug>/themes/<sub>/latest.{json,css}  (version === 'latest')
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  brandingPath,
  cssPath,
  decorationsPath,
  fontsPath,
  materialsPath,
  themeCssPath,
  themeThemeConfigPath,
  themeConfigPath,
} from './paths';
import type {
  Branding,
  BrandJsonV2,
  CdnLogger,
  ResolvedOptions,
  ThemeJsonV2,
} from './types';

const TAG = '[@oneui/cdn]';

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

interface FetchSpec<T> {
  url: string;
  /** When set, a 404 on `url` retries this legacy CDN path (e.g. subBrands/). */
  legacyUrl?: string;
  cacheFile: string;
  parse: (text: string) => T;
  defaultValue: T;
  label: string;
}

/**
 * Fetch one artefact from the CDN, write to cache on success, fall back to
 * the existing cache file on network/HTTP/parse failure. 404 is treated as
 * "intentionally absent" — defaults are returned and the cached copy is
 * wiped so consumers don't see stale content.
 */
async function fetchOrFallback<T>(
  spec: FetchSpec<T>,
  opts: ResolvedOptions,
  logger?: CdnLogger,
): Promise<T> {
  if (opts.offline) {
    if (existsSync(spec.cacheFile)) {
      try {
        return spec.parse(readFileSync(spec.cacheFile, 'utf8'));
      } catch {
        /* fall through */
      }
    }
    return spec.defaultValue;
  }

  try {
    const res = spec.legacyUrl
      ? await fetchThemeAssetWithLegacyFallback(spec.url, spec.legacyUrl)
      : await fetch(spec.url);
    if (res.status === 404) {
      try {
        rmSync(spec.cacheFile, { force: true });
      } catch {
        /* best effort */
      }
      return spec.defaultValue;
    }
    if (!res.ok) {
      logger?.warn(
        `${TAG} ${spec.url} → HTTP ${res.status}; falling back to ${
          existsSync(spec.cacheFile) ? 'cache' : 'default'
        } for ${spec.label}.`,
      );
    } else {
      const body = await res.text();
      try {
        const parsed = spec.parse(body);
        ensureDir(dirname(spec.cacheFile));
        writeFileSync(spec.cacheFile, body);
        return parsed;
      } catch (e) {
        logger?.warn(
          `${TAG} ${spec.label} parse error: ${(e as Error).message}; falling back to ${
            existsSync(spec.cacheFile) ? 'cache' : 'default'
          }.`,
        );
      }
    }
  } catch (e) {
    logger?.warn(
      `${TAG} ${spec.label} fetch failed for ${spec.url}: ${(e as Error).message}; falling back to ${
        existsSync(spec.cacheFile) ? 'cache' : 'default'
      }.`,
    );
  }

  if (existsSync(spec.cacheFile)) {
    try {
      return spec.parse(readFileSync(spec.cacheFile, 'utf8'));
    } catch {
      /* fall through */
    }
  }
  return spec.defaultValue;
}

// ─── URL builders ───────────────────────────────────────────────────────────

function brandJsonUrl(opts: ResolvedOptions, slug: string, version: string): string {
  return version === 'latest'
    ? `${opts.cdnUrl}/brands/${slug}/latest.json`
    : `${opts.cdnUrl}/brands/${slug}/${version}/brand.json`;
}

function brandCssUrl(opts: ResolvedOptions, slug: string, version: string): string {
  return version === 'latest'
    ? `${opts.cdnUrl}/brands/${slug}/latest.css`
    : `${opts.cdnUrl}/brands/${slug}/${version}/brand.css`;
}

function themeJsonUrl(
  opts: ResolvedOptions,
  parent: string,
  sub: string,
  version: string,
  layout: 'themes' | 'subBrands' = 'themes',
): string {
  const base = `${opts.cdnUrl}/brands/${parent}/${layout}/${sub}`;
  return version === 'latest'
    ? `${base}/latest.json`
    : `${base}/${version}/brand.json`;
}

function themeCssUrl(
  opts: ResolvedOptions,
  parent: string,
  sub: string,
  version: string,
  layout: 'themes' | 'subBrands' = 'themes',
): string {
  const base = `${opts.cdnUrl}/brands/${parent}/${layout}/${sub}`;
  return version === 'latest'
    ? `${base}/latest.css`
    : `${base}/${version}/brand.css`;
}

/** Fetch with themes/ path first, then legacy subBrands/ on 404. */
async function fetchThemeAssetWithLegacyFallback(
  primaryUrl: string,
  legacyUrl: string,
): Promise<Response> {
  const primary = await fetch(primaryUrl);
  if (primary.status !== 404 || primaryUrl === legacyUrl) return primary;
  return fetch(legacyUrl);
}

// ─── Parsers ────────────────────────────────────────────────────────────────

const identity = (s: string): string => s;

function parseBrandJson(s: string): BrandJsonV2 {
  const raw = JSON.parse(s) as Partial<BrandJsonV2>;
  return {
    schemaVersion: 2,
    version: typeof raw.version === 'string' ? raw.version : '',
    branding: parseBrandingObject(raw.branding),
    decorations: Array.isArray(raw.decorations) ? raw.decorations : [],
    themeConfig: raw.themeConfig ?? null,
    materials: raw.materials ?? null,
    fonts: raw.fonts ?? null,
  };
}

function parseThemeJson(s: string): ThemeJsonV2 {
  const raw = JSON.parse(s) as Partial<ThemeJsonV2>;
  return {
    schemaVersion: 2,
    version: typeof raw.version === 'string' ? raw.version : '',
    themeConfig: raw.themeConfig ?? null,
  };
}

function parseBrandingObject(raw: unknown): Branding {
  const r = (raw ?? {}) as Partial<Branding>;
  return {
    brandName: typeof r.brandName === 'string' ? r.brandName : '',
    logoSvg: r.logoSvg ?? null,
  };
}

// ─── On-disk split ──────────────────────────────────────────────────────────

/**
 * Split a fetched BrandJsonV2 into the legacy per-sidecar files on disk so
 * BrandProvider / virtual-module codegen don't need to change.
 */
function writeBrandSidecars(
  cacheDir: string,
  slug: string,
  data: BrandJsonV2,
): void {
  const safeBranding: Branding =
    data.branding.brandName.length > 0
      ? data.branding
      : { ...data.branding, brandName: slug };

  writeFileSync(brandingPath(cacheDir, slug), `${JSON.stringify(safeBranding, null, 2)}\n`);
  writeFileSync(decorationsPath(cacheDir, slug), `${JSON.stringify(data.decorations, null, 2)}\n`);
  writeFileSync(themeConfigPath(cacheDir, slug), `${JSON.stringify(data.themeConfig, null, 2)}\n`);
  writeFileSync(materialsPath(cacheDir, slug), `${JSON.stringify(data.materials, null, 2)}\n`);

  // fonts: present-or-absent semantics — remove the file if null to match the
  // legacy "404 → delete cache" behaviour of fetchOrFallback.
  if (data.fonts === null) {
    try {
      rmSync(fontsPath(cacheDir, slug), { force: true });
    } catch {
      /* best effort */
    }
  } else {
    writeFileSync(fontsPath(cacheDir, slug), `${JSON.stringify(data.fonts, null, 2)}\n`);
  }
}

function writeThemeSidecars(
  cacheDir: string,
  parent: string,
  sub: string,
  data: ThemeJsonV2,
): void {
  writeFileSync(
    themeThemeConfigPath(cacheDir, parent, sub),
    `${JSON.stringify(data.themeConfig, null, 2)}\n`,
  );
}

// ─── Public API ─────────────────────────────────────────────────────────────

const DEFAULT_BRAND_JSON: BrandJsonV2 = {
  schemaVersion: 2,
  version: '',
  branding: { brandName: '', logoSvg: null },
  decorations: [],
  themeConfig: null,
  materials: null,
  fonts: null,
};

const DEFAULT_SUB_BRAND_JSON: ThemeJsonV2 = {
  schemaVersion: 2,
  version: '',
  themeConfig: null,
};

/**
 * Fetch parent brand: 1 JSON + 1 CSS request. Splits the JSON back into the
 * legacy 5-file on-disk shape. Returns the in-memory payload for callers that
 * want to seed something (manifest hash, log line).
 */
export async function fetchBrandAssets(
  slug: string,
  version: string,
  opts: ResolvedOptions,
  logger?: CdnLogger,
): Promise<{ css: string; data: BrandJsonV2 }> {
  logger?.info(`${TAG}   ↓ ${slug}@${version}`);

  // brand.json goes through a non-cacheFile path (we split it ourselves
  // below), so use a fake cacheFile that doesn't conflict with real files.
  // The combined JSON itself isn't kept on disk — only the split sidecars are,
  // so BrandProvider / virtual-module codegen stay byte-identical.
  const [css, data] = await Promise.all([
    fetchOrFallback<string>(
      {
        url: brandCssUrl(opts, slug, version),
        cacheFile: cssPath(opts.cacheDir, slug),
        parse: identity,
        defaultValue: '',
        label: `${slug} css`,
      },
      opts,
      logger,
    ),
    fetchBrandJsonOnly(slug, version, opts, logger),
  ]);

  writeBrandSidecars(opts.cacheDir, slug, data);
  return { css, data };
}

async function fetchBrandJsonOnly(
  slug: string,
  version: string,
  opts: ResolvedOptions,
  logger?: CdnLogger,
): Promise<BrandJsonV2> {
  // We don't persist brand.json on disk — the split files are the cache.
  // To still benefit from cache-fallback on network failure, we read the
  // existing split files back into a BrandJsonV2 when fetch fails.
  if (opts.offline) {
    return readSidecarsFromDisk(opts.cacheDir, slug);
  }

  const url = brandJsonUrl(opts, slug, version);
  try {
    const res = await fetch(url);
    if (res.status === 404) {
      // Treat 404 as "intentionally absent" — clear sidecars + use defaults.
      // Mirrors the legacy per-file 404 behaviour.
      clearBrandSidecars(opts.cacheDir, slug);
      return { ...DEFAULT_BRAND_JSON, branding: { brandName: slug, logoSvg: null } };
    }
    if (!res.ok) {
      logger?.warn(`${TAG} ${url} → HTTP ${res.status}; falling back to cached sidecars.`);
      return readSidecarsFromDisk(opts.cacheDir, slug);
    }
    const body = await res.text();
    try {
      return parseBrandJson(body);
    } catch (e) {
      logger?.warn(
        `${TAG} ${slug} brand.json parse error: ${(e as Error).message}; falling back to cached sidecars.`,
      );
      return readSidecarsFromDisk(opts.cacheDir, slug);
    }
  } catch (e) {
    logger?.warn(
      `${TAG} ${slug} brand.json fetch failed for ${url}: ${(e as Error).message}; falling back to cached sidecars.`,
    );
    return readSidecarsFromDisk(opts.cacheDir, slug);
  }
}

/** Reconstruct a BrandJsonV2 from the on-disk sidecars (fallback path). */
function readSidecarsFromDisk(cacheDir: string, slug: string): BrandJsonV2 {
  const readFile = <T>(file: string, parse: (s: string) => T, fallback: T): T => {
    if (!existsSync(file)) return fallback;
    try {
      return parse(readFileSync(file, 'utf8'));
    } catch {
      return fallback;
    }
  };
  return {
    schemaVersion: 2,
    version: '',
    branding: readFile<Branding>(
      brandingPath(cacheDir, slug),
      (s) => parseBrandingObject(JSON.parse(s)),
      { brandName: slug, logoSvg: null },
    ),
    decorations: readFile<unknown[]>(
      decorationsPath(cacheDir, slug),
      (s) => {
        const v: unknown = JSON.parse(s);
        return Array.isArray(v) ? v : [];
      },
      [],
    ),
    themeConfig: readFile<unknown | null>(
      themeConfigPath(cacheDir, slug),
      (s) => JSON.parse(s) as unknown,
      null,
    ),
    materials: readFile<unknown | null>(
      materialsPath(cacheDir, slug),
      (s) => JSON.parse(s) as unknown,
      null,
    ),
    fonts: readFile<unknown | null>(
      fontsPath(cacheDir, slug),
      (s) => JSON.parse(s) as unknown,
      null,
    ),
  };
}

function clearBrandSidecars(cacheDir: string, slug: string): void {
  for (const file of [
    brandingPath(cacheDir, slug),
    decorationsPath(cacheDir, slug),
    themeConfigPath(cacheDir, slug),
    materialsPath(cacheDir, slug),
    fontsPath(cacheDir, slug),
  ]) {
    try {
      rmSync(file, { force: true });
    } catch {
      /* best effort */
    }
  }
}

export async function fetchThemeAssets(
  parentSlug: string,
  themeSlug: string,
  version: string,
  opts: ResolvedOptions,
  logger?: CdnLogger,
): Promise<{ css: string; data: ThemeJsonV2 }> {
  logger?.info(`${TAG}     ↓ ${parentSlug}/${themeSlug}@${version}`);

  const [css, data] = await Promise.all([
    fetchOrFallback<string>(
      {
        url: themeCssUrl(opts, parentSlug, themeSlug, version),
        legacyUrl: themeCssUrl(opts, parentSlug, themeSlug, version, 'subBrands'),
        cacheFile: themeCssPath(opts.cacheDir, parentSlug, themeSlug),
        parse: identity,
        defaultValue: '',
        label: `${parentSlug}/${themeSlug} css`,
      },
      opts,
      logger,
    ),
    fetchThemeJsonOnly(parentSlug, themeSlug, version, opts, logger),
  ]);

  writeThemeSidecars(opts.cacheDir, parentSlug, themeSlug, data);
  return { css, data };
}

async function fetchThemeJsonOnly(
  parentSlug: string,
  themeSlug: string,
  version: string,
  opts: ResolvedOptions,
  logger?: CdnLogger,
): Promise<ThemeJsonV2> {
  if (opts.offline) {
    return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
  }

  const url = themeJsonUrl(opts, parentSlug, themeSlug, version);
  const legacyUrl = themeJsonUrl(opts, parentSlug, themeSlug, version, 'subBrands');
  try {
    const res = await fetchThemeAssetWithLegacyFallback(url, legacyUrl);
    if (res.status === 404) {
      try {
        rmSync(themeThemeConfigPath(opts.cacheDir, parentSlug, themeSlug), { force: true });
      } catch {
        /* best effort */
      }
      return DEFAULT_SUB_BRAND_JSON;
    }
    if (!res.ok) {
      logger?.warn(
        `${TAG} ${url} → HTTP ${res.status}; falling back to cached themeConfig.`,
      );
      return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
    }
    const body = await res.text();
    try {
      return parseThemeJson(body);
    } catch (e) {
      logger?.warn(
        `${TAG} ${parentSlug}/${themeSlug} brand.json parse error: ${(e as Error).message}; falling back to cached themeConfig.`,
      );
      return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
    }
  } catch (e) {
    logger?.warn(
      `${TAG} ${parentSlug}/${themeSlug} brand.json fetch failed for ${url}: ${(e as Error).message}; falling back to cached themeConfig.`,
    );
    return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
  }
}

function readSubSidecarsFromDisk(
  cacheDir: string,
  parent: string,
  sub: string,
): ThemeJsonV2 {
  const tcFile = themeThemeConfigPath(cacheDir, parent, sub);
  let themeConfig: unknown | null = null;
  if (existsSync(tcFile)) {
    try {
      themeConfig = JSON.parse(readFileSync(tcFile, 'utf8')) as unknown;
    } catch {
      themeConfig = null;
    }
  }
  return { schemaVersion: 2, version: '', themeConfig };
}
