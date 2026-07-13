/**
 * componentRecipeSelections.ts
 *
 * Convex functions for persisting recipe selections per brand+component.
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { requireBrandRole, canReadBrand } from './lib/auth';

/**
 * Get recipe selections for a brand and component.
 */
export const getRecipeSelections = query({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, { brandId, componentName }) => {
    if (!(await canReadBrand(ctx, brandId))) return null;
    const result = await ctx.db
      .query('componentRecipeSelections')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName)
      )
      .first();

    return result ?? null;
  },
});

/**
 * Insert or update recipe selections for a brand and component.
 */
export const upsertRecipeSelections = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
    selections: v.any(),
  },
  handler: async (ctx, { brandId, componentName, selections }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const existing = await ctx.db
      .query('componentRecipeSelections')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        selections,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert('componentRecipeSelections', {
      brandId,
      componentName,
      selections,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete the recipe selections row for a brand and component.
 *
 * Reset semantics: deleting the row (rather than writing all-default
 * selections) returns the component to the inert factory state and keeps
 * "has customizations" trivially queryable.
 */
export const deleteRecipeSelections = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, { brandId, componentName }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const existing = await ctx.db
      .query('componentRecipeSelections')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});
