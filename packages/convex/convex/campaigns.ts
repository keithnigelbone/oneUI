/**
 * Experience Builder — Campaign CRUD + Asset + Media + Chat mutations/queries
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { requireBrandRole, requireBrandRoleForDoc, requireBrandRoleForDocIfExists, requireUser, canReadBrand } from './lib/auth';

// ============================================================================
// Campaigns
// ============================================================================

/** List campaigns for a brand, optionally filtered by type */
export const list = query({
  args: {
    brandId: v.id('brands'),
    type: v.optional(
      v.union(
        v.literal('campaign'),
        v.literal('app'),
        v.literal('outdoor'),
        v.literal('print')
      )
    ),
  },
  handler: async (ctx, { brandId, type }) => {
    if (!(await canReadBrand(ctx, brandId))) return [];
    if (type) {
      const campaigns = await ctx.db
        .query('campaigns')
        .withIndex('by_brand_type', (q) => q.eq('brandId', brandId).eq('type', type))
        .collect();
      // Attach asset count
      return Promise.all(
        campaigns.map(async (c) => {
          const assets = await ctx.db
            .query('campaignAssets')
            .withIndex('by_campaign', (q) => q.eq('campaignId', c._id))
            .collect();
          return { ...c, assetCount: assets.length };
        })
      );
    }
    const campaigns = await ctx.db
      .query('campaigns')
      .withIndex('by_brand', (q) => q.eq('brandId', brandId))
      .collect();
    return Promise.all(
      campaigns.map(async (c) => {
        const assets = await ctx.db
          .query('campaignAssets')
          .withIndex('by_campaign', (q) => q.eq('campaignId', c._id))
          .collect();
        return { ...c, assetCount: assets.length };
      })
    );
  },
});

/** Get a single campaign with metadata */
export const get = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, { campaignId }) => {
    const doc = await ctx.db.get(campaignId);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return doc;
  },
});

/** Create a new campaign */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal('campaign'),
      v.literal('app'),
      v.literal('outdoor'),
      v.literal('print')
    ),
    platforms: v.array(
      v.union(
        v.literal('instagram'),
        v.literal('facebook'),
        v.literal('youtube'),
        v.literal('tiktok'),
        v.literal('linkedin'),
        v.literal('twitter')
      )
    ),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    brief: v.optional(v.string()),
    assetType: v.optional(v.union(v.literal('social-post'), v.literal('ad-banner'), v.literal('story-reel'))),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return ctx.db.insert('campaigns', {
      ...args,
      status: 'draft',
      setupComplete: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update campaign metadata */
export const update = mutation({
  args: {
    campaignId: v.id('campaigns'),
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
    platforms: v.optional(
      v.array(
        v.union(
          v.literal('instagram'),
          v.literal('facebook'),
          v.literal('youtube'),
          v.literal('tiktok'),
          v.literal('linkedin'),
          v.literal('twitter')
        )
      )
    ),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    brief: v.optional(v.string()),
    assetType: v.optional(v.union(v.literal('social-post'), v.literal('ad-banner'), v.literal('story-reel'))),
  },
  handler: async (ctx, { campaignId, ...fields }) => {
    await requireBrandRoleForDoc(ctx, 'campaigns', campaignId, 'editor');
    // Filter out undefined values
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(campaignId, updates);
  },
});

/** Delete a campaign and cascade to assets, media, and messages */
export const remove = mutation({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, { campaignId }) => {
    await requireBrandRoleForDoc(ctx, 'campaigns', campaignId, 'editor');
    // Delete assets
    const assets = await ctx.db
      .query('campaignAssets')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect();
    for (const asset of assets) {
      await ctx.db.delete(asset._id);
    }
    // Delete media
    const media = await ctx.db
      .query('campaignMedia')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect();
    for (const m of media) {
      await ctx.db.delete(m._id);
    }
    // Delete chat messages
    const messages = await ctx.db
      .query('chatMessages')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    // Delete campaign
    await ctx.db.delete(campaignId);
  },
});

// ============================================================================
// Campaign Assets
// ============================================================================

/** List all assets for a campaign */
export const listAssets = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, { campaignId }) => {
    return ctx.db
      .query('campaignAssets')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect();
  },
});

/** Create a new asset */
export const createAsset = mutation({
  args: {
    campaignId: v.id('campaigns'),
    brandId: v.id('brands'),
    name: v.string(),
    masterAssetId: v.optional(v.id('campaignAssets')),
    platform: v.union(
      v.literal('instagram'),
      v.literal('facebook'),
      v.literal('youtube'),
      v.literal('tiktok'),
      v.literal('linkedin'),
      v.literal('twitter')
    ),
    dimensionName: v.string(),
    width: v.number(),
    height: v.number(),
    category: v.string(),
    html: v.string(),
    css: v.string(),
    imageSlots: v.array(
      v.object({
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
      })
    ),
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
    return ctx.db.insert('campaignAssets', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update an asset */
export const updateAsset = mutation({
  args: {
    assetId: v.id('campaignAssets'),
    html: v.optional(v.string()),
    css: v.optional(v.string()),
    imageSlots: v.optional(
      v.array(
        v.object({
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
        })
      )
    ),
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
    caption: v.optional(v.string()),
    hashtags: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, { assetId, ...fields }) => {
    await requireBrandRoleForDoc(ctx, 'campaignAssets', assetId, 'editor');
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    // If capturedImageStorageId provided, resolve to URL server-side
    if (fields.capturedImageStorageId) {
      const url = await ctx.storage.getUrl(fields.capturedImageStorageId);
      if (url) updates.capturedImageUrl = url;
    }
    await ctx.db.patch(assetId, updates);
  },
});

/** Update an image slot with Convex file storage (resolves URL server-side) */
export const updateImageSlotStorage = mutation({
  args: {
    assetId: v.id('campaignAssets'),
    slotId: v.string(),
    storageId: v.id('_storage'),
    mimeType: v.string(),
  },
  handler: async (ctx, { assetId, slotId, storageId, mimeType }) => {
    // Idempotent: the asset may have been deleted while this upload was in
    // flight — drop the late write silently rather than throwing at the user.
    const found = await requireBrandRoleForDocIfExists(ctx, 'campaignAssets', assetId, 'editor');
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

/** Delete an asset */
export const removeAsset = mutation({
  args: { assetId: v.id('campaignAssets') },
  handler: async (ctx, { assetId }) => {
    // Idempotent: an already-deleted asset is a successful no-op.
    const found = await requireBrandRoleForDocIfExists(ctx, 'campaignAssets', assetId, 'editor');
    if (!found) return;
    await ctx.db.delete(assetId);
  },
});

/** Get variants of a master asset */
export const getVariants = query({
  args: { masterAssetId: v.id('campaignAssets') },
  handler: async (ctx, { masterAssetId }) => {
    return ctx.db
      .query('campaignAssets')
      .withIndex('by_master', (q) => q.eq('masterAssetId', masterAssetId))
      .collect();
  },
});

// ============================================================================
// Campaign Media
// ============================================================================

/** Generate a Convex upload URL */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Register an uploaded media file */
export const createMedia = mutation({
  args: {
    campaignId: v.id('campaigns'),
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
    return ctx.db.insert('campaignMedia', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** List media for a campaign */
export const listMedia = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, { campaignId }) => {
    return ctx.db
      .query('campaignMedia')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect();
  },
});

/** Delete a media file */
export const removeMedia = mutation({
  args: { mediaId: v.id('campaignMedia') },
  handler: async (ctx, { mediaId }) => {
    // Idempotent: deleting media that is already gone (double-click, retry,
    // concurrent delete) is a successful no-op, not an error.
    const found = await requireBrandRoleForDocIfExists(ctx, 'campaignMedia', mediaId, 'editor');
    if (!found) return;
    await ctx.storage.delete(found.doc.storageId);
    await ctx.db.delete(mediaId);
  },
});

// ============================================================================
// Chat Messages
// ============================================================================

/** List chat messages for a campaign (ordered by creation time) */
export const listMessages = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, { campaignId }) => {
    return ctx.db
      .query('chatMessages')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect();
  },
});

/** Batch create chat messages */
export const batchCreateMessages = mutation({
  args: {
    messages: v.array(
      v.object({
        campaignId: v.id('campaigns'),
        role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
        content: v.string(),
        parts: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, { messages }) => {
    if (messages.length > 0) {
      const campaign = await ctx.db.get(messages[0].campaignId);
      if (!campaign) throw new Error('Campaign not found');
      await requireBrandRole(ctx, campaign.brandId, 'editor');
    }
    const now = Date.now();
    const ids = [];
    for (const msg of messages) {
      const id = await ctx.db.insert('chatMessages', {
        ...msg,
        createdAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

/** Create a single chat message */
export const createMessage = mutation({
  args: {
    campaignId: v.id('campaigns'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    parts: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error('Campaign not found');
    await requireBrandRole(ctx, campaign.brandId, 'editor');
    return ctx.db.insert('chatMessages', {
      ...args,
      createdAt: Date.now(),
    });
  },
});
