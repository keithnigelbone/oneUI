/**
 * tokenOverrides.ts
 *
 * Convex queries and mutations for token override management
 * Allows brands to override token values from their base brand
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

/**
 * List all overrides for a brand
 */
export const listByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * Get overrides for a specific token
 */
export const listByToken = query({
  args: { tokenName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tokenOverrides')
      .withIndex('by_token', (q) => q.eq('tokenName', args.tokenName))
      .collect();
  },
});

/**
 * Create a token override
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    tokenName: v.string(),
    mode: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();

    return await ctx.db.insert('tokenOverrides', {
      brandId: args.brandId,
      tokenName: args.tokenName,
      mode: args.mode,
      value: args.value,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a token override
 */
export const update = mutation({
  args: {
    id: v.id('tokenOverrides'),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'tokenOverrides', args.id, 'editor');
    const override = await ctx.db.get(args.id);
    if (!override) throw new Error('Override not found');

    await ctx.db.patch(args.id, {
      value: args.value,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Remove a token override
 */
export const remove = mutation({
  args: { id: v.id('tokenOverrides') },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'tokenOverrides', args.id, 'editor');
    const override = await ctx.db.get(args.id);
    if (!override) throw new Error('Override not found');

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Remove all overrides for a brand
 */
export const removeAllForBrand = mutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const overrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    for (const override of overrides) {
      await ctx.db.delete(override._id);
    }

    return overrides.length;
  },
});
