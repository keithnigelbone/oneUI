/**
 * In-memory brand cache for data pre-fetched by `npx oneui-native-cdn prefetch`.
 *
 * The prefetch command writes `node_modules/.oneui-cached/index.js`.
 * That file calls `registerBrandCache()` at import time, populating the maps
 * below.  Consumer apps add ONE import in their entry file:
 *
 *   import '.oneui-cached';  // side-effect: registers prefetched brands
 *
 * Metro sees this import in the consumer's own source (statically analyzable)
 * and includes `.oneui-cached` in the bundle.  No metro.config.js changes are
 * needed.  If the consumer has NOT run prefetch (or hasn't added the import),
 * both maps are empty and `OneUIBrandProvider` falls back to DEFAULT_JIO_BRAND_DATA.
 *
 * WHY NOT `require('.oneui-cached')` IN THE BUNDLE?
 * When a file with ES-module syntax (import/export) also calls `require()`,
 * esbuild wraps the require in a shim function (e.g. `en(".oneui-cached")`).
 * Metro's static analyzer only detects literal `require("...")` call expressions
 * — it never sees the shim call as a dependency, so `.oneui-cached` is absent
 * from the bundle and falls back silently at runtime.
 */

import type { BrandData, ThemeData } from '../OneUIBrandProvider';

let _BRANDS: Record<string, BrandData> = {};
let _THEMES: Record<string, ThemeData> = {};

/**
 * Called automatically by the `node_modules/.oneui-cached/index.js` generated
 * by `npx oneui-native-cdn prefetch`.  Safe to call multiple times; each call
 * merges into the existing maps.
 */
export function registerBrandCache(
  brands: Record<string, BrandData>,
  themes: Record<string, ThemeData>,
): void {
  _BRANDS = { ..._BRANDS, ...brands };
  _THEMES = { ..._THEMES, ...themes };
}

/** Return the prefetched parent-brand snapshot for `brand`, or `undefined` if not cached. */
export function getCdnBrandData(brand: string): BrandData | undefined {
  return _BRANDS[brand];
}

/** Return the prefetched sub-brand accent delta, or `undefined` for the parent variant. */
export function getCdnThemeData(brand: string, variant = 'base'): ThemeData | undefined {
  if (!variant || variant === 'base') return undefined;
  return _THEMES[`${brand}::${variant}`];
}
