/**
 * Offline brand registry for the OneUI Storybook.
 *
 * The default Jio snapshot (`DEFAULT_JIO_BRAND_DATA`) ships inside
 * `@oneui/ui-native`, so this app builds and runs with **zero Convex
 * dependency** — `pnpm install` + an emulator is all it takes.
 *
 * ─── Enabling the full multi-brand matrix (optional) ───────────────────────
 * To let designers switch across every Jio brand/variant in the toolbar:
 *   1. Generate the snapshots (needs a Convex URL in .env.local):
 *        pnpm -C ../native-sample export:brands
 *   2. Copy them into this app:
 *        cp -R ../native-sample/brand-data ./brand-data
 *        cp ../native-sample/src/brand-data/offlineBrandData.generated.ts \
 *           ./src/brand-data/offlineBrandData.generated.ts
 *   3. Flip USE_OFFLINE_SNAPSHOTS below to true and import from the generated
 *      module instead of the default-only registry.
 */
import { DEFAULT_JIO_BRAND_DATA, type BrandData } from '@oneui/ui-native/theme';

export interface BrandOption {
  brand: string;
  variant: string;
}

/** Brands offered in the toolbar. Baseline = the bundled Jio default. */
export const OFFLINE_BRANDS: ReadonlyArray<BrandOption> = [
  { brand: 'Jio', variant: 'base' },
];

/** Resolve a brand + variant to its `BrandData`, or `undefined` if unknown. */
export function getOfflineBrandData(
  brandName: string,
  variant = 'base',
): BrandData | undefined {
  if (brandName === 'Jio' && variant === 'base') {
    return DEFAULT_JIO_BRAND_DATA;
  }
  return undefined;
}
