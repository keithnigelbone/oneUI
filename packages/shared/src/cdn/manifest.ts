/**
 * On-disk cache manifest helpers — one `manifest.json` at the cacheDir root.
 * Tracks the pinned version per brand so `sync.ts` can wipe stale CSS when a
 * user bumps a version.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { manifestPath } from './paths';
import type { CacheManifest } from './types';

function readJSON<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function readCachedManifest(cacheDir: string): CacheManifest {
  const cached = readJSON<CacheManifest>(manifestPath(cacheDir));
  return cached && cached.version === 2 ? cached : { version: 2, brands: {} };
}

export function writeCachedManifest(cacheDir: string, manifest: CacheManifest): void {
  ensureDir(cacheDir);
  writeFileSync(manifestPath(cacheDir), JSON.stringify(manifest, null, 2));
}
