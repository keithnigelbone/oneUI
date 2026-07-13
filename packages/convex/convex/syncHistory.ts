/**
 * syncHistory.ts
 *
 * Convex queries for sync history tracking
 */

import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * List sync history for a brand
 */
export const listByBrand = query({
  args: {
    brandId: v.id('brands'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('syncHistory')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .order('desc')
      .take(args.limit || 50);
  },
});

/**
 * Get the latest sync for a brand
 */
export const getLatest = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('syncHistory')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .order('desc')
      .first();
  },
});
