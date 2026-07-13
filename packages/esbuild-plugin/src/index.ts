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

import type { Plugin, PluginBuild } from 'esbuild';
import {
  type CacheManifest,
  type ResolvedOptions,
  VIRT_BRAND_PREFIX,
  VIRT_INDEX,
  VIRT_SUB_BRAND_PREFIX,
  generateBrandModuleSource,
  generateIndexModuleSource,
  generateThemeModuleSource,
  isBrandLoaderModuleId,
  resolveOptions,
  syncBrandCache,
} from '@oneui/shared/cdn';

// Public type surface — declared locally so the published .d.ts has no
// workspace-internal references. Structurally identical to the shared types.
export type BrandConfigEntry = string | { version: string; themes?: string[] };

export interface OneuiEsbuildPluginOptions {
  cdnUrl?: string;
  brands?: Record<string, BrandConfigEntry>;
  configFile?: string;
  cacheDir?: string;
  offline?: boolean;
  /** Override the project root — esbuild has no built-in concept of one. */
  projectRoot?: string;
}

const TAG = '[@oneui/esbuild-plugin]';
const NAMESPACE = 'oneui-virtual';

const syncLogger = {
  info: (m: string) => console.log(m),
  warn: (m: string) => console.warn(m),
};

// Inflight dedupe across parallel build()s sharing a cacheDir.
const inflightSyncByCacheDir = new Map<string, Promise<CacheManifest>>();

function syncCacheOnce(opts: ResolvedOptions): Promise<CacheManifest> {
  const existing = inflightSyncByCacheDir.get(opts.cacheDir);
  if (existing) return existing;
  const fresh = syncBrandCache(opts, syncLogger);
  inflightSyncByCacheDir.set(opts.cacheDir, fresh);
  fresh.catch(() => inflightSyncByCacheDir.delete(opts.cacheDir));
  return fresh;
}

function buildVirtualModuleSource(
  resolved: ResolvedOptions,
  manifest: CacheManifest,
  path: string,
): string | null {
  if (path === VIRT_INDEX) {
    return generateIndexModuleSource(
      resolved,
      manifest,
      (slug) => `${VIRT_BRAND_PREFIX}${slug}`,
      (parent, sub) => `${VIRT_SUB_BRAND_PREFIX}${parent}::${sub}`,
    );
  }
  if (path.startsWith(VIRT_BRAND_PREFIX)) {
    const slug = path.slice(VIRT_BRAND_PREFIX.length);
    return generateBrandModuleSource(slug, resolved.cacheDir);
  }
  if (path.startsWith(VIRT_SUB_BRAND_PREFIX)) {
    const key = path.slice(VIRT_SUB_BRAND_PREFIX.length);
    const idx = key.indexOf('::');
    if (idx === -1) return null;
    return generateThemeModuleSource(key.slice(0, idx), key.slice(idx + 2), resolved.cacheDir);
  }
  return null;
}

export function oneui(opts: OneuiEsbuildPluginOptions = {}): Plugin {
  return {
    name: '@oneui/esbuild-plugin',
    setup(build: PluginBuild) {
      let resolved: ResolvedOptions | null = null;
      let manifest: CacheManifest | null = null;

      build.onStart(async () => {
        const root = opts.projectRoot ?? build.initialOptions.absWorkingDir ?? process.cwd();
        resolved = resolveOptions(opts, root, TAG);
        console.log(`${TAG} syncing brand cache (force-fetch, cache fallback):`);
        manifest = await syncCacheOnce(resolved);
        const totalBytes = Object.values(manifest.brands).reduce((s, b) => s + b.bytes, 0);
        console.log(
          `${TAG} cache ready: ${Object.keys(manifest.brands).length} brand(s), ${(totalBytes / 1024).toFixed(1)} KB total`,
        );
      });

      // Mark virtual paths with our namespace so onLoad picks them up. esbuild
      // would otherwise treat them as filesystem paths and fail to resolve.
      build.onResolve(
        { filter: /^virtual:oneui-(brands|brand\/[^\s]+|sub-brand\/[^\s]+)$/ },
        (args) => ({ path: args.path, namespace: NAMESPACE }),
      );

      build.onResolve(
        { filter: /^@(?:oneui\/ui|jds4\/oneui-react)\/brand-loader$/ },
        () => ({ path: VIRT_INDEX, namespace: NAMESPACE }),
      );

      build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => {
        if (resolved === null || manifest === null) {
          return {
            errors: [
              { text: `${TAG} onLoad called before onStart completed; this should not happen.` },
            ],
          };
        }
        const source = buildVirtualModuleSource(resolved, manifest, args.path);
        if (source === null) {
          const slug = args.path.startsWith(VIRT_BRAND_PREFIX)
            ? args.path.slice(VIRT_BRAND_PREFIX.length)
            : args.path;
          return {
            errors: [
              {
                text: `${TAG} brand "${slug}" not in cache. Ensure it's listed in oneui.brands.json.`,
              },
            ],
          };
        }
        return { contents: source, loader: 'js' };
      });
    },
  };
}

export default oneui;
