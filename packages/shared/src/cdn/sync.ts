/**
 * syncBrandCache — top-level orchestrator. Called once at plugin
 * `configResolved` / `compiler.hooks.beforeRun` / esbuild `setup`. Prunes
 * orphans, wipes stale CSS on version bumps, fetches each parent + sub-brand,
 * and writes the cache manifest.
 *
 * Returns the manifest so the bundler-specific code can read sizes/hashes for
 * its virtual module emission.
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fetchBrandAssets, fetchThemeAssets } from './fetcher';
import { readCachedManifest, writeCachedManifest } from './manifest';
import { brandDir, brandsRoot, cssPath, themeDir } from './paths';
import { dropLegacyFlatFiles, pruneOrphanBrands } from './prune';
import type { CacheManifest, CdnLogger, ResolvedOptions } from './types';

const TAG = '[@oneui/cdn]';

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function shortHash(s: string): string {
  return `sha256-${createHash('sha256').update(s).digest('hex').slice(0, 16)}`;
}

export async function syncBrandCache(
  opts: ResolvedOptions,
  logger?: CdnLogger,
): Promise<CacheManifest> {
  ensureDir(brandsRoot(opts.cacheDir));
  dropLegacyFlatFiles(opts.cacheDir, logger);

  const manifest = readCachedManifest(opts.cacheDir);
  pruneOrphanBrands(opts.cacheDir, opts.brands, manifest, logger);

  for (const [slug, entry] of Object.entries(opts.brands)) {
    const { version, themes } = entry;

    // If the pinned version changed since the last build, brand.css on disk
    // holds content for the OLD version. fetchOrFallback's network/5xx-failure
    // path would happily serve that stale content while the manifest records
    // the NEW version — a silent staleness bug. Wipe the CSS proactively.
    const previousVersion = manifest.brands[slug]?.version;
    if (previousVersion !== undefined && previousVersion !== version) {
      try {
        rmSync(cssPath(opts.cacheDir, slug), { force: true });
        logger?.info(
          `${TAG}   ↻ ${slug} version changed ${previousVersion} → ${version}; wiped CSS cache`,
        );
      } catch {
        /* best effort */
      }
    }

    ensureDir(brandDir(opts.cacheDir, slug));
    const { css } = await fetchBrandAssets(slug, version, opts, logger);

    if (css.length === 0) {
      logger?.warn(
        `${TAG} "${slug}"@${version}: no CSS available — brand stays unstyled until the CDN serves CSS (or the cache fills).`,
      );
    }

    // Sub-brand pass: eager-fetch every declared sub-brand chunk.
    const themesManifest: NonNullable<CacheManifest['brands'][string]['themes']> = {};
    for (const themeSlug of themes) {
      ensureDir(themeDir(opts.cacheDir, slug, themeSlug));
      const { css: themeCss } = await fetchThemeAssets(slug, themeSlug, version, opts, logger);
      if (themeCss.length === 0) {
        logger?.warn(
          `${TAG} "${slug}/${themeSlug}": no CSS available — sub-brand will degrade to parent accents at runtime.`,
        );
      }
      themesManifest[themeSlug] = {
        hash: shortHash(themeCss),
        bytes: Buffer.byteLength(themeCss, 'utf8'),
        fetchedAt: new Date().toISOString(),
      };
    }

    manifest.brands[slug] = {
      version,
      hash: shortHash(css),
      bytes: Buffer.byteLength(css, 'utf8'),
      fetchedAt: new Date().toISOString(),
      ...(themes.length > 0 ? { themes: themesManifest } : {}),
    };
  }

  writeCachedManifest(opts.cacheDir, manifest);
  return manifest;
}
