/**
 * Brand payloads served on the CDN. There are TWO shapes, mirrored by the
 * provider's two props (`@oneui/ui-native` `OneUIBrandProvider`):
 *
 *   parent  <brand>/latest.json                  → { version, foundation, components } → BrandData
 *   sub      <brand>/sub-brands/<sub>/latest.json → { version, themeData }             → ThemeData
 *
 * A sub-brand is NOT a standalone brand — it's an accent delta. To render a
 * sub-brand you pass the PARENT's `brandData` plus the sub-brand's `themeData`;
 * the provider merges the accents internally.
 *
 * Both types are declared locally (rather than imported from `@oneui/ui-native`)
 * to keep this package's typecheck decoupled from the full native theme + engine
 * source graph. They are structurally identical to the provider's props and must
 * stay in sync.
 */

/** Parent-brand payload — assigns to `<OneUIBrandProvider brandData={…}>`. */
export interface BrandData {
  /** Raw `api.foundations.getBrandOverviewData` payload (already trimmed for native). */
  foundation: unknown;
  /** Raw `api.componentTokenOverrides.getAllBrandComponentData` payload. */
  components?: unknown;
}

/**
 * Sub-brand accent delta — the `themeData` field of a sub-brand's `latest.json`.
 * Assigns to `<OneUIBrandProvider themeData={…}>`. Structurally matches
 * `SubBrandAccentFields` in `@oneui/shared`.
 */
export interface ThemeData {
  primary: { scaleName: string; baseStep: number };
  secondary: { scaleName: string; baseStep: number };
  sparkle: { scaleName: string; baseStep: number };
  brandBg: {
    scaleName: string;
    backgroundStep: { light: number; dark: number };
  };
}

/** Raw shape of a sub-brand `latest.json` file (wraps `ThemeData`). */
export interface SubBrandFile {
  version?: string;
  themeData: ThemeData;
}

/**
 * Persistent cache adapter. The shape is intentionally identical to
 * `@react-native-async-storage/async-storage`, so an AsyncStorage instance can
 * be passed directly. `expo-file-system` (or anything else) works too — supply
 * a thin wrapper that resolves to a JSON string.
 *
 * Values stored/read are the raw JSON text of a brand or sub-brand payload.
 */
export interface CdnCacheStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  /** Optional — used by `clearCachedBrandData`. */
  removeItem?(key: string): Promise<void>;
}

/** Global CDN configuration, supplied via `<OneUICdnProvider>` or per-hook options. */
export interface CdnConfig {
  /**
   * Base CDN URL up to (but NOT including) the `brand-data` segment.
   *
   * Given the layout `…/JDS/ReactNative/brand-data/jio/latest.json`, set
   * `cdnUrl` to `https://<host>/JDS/ReactNative`. A trailing slash is fine.
   */
  cdnUrl: string;
  /**
   * Persistent cache adapter. Defaults to a process-lifetime in-memory store
   * (no cross-launch persistence). Pass AsyncStorage / a file-system wrapper
   * for offline-survivable caching.
   */
  storage?: CdnCacheStorage;
  /** Cache-key prefix. Default `'oneui-cdn:'`. */
  cachePrefix?: string;
}

/** Where the currently-held `brandData` came from. */
export type BrandDataSource = 'cache' | 'network';

/**
 * Hook lifecycle status.
 * - `loading` — no parent data yet (no cache hit, network in flight).
 * - `success` — `brandData` is populated (from cache and/or network).
 * - `error` — no parent data could be obtained (no cache AND network failed).
 *
 * Note: when a cached value is being shown and a background revalidation
 * fails, status stays `success` (stale-while-error) and `error` is populated.
 */
export type BrandDataStatus = 'loading' | 'success' | 'error';
