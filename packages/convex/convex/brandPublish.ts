/**
 * brandPublish.ts
 *
 * Publication management for brand CSS. Creates immutable snapshots of
 * brand CSS for external consumption (CDN, build pipelines, etc.).
 *
 * Each publication captures:
 * - Full CSS for both themes (wrapped in @layer brand)
 * - Algorithm version and input hash for change detection
 * - Semantic version for consumer tracking
 */

import { query, mutation, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { requireBrandRole } from './lib/auth';

/**
 * List all publications for a brand, most recent first.
 */
export const list = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const publications = await ctx.db
      .query('brandPublications')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    // Sort by publishedAt descending
    return publications.sort((a, b) => b.publishedAt - a.publishedAt);
  },
});

/**
 * Get the latest publication for a brand.
 */
export const getLatest = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const publications = await ctx.db
      .query('brandPublications')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    if (publications.length === 0) return null;

    return publications.sort((a, b) => b.publishedAt - a.publishedAt)[0];
  },
});

/**
 * Get a specific publication by brand + version.
 */
export const getByVersion = query({
  args: {
    brandId: v.id('brands'),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('brandPublications')
      .withIndex('by_brand_version', (q) =>
        q.eq('brandId', args.brandId).eq('version', args.version)
      )
      .first();
  },
});

/**
 * Publish brand CSS as a new version.
 * Takes CSS from the cache (or computes fresh) and stores as an immutable snapshot.
 */
export const publish = mutation({
  args: {
    brandId: v.id('brands'),
    version: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    // Check for duplicate version
    const existing = await ctx.db
      .query('brandPublications')
      .withIndex('by_brand_version', (q) =>
        q.eq('brandId', args.brandId).eq('version', args.version)
      )
      .first();

    if (existing) {
      throw new Error(`Version ${args.version} already exists for this brand.`);
    }

    // Schedule the export action to do the heavy lifting
    await ctx.scheduler.runAfter(0, internal.brandCSSExport.exportAndPublish, {
      brandId: args.brandId,
      version: args.version,
      notes: args.notes,
    });

    return { status: 'scheduled', version: args.version };
  },
});

/**
 * Internal mutation to store a publication (called from export action).
 */
export const createPublication = internalMutation({
  args: {
    brandId: v.id('brands'),
    version: v.string(),
    lightCSS: v.string(),
    darkCSS: v.string(),
    algorithmVersion: v.number(),
    inputHash: v.string(),
    tokenCount: v.number(),
    cssSize: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('brandPublications', {
      ...args,
      publishedAt: Date.now(),
    });
  },
});
