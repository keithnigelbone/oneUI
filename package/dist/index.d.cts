import { Compiler } from 'webpack';

/**
 * @oneui/webpack-plugin (published as @jds4/oneui-webpack-plugin)
 *
 * Webpack equivalent of `@jds4/oneui-vite-plugin`. Fetch / cache / prune /
 * codegen logic lives in `@oneui/shared/cdn` (bundled into the published
 * tarball); this file is just the webpack-specific glue (virtual module
 * file writer + normalModuleFactory.beforeResolve hook).
 *
 *   const { oneui } = require('@jds4/oneui-webpack-plugin');
 *   module.exports = {
 *     plugins: [oneui({ cdnUrl: '...', brands: { jio: 'latest' } })],
 *   };
 *
 * For Next.js, use `@jds4/oneui-next-plugin` (wraps this plugin in
 * `withOneui()` for `next.config.js`).
 */

type BrandConfigEntry = string | {
    version: string;
    themes?: string[];
};
interface OneuiWebpackPluginOptions {
    cdnUrl?: string;
    brands?: Record<string, BrandConfigEntry>;
    configFile?: string;
    cacheDir?: string;
    offline?: boolean;
}
/**
 * OneUI Webpack plugin. Instantiate it and pass into `webpack.plugins`:
 *
 *   plugins: [new OneuiWebpackPlugin({ cdnUrl, brands })]
 *
 * The exported `oneui()` factory is sugar for `new OneuiWebpackPlugin()`.
 */
declare class OneuiWebpackPlugin {
    private readonly options;
    private synced;
    constructor(options?: OneuiWebpackPluginOptions);
    apply(compiler: Compiler): void;
}
/** Factory matching `@oneui/vite-plugin`'s API. */
declare function oneui(opts?: OneuiWebpackPluginOptions): OneuiWebpackPlugin;

export { type BrandConfigEntry, OneuiWebpackPlugin, type OneuiWebpackPluginOptions, oneui as default, oneui };
