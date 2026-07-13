/**
 * Create — reusable artboard templates.
 *
 * A template is a brand-scoped artboard saved with three artefacts:
 *   - tldrawSnapshot — what the canvas re-hydrates when editing
 *   - ast — the OneUI Component AST the start-here LLM clones
 *   - capturedImageStorageId — the PNG thumbnail for the list-page card
 *
 * Templates mirror the createAssets shape so the same canvas + capture
 * pipeline edits either kind; the only structural difference is that a
 * template has no parent project.
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { requireBrandRole, requireBrandRoleForDoc, requireUser, canReadBrand } from './lib/auth';

const platformUnion = v.union(
  v.literal('instagram'),
  v.literal('facebook'),
  v.literal('youtube'),
  v.literal('tiktok'),
  v.literal('linkedin'),
  v.literal('twitter')
);

const statusUnion = v.union(
  v.literal('draft'),
  v.literal('capturing'),
  v.literal('ready'),
  v.literal('error')
);

/**
 * List every template for a brand. Optionally filter by platform — used
 * server-side to keep the LLM's TEMPLATES prompt block scoped to the
 * dimensions the user's project actually targets.
 *
 * Returns each row with `capturedImageUrl` resolved (storage blob → URL),
 * so the cards can `<img src={…} />` directly without a second round-trip.
 */
export const list = query({
  args: {
    brandId: v.id('brands'),
    platform: v.optional(platformUnion),
  },
  handler: async (ctx, { brandId, platform }) => {
    if (!(await canReadBrand(ctx, brandId))) return [];
    const rows = platform
      ? await ctx.db
          .query('createTemplates')
          .withIndex('by_brand_platform', (q) => q.eq('brandId', brandId).eq('platform', platform))
          .collect()
      : await ctx.db
          .query('createTemplates')
          .withIndex('by_brand', (q) => q.eq('brandId', brandId))
          .collect();
    return Promise.all(
      rows.map(async (r) => ({
        ...r,
        capturedImageUrl: r.capturedImageStorageId
          ? await ctx.storage.getUrl(r.capturedImageStorageId)
          : null,
      })),
    );
  },
});

export const get = query({
  args: { templateId: v.id('createTemplates') },
  handler: async (ctx, { templateId }) => {
    const row = await ctx.db.get(templateId);
    if (!row) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, row.brandId))) return null;
    const capturedImageUrl = row.capturedImageStorageId
      ? await ctx.storage.getUrl(row.capturedImageStorageId)
      : null;
    return { ...row, capturedImageUrl };
  },
});

export const create = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    platform: platformUnion,
    dimensionName: v.string(),
    width: v.number(),
    height: v.number(),
    category: v.string(),
    /** Optional seed when forking an existing artboard via "Save as template". */
    ast: v.optional(v.any()),
    tldrawSnapshot: v.optional(v.string()),
    contentBlockData: v.optional(v.any()),
    ribbonData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return ctx.db.insert('createTemplates', {
      ...args,
      status: args.tldrawSnapshot ? 'ready' : 'draft',
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    templateId: v.id('createTemplates'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    ast: v.optional(v.any()),
    tldrawSnapshot: v.optional(v.string()),
    contentBlockData: v.optional(v.any()),
    ribbonData: v.optional(v.any()),
    capturedImageStorageId: v.optional(v.id('_storage')),
    status: v.optional(statusUnion),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { templateId, ...fields }) => {
    await requireBrandRoleForDoc(ctx, 'createTemplates', templateId, 'editor');
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(templateId, updates);
  },
});

export const remove = mutation({
  args: { templateId: v.id('createTemplates') },
  handler: async (ctx, { templateId }) => {
    await requireBrandRoleForDoc(ctx, 'createTemplates', templateId, 'editor');
    const row = await ctx.db.get(templateId);
    if (row?.capturedImageStorageId) {
      await ctx.storage.delete(row.capturedImageStorageId);
    }
    await ctx.db.delete(templateId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});
