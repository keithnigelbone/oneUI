/**
 * Create section — project CRUD, assets, media, chat (design-system marketing builder)
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { requireBrandRole, requireBrandRoleForDoc, requireBrandRoleForDocIfExists, requireUser, canReadBrand } from './lib/auth';

const platformUnion = v.union(
  v.literal('instagram'),
  v.literal('facebook'),
  v.literal('youtube'),
  v.literal('tiktok'),
  v.literal('linkedin'),
  v.literal('twitter')
);

const imageSlotShape = v.object({
  id: v.string(),
  prompt: v.string(),
  storageId: v.optional(v.id('_storage')),
  imageUrl: v.optional(v.string()),
  mimeType: v.optional(v.string()),
  status: v.union(
    v.literal('pending'),
    v.literal('generating'),
    v.literal('ready'),
    v.literal('error')
  ),
  error: v.optional(v.string()),
});

export const list = query({
  args: {
    brandId: v.id('brands'),
    type: v.optional(v.union(v.literal('single'), v.literal('campaign'))),
  },
  handler: async (ctx, { brandId, type }) => {
    if (!(await canReadBrand(ctx, brandId))) return [];
    if (type) {
      const projects = await ctx.db
        .query('createProjects')
        .withIndex('by_brand_type', (q) => q.eq('brandId', brandId).eq('type', type))
        .collect();
      return Promise.all(
        projects.map(async (p) => {
          const assets = await ctx.db
            .query('createAssets')
            .withIndex('by_project', (q) => q.eq('projectId', p._id))
            .collect();
          return { ...p, assetCount: assets.length };
        })
      );
    }
    const projects = await ctx.db
      .query('createProjects')
      .withIndex('by_brand', (q) => q.eq('brandId', brandId))
      .collect();
    return Promise.all(
      projects.map(async (p) => {
        const assets = await ctx.db
          .query('createAssets')
          .withIndex('by_project', (q) => q.eq('projectId', p._id))
          .collect();
        return { ...p, assetCount: assets.length };
      })
    );
  },
});

export const get = query({
  args: { projectId: v.id('createProjects') },
  handler: async (ctx, { projectId }) => {
    const doc = await ctx.db.get(projectId);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return doc;
  },
});

export const create = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('single'), v.literal('campaign')),
    platforms: v.array(platformUnion),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    brief: v.optional(v.string()),
    assetType: v.optional(v.union(v.literal('social-post'), v.literal('ad-banner'), v.literal('story-reel'))),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return ctx.db.insert('createProjects', {
      ...args,
      status: 'draft',
      setupComplete: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id('createProjects'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('archived')
      )
    ),
    type: v.optional(v.union(v.literal('single'), v.literal('campaign'))),
    platforms: v.optional(v.array(platformUnion)),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    brief: v.optional(v.string()),
    assetType: v.optional(v.union(v.literal('social-post'), v.literal('ad-banner'), v.literal('story-reel'))),
  },
  handler: async (ctx, { projectId, ...fields }) => {
    await requireBrandRoleForDoc(ctx, 'createProjects', projectId, 'editor');
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(projectId, updates);
  },
});

export const remove = mutation({
  args: { projectId: v.id('createProjects') },
  handler: async (ctx, { projectId }) => {
    await requireBrandRoleForDoc(ctx, 'createProjects', projectId, 'editor');
    const assets = await ctx.db
      .query('createAssets')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();
    for (const asset of assets) {
      await ctx.db.delete(asset._id);
    }
    const media = await ctx.db
      .query('createMedia')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();
    for (const m of media) {
      await ctx.db.delete(m._id);
    }
    const messages = await ctx.db
      .query('createChatMessages')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(projectId);
  },
});

export const listAssets = query({
  args: { projectId: v.id('createProjects') },
  handler: async (ctx, { projectId }) =>
    ctx.db
      .query('createAssets')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect(),
});

export const createAsset = mutation({
  args: {
    projectId: v.id('createProjects'),
    brandId: v.id('brands'),
    name: v.string(),
    masterAssetId: v.optional(v.id('createAssets')),
    platform: platformUnion,
    dimensionName: v.string(),
    width: v.number(),
    height: v.number(),
    category: v.string(),
    html: v.string(),
    css: v.string(),
    contentBlockData: v.optional(v.any()),
    ribbonData: v.optional(v.any()),
    imageSlots: v.array(imageSlotShape),
    tldrawSnapshot: v.optional(v.string()),
    status: v.union(
      v.literal('generating'),
      v.literal('rendering'),
      v.literal('capturing'),
      v.literal('ready'),
      v.literal('error')
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return ctx.db.insert('createAssets', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAsset = mutation({
  args: {
    assetId: v.id('createAssets'),
    html: v.optional(v.string()),
    css: v.optional(v.string()),
    contentBlockData: v.optional(v.any()),
    ribbonData: v.optional(v.any()),
    imageSlots: v.optional(v.array(imageSlotShape)),
    status: v.optional(
      v.union(
        v.literal('generating'),
        v.literal('rendering'),
        v.literal('capturing'),
        v.literal('ready'),
        v.literal('error')
      )
    ),
    error: v.optional(v.string()),
    capturedImageUrl: v.optional(v.string()),
    capturedImageStorageId: v.optional(v.id('_storage')),
    tldrawSnapshot: v.optional(v.string()),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, { assetId, ...fields }) => {
    await requireBrandRoleForDoc(ctx, 'createAssets', assetId, 'editor');
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    if (fields.capturedImageStorageId) {
      const url = await ctx.storage.getUrl(fields.capturedImageStorageId);
      if (url) updates.capturedImageUrl = url;
    }
    await ctx.db.patch(assetId, updates);
  },
});

export const updateImageSlotStorage = mutation({
  args: {
    assetId: v.id('createAssets'),
    slotId: v.string(),
    storageId: v.id('_storage'),
    mimeType: v.string(),
  },
  handler: async (ctx, { assetId, slotId, storageId, mimeType }) => {
    // Idempotent: the asset may have been deleted while this upload was in
    // flight — drop the late write silently rather than throwing at the user.
    const found = await requireBrandRoleForDocIfExists(ctx, 'createAssets', assetId, 'editor');
    if (!found) return;
    const asset = found.doc;
    const imageUrl = await ctx.storage.getUrl(storageId);
    const updatedSlots = asset.imageSlots.map((s) =>
      s.id === slotId
        ? { ...s, storageId, imageUrl: imageUrl ?? undefined, mimeType, status: 'ready' as const }
        : s
    );
    await ctx.db.patch(assetId, { imageSlots: updatedSlots, updatedAt: Date.now() });
  },
});

export const removeAsset = mutation({
  args: { assetId: v.id('createAssets') },
  handler: async (ctx, { assetId }) => {
    // Idempotent: an already-deleted asset is a successful no-op.
    const found = await requireBrandRoleForDocIfExists(ctx, 'createAssets', assetId, 'editor');
    if (!found) return;
    await ctx.db.delete(assetId);
  },
});

export const getVariants = query({
  args: { masterAssetId: v.id('createAssets') },
  handler: async (ctx, { masterAssetId }) =>
    ctx.db
      .query('createAssets')
      .withIndex('by_master', (q) => q.eq('masterAssetId', masterAssetId))
      .collect(),
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const createMedia = mutation({
  args: {
    projectId: v.id('createProjects'),
    brandId: v.id('brands'),
    name: v.string(),
    storageId: v.id('_storage'),
    url: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    source: v.union(v.literal('upload'), v.literal('generated')),
    generationPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return ctx.db.insert('createMedia', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listMedia = query({
  args: { projectId: v.id('createProjects') },
  handler: async (ctx, { projectId }) =>
    ctx.db
      .query('createMedia')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect(),
});

export const removeMedia = mutation({
  args: { mediaId: v.id('createMedia') },
  handler: async (ctx, { mediaId }) => {
    // Idempotent: deleting media that is already gone (double-click, retry,
    // concurrent delete) is a successful no-op, not an error.
    const found = await requireBrandRoleForDocIfExists(ctx, 'createMedia', mediaId, 'editor');
    if (!found) return;
    await ctx.storage.delete(found.doc.storageId);
    await ctx.db.delete(mediaId);
  },
});

export const listMessages = query({
  args: { projectId: v.id('createProjects') },
  handler: async (ctx, { projectId }) => {
    const rows = await ctx.db
      .query('createChatMessages')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();
    return rows.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const batchCreateMessages = mutation({
  args: {
    messages: v.array(
      v.object({
        projectId: v.id('createProjects'),
        role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
        content: v.string(),
        parts: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, { messages }) => {
    if (messages.length > 0) {
      const project = await ctx.db.get(messages[0].projectId);
      if (!project) throw new Error('Project not found');
      await requireBrandRole(ctx, project.brandId, 'editor');
    }
    const now = Date.now();
    const ids = [];
    for (const msg of messages) {
      const id = await ctx.db.insert('createChatMessages', {
        ...msg,
        createdAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

export const createMessage = mutation({
  args: {
    projectId: v.id('createProjects'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    parts: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error('Project not found');
    await requireBrandRole(ctx, project.brandId, 'editor');
    return ctx.db.insert('createChatMessages', {
      ...args,
      createdAt: Date.now(),
    });
  },
});
