import { OneuiWebpackPluginOptions } from '@jds4/oneui-webpack-plugin';

/**
 * @oneui/next-plugin (published as @jds4/oneui-next-plugin)
 *
 * Thin Next.js wrapper around `@jds4/oneui-webpack-plugin`. Hooks the OneUI
 * brand fetcher into Next's webpack pipeline so `<BrandProvider>` from
 * `@jds4/oneui-react` resolves `virtual:oneui-brands` the same way it does
 * in a vanilla Vite or webpack consumer.
 *
 * Usage:
 *
 *   // next.config.js (or .mjs / .ts)
 *   const { withOneui } = require('@jds4/oneui-next-plugin');
 *
 *   module.exports = withOneui({
 *     cdnUrl: 'https://myjiostatic.cdn.jio.com/JDS',
 *     brands: { jio: 'latest' },
 *   })({
 *     // your usual Next config:
 *     reactStrictMode: true,
 *     // …
 *   });
 *
 * Both calling conventions are supported:
 *   - `withOneui(opts)(nextConfig)` — curried (recommended)
 *   - `withOneui(nextConfig, opts)` — flat
 *
 * ## Turbopack note
 *
 * Turbopack is Next.js 15's default dev bundler, replacing webpack. It does
 * not run webpack plugins. For Turbopack-built apps:
 *
 *   - **dev (`next dev`)**: Turbopack ignores this plugin. Workaround: run
 *     `pnpm @jds4/oneui-webpack-plugin sync` (or call the plugin's syncCache
 *     in a small pre-dev script) so the cache is filled, then use a
 *     consumer-provided alias for `virtual:oneui-brands`.
 *   - **build (`next build`)**: Next still uses webpack for production
 *     builds (Turbopack build is opt-in via `experimental.turbo`). This
 *     plugin works there.
 *
 * For full Turbopack support, a dedicated `@jds4/oneui-turbopack-plugin`
 * would be needed — Turbopack's plugin API (Rust-side) is still stabilising.
 * Most production Next apps build with webpack today, so this plugin
 * covers the common path.
 */

interface NextConfigLike {
    webpack?: (config: unknown, options: unknown) => unknown;
    [key: string]: unknown;
}
type OneuiNextPluginOptions = OneuiWebpackPluginOptions;
/**
 * Curried API: `withOneui(opts)(nextConfig)`.
 *
 * The curried form composes cleanly with other Next plugins
 * (`withOneui(opts)(withMDX(...)(baseConfig))`).
 */
declare function withOneui(opts?: OneuiNextPluginOptions): (config?: NextConfigLike) => NextConfigLike;
/**
 * Flat API: `withOneui(nextConfig, opts)`.
 */
declare function withOneui(config: NextConfigLike, opts?: OneuiNextPluginOptions): NextConfigLike;

export { type OneuiNextPluginOptions, withOneui as default, withOneui };
