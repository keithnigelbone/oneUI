/**
 * brandCSSPrecompute.ts
 *
 * Server-side brand CSS precomputation. Triggered after foundation/appearance
 * mutations to populate the brandCSSCache table, so clients can skip
 * local computation on subsequent page loads.
 *
 * Flow:
 * 1. Foundation mutation fires → cache invalidated
 * 2. This action is scheduled → reads brand data → computes CSS
 * 3. Computed CSS stored in brandCSSCache
 * 4. Client reads cache on next load → skips useBrandCSS computation
 */

import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import {
  mergeMaterialConfigWithFoundationConfig,
  precomputeBrandCSSNew,
} from '@oneui/shared/engine';

// v6: component theme taxonomy v2 (selection/navigation families), precision
// custom shape/scale decisions, and per-level attention styles — bumped so
// cached brand CSS regenerates under the new resolver logic.
const ALGORITHM_VERSION = 6;

/**
 * Precompute brand CSS for both themes and store in cache.
 * Called as an internal action after cache invalidation.
 */
export const precompute = internalAction({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    // 1. Fetch brand foundation data (reuses the same query as the client)
    const foundationData = await ctx.runQuery(
      internal.foundations.getBrandOverviewDataInternal,
      { brandId: args.brandId }
    );

    if (!foundationData) return;

    // 2. Build precompute input from foundation data
    const input = {
      colorConfig: foundationData.color?.config ?? null,
      presetSelection: foundationData.presetSelection ?? null,
      appearanceConfig: foundationData.appearanceConfig ?? null,
      typographyConfig: foundationData.typography?.config ?? null,
      motionConfig: foundationData.motion?.config ?? null,
      elevationConfig: foundationData.elevation?.config ?? null,
      gridConfig: foundationData.grid?.config ?? null,
      platformsConfig: foundationData.platforms?.config ?? null,
      materialConfig: mergeMaterialConfigWithFoundationConfig(
        foundationData.materialConfig ?? null,
        foundationData.materials?.config ?? null,
      ) as Record<string, unknown> | null,
      customFonts: foundationData.customFonts ?? undefined,
      // No font resolver on server — font family strings will be used as-is
      // from fontSelection. The client-side useBrandCSS hook resolves font IDs
      // to CSS font-family strings via the font registry.
    };

    // 3. Compute CSS for both themes
    for (const theme of ['light', 'dark'] as const) {
      const result = precomputeBrandCSSNew(input, theme);

      if (!result.rawCSS) continue;

      // 4. Store in cache
      await ctx.runMutation(internal.brandCSSCache.putInternal, {
        brandId: args.brandId,
        theme,
        rawCSS: result.rawCSS,
        contextCSS: result.contextCSS ?? '',
        tokenCount: result.tokenCount,
        algorithmVersion: ALGORITHM_VERSION,
        inputHash: result.inputHash,
        isValid: result.isValid,
      });
    }
  },
});
