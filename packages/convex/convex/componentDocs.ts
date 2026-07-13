/**
 * componentDocs.ts
 *
 * Convex API for machine-readable component documentation overrides.
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireBrandRole } from './lib/auth';

function deepMerge<T extends Record<string, any>>(base: T, patch: Partial<T>): T {
  const out: Record<string, any> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === 'object' &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

export const getOverride = query({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, { brandId, componentName }) => {
    const entry = await ctx.db
      .query('componentDocOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName),
      )
      .first();
    return entry ?? null;
  },
});

export const upsertOverride = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
    override: v.any(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, { brandId, componentName, override, updatedBy }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const existing = await ctx.db
      .query('componentDocOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        override,
        updatedAt: Date.now(),
        updatedBy,
      });
      return existing._id;
    }

    return ctx.db.insert('componentDocOverrides', {
      brandId,
      componentName,
      override,
      updatedAt: Date.now(),
      updatedBy,
    });
  },
});

export const listOverrides = query({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, { brandId }) => {
    return ctx.db
      .query('componentDocOverrides')
      .withIndex('by_brand_component', (q) => q.eq('brandId', brandId))
      .collect();
  },
});

export const deleteOverride = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, { brandId, componentName }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const existing = await ctx.db
      .query('componentDocOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getResolvedDocumentation = query({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
    baseline: v.any(),
  },
  handler: async (ctx, { brandId, componentName, baseline }) => {
    const overrideEntry = await ctx.db
      .query('componentDocOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName),
      )
      .first();

    if (!overrideEntry) {
      return {
        documentation: baseline,
        source: 'baseline',
      };
    }

    return {
      documentation: deepMerge(baseline, overrideEntry.override ?? {}),
      source: 'merged',
      updatedAt: overrideEntry.updatedAt,
      updatedBy: overrideEntry.updatedBy ?? null,
    };
  },
});
