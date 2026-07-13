/**
 * Ensure a brand + sub-brand exist in a React Native project's `oneui.brands.json`.
 *
 * Native shape (verified against shipped samples):
 *   {
 *     "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS/ReactNative",
 *     "brands": { "jio": { "subBrands": ["jiomart"] }, "tira": "latest" }
 *   }
 *
 * A brand entry is either a bare version string ("latest") or an object that may
 * carry `version` and `subBrands`. The sub-brand a user passes to figma_to_code is
 * the SAME value used for the `theme` prop of <OneUIBrandProvider> in generated
 * code, so it must be registered here (it drives `oneui-native-cdn prefetch`).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const BRANDS_CONFIG_FILENAME = 'oneui.brands.json';
const DEFAULT_NATIVE_CDN = 'https://myjiostatic.cdn.jio.com/JDS/ReactNative';

type NativeBrandEntry = string | { version?: string; subBrands?: string[]; [k: string]: unknown };
interface NativeBrandsConfig {
  cdnUrl?: string;
  brands?: Record<string, NativeBrandEntry>;
  [k: string]: unknown;
}

export interface EnsureBrandResult {
  ok: boolean;
  changed: boolean;
  created: boolean;
  path: string;
  message: string;
}

/**
 * Make sure `brand` exists in oneui.brands.json and lists `subBrand` under its
 * `subBrands`. Creates the file if missing; converts a bare-string entry to the
 * object form when a sub-brand must be added. Returns what (if anything) changed.
 */
export function ensureBrandSubBrand(projectRoot: string, brand: string, subBrand: string): EnsureBrandResult {
  const path = resolve(projectRoot, BRANDS_CONFIG_FILENAME);

  // Create from scratch when absent.
  if (!existsSync(path)) {
    const config: NativeBrandsConfig = {
      cdnUrl: DEFAULT_NATIVE_CDN,
      brands: { [brand]: { subBrands: [subBrand] } },
    };
    try {
      writeFileSync(path, JSON.stringify(config, null, 2) + '\n', 'utf8');
    } catch (err) {
      return { ok: false, changed: false, created: false, path, message: `Could not create ${BRANDS_CONFIG_FILENAME}: ${err instanceof Error ? err.message : String(err)}` };
    }
    return { ok: true, changed: true, created: true, path, message: `Created ${BRANDS_CONFIG_FILENAME} with brand "${brand}" → subBrand "${subBrand}".` };
  }

  // Update existing.
  let config: NativeBrandsConfig;
  try {
    config = JSON.parse(readFileSync(path, 'utf8')) as NativeBrandsConfig;
  } catch (err) {
    return { ok: false, changed: false, created: false, path, message: `Could not parse ${BRANDS_CONFIG_FILENAME}: ${err instanceof Error ? err.message : String(err)}` };
  }
  if (!config.brands || typeof config.brands !== 'object') config.brands = {};

  const entry = config.brands[brand];
  let changed = false;

  if (entry === undefined) {
    config.brands[brand] = { subBrands: [subBrand] };
    changed = true;
  } else if (typeof entry === 'string') {
    // Bare version string → object form, preserving a non-"latest" version.
    config.brands[brand] = entry === 'latest' ? { subBrands: [subBrand] } : { version: entry, subBrands: [subBrand] };
    changed = true;
  } else {
    const subBrands = Array.isArray(entry.subBrands) ? entry.subBrands : [];
    if (!subBrands.includes(subBrand)) {
      entry.subBrands = [...subBrands, subBrand];
      changed = true;
    }
  }

  if (!changed) {
    return { ok: true, changed: false, created: false, path, message: `brand "${brand}" already lists subBrand "${subBrand}" — no change.` };
  }
  try {
    writeFileSync(path, JSON.stringify(config, null, 2) + '\n', 'utf8');
  } catch (err) {
    return { ok: false, changed: false, created: false, path, message: `Could not write ${BRANDS_CONFIG_FILENAME}: ${err instanceof Error ? err.message : String(err)}` };
  }
  return { ok: true, changed: true, created: false, path, message: `Updated ${BRANDS_CONFIG_FILENAME}: brand "${brand}" now includes subBrand "${subBrand}".` };
}
