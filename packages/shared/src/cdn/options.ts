/**
 * resolveOptions — turn user-facing OneuiPluginOptions + an `oneui.brands.json`
 * file on disk into a fully-resolved ResolvedOptions (absolute paths, trailing
 * slash stripped from cdnUrl, normalized brand entries). Identical across
 * vite/webpack/esbuild — they all import this verbatim.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  BrandConfigEntry,
  OneuiPluginOptions,
  ResolvedBrandEntry,
  ResolvedOptions,
} from './types';

const PLUGIN_TAG = '[@oneui/cdn]';

function readJSON<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

function normalizeBrandEntry(raw: BrandConfigEntry): ResolvedBrandEntry {
  if (typeof raw === 'string') return { version: raw, themes: [] };
  return {
    version: raw.version,
    themes: Array.isArray(raw.themes) ? [...raw.themes] : [],
  };
}

export function resolveOptions(
  opts: OneuiPluginOptions,
  projectRoot: string,
  pluginTag: string = PLUGIN_TAG,
): ResolvedOptions {
  const configFile = resolve(projectRoot, opts.configFile ?? 'oneui.brands.json');
  const fileCfg = readJSON<{ cdnUrl?: string; brands?: Record<string, BrandConfigEntry> }>(
    configFile,
  );

  const cdnUrl =
    opts.cdnUrl
    ?? process.env.ONEUI_CDN_URL
    ?? fileCfg?.cdnUrl
    ?? '';
  if (!cdnUrl) {
    throw new Error(
      `${pluginTag} cdnUrl not set. Pass it inline, set ONEUI_CDN_URL env, or add it to ${configFile}.`,
    );
  }

  const rawBrands = opts.brands ?? fileCfg?.brands ?? {};
  if (Object.keys(rawBrands).length === 0) {
    throw new Error(
      `${pluginTag} no brands configured. Pass { brands: { ... } } or list them in ${configFile}.`,
    );
  }

  const brands: Record<string, ResolvedBrandEntry> = {};
  for (const [slug, entry] of Object.entries(rawBrands)) {
    brands[slug] = normalizeBrandEntry(entry);
  }

  return {
    cdnUrl: cdnUrl.replace(/\/$/, ''),
    brands,
    cacheDir: resolve(projectRoot, opts.cacheDir ?? 'node_modules/.oneui-cache'),
    offline: opts.offline ?? false,
  };
}
