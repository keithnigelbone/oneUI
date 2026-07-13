/**
 * compositions.ts
 *
 * Convex queries and mutations for canvas compositions.
 * CRUD operations for saved component compositions from the experience builder.
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

/** List all compositions for a brand */
export const listByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, { brandId }) => {
    if (!(await canReadBrand(ctx, brandId))) return [];
    return ctx.db
      .query('compositions')
      .withIndex('by_brand', (q) => q.eq('brandId', brandId))
      .order('desc')
      .collect();
  },
});

/** Get a single composition by ID */
export const get = query({
  args: { id: v.id('compositions') },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return doc;
  },
});

/** Create a new composition */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    ast: v.string(),
    tldrawSnapshot: v.optional(v.string()),
    generatedCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return ctx.db.insert('compositions', {
      ...args,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update a composition's AST and snapshot */
export const update = mutation({
  args: {
    id: v.id('compositions'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    ast: v.optional(v.string()),
    tldrawSnapshot: v.optional(v.string()),
    generatedCode: v.optional(v.string()),
    status: v.optional(v.union(v.literal('draft'), v.literal('published'))),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireBrandRoleForDoc(ctx, 'compositions', id, 'editor');
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Composition not found');

    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );

    await ctx.db.patch(id, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

/** Delete a composition */
export const remove = mutation({
  args: { id: v.id('compositions') },
  handler: async (ctx, { id }) => {
    await requireBrandRoleForDoc(ctx, 'compositions', id, 'editor');
    await ctx.db.delete(id);
  },
});
