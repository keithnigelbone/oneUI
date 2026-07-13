/**
 * contextPacks.ts
 *
 * Cache for the public /api/agent/context-pack endpoint. Rows key off a
 * deterministic hash of (brandId, vertical, archetype, context, rulesHash,
 * refsHash). A TTL check in the route ignores rows older than 1h, giving
 * external MCP clients sub-200ms responses for repeated queries while still
 * picking up rule/reference edits within minutes.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole } from './lib/auth';

export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query('contextPackCache')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first(),
});

export const upsert = mutation({
  args: {
    key: v.string(),
    brandId: v.id('brands'),
    vertical: v.optional(v.string()),
    archetype: v.optional(v.string()),
    context: v.string(),
    compiledPrompt: v.string(),
    referenceScreenIds: v.array(v.id('referenceScreens')),
    skillIds: v.array(v.string()),
    citedTokens: v.optional(v.array(v.string())),
    promptSize: v.number(),
    rulesHash: v.string(),
    refsHash: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('contextPackCache')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        compiledPrompt: args.compiledPrompt,
        referenceScreenIds: args.referenceScreenIds,
        skillIds: args.skillIds,
        citedTokens: args.citedTokens,
        promptSize: args.promptSize,
        rulesHash: args.rulesHash,
        refsHash: args.refsHash,
        builtAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert('contextPackCache', {
      key: args.key,
      brandId: args.brandId,
      vertical: args.vertical,
      archetype: args.archetype,
      context: args.context,
      compiledPrompt: args.compiledPrompt,
      referenceScreenIds: args.referenceScreenIds,
      skillIds: args.skillIds,
      citedTokens: args.citedTokens,
      promptSize: args.promptSize,
      rulesHash: args.rulesHash,
      refsHash: args.refsHash,
      builtAt: now,
    });
  },
});

/** Invalidate every cached pack for a brand. Called when rules or references
 *  change meaningfully. Optional — the TTL + hash checks already make stale
 *  packs self-correcting. */
export const invalidateBrand = mutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const rows = await ctx.db
      .query('contextPackCache')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
    return rows.length;
  },
});
