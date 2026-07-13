/**
 * @oneui/vite-plugin
 *
 * Vite plugin that bridges OneUI brand CSS from a CDN to a consumer app at
 * build time. Fetch / cache / prune / codegen logic lives in
 * `@oneui/shared/cdn` (bundled into the published tarball — end users still
 * install just the 3 packages they already expect).
 *
 *   import { oneui } from '@oneui/vite-plugin';
 *
 *   export default defineConfig({
 *     plugins: [
 *       oneui({
 *         cdnUrl: 'https://myjiostatic.cdn.jio.com/JDS',
 *         brands: { jio: 'latest', reliance: 'latest' },
 *       }),
 *     ],
 *   });
 *
 * Exposes two virtual modules: `virtual:oneui-brands` (lazy loader map) and
 * `virtual:oneui-brand/<slug>` / `virtual:oneui-sub-brand/<parent>::<sub>`
 * (CSS string + sidecar exports per brand). See `@oneui/shared/cdn/codegen.ts`
 * for the emitted JS shape.
 *
 * Sync policy (always-fetch with cache fallback) and cache layout
 * (`node_modules/.oneui-cache/brands/<slug>/...`): see `@oneui/shared/cdn`.
 */

import { basename, relative } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import {
  type CacheManifest,
  type ResolvedOptions,
  VIRT_BRAND_PREFIX,
  VIRT_INDEX,
  VIRT_SUB_BRAND_PREFIX,
  brandsRoot,
  generateBrandModuleSource,
  generateIndexModuleSource,
  generateThemeModuleSource,
  isBrandLoaderModuleId,
  manifestPath,
  resolveOptions,
  syncBrandCache,
} from '@oneui/shared/cdn';

// Public type surface — declared locally (not re-exported from
// `@oneui/shared/cdn`) so the published .d.ts has no workspace-internal leaks.
// Structurally identical to the types the shared module uses internally.

/**
 * Per-brand entry shape in `oneui.brands.json` / `OneuiPluginOptions.brands`.
 * String form is the legacy parent-only shape; object form opts the parent
 * into one or more sub-brands.
 */
export type BrandConfigEntry = string | { version: string; themes?: string[] };

export interface OneuiPluginOptions {
  /** Base CDN URL. Trailing slash optional. Falls back to env or config file. */
  cdnUrl?: string;
  /** Map of brand slug → version, or `{ version, themes }`. Falls back to config file. */
  brands?: Record<string, BrandConfigEntry>;
  /** Path (relative to project root) to the brand config file. Default: `./oneui.brands.json`. */
  configFile?: string;
  /** Cache directory relative to project root. Default: `node_modules/.oneui-cache`. */
  cacheDir?: string;
  /** If true, never hit the network — only use cached CSS. */
  offline?: boolean;
}

const RESOLVED_PREFIX = '\0';
const TAG = '[@oneui/vite-plugin]';

export function oneui(opts: OneuiPluginOptions = {}): Plugin {
  let resolved: ResolvedOptions;
  let manifest: CacheManifest = { version: 2, brands: {} };
  let logger: ResolvedConfig['logger'];

  return {
    name: '@oneui/vite-plugin',
    enforce: 'pre',

    async configResolved(config) {
      logger = config.logger;
      resolved = resolveOptions(opts, config.root, TAG);
      logger.info(`${TAG} syncing brand cache (force-fetch, cache fallback):`);
      manifest = await syncBrandCache(resolved, logger);
      const total = Object.values(manifest.brands).reduce((s, b) => s + b.bytes, 0);
      logger.info(
        `${TAG} cache ready: ${Object.keys(manifest.brands).length} brand(s), ${(total / 1024).toFixed(1)} KB total`,
      );
    },

    resolveId(id) {
      if (id === VIRT_INDEX || isBrandLoaderModuleId(id)) return RESOLVED_PREFIX + VIRT_INDEX;
      if (id.startsWith(VIRT_BRAND_PREFIX)) return RESOLVED_PREFIX + id;
      if (id.startsWith(VIRT_SUB_BRAND_PREFIX)) return RESOLVED_PREFIX + id;
      return null;
    },

    load(id) {
      if (id === RESOLVED_PREFIX + VIRT_INDEX) {
        return generateIndexModuleSource(
          resolved,
          manifest,
          (slug) => `${VIRT_BRAND_PREFIX}${slug}`,
          (parent, sub) => `${VIRT_SUB_BRAND_PREFIX}${parent}::${sub}`,
        );
      }

      if (id.startsWith(RESOLVED_PREFIX + VIRT_BRAND_PREFIX)) {
        const slug = id.slice((RESOLVED_PREFIX + VIRT_BRAND_PREFIX).length);
        return generateBrandModuleSource(slug, resolved.cacheDir);
      }

      if (id.startsWith(RESOLVED_PREFIX + VIRT_SUB_BRAND_PREFIX)) {
        const key = id.slice((RESOLVED_PREFIX + VIRT_SUB_BRAND_PREFIX).length);
        const idx = key.indexOf('::');
        if (idx === -1) return null;
        const parentSlug = key.slice(0, idx);
        const themeSlug = key.slice(idx + 2);
        return generateThemeModuleSource(parentSlug, themeSlug, resolved.cacheDir);
      }

      return null;
    },

    handleHotUpdate(ctx) {
      const root = brandsRoot(resolved.cacheDir);
      const mfPath = manifestPath(resolved.cacheDir);

      if (ctx.file.startsWith(root)) {
        const rel = relative(root, ctx.file);
        const parts = rel.split(/[\\/]/);
        const slug = parts[0];
        if (slug && Object.prototype.hasOwnProperty.call(resolved.brands, slug)) {
          const mods: any[] = [];
          if (parts[1] === 'sub' && parts[2]) {
            const themeSlug = parts[2];
            const subMod = ctx.server.moduleGraph.getModuleById(
              RESOLVED_PREFIX + VIRT_SUB_BRAND_PREFIX + `${slug}::${themeSlug}`,
            );
            if (subMod) mods.push(subMod);
          } else {
            const mod = ctx.server.moduleGraph.getModuleById(
              RESOLVED_PREFIX + VIRT_BRAND_PREFIX + slug,
            );
            if (mod) mods.push(mod);
          }
          const indexMod = ctx.server.moduleGraph.getModuleById(RESOLVED_PREFIX + VIRT_INDEX);
          if (indexMod) mods.push(indexMod);
          return mods;
        }
      }
      if (ctx.file === mfPath || basename(ctx.file) === 'manifest.json') {
        const mods: any[] = [];
        for (const slug of Object.keys(resolved.brands)) {
          const mod = ctx.server.moduleGraph.getModuleById(
            RESOLVED_PREFIX + VIRT_BRAND_PREFIX + slug,
          );
          if (mod) mods.push(mod);
        }
        const indexMod = ctx.server.moduleGraph.getModuleById(RESOLVED_PREFIX + VIRT_INDEX);
        if (indexMod) mods.push(indexMod);
        return mods;
      }
      return undefined;
    },
  };
}

export default oneui;
