/**
 * brandCSSCache.ts
 *
 * Server-side brand CSS cache management. Stores precomputed CSS
 * so clients can use it as a fast path without recomputing.
 *
 * Flow:
 * 1. Client writes foundation/appearance changes via mutations
 * 2. Cache is invalidated (deleted) for the affected brand
 * 3. Server-side precompute action is scheduled to repopulate cache
 * 4. Client reads cached CSS on next load → skips local computation
 * 4. Next page load: client reads cached CSS first, skips computation if fresh
 *
 * All writes are server-side: mutations invalidate via `invalidateInternal`,
 * which schedules `brandCSSPrecompute.precompute` to repopulate via
 * `putInternal`. There are deliberately no public write entry points —
 * clients only read.
 */

import { query, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

// ============================================================================
// Queries
// ============================================================================

/**
 * Get cached CSS for a brand + theme.
 * Returns null if no cache exists or cache is stale.
 */
export const get = query({
  args: {
    brandId: v.id('brands'),
    theme: v.union(v.literal('light'), v.literal('dark')),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('brandCSSCache')
      .withIndex('by_brand_theme', (q) =>
        q.eq('brandId', args.brandId).eq('theme', args.theme)
      )
      .first();
  },
});

/**
 * Get all cached entries for a brand (both themes).
 */
export const getByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('brandCSSCache')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

// ============================================================================
// Mutations (internal-only — no public write entry points)
// ============================================================================

/**
 * Internal mutation for storing precomputed CSS — called from brandCSSPrecompute action.
 */
export const putInternal = internalMutation({
  args: {
    brandId: v.id('brands'),
    theme: v.union(v.literal('light'), v.literal('dark')),
    rawCSS: v.string(),
    contextCSS: v.optional(v.string()),
    tokenCount: v.number(),
    algorithmVersion: v.number(),
    inputHash: v.string(),
    isValid: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('brandCSSCache')
      .withIndex('by_brand_theme', (q) =>
        q.eq('brandId', args.brandId).eq('theme', args.theme)
      )
      .first();

    const now = Date.now();
    const data = {
      brandId: args.brandId,
      theme: args.theme,
      rawCSS: args.rawCSS,
      contextCSS: args.contextCSS ?? undefined,
      cssSize: new TextEncoder().encode(args.rawCSS + (args.contextCSS ?? '')).length,
      tokenCount: args.tokenCount,
      algorithmVersion: args.algorithmVersion,
      inputHash: args.inputHash,
      isValid: args.isValid,
      computedAt: now,
    };

    if (existing) {
      await ctx.db.replace(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert('brandCSSCache', data);
    }
  },
});

/**
 * Internal mutation for cache invalidation — called from other mutations
 * (foundations.update, appearanceConfigs.upsert) without client involvement.
 * After clearing the cache, schedules server-side precomputation to repopulate.
 */
export const invalidateInternal = internalMutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query('brandCSSCache')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // Schedule server-side precomputation (runs asynchronously)
    await ctx.scheduler.runAfter(0, internal.brandCSSPrecompute.precompute, {
      brandId: args.brandId,
    });

    return entries.length;
  },
});
