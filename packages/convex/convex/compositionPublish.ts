/**
 * compositionPublish.ts
 *
 * Publish immutable snapshots of composition configuration for SDK consumption.
 * Mirrors voicePublish.ts pattern.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole } from './lib/auth';

// ============================================
// Queries
// ============================================

export const getLatest = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const publications = await ctx.db
      .query('compositionPublications')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .order('desc')
      .take(1);
    return publications[0] ?? null;
  },
});

export const list = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('compositionPublications')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .order('desc')
      .take(20);
  },
});

// ============================================
// Mutations
// ============================================

export const publish = mutation({
  args: {
    brandId: v.id('brands'),
    version: v.string(),
    compiledPrompts: v.object({
      mobileApp: v.optional(v.string()),
      webApp: v.optional(v.string()),
      marketingPage: v.optional(v.string()),
      socialPost: v.optional(v.string()),
      print: v.optional(v.string()),
      outdoor: v.optional(v.string()),
    }),
    skills: v.array(v.object({
      skillId: v.string(),
      name: v.string(),
      systemPromptTemplate: v.string(),
      applicableContexts: v.array(v.string()),
    })),
    configSnapshot: v.any(),
    rulesHash: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    // Check for duplicate version
    const existing = await ctx.db
      .query('compositionPublications')
      .withIndex('by_brand_version', (q) =>
        q.eq('brandId', args.brandId).eq('version', args.version))
      .first();

    if (existing) {
      throw new Error(`Version ${args.version} already published for this brand`);
    }

    return await ctx.db.insert('compositionPublications', {
      brandId: args.brandId,
      version: args.version,
      compiledPrompts: args.compiledPrompts,
      skills: args.skills,
      configSnapshot: args.configSnapshot,
      validatorVersion: '1.0.0',
      rulesHash: args.rulesHash,
      notes: args.notes,
      publishedAt: Date.now(),
    });
  },
});
