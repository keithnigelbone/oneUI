/**
 * voiceFeedback.ts
 *
 * Convex queries and mutations for Voice & Tone feedback.
 * Manages feedback on AI responses for continuous rule improvement.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

// ============================================
// Shared validators
// ============================================

const sourceValidator = v.union(
  v.literal('playground'),
  v.literal('evaluation'),
  v.literal('sdk'),
  v.literal('tone-guard'),
);

const statusValidator = v.union(
  v.literal('open'),
  v.literal('reviewed'),
  v.literal('resolved'),
  v.literal('dismissed'),
);

const ratingValidator = v.union(
  v.literal('positive'),
  v.literal('negative'),
);

const resolutionValidator = v.object({
  action: v.union(
    v.literal('rule-updated'),
    v.literal('scenario-added'),
    v.literal('forbidden-word-added'),
    v.literal('dismissed'),
  ),
  details: v.optional(v.string()),
  resolvedAt: v.optional(v.number()),
});

// ============================================
// Queries
// ============================================

/**
 * List all feedback for a brand
 */
export const listByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('voiceFeedback')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * List feedback by brand and status
 */
export const listByStatus = query({
  args: {
    brandId: v.id('brands'),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('voiceFeedback')
      .withIndex('by_brand_status', (q) =>
        q.eq('brandId', args.brandId).eq('status', args.status)
      )
      .collect();
  },
});

/**
 * Get feedback counts by status for a brand
 */
export const getStats = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const allFeedback = await ctx.db
      .query('voiceFeedback')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    const stats = {
      open: 0,
      reviewed: 0,
      resolved: 0,
      dismissed: 0,
    };

    for (const item of allFeedback) {
      stats[item.status]++;
    }

    return stats;
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Create feedback on an AI response
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    source: sourceValidator,
    userMessage: v.string(),
    aiResponse: v.string(),
    channel: v.optional(v.string()),
    annotation: v.optional(v.string()),
    rating: ratingValidator,
    relatedRuleSections: v.optional(v.array(v.string())),
    toneGuardCorrections: v.optional(v.any()),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();

    const id = await ctx.db.insert('voiceFeedback', {
      brandId: args.brandId,
      source: args.source,
      userMessage: args.userMessage,
      aiResponse: args.aiResponse,
      channel: args.channel,
      annotation: args.annotation,
      rating: args.rating,
      relatedRuleSections: args.relatedRuleSections,
      toneGuardCorrections: args.toneGuardCorrections,
      status: args.status ?? 'open',
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update the status of a feedback item
 */
export const updateStatus = mutation({
  args: {
    id: v.id('voiceFeedback'),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceFeedback', args.id, 'editor');
    const feedback = await ctx.db.get(args.id);
    if (!feedback) {
      throw new Error('Feedback item not found');
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Resolve a feedback item with resolution details
 */
export const resolve = mutation({
  args: {
    id: v.id('voiceFeedback'),
    resolution: resolutionValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceFeedback', args.id, 'editor');
    const feedback = await ctx.db.get(args.id);
    if (!feedback) {
      throw new Error('Feedback item not found');
    }

    await ctx.db.patch(args.id, {
      status: 'resolved',
      resolution: args.resolution,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
