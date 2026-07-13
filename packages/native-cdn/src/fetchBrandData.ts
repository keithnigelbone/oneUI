import type {
  BrandData,
  BrandDataSource,
  CdnCacheStorage,
  SubBrandFile,
  ThemeData,
} from './types';

/**
 * Low-level brand-data I/O: read from cache, fetch from network, write back.
 * Two payload kinds (see `types.ts`):
 *   - parent `latest.json` → `BrandData` (validated on `foundation`)
 *   - sub-brand `latest.json` → `ThemeData` (validated on `themeData`)
 *
 * `useCdnBrandData` composes these into a cache-first + revalidate flow; they're
 * also exported for imperative / non-React use.
 */

export interface JsonIOParams {
  /** Absolute URL of the brand or sub-brand `latest.json` (build with the `urls` helpers). */
  url: string;
  /** Cache adapter. */
  storage: CdnCacheStorage;
  /** Cache-key prefix. */
  cachePrefix: string;
  /** Optional abort signal for the network fetch. */
  signal?: AbortSignal;
}

function cacheKey(prefix: string, url: string): string {
  return `${prefix}${url}`;
}

// ── Parsers (return null on invalid / wrong-shape) ───────────────────────────

function parseBrandData(text: string): BrandData | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null && 'foundation' in parsed) {
      return parsed as BrandData;
    }
  } catch {
    /* fall through */
  }
  return null;
}

function parseThemeData(text: string): ThemeData | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null && 'themeData' in parsed) {
      return (parsed as SubBrandFile).themeData ?? null;
    }
  } catch {
    /* fall through */
  }
  return null;
}

// ── Cache reads (never throw) ────────────────────────────────────────────────

async function readCachedText(params: JsonIOParams): Promise<string | null> {
  try {
    return await params.storage.getItem(cacheKey(params.cachePrefix, params.url));
  } catch {
    return null;
  }
}

/** Read cached parent `BrandData` for `url`, or `null` if absent / unparseable. */
export async function readCachedBrandData(params: JsonIOParams): Promise<BrandData | null> {
  const text = await readCachedText(params);
  return text ? parseBrandData(text) : null;
}

/** Read cached sub-brand `ThemeData` for `url`, or `null` if absent / unparseable. */
export async function readCachedThemeData(params: JsonIOParams): Promise<ThemeData | null> {
  const text = await readCachedText(params);
  return text ? parseThemeData(text) : null;
}

// ── Network fetch + cache write ──────────────────────────────────────────────

/**
 * Fetch + validate + cache. Throws on network error, non-2xx, invalid JSON, or
 * a wrong-shape payload. The cache write (raw response text) is best-effort.
 */
async function fetchParseCache<T>(
  params: JsonIOParams,
  parse: (text: string) => T | null,
  kind: string,
): Promise<T> {
  const res = await fetch(params.url, { signal: params.signal });
  if (!res.ok) {
    throw new Error(`[@oneui/native-cdn] ${params.url} → HTTP ${res.status}`);
  }
  const text = await res.text();
  const parsed = parse(text);
  if (parsed === null) {
    throw new Error(`[@oneui/native-cdn] ${params.url} is not a valid ${kind} payload`);
  }
  try {
    await params.storage.setItem(cacheKey(params.cachePrefix, params.url), text);
  } catch {
    /* best effort — a write failure must not break rendering */
  }
  return parsed;
}

/** Fetch fresh parent `BrandData` from the CDN and cache it. */
export function fetchFreshBrandData(params: JsonIOParams): Promise<BrandData> {
  return fetchParseCache(params, parseBrandData, 'BrandData');
}

/** Fetch fresh sub-brand `ThemeData` from the CDN and cache it. */
export function fetchFreshThemeData(params: JsonIOParams): Promise<ThemeData> {
  return fetchParseCache(params, parseThemeData, 'sub-brand ThemeData');
}

// ── Imperative one-shot loaders ──────────────────────────────────────────────

/**
 * Network-first parent-brand load with cache fallback, for imperative use.
 * Throws only when the network fails AND there is no cached copy.
 */
export async function loadBrandData(
  params: JsonIOParams,
): Promise<{ data: BrandData; source: BrandDataSource }> {
  try {
    const data = await fetchFreshBrandData(params);
    return { data, source: 'network' };
  } catch (err) {
    const cached = await readCachedBrandData(params);
    if (cached) return { data: cached, source: 'cache' };
    throw err;
  }
}

/** Remove a single cached payload (best effort). */
export async function clearCachedBrandData(params: JsonIOParams): Promise<void> {
  try {
    await params.storage.removeItem?.(cacheKey(params.cachePrefix, params.url));
  } catch {
    /* best effort */
  }
}
