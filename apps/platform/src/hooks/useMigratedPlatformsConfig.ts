/**
 * useMigratedPlatformsConfig.ts
 *
 * Shared helper that extracts the `platforms` foundation config from a
 * Convex foundation-data object, runs `migrateLegacyPlatformsConfig()` on it,
 * and memoizes the result. Used by every component-preview page (Button,
 * Icon, Chip, Switch, etc.) and by the Density & Platforms editor page.
 *
 * Previously every page had its own inline `useMemo` block that looked
 * roughly like:
 *
 *   const platformsConfig = useMemo<PlatformsFoundationConfig>(() => {
 *     const config = (foundationData as { platforms?: { config?: PlatformsFoundationConfig } } | null)
 *       ?.platforms?.config;
 *     if (config && config.platforms) return migrateLegacyPlatformsConfig(config);
 *     return buildDefaultPlatformsConfig();
 *   }, [foundationData]);
 *
 * The duplication meant a `foundationData` shape change or a missing
 * migrator call had to be fixed in 18 places. This hook centralizes it,
 * types the shape boundary cleanly, and guarantees every consumer runs the
 * migrator. No component logic changes — pages call
 * `useMigratedPlatformsConfig(foundationData)` instead of the inline useMemo.
 */

import { useMemo } from 'react';
import {
  buildDefaultPlatformsConfig,
  migrateLegacyPlatformsConfig,
  type PlatformsFoundationConfig,
} from '@oneui/shared';

/**
 * Narrow shape we extract from the Convex foundation-data object. Typed as
 * the minimum surface the hook actually reads, so changes to other foundation
 * fields don't ripple into this hook.
 */
interface FoundationDataShape {
  platforms?: {
    config?: PlatformsFoundationConfig;
  };
}

/**
 * Extract + migrate the platforms foundation config from Convex foundation
 * data, with a safe fallback to `buildDefaultPlatformsConfig()` when the
 * data isn't available yet.
 *
 * @param foundationData  The object returned by `useFoundationData()` /
 *                        `getBrandOverviewData` query. May be `null` /
 *                        `undefined` during initial load.
 * @returns               A fully-migrated `PlatformsFoundationConfig`.
 *                        Stable reference as long as the underlying
 *                        `foundationData?.platforms?.config` doesn't change.
 */
export function useMigratedPlatformsConfig(
  foundationData: unknown,
): PlatformsFoundationConfig {
  return useMemo<PlatformsFoundationConfig>(() => {
    const config = (foundationData as FoundationDataShape | null | undefined)
      ?.platforms?.config;
    if (config && Array.isArray(config.platforms)) {
      return migrateLegacyPlatformsConfig(config);
    }
    return buildDefaultPlatformsConfig();
  }, [foundationData]);
}
