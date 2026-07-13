/**
 * Cache hygiene — prune brand/sub-brand folders that aren't in the current
 * `oneui.brands.json`, and drop legacy flat files left over from pre-v2 caches.
 */

import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { brandsRoot } from './paths';
import type { CacheManifest, CdnLogger, ResolvedBrandEntry } from './types';

const TAG = '[@oneui/cdn]';

/**
 * Remove legacy flat files (`brands/<slug>.css`, `brands/<slug>.*.json`) from
 * pre-v2 cache layouts. Subsequent code uses folder-per-slug exclusively.
 */
export function dropLegacyFlatFiles(cacheDir: string, logger?: CdnLogger): void {
  const root = brandsRoot(cacheDir);
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) continue;
    if (/\.(css|json)$/.test(entry.name)) {
      try {
        rmSync(join(root, entry.name));
        logger?.info(`${TAG}   ↧ migrated legacy ${entry.name} (removed)`);
      } catch {
        /* best effort */
      }
    }
  }
}

/**
 * Remove brand folders not in the current config, and prune sub-brand folders
 * for configured parents whose `themes` list has shrunk.
 */
export function pruneOrphanBrands(
  cacheDir: string,
  configured: Record<string, ResolvedBrandEntry>,
  manifest: CacheManifest,
  logger?: CdnLogger,
): void {
  const root = brandsRoot(cacheDir);
  if (!existsSync(root)) return;
  const wanted = new Set(Object.keys(configured));

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    if (!wanted.has(entry.name)) {
      const path = join(root, entry.name);
      try {
        rmSync(path, { recursive: true, force: true });
        delete manifest.brands[entry.name];
        logger?.info(`${TAG}   ✗ pruned ${entry.name} (no longer in oneui.brands.json)`);
      } catch {
        /* best effort */
      }
      continue;
    }

    // Configured parent — prune sub-brands not in its `themes` list.
    const subRoot = join(root, entry.name, 'sub');
    if (!existsSync(subRoot)) continue;
    const wantedSubs = new Set(configured[entry.name].themes);
    for (const subEntry of readdirSync(subRoot, { withFileTypes: true })) {
      if (!subEntry.isDirectory()) continue;
      if (wantedSubs.has(subEntry.name)) continue;
      const path = join(subRoot, subEntry.name);
      try {
        rmSync(path, { recursive: true, force: true });
        if (manifest.brands[entry.name]?.themes) {
          delete manifest.brands[entry.name].themes![subEntry.name];
        }
        logger?.info(
          `${TAG}   ✗ pruned ${entry.name}/${subEntry.name} (no longer in oneui.brands.json)`,
        );
      } catch {
        /* best effort */
      }
    }
  }
}
