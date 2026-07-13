/**
 * compositionConfigs.ts
 *
 * Convex queries and mutations for Design Composition Agent configuration.
 * Manages brand-level composition profiles: vertical type, layout personality,
 * default context, and composition preferences.
 *
 * Mirrors voiceConfigs.ts pattern.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

// ============================================
// Default composition configuration
// ============================================

const DEFAULT_COMPOSITION_CONFIG = {
  vertical: 'general' as const,
  layoutPersonality: {
    density: 30,          // spacious by default
    expressiveness: 50,   // balanced
  },
  defaultContext: 'mobile-app' as const,
  maxComponentsPerScreen: undefined as number | undefined,
  preferBoldHeros: false,
  preferMinimalContainers: true,
};

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
  v.literal('general')
);

const contextValidator = v.union(
  v.literal('mobile-app'),
  v.literal('web-app'),
  v.literal('marketing-page'),
  v.literal('social-post'),
  v.literal('print'),
  v.literal('outdoor')
);

const layoutPersonalityValidator = v.object({
  density: v.number(),
  expressiveness: v.number(),
});

// ============================================
// Queries
// ============================================

/**
 * Get composition configuration for a brand
 */
export const get = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await ctx.db
      .query('compositionConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();
  },
});

/**
 * Get default composition configuration (for reference/preview)
 */
export const getDefaults = query({
  args: {},
  handler: async () => {
    return DEFAULT_COMPOSITION_CONFIG;
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Create composition configuration with default values
 */
export const createDefaults = mutation({
  args: {
    brandId: v.id('brands'),
    vertical: v.optional(verticalValidator),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('compositionConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      throw new Error('Composition configuration already exists for this brand');
    }

    const now = Date.now();

    return await ctx.db.insert('compositionConfigs', {
      brandId: args.brandId,
      vertical: args.vertical ?? DEFAULT_COMPOSITION_CONFIG.vertical,
      layoutPersonality: DEFAULT_COMPOSITION_CONFIG.layoutPersonality,
      defaultContext: DEFAULT_COMPOSITION_CONFIG.defaultContext,
      preferBoldHeros: DEFAULT_COMPOSITION_CONFIG.preferBoldHeros,
      preferMinimalContainers: DEFAULT_COMPOSITION_CONFIG.preferMinimalContainers,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update composition configuration (partial update)
 */
export const update = mutation({
  args: {
    id: v.id('compositionConfigs'),
    vertical: v.optional(verticalValidator),
    layoutPersonality: v.optional(layoutPersonalityValidator),
    defaultContext: v.optional(contextValidator),
    maxComponentsPerScreen: v.optional(v.number()),
    preferBoldHeros: v.optional(v.boolean()),
    preferMinimalContainers: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { doc: config } = await requireBrandRoleForDoc(ctx, 'compositionConfigs', args.id, 'editor');

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.vertical !== undefined) updates.vertical = args.vertical;
    if (args.layoutPersonality !== undefined) updates.layoutPersonality = args.layoutPersonality;
    if (args.defaultContext !== undefined) updates.defaultContext = args.defaultContext;
    if (args.maxComponentsPerScreen !== undefined) updates.maxComponentsPerScreen = args.maxComponentsPerScreen;
    if (args.preferBoldHeros !== undefined) updates.preferBoldHeros = args.preferBoldHeros;
    if (args.preferMinimalContainers !== undefined) updates.preferMinimalContainers = args.preferMinimalContainers;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    // Bump version
    updates.version = config.version + 1;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Update layout personality dials (smooth dragging support)
 */
export const updateLayoutPersonality = mutation({
  args: {
    id: v.id('compositionConfigs'),
    layoutPersonality: layoutPersonalityValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionConfigs', args.id, 'editor');

    await ctx.db.patch(args.id, {
      layoutPersonality: args.layoutPersonality,
      updatedAt: Date.now(),
    });
  },
});
