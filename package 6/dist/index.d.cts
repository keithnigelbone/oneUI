import { Plugin } from 'vite';

/**
 * @oneui/vite-plugin
 *
 * Vite plugin that bridges OneUI brand CSS from a CDN to a consumer app at
 * build time. Fetch / cache / prune / codegen logic lives in
 * `@oneui/shared/cdn` (bundled into the published tarball — end users still
 * install just the 3 packages they already expect).
 *
 *   import { oneui } from '@jds4/oneui-vite-plugin';
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

/**
 * Per-brand entry shape in `oneui.brands.json` / `OneuiPluginOptions.brands`.
 * String form is the legacy parent-only shape; object form opts the parent
 * into one or more sub-brands.
 */
type BrandConfigEntry = string | {
    version: string;
    themes?: string[];
};
interface OneuiPluginOptions {
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
declare function oneui(opts?: OneuiPluginOptions): Plugin;

export { type BrandConfigEntry, type OneuiPluginOptions, oneui as default, oneui };
