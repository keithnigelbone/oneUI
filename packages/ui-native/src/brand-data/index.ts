/**
 * Default offline Jio brand snapshot for apps that do not fetch Convex data.
 *
 * Regenerate from `apps/native-sample/brand-data/Jio/base.json`:
 *   pnpm --filter @oneui/ui-native run generate:default-brand
 */

import type { BrandData } from '../theme/OneUIBrandProvider';
import defaultJioBrandDataJson from './defaultJioBrandData.json';

/** Trimmed Jio `BrandData` used when `OneUIBrandProvider` receives no `brandData`. */
export const DEFAULT_JIO_BRAND_DATA: BrandData =
  defaultJioBrandDataJson as BrandData;
