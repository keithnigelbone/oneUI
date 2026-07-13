/**
 * referenceAnalyses.ts
 *
 * LLM-extracted structural readouts for reference screens. Cached by
 * `inputHash = hash(storageId + modelVersion + promptVersion)` so the same
 * (image, model, prompt-version) tuple is never analysed twice.
 *
 * The API route `/api/reference/analyze` calls Claude vision with a structured
 * extraction prompt and writes the result here via `upsert`.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { requirePlatformOwner } from './lib/auth';

export const getByHash = query({
  args: { inputHash: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query('referenceAnalyses')
      .withIndex('by_inputHash', (q) => q.eq('inputHash', args.inputHash))
      .first(),
});

export const listByScreen = query({
  args: { screenId: v.id('referenceScreens') },
  handler: async (ctx, args) =>
    ctx.db
      .query('referenceAnalyses')
      .withIndex('by_screen', (q) => q.eq('screenId', args.screenId))
      .collect(),
});

export const latestForScreen = query({
  args: { screenId: v.id('referenceScreens') },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('referenceAnalyses')
      .withIndex('by_screen', (q) => q.eq('screenId', args.screenId))
      .collect();
    if (rows.length === 0) return null;
    return rows.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  },
});

export const upsert = mutation({
  args: {
    screenId: v.id('referenceScreens'),
    inputHash: v.string(),
    modelVersion: v.string(),
    promptVersion: v.string(),
    summary: v.string(),
    extractedPalette: v.optional(v.array(v.string())),
    extractedHierarchy: v.optional(v.string()),
    extractedComposition: v.optional(v.string()),
    extractedTypography: v.optional(v.string()),
    extractedSurfaces: v.optional(v.string()),
    extractedComponents: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const existing = await ctx.db
      .query('referenceAnalyses')
      .withIndex('by_inputHash', (q) => q.eq('inputHash', args.inputHash))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        summary: args.summary,
        extractedPalette: args.extractedPalette,
        extractedHierarchy: args.extractedHierarchy,
        extractedComposition: args.extractedComposition,
        extractedTypography: args.extractedTypography,
        extractedSurfaces: args.extractedSurfaces,
        extractedComponents: args.extractedComponents,
        updatedAt: now,
      });
      // Hybrid RAG (RFC 0002): freshly extracted analysis → re-embed so the
      // retrieval layer can see the new content. The action resolves
      // archetype/vertical/context from the parent screen + collection.
      await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedAnalysis, {
        id: existing._id,
      });
      return existing._id;
    }

    const newId = await ctx.db.insert('referenceAnalyses', {
      screenId: args.screenId,
      inputHash: args.inputHash,
      modelVersion: args.modelVersion,
      promptVersion: args.promptVersion,
      summary: args.summary,
      extractedPalette: args.extractedPalette,
      extractedHierarchy: args.extractedHierarchy,
      extractedComposition: args.extractedComposition,
      extractedTypography: args.extractedTypography,
      extractedSurfaces: args.extractedSurfaces,
      extractedComponents: args.extractedComponents,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedAnalysis, {
      id: newId,
    });
    return newId;
  },
});

export const remove = mutation({
  args: { id: v.id('referenceAnalyses') },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    await ctx.db.delete(args.id);
  },
});

/** Human-authored edit of an analysis summary. Used when a designer refines
 *  Claude's output — kept as a patch so we don't lose the structured fields. */
export const patchSummary = mutation({
  args: {
    id: v.id('referenceAnalyses'),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    await ctx.db.patch(args.id, {
      summary: args.summary,
      updatedAt: Date.now(),
    });
    // Designer edited the summary — content drifted, re-embed.
    await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedAnalysis, {
      id: args.id,
    });
  },
});

/** Remove all analyses for a screen and revert it to draft. Used when a
 *  reference becomes visually outdated — designer wipes the cached analysis
 *  and re-runs it, or removes it entirely so the resolver stops using it. */
export const clearForScreen = mutation({
  args: {
    screenId: v.id('referenceScreens'),
    revertToDraft: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const rows = await ctx.db
      .query('referenceAnalyses')
      .withIndex('by_screen', (q) => q.eq('screenId', args.screenId))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);

    if (args.revertToDraft ?? true) {
      const screen = await ctx.db.get(args.screenId);
      if (screen && screen.status === 'approved') {
        await ctx.db.patch(args.screenId, {
          status: 'draft',
          updatedAt: Date.now(),
        });
      }
    }
    return rows.length;
  },
});
