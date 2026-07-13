/**
 * voicePublish.ts
 *
 * Voice publication pipeline — creates immutable snapshots of compiled
 * voice configurations for consumption by product teams via SDK.
 *
 * Follows the same pattern as brandPublish.ts + brandCSSExport.ts.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole } from './lib/auth';

/**
 * Get the latest published voice config for a brand
 */
export const getLatest = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const publications = await ctx.db
      .query('voicePublications')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    if (publications.length === 0) return null;

    // Sort by publishedAt descending, return latest
    return publications.sort((a, b) => b.publishedAt - a.publishedAt)[0];
  },
});

/**
 * Get a specific published version
 */
export const getByVersion = query({
  args: {
    brandId: v.id('brands'),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('voicePublications')
      .withIndex('by_brand_version', (q) =>
        q.eq('brandId', args.brandId).eq('version', args.version)
      )
      .first();
  },
});

/**
 * List all publications for a brand
 */
export const list = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const publications = await ctx.db
      .query('voicePublications')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    return publications.sort((a, b) => b.publishedAt - a.publishedAt);
  },
});

/**
 * Publish a voice configuration snapshot.
 * Creates an immutable record of compiled prompts per channel.
 */
export const publish = mutation({
  args: {
    brandId: v.id('brands'),
    version: v.string(),
    // All prompt keys are optional. A publication should carry at least one
    // compiled prompt — either the legacy `default` key, or one or more of
    // the four context-keyed prompts (conversational/copy/microcopy/editorial),
    // optionally supplemented by per-channel variants.
    compiledPrompts: v.object({
      default: v.optional(v.string()),
      // Context-keyed prompts (new — surface-aware compilation)
      conversational: v.optional(v.string()),
      copy: v.optional(v.string()),
      microcopy: v.optional(v.string()),
      editorial: v.optional(v.string()),
      // Channel-keyed prompts (legacy — conversational × channel constraint)
      sms: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
      app: v.optional(v.string()),
      ivr: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    skills: v.array(v.object({
      skillId: v.string(),
      name: v.string(),
      systemPromptTemplate: v.string(),
      inputSchema: v.optional(v.any()),
      outputSchema: v.optional(v.any()),
    })),
    voiceConfigSnapshot: v.any(),
    toneGuardRules: v.object({
      forbiddenWords: v.array(v.string()),
      spellingConvention: v.string(),
      useEmojis: v.boolean(),
      allowedEmojis: v.optional(v.array(v.string())),
    }),
    rulesHash: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    // Check for duplicate version
    const existing = await ctx.db
      .query('voicePublications')
      .withIndex('by_brand_version', (q) =>
        q.eq('brandId', args.brandId).eq('version', args.version)
      )
      .first();

    if (existing) {
      throw new Error(`Version ${args.version} already exists for this brand`);
    }

    const now = Date.now();

    const id = await ctx.db.insert('voicePublications', {
      brandId: args.brandId,
      version: args.version,
      compiledPrompts: args.compiledPrompts,
      skills: args.skills,
      voiceConfigSnapshot: args.voiceConfigSnapshot,
      toneGuardRules: args.toneGuardRules,
      rulesHash: args.rulesHash,
      notes: args.notes,
      publishedAt: now,
    });

    return id;
  },
});
