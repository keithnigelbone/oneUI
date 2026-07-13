/**
 * brandCSSExport.ts
 *
 * Server-side CSS export action. Computes brand CSS for both themes,
 * wraps in @layer brand selector, and stores as an immutable publication.
 *
 * Used by the "Publish to CDN" flow in brand settings.
 */

import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import {
  mergeMaterialConfigWithFoundationConfig,
  precomputeBrandCSSNew,
  wrapCSSForInjection,
} from '@oneui/shared/engine';

const ALGORITHM_VERSION = 5;

/**
 * Compute CSS for both themes, wrap for global injection, and store as publication.
 */
export const exportAndPublish = internalAction({
  args: {
    brandId: v.id('brands'),
    version: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch brand foundation data
    const foundationData = await ctx.runQuery(
      internal.foundations.getBrandOverviewDataInternal,
      { brandId: args.brandId }
    );

    if (!foundationData) {
      throw new Error('Brand foundation data not found');
    }

    // 2. Build precompute input
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
    };

    // 3. Compute CSS for both themes
    const lightResult = precomputeBrandCSSNew(input, 'light');
    const darkResult = precomputeBrandCSSNew(input, 'dark');

    // 4. Wrap CSS for global injection (@layer brand { :root { ... } })
    // Pass contextCSS as additionalBlocks so [data-surface] blocks are
    // included inside @layer brand alongside the root declarations.
    const lightCSS = lightResult.rawCSS
      ? wrapCSSForInjection(lightResult.rawCSS, 'global', lightResult.contextCSS)
      : '';
    const darkCSS = darkResult.rawCSS
      ? wrapCSSForInjection(darkResult.rawCSS, 'global', darkResult.contextCSS)
      : '';

    const totalSize = new TextEncoder().encode(lightCSS + darkCSS).length;

    // 5. Store as publication
    await ctx.runMutation(internal.brandPublish.createPublication, {
      brandId: args.brandId,
      version: args.version,
      lightCSS,
      darkCSS,
      algorithmVersion: ALGORITHM_VERSION,
      inputHash: lightResult.inputHash,
      tokenCount: lightResult.tokenCount,
      cssSize: totalSize,
      notes: args.notes,
    });
  },
});
