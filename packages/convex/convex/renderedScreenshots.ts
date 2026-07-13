/**
 * renderedScreenshots.ts
 *
 * Storage-backed records of Playwright-captured screenshots taken after
 * a composition is generated. Rows link the screenshot blob (in Convex
 * _storage) to the AST hash that produced it and to the reference screens
 * it was compared against. The visual-verification loop reads/writes here.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireUser, requirePlatformOwner } from './lib/auth';

export const getByAstHash = query({
  args: { astHash: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query('renderedScreenshots')
      .withIndex('by_astHash', (q) => q.eq('astHash', args.astHash))
      .collect(),
});

export const listByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) =>
    ctx.db
      .query('renderedScreenshots')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect(),
});

export const create = mutation({
  args: {
    brandId: v.optional(v.id('brands')),
    astHash: v.string(),
    storageId: v.id('_storage'),
    viewport: v.string(),
    context: v.string(),
    referenceScreenIds: v.optional(v.array(v.id('referenceScreens'))),
    visualAlignment: v.optional(
      v.object({
        overall: v.number(),
        dimensions: v.any(),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return ctx.db.insert('renderedScreenshots', {
      brandId: args.brandId,
      astHash: args.astHash,
      storageId: args.storageId,
      viewport: args.viewport,
      context: args.context,
      referenceScreenIds: args.referenceScreenIds,
      visualAlignment: args.visualAlignment,
      createdAt: Date.now(),
    });
  },
});

export const attachVisualAlignment = mutation({
  args: {
    id: v.id('renderedScreenshots'),
    visualAlignment: v.object({
      overall: v.number(),
      dimensions: v.any(),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    await ctx.db.patch(args.id, { visualAlignment: args.visualAlignment });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});
