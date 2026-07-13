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

import { OneuiWebpackPlugin, type OneuiWebpackPluginOptions } from '@oneui/webpack-plugin';

// Minimal shape of next.config — we only need to extend the `webpack` hook.
// Avoiding `import type { NextConfig } from 'next'` keeps the dependency
// strictly to peerDependencies and avoids tying us to a specific Next major.
interface NextConfigLike {
  webpack?: (config: unknown, options: unknown) => unknown;
  [key: string]: unknown;
}

export type OneuiNextPluginOptions = OneuiWebpackPluginOptions;

/**
 * Curried API: `withOneui(opts)(nextConfig)`.
 *
 * The curried form composes cleanly with other Next plugins
 * (`withOneui(opts)(withMDX(...)(baseConfig))`).
 */
export function withOneui(opts?: OneuiNextPluginOptions): (config?: NextConfigLike) => NextConfigLike;
/**
 * Flat API: `withOneui(nextConfig, opts)`.
 */
export function withOneui(config: NextConfigLike, opts?: OneuiNextPluginOptions): NextConfigLike;
export function withOneui(
  configOrOpts?: NextConfigLike | OneuiNextPluginOptions,
  maybeOpts?: OneuiNextPluginOptions,
): NextConfigLike | ((config?: NextConfigLike) => NextConfigLike) {
  // Detect which form was used. NextConfig has webpack/reactStrictMode/etc.;
  // OneuiPluginOptions has cdnUrl/brands. They're disjoint shapes in practice.
  const looksLikeOpts = (v: unknown): v is OneuiNextPluginOptions =>
    typeof v === 'object'
    && v !== null
    && ('cdnUrl' in v || 'brands' in v || 'configFile' in v || 'cacheDir' in v || 'offline' in v);

  if (configOrOpts === undefined || looksLikeOpts(configOrOpts)) {
    // Curried form: returns a config wrapper
    const opts = configOrOpts as OneuiNextPluginOptions | undefined;
    return (config: NextConfigLike = {}) => wrapConfig(config, opts);
  }
  // Flat form: directly wrap the config
  return wrapConfig(configOrOpts as NextConfigLike, maybeOpts);
}

function wrapConfig(config: NextConfigLike, opts?: OneuiNextPluginOptions): NextConfigLike {
  const userWebpack = config.webpack;
  return {
    ...config,
    webpack(webpackConfig: unknown, options: unknown) {
      // Next provides webpack config as a mutable object. Push our plugin
      // into its `plugins` array.
      const wc = webpackConfig as { plugins?: unknown[] };
      wc.plugins = wc.plugins ?? [];
      wc.plugins.push(new OneuiWebpackPlugin(opts ?? {}));

      // Chain through whatever the consumer's existing webpack hook does.
      if (typeof userWebpack === 'function') {
        return userWebpack(webpackConfig, options);
      }
      return webpackConfig;
    },
  };
}

export default withOneui;
