/**
 * compositionFeedback.ts
 *
 * Convex queries and mutations for composition feedback.
 * Designers submit feedback on generated compositions for continuous
 * rule improvement. Mirrors voiceFeedback.ts patterns.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc } from './lib/auth';

// ============================================
// Queries
// ============================================

/**
 * List feedback for a brand, optionally filtered by status
 */
export const list = query({
  args: {
    brandId: v.id('brands'),
    status: v.optional(v.union(
      v.literal('open'),
      v.literal('reviewed'),
      v.literal('resolved'),
      v.literal('dismissed')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.status) {
      return await ctx.db
        .query('compositionFeedback')
        .withIndex('by_brand_status', (q) =>
          q.eq('brandId', args.brandId).eq('status', args.status!))
        .order('desc')
        .take(limit);
    }

    return await ctx.db
      .query('compositionFeedback')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .order('desc')
      .take(limit);
  },
});

/**
 * Get feedback stats for a brand
 */
export const getStats = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query('compositionFeedback')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    return {
      total: all.length,
      positive: all.filter((f) => f.rating === 'positive').length,
      negative: all.filter((f) => f.rating === 'negative').length,
      open: all.filter((f) => f.status === 'open').length,
      resolved: all.filter((f) => f.status === 'resolved').length,
    };
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Submit feedback on a generated composition.
 *
 * Note: exported as both `submit` (legacy name) and `create` (consistent with
 * other convex files) so the verify API route can call it without renaming.
 */
const submitHandler = {
  args: {
    brandId: v.id('brands'),
    source: v.union(
      v.literal('playground'),
      v.literal('evaluation'),
      v.literal('canvas'),
      v.literal('experience-builder'),
      v.literal('visual-verification')
    ),
    prompt: v.string(),
    generatedAST: v.string(),
    context: v.string(),
    annotation: v.optional(v.string()),
    rating: v.union(v.literal('positive'), v.literal('negative')),
    relatedRuleSections: v.optional(v.array(v.string())),
    validationResult: v.optional(v.any()),
    renderedScreenshotId: v.optional(v.id('renderedScreenshots')),
    visualAlignmentScore: v.optional(v.number()),
    /**
     * Optional skill the composition was generated from. When present and
     * rating is positive, the related skill's `positiveRatings` counter
     * increments — this drives `compositionSkills.getTopRated` ordering for
     * the Skill Writer's few-shot selection.
     */
    skillId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    const id = await ctx.db.insert('compositionFeedback', {
      brandId: args.brandId,
      source: args.source,
      prompt: args.prompt,
      generatedAST: args.generatedAST,
      context: args.context,
      annotation: args.annotation,
      rating: args.rating,
      relatedRuleSections: args.relatedRuleSections,
      validationResult: args.validationResult,
      renderedScreenshotId: args.renderedScreenshotId,
      visualAlignmentScore: args.visualAlignmentScore,
      skillId: args.skillId,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    });
    if (args.rating === 'positive' && args.skillId) {
      const skill = await ctx.db
        .query('compositionSkills')
        .withIndex('by_brand_skill', (q: any) =>
          q.eq('brandId', args.brandId).eq('skillId', args.skillId),
        )
        .first();
      if (skill) {
        await ctx.db.patch(skill._id, {
          positiveRatings: (skill.positiveRatings ?? 0) + 1,
        });
      }
    }
    return id;
  },
} as const;

export const submit = mutation(submitHandler);
export const create = mutation(submitHandler);

/**
 * Update feedback status (review workflow).
 *
 * When `resolution.action === 'reference-added'` and `referenceScreenId` is
 * provided, we automatically create a `referenceLinks` row tying the new
 * reference to this feedback entry so it starts informing future compilations
 * for the same (vertical, context). This is the learning-loop closure —
 * the catalog grows from resolved negative feedback.
 */
export const updateStatus = mutation({
  args: {
    id: v.id('compositionFeedback'),
    status: v.union(
      v.literal('open'),
      v.literal('reviewed'),
      v.literal('resolved'),
      v.literal('dismissed')
    ),
    resolution: v.optional(v.object({
      action: v.union(
        v.literal('rule-updated'),
        v.literal('scenario-added'),
        v.literal('skill-added'),
        v.literal('reference-added'),
        v.literal('dismissed')
      ),
      details: v.optional(v.string()),
    })),
    /** Referenced screen id — required when action is 'reference-added'. */
    referenceScreenId: v.optional(v.id('referenceScreens')),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionFeedback', args.id, 'editor');
    const feedback = await ctx.db.get(args.id);
    if (!feedback) throw new Error('Feedback not found');

    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.resolution) {
      updates.resolution = {
        ...args.resolution,
        resolvedAt: now,
      };
    }

    await ctx.db.patch(args.id, updates);

    // Learning loop: feedback resolved by adding a reference → link them.
    if (args.resolution?.action === 'reference-added' && args.referenceScreenId) {
      await ctx.db.insert('referenceLinks', {
        screenId: args.referenceScreenId,
        targetType: 'feedback',
        targetId: args.id as unknown as string,
        weight: 1,
        note: args.resolution.details,
        createdAt: now,
      });
    }
  },
});
