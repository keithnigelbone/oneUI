/**
 * references.ts
 *
 * Reference UI Library — collections + screens CRUD.
 *
 * Designers upload Jio ecosystem screenshots (JioMart, JioCinema, MyJio…)
 * tagged by vertical + platform + archetype. The Design Composition Agent
 * resolves top-k references for each generation, sends the PNGs as vision
 * content blocks, and grounds its output in real visual precedent.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireUser, requirePlatformOwner, requireBrandRole, canReadBrand } from './lib/auth';

// ============================================
// Shared validators
// ============================================

const verticalValidator = v.union(
  v.literal('entertainment'),
  v.literal('e-commerce'),
  v.literal('finance'),
  v.literal('governance'),
  v.literal('farm'),
  v.literal('iot'),
  v.literal('telecom'),
  v.literal('mobility'),
  v.literal('health'),
  v.literal('general'),
);

const platformValidator = v.union(
  v.literal('mobile'),
  v.literal('web'),
  v.literal('tablet'),
  v.literal('tv'),
  v.literal('print'),
  v.literal('outdoor'),
);

const contextValidator = v.union(
  v.literal('mobile-app'),
  v.literal('web-app'),
  v.literal('marketing-page'),
  v.literal('social-post'),
  v.literal('print'),
  v.literal('outdoor'),
);

const screenStatusValidator = v.union(
  v.literal('draft'),
  v.literal('approved'),
  v.literal('archived'),
);

// ============================================
// Collections
// ============================================

export const listCollections = query({
  args: {
    vertical: v.optional(verticalValidator),
    brandId: v.optional(v.id('brands')),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rows = args.vertical
      ? await ctx.db
          .query('referenceCollections')
          .withIndex('by_vertical', (q) => q.eq('vertical', args.vertical!))
          .collect()
      : args.brandId
        ? await ctx.db
            .query('referenceCollections')
            .withIndex('by_brand', (q) => q.eq('brandId', args.brandId!))
            .collect()
        : await ctx.db.query('referenceCollections').collect();

    return args.includeArchived ? rows : rows.filter((r) => !r.isArchived);
  },
});

export const getCollection = query({
  args: { id: v.id('referenceCollections') },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);
    if (!collection) return null;
    // Read-scoped: brand-owned collections gate on brandId (authenticated
    // non-members get null; anonymous tooling passes). Global collections
    // (no brandId) stay public.
    if (collection.brandId && !(await canReadBrand(ctx, collection.brandId))) return null;
    return collection;
  },
});

export const createCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    vertical: verticalValidator,
    platform: platformValidator,
    brandId: v.optional(v.id('brands')),
    isBuiltIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.brandId) {
      await requireBrandRole(ctx, args.brandId, 'editor');
    } else {
      await requirePlatformOwner(ctx);
    }
    const now = Date.now();
    return ctx.db.insert('referenceCollections', {
      name: args.name,
      description: args.description,
      vertical: args.vertical,
      platform: args.platform,
      brandId: args.brandId,
      isBuiltIn: args.isBuiltIn ?? false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCollection = mutation({
  args: {
    id: v.id('referenceCollections'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    vertical: v.optional(verticalValidator),
    platform: v.optional(platformValidator),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);
    if (!collection) throw new Error('Reference collection not found');
    // Mirror createCollection's gate: a brand-scoped collection is managed by a
    // brand editor; a platform-wide (built-in) collection by the platform owner.
    // Without this, a brand editor could create collections they could never edit.
    if (collection.brandId) {
      await requireBrandRole(ctx, collection.brandId, 'editor');
    } else {
      await requirePlatformOwner(ctx);
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.vertical !== undefined) patch.vertical = args.vertical;
    if (args.platform !== undefined) patch.platform = args.platform;
    if (args.isArchived !== undefined) patch.isArchived = args.isArchived;
    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

export const deleteCollection = mutation({
  args: { id: v.id('referenceCollections') },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);
    if (!collection) throw new Error('Reference collection not found');
    // Same gate as updateCollection: brand-scoped → brand editor, else owner.
    if (collection.brandId) {
      await requireBrandRole(ctx, collection.brandId, 'editor');
    } else {
      await requirePlatformOwner(ctx);
    }
    // Cascade: archive all screens in this collection, then delete collection.
    const screens = await ctx.db
      .query('referenceScreens')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.id))
      .collect();
    for (const s of screens) {
      await ctx.db.patch(s._id, { status: 'archived', updatedAt: Date.now() });
    }
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Screens
// ============================================

export const listScreens = query({
  args: {
    collectionId: v.optional(v.id('referenceCollections')),
    archetype: v.optional(v.string()),
    context: v.optional(contextValidator),
    status: v.optional(screenStatusValidator),
  },
  handler: async (ctx, args) => {
    let rows;
    if (args.collectionId) {
      rows = await ctx.db
        .query('referenceScreens')
        .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId!))
        .collect();
    } else if (args.archetype) {
      rows = await ctx.db
        .query('referenceScreens')
        .withIndex('by_archetype', (q) => q.eq('archetype', args.archetype!))
        .collect();
    } else if (args.status) {
      rows = await ctx.db
        .query('referenceScreens')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect();
    } else {
      rows = await ctx.db.query('referenceScreens').collect();
    }
    if (args.context) rows = rows.filter((r) => r.context === args.context);
    if (args.status && !args.collectionId) rows = rows.filter((r) => r.status === args.status);
    return rows;
  },
});

export const getScreen = query({
  args: { id: v.id('referenceScreens') },
  handler: async (ctx, args) => {
    const screen = await ctx.db.get(args.id);
    if (!screen) return null;
    // Read-scoped: resolve screen→collection→brandId. Brand-owned collections
    // gate on brandId (authenticated non-members get null; anonymous tooling
    // passes). Screens in global collections (no brandId) stay public.
    const collection = await ctx.db.get(screen.collectionId);
    if (collection?.brandId && !(await canReadBrand(ctx, collection.brandId))) return null;
    return screen;
  },
});

export const createScreen = mutation({
  args: {
    collectionId: v.id('referenceCollections'),
    storageId: v.id('_storage'),
    thumbnailStorageId: v.optional(v.id('_storage')),
    mimeType: v.string(),
    fileSize: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    name: v.string(),
    archetype: v.string(),
    context: contextValidator,
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    addedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const now = Date.now();
    return ctx.db.insert('referenceScreens', {
      collectionId: args.collectionId,
      storageId: args.storageId,
      thumbnailStorageId: args.thumbnailStorageId,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      width: args.width,
      height: args.height,
      name: args.name,
      archetype: args.archetype,
      context: args.context,
      description: args.description,
      tags: args.tags,
      status: 'draft',
      version: 1,
      addedBy: args.addedBy,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateScreen = mutation({
  args: {
    id: v.id('referenceScreens'),
    name: v.optional(v.string()),
    archetype: v.optional(v.string()),
    context: v.optional(contextValidator),
    description: v.optional(v.string()),
    tokensObserved: v.optional(v.array(v.string())),
    attentionNotes: v.optional(v.string()),
    dosDonts: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    status: v.optional(screenStatusValidator),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const screen = await ctx.db.get(args.id);
    if (!screen) throw new Error('Reference screen not found');
    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
      version: screen.version + 1,
    };
    for (const key of [
      'name',
      'archetype',
      'context',
      'description',
      'tokensObserved',
      'attentionNotes',
      'dosDonts',
      'tags',
      'status',
    ] as const) {
      if (args[key] !== undefined) patch[key] = args[key];
    }
    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

export const deleteScreen = mutation({
  args: { id: v.id('referenceScreens') },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    // Remove dependent analyses + links first
    const analyses = await ctx.db
      .query('referenceAnalyses')
      .withIndex('by_screen', (q) => q.eq('screenId', args.id))
      .collect();
    for (const a of analyses) await ctx.db.delete(a._id);
    const links = await ctx.db
      .query('referenceLinks')
      .withIndex('by_screen', (q) => q.eq('screenId', args.id))
      .collect();
    for (const l of links) await ctx.db.delete(l._id);
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Storage helpers (signed upload URLs + URL resolution)
// ============================================

/** Mint a one-shot upload URL for the client to POST the image file to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Resolve a storageId to a download URL for client-side previewing. */
export const getStorageUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => ctx.storage.getUrl(args.storageId),
});

// ============================================
// Links
// ============================================

export const listLinks = query({
  args: {
    screenId: v.optional(v.id('referenceScreens')),
    targetType: v.optional(
      v.union(v.literal('rule'), v.literal('skill'), v.literal('scenario'), v.literal('feedback')),
    ),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.screenId) {
      return ctx.db
        .query('referenceLinks')
        .withIndex('by_screen', (q) => q.eq('screenId', args.screenId!))
        .collect();
    }
    if (args.targetType && args.targetId) {
      return ctx.db
        .query('referenceLinks')
        .withIndex('by_target', (q) =>
          q.eq('targetType', args.targetType!).eq('targetId', args.targetId!),
        )
        .collect();
    }
    return ctx.db.query('referenceLinks').collect();
  },
});

export const createLink = mutation({
  args: {
    screenId: v.id('referenceScreens'),
    targetType: v.union(
      v.literal('rule'),
      v.literal('skill'),
      v.literal('scenario'),
      v.literal('feedback'),
    ),
    targetId: v.string(),
    weight: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    return ctx.db.insert('referenceLinks', {
      screenId: args.screenId,
      targetType: args.targetType,
      targetId: args.targetId,
      weight: args.weight ?? 1,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

export const deleteLink = mutation({
  args: { id: v.id('referenceLinks') },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    await ctx.db.delete(args.id);
  },
});
