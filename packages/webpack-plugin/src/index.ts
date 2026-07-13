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

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Compiler } from 'webpack';
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

export interface OneuiWebpackPluginOptions {
  cdnUrl?: string;
  brands?: Record<string, BrandConfigEntry>;
  configFile?: string;
  cacheDir?: string;
  offline?: boolean;
}

const TAG = '[@oneui/webpack-plugin]';
const VIRTUAL_MODULE_DIR = 'webpack-virtual';
const VIRTUAL_INDEX_FILE = 'oneui-brands.js';

// ─── Virtual-module-file paths ──────────────────────────────────────────────
// Webpack 5 treats requests containing a URI scheme (`virtual:`) as
// scheme-backed resources before normal file reading. Keep the public import
// specifiers stable, but rewrite them to ordinary files in our cache.

function virtualModulesRoot(cacheDir: string): string {
  return join(cacheDir, VIRTUAL_MODULE_DIR);
}

function virtualIndexPath(cacheDir: string): string {
  return join(virtualModulesRoot(cacheDir), VIRTUAL_INDEX_FILE);
}

function virtualBrandPath(cacheDir: string, slug: string): string {
  return join(virtualModulesRoot(cacheDir), 'oneui-brand', `${encodeURIComponent(slug)}.js`);
}

function virtualThemePath(cacheDir: string, parent: string, sub: string): string {
  return join(
    virtualModulesRoot(cacheDir),
    'oneui-sub-brand',
    `${encodeURIComponent(parent)}__${encodeURIComponent(sub)}.js`,
  );
}

function virtualRequestToPath(resolved: ResolvedOptions, request: string): string | null {
  if (request === VIRT_INDEX || isBrandLoaderModuleId(request)) {
    return virtualIndexPath(resolved.cacheDir);
  }
  if (request.startsWith(VIRT_BRAND_PREFIX)) {
    return virtualBrandPath(resolved.cacheDir, request.slice(VIRT_BRAND_PREFIX.length));
  }
  if (request.startsWith(VIRT_SUB_BRAND_PREFIX)) {
    const key = request.slice(VIRT_SUB_BRAND_PREFIX.length);
    const idx = key.indexOf('::');
    if (idx === -1) return null;
    return virtualThemePath(resolved.cacheDir, key.slice(0, idx), key.slice(idx + 2));
  }
  return null;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// Tracks cacheDirs whose virtual modules have already been written this Node
// process. Parallel compilers sharing a cacheDir (Next.js server + client)
// would otherwise race: the second compiler's rmSync wipes the first's
// just-written files between write and resolve.
const virtualWritesByCacheDir = new Set<string>();

function writeVirtualModuleFiles(resolved: ResolvedOptions, manifest: CacheManifest): void {
  if (virtualWritesByCacheDir.has(resolved.cacheDir)) return;
  virtualWritesByCacheDir.add(resolved.cacheDir);

  const root = virtualModulesRoot(resolved.cacheDir);
  rmSync(root, { recursive: true, force: true });

  const indexSource = generateIndexModuleSource(
    resolved,
    manifest,
    (slug) => `${VIRT_BRAND_PREFIX}${slug}`,
    (parent, sub) => `${VIRT_SUB_BRAND_PREFIX}${parent}::${sub}`,
  );
  ensureDir(dirname(virtualIndexPath(resolved.cacheDir)));
  writeFileSync(virtualIndexPath(resolved.cacheDir), indexSource);

  for (const slug of Object.keys(resolved.brands)) {
    const src = generateBrandModuleSource(slug, resolved.cacheDir);
    const file = virtualBrandPath(resolved.cacheDir, slug);
    ensureDir(dirname(file));
    writeFileSync(file, src);

    for (const themeSlug of resolved.brands[slug].themes) {
      const subSrc = generateThemeModuleSource(slug, themeSlug, resolved.cacheDir);
      const subFile = virtualThemePath(resolved.cacheDir, slug, themeSlug);
      ensureDir(dirname(subFile));
      writeFileSync(subFile, subSrc);
    }
  }
}

function installVirtualModuleResolver(compiler: Compiler, resolved: ResolvedOptions): void {
  compiler.hooks.normalModuleFactory.tap('OneuiWebpackPlugin', (normalModuleFactory) => {
    normalModuleFactory.hooks.beforeResolve.tap('OneuiWebpackPlugin', (resolveData) => {
      const file = virtualRequestToPath(resolved, resolveData.request);
      if (file !== null) {
        resolveData.request = file;
      }
    });
  });
}

// Inflight dedupe across parallel compilers (Next.js server + client) — they
// share a cacheDir and would otherwise race on writeFileSync.
const inflightSyncByCacheDir = new Map<string, Promise<CacheManifest>>();
const syncLogger = {
  info: (m: string) => console.log(m),
  warn: (m: string) => console.warn(m),
};

function syncCacheOnce(opts: ResolvedOptions): Promise<CacheManifest> {
  const existing = inflightSyncByCacheDir.get(opts.cacheDir);
  if (existing) return existing;
  const fresh = syncBrandCache(opts, syncLogger);
  inflightSyncByCacheDir.set(opts.cacheDir, fresh);
  fresh.catch(() => inflightSyncByCacheDir.delete(opts.cacheDir));
  return fresh;
}

/**
 * OneUI Webpack plugin. Instantiate it and pass into `webpack.plugins`:
 *
 *   plugins: [new OneuiWebpackPlugin({ cdnUrl, brands })]
 *
 * The exported `oneui()` factory is sugar for `new OneuiWebpackPlugin()`.
 */
export class OneuiWebpackPlugin {
  private synced = false;

  constructor(private readonly options: OneuiWebpackPluginOptions = {}) {}

  apply(compiler: Compiler): void {
    const resolved = resolveOptions(this.options, compiler.context, TAG);
    installVirtualModuleResolver(compiler, resolved);

    compiler.hooks.beforeCompile.tapPromise('OneuiWebpackPlugin', async () => {
      if (this.synced) return;
      console.log(`${TAG} syncing brand cache (force-fetch, cache fallback):`);
      const manifest = await syncCacheOnce(resolved);
      writeVirtualModuleFiles(resolved, manifest);
      const totalBytes = Object.values(manifest.brands).reduce((s, b) => s + b.bytes, 0);
      console.log(
        `${TAG} cache ready: ${Object.keys(manifest.brands).length} brand(s), ${(totalBytes / 1024).toFixed(1)} KB total`,
      );
      this.synced = true;
    });
  }
}

/** Factory matching `@oneui/vite-plugin`'s API. */
export function oneui(opts: OneuiWebpackPluginOptions = {}): OneuiWebpackPlugin {
  return new OneuiWebpackPlugin(opts);
}

export default oneui;
