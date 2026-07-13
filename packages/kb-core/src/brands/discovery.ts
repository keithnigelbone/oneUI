/**
 * Brand discovery — runtime reads against the snapshotted JSON shipped in
 * `dist/brands/<brandId>.json`. Snapshots are produced by OneUI CI via
 * `scripts/snapshot-brands.ts` (see deliverable C) and committed to dist
 * before publish.
 *
 * The functions are declared on the type-level in brand.ts; this file is the
 * canonical implementation. Consumers never import Convex directly.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { BrandFoundation } from '../types/brand';

const distBrandsDir = (): string => {
  // resolved relative to this file's runtime location after tsup compile
  // (`dist/index.{cjs,mjs}` → dist/brands/)
  return resolve(__dirname, 'brands');
};

const cache = new Map<string, BrandFoundation>();

export function getBrand(brandId: string): BrandFoundation {
  const cached = cache.get(brandId);
  if (cached) return cached;
  const path = join(distBrandsDir(), `${brandId}.json`);
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(
      `[@jds/kb-core] Brand "${brandId}" not found in this KB release. ` +
        `Inspect dist/brands/ for available brand slugs. (path=${path})`,
    );
  }
  const brand = JSON.parse(raw) as BrandFoundation;
  cache.set(brandId, brand);
  return brand;
}

export function listBrands(): readonly string[] {
  try {
    return readdirSync(distBrandsDir())
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.slice(0, -'.json'.length))
      .sort();
  } catch {
    return [];
  }
}

interface OneUiConfig {
  readonly brandId: string;
  readonly themeModifier?: readonly ('dark' | 'rtl' | 'highContrast')[];
  readonly sdkTarget?: 'web' | 'rn' | 'ios' | 'android' | 'flutter';
}

/**
 * Convention path: read `oneui.config.json` at the consumer project root, then
 * resolve via getBrand(). Set JDS_BRAND_OVERRIDE to force a specific brand
 * (e.g. for matrix builds in CI).
 */
export function resolveBrandFromConfig(cwd: string = process.cwd()): BrandFoundation {
  const override = process.env.JDS_BRAND_OVERRIDE;
  if (override) return getBrand(override);

  const configPath = join(cwd, 'oneui.config.json');
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf8');
  } catch {
    throw new Error(
      `[@jds/kb-core] oneui.config.json not found at ${configPath}. ` +
        `Create one with { "brandId": "<slug>" } or set JDS_BRAND_OVERRIDE.`,
    );
  }
  const cfg = JSON.parse(raw) as OneUiConfig;
  if (!cfg.brandId) {
    throw new Error('[@jds/kb-core] oneui.config.json is missing "brandId".');
  }
  return getBrand(cfg.brandId);
}
