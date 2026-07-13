/**
 * @oneui/shared/cdn — bundler-agnostic CDN fetch + cache + codegen primitives.
 *
 * Consumed by:
 *   - @oneui/vite-plugin
 *   - @oneui/webpack-plugin
 *   - @oneui/esbuild-plugin
 *   - @oneui/next-plugin (delegates to webpack-plugin)
 *
 * Each plugin uses `resolveOptions`, `syncBrandCache`, the `generate*Source`
 * codegen helpers, and the virtual-module ID constants. Bundler-specific
 * plumbing (resolveId/load/HMR) stays in each plugin.
 */

export * from './types';
export * from './paths';
export { resolveOptions } from './options';
export { syncBrandCache } from './sync';
export { readCachedManifest, writeCachedManifest } from './manifest';
export { dropLegacyFlatFiles, pruneOrphanBrands } from './prune';
export { fetchBrandAssets, fetchThemeAssets } from './fetcher';
export {
  VIRT_INDEX,
  VIRT_BRAND_PREFIX,
  VIRT_SUB_BRAND_PREFIX,
  BRAND_LOADER_MODULE_IDS,
  isBrandLoaderModuleId,
  escapeForTemplateLiteral,
  generateIndexModuleSource,
  generateBrandModuleSource,
  generateThemeModuleSource,
} from './codegen';
