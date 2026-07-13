/**
 * compositionEval.ts
 *
 * Convex queries and mutations for composition evaluation scenarios and runs.
 * Mirrors voiceEval patterns — scenarios define test cases, runs capture results.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc } from './lib/auth';

// ============================================
// Scenario Queries
// ============================================

export const listScenarios = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('compositionEvalScenarios')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

export const getScenariosByCategory = query({
  args: {
    brandId: v.id('brands'),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('compositionEvalScenarios')
      .withIndex('by_brand_category', (q) =>
        q.eq('brandId', args.brandId).eq('category', args.category))
      .collect();
  },
});

// ============================================
// Scenario Mutations
// ============================================

export const createScenario = mutation({
  args: {
    brandId: v.id('brands'),
    scenarioId: v.string(),
    category: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    prompt: v.string(),
    context: v.string(),
    expectedBehaviors: v.array(v.string()),
    forbiddenBehaviors: v.array(v.string()),
    rubric: v.object({
      tokenCompliance: v.optional(v.number()),
      attentionHierarchy: v.optional(v.number()),
      spacingConsistency: v.optional(v.number()),
      surfaceCorrectness: v.optional(v.number()),
      componentSelection: v.optional(v.number()),
      brandConsistency: v.optional(v.number()),
      accessibility: v.optional(v.number()),
      layoutQuality: v.optional(v.number()),
    }),
    referenceAST: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return await ctx.db.insert('compositionEvalScenarios', {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const toggleScenario = mutation({
  args: {
    id: v.id('compositionEvalScenarios'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionEvalScenarios', args.id, 'editor');
    await ctx.db.patch(args.id, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});

// ============================================
// Run Queries
// ============================================

export const listRuns = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('compositionEvalRuns')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .order('desc')
      .take(20);
  },
});

// ============================================
// Run Mutations
// ============================================

export const createRun = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.optional(v.string()),
    rulesVersion: v.number(),
    totalScenarios: v.number(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    return await ctx.db.insert('compositionEvalRuns', {
      brandId: args.brandId,
      name: args.name,
      rulesVersion: args.rulesVersion,
      totalScenarios: args.totalScenarios,
      passCount: 0,
      failCount: 0,
      averageScore: 0,
      results: [],
      status: 'running',
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const completeRun = mutation({
  args: {
    id: v.id('compositionEvalRuns'),
    results: v.array(v.object({
      scenarioId: v.string(),
      score: v.number(),
      passed: v.boolean(),
      generatedAST: v.string(),
      dimensionScores: v.optional(v.any()),
      notes: v.optional(v.string()),
    })),
    status: v.union(v.literal('completed'), v.literal('failed')),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionEvalRuns', args.id, 'editor');
    const now = Date.now();
    const passCount = args.results.filter((r) => r.passed).length;
    const failCount = args.results.filter((r) => !r.passed).length;
    const totalScore = args.results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = args.results.length > 0 ? totalScore / args.results.length : 0;

    await ctx.db.patch(args.id, {
      results: args.results,
      passCount,
      failCount,
      averageScore: Math.round(averageScore * 100) / 100,
      status: args.status,
      completedAt: now,
      updatedAt: now,
    });
  },
});
