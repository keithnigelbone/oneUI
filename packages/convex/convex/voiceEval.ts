/**
 * voiceEval.ts
 *
 * Convex queries and mutations for Voice & Tone evaluation.
 * Manages eval scenarios (per-brand test bank) and eval run results.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

// ============================================
// Shared validators
// ============================================

const rubricValidator = v.object({
  emotionDetection: v.optional(v.number()),
  forbiddenWords: v.optional(v.number()),
  formatting: v.optional(v.number()),
  warmth: v.optional(v.number()),
  forwardMomentum: v.optional(v.number()),
  apologyCorrectness: v.optional(v.number()),
  responseLength: v.optional(v.number()),
  benefitFraming: v.optional(v.number()),
  ecosystemBalance: v.optional(v.number()),
  inclusivity: v.optional(v.number()),
  readability: v.optional(v.number()),
});

const resultItemValidator = v.object({
  scenarioId: v.string(),
  score: v.number(),
  passed: v.boolean(),
  response: v.string(),
  dimensionScores: v.optional(v.any()),
  notes: v.optional(v.string()),
});

// ============================================
// Queries
// ============================================

/**
 * List all eval scenarios for a brand
 */
export const listScenarios = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('voiceEvalScenarios')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * List eval scenarios filtered by category
 */
export const listScenariosByCategory = query({
  args: {
    brandId: v.id('brands'),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('voiceEvalScenarios')
      .withIndex('by_brand_category', (q) =>
        q.eq('brandId', args.brandId).eq('category', args.category)
      )
      .collect();
  },
});

/**
 * List all eval runs for a brand, sorted by createdAt descending
 */
export const listRuns = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const runs = await ctx.db
      .query('voiceEvalRuns')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    return runs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a specific eval run by ID
 */
export const getRun = query({
  args: { id: v.id('voiceEvalRuns') },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return doc;
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Create a new eval scenario
 */
export const createScenario = mutation({
  args: {
    brandId: v.id('brands'),
    scenarioId: v.string(),
    category: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    userMessage: v.string(),
    expectedBehaviors: v.array(v.string()),
    forbiddenBehaviors: v.array(v.string()),
    rubric: rubricValidator,
    referenceAnswer: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();

    const id = await ctx.db.insert('voiceEvalScenarios', {
      brandId: args.brandId,
      scenarioId: args.scenarioId,
      category: args.category,
      title: args.title,
      description: args.description,
      userMessage: args.userMessage,
      expectedBehaviors: args.expectedBehaviors,
      forbiddenBehaviors: args.forbiddenBehaviors,
      rubric: args.rubric,
      referenceAnswer: args.referenceAnswer,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an eval scenario (partial update)
 */
export const updateScenario = mutation({
  args: {
    id: v.id('voiceEvalScenarios'),
    scenarioId: v.optional(v.string()),
    category: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    userMessage: v.optional(v.string()),
    expectedBehaviors: v.optional(v.array(v.string())),
    forbiddenBehaviors: v.optional(v.array(v.string())),
    rubric: v.optional(rubricValidator),
    referenceAnswer: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceEvalScenarios', args.id, 'editor');
    const scenario = await ctx.db.get(args.id);
    if (!scenario) {
      throw new Error('Eval scenario not found');
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.scenarioId !== undefined) updates.scenarioId = args.scenarioId;
    if (args.category !== undefined) updates.category = args.category;
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.userMessage !== undefined) updates.userMessage = args.userMessage;
    if (args.expectedBehaviors !== undefined) updates.expectedBehaviors = args.expectedBehaviors;
    if (args.forbiddenBehaviors !== undefined) updates.forbiddenBehaviors = args.forbiddenBehaviors;
    if (args.rubric !== undefined) updates.rubric = args.rubric;
    if (args.referenceAnswer !== undefined) updates.referenceAnswer = args.referenceAnswer;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Delete an eval scenario
 */
export const removeScenario = mutation({
  args: { id: v.id('voiceEvalScenarios') },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceEvalScenarios', args.id, 'editor');
    const scenario = await ctx.db.get(args.id);
    if (!scenario) {
      throw new Error('Eval scenario not found');
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Create an eval run record
 */
export const createRun = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.optional(v.string()),
    rulesVersion: v.number(),
    totalScenarios: v.number(),
    passCount: v.number(),
    failCount: v.number(),
    averageScore: v.number(),
    scoreBreakdown: v.optional(v.any()),
    results: v.array(resultItemValidator),
    status: v.union(
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();

    const id = await ctx.db.insert('voiceEvalRuns', {
      brandId: args.brandId,
      name: args.name,
      rulesVersion: args.rulesVersion,
      totalScenarios: args.totalScenarios,
      passCount: args.passCount,
      failCount: args.failCount,
      averageScore: args.averageScore,
      scoreBreakdown: args.scoreBreakdown,
      results: args.results,
      status: args.status,
      startedAt: args.startedAt,
      completedAt: args.completedAt,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update eval run with full results (used when a run completes)
 */
export const updateRun = mutation({
  args: {
    id: v.id('voiceEvalRuns'),
    totalScenarios: v.optional(v.number()),
    passCount: v.optional(v.number()),
    failCount: v.optional(v.number()),
    averageScore: v.optional(v.number()),
    scoreBreakdown: v.optional(v.any()),
    results: v.optional(v.array(resultItemValidator)),
    status: v.optional(v.union(
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
    )),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceEvalRuns', args.id, 'editor');
    const run = await ctx.db.get(args.id);
    if (!run) {
      throw new Error('Eval run not found');
    }

    const { id, ...rest } = args;
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) updates[key] = value;
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Update eval run status and completedAt
 */
export const updateRunStatus = mutation({
  args: {
    id: v.id('voiceEvalRuns'),
    status: v.union(
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceEvalRuns', args.id, 'editor');
    const run = await ctx.db.get(args.id);
    if (!run) {
      throw new Error('Eval run not found');
    }

    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.completedAt !== undefined) updates.completedAt = args.completedAt;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});
