import { Plugin } from 'esbuild';

/**
 * @oneui/esbuild-plugin (published as @jds4/oneui-esbuild-plugin)
 *
 * esbuild equivalent of `@jds4/oneui-vite-plugin`. Fetch / cache / prune /
 * codegen logic lives in `@oneui/shared/cdn` (bundled into the published
 * tarball); this file is just the esbuild-specific glue (onResolve namespace
 * marker + onLoad codegen dispatch).
 *
 *   import { build } from 'esbuild';
 *   import { oneui } from '@jds4/oneui-esbuild-plugin';
 *
 *   await build({ entryPoints, bundle: true, plugins: [oneui()] });
 */

type BrandConfigEntry = string | {
    version: string;
    themes?: string[];
};
interface OneuiEsbuildPluginOptions {
    cdnUrl?: string;
    brands?: Record<string, BrandConfigEntry>;
    configFile?: string;
    cacheDir?: string;
    offline?: boolean;
    /** Override the project root — esbuild has no built-in concept of one. */
    projectRoot?: string;
}
declare function oneui(opts?: OneuiEsbuildPluginOptions): Plugin;

export { type BrandConfigEntry, type OneuiEsbuildPluginOptions, oneui as default, oneui };
