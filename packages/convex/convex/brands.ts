/**
 * brands.ts
 *
 * Convex queries and mutations for brand management
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import {
  requireBrandCreator,
  requireBrandRole,
  requirePlatformOwner,
  getAccessibleBrandIds,
  canReadBrand,
} from './lib/auth';

/**
 * Check if any brands exist (lightweight, uses .first() instead of .collect())
 */
export const hasAnyBrands = query({
  args: {},
  handler: async (ctx) => {
    const first = await ctx.db.query('brands').first();
    return first !== null;
  },
});

/**
 * Get all brands the current user may see (by-invitation scoping).
 * Owner sees all; members see their brands + system brands; signed-out sees system only.
 */
export const list = query(async (ctx) => {
  const access = await getAccessibleBrandIds(ctx);
  const all = await ctx.db.query('brands').collect();
  if (access === 'all') return all;
  return all.filter((b) => b.isSystem || access.has(b._id));
});

/**
 * Get a single brand by ID
 */
export const get = query({
  args: { id: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.id))) return null;
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a brand by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('brands')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
  },
});

/**
 * Get brand statistics (token counts by category)
 */
export const getStats = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query('tokens')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    // Count by category
    const tokensByCategory: Record<string, number> = {};
    for (const token of tokens) {
      const category = token.category.split('/')[0]; // Get top-level category
      tokensByCategory[category] = (tokensByCategory[category] || 0) + 1;
    }

    const totalTokens = tokens.length;

    return {
      totalTokens,
      tokensByCategory,
      categories: {
        color: tokensByCategory['color'] || 0,
        typography: tokensByCategory['typography'] || 0,
        spacing: tokensByCategory['spacing'] || 0,
        shape: tokensByCategory['shape'] || 0,
        motion: tokensByCategory['motion'] || 0,
        elevation: tokensByCategory['elevation'] || 0,
      },
    };
  },
});

/**
 * Create a new brand
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    primaryHue: v.number(),
    primaryChroma: v.number(),
    secondaryHue: v.number(),
    secondaryChroma: v.number(),
    baseBrand: v.optional(v.id('brands')),
    status: v.union(
      v.literal('active'),
      v.literal('draft'),
      v.literal('deprecated')
    ),
  },
  handler: async (ctx, args) => {
    // By-invitation platform: only platform owner/creator may create brands.
    // Self-registered members are viewers. The creator becomes the brand's admin.
    const user = await requireBrandCreator(ctx);
    const now = Date.now();

    const brandId = await ctx.db.insert('brands', {
      name: args.name,
      slug: args.slug,
      description: args.description,
      icon: args.icon,
      primaryHue: args.primaryHue,
      primaryChroma: args.primaryChroma,
      secondaryHue: args.secondaryHue,
      secondaryChroma: args.secondaryChroma,
      baseBrand: args.baseBrand,
      status: args.status,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // Ownership grant: creator is admin of the brand they just made.
    await ctx.db.insert('brandMembers', {
      brandId,
      userId: user._id,
      role: 'admin',
      createdAt: now,
    });

    return brandId;
  },
});

/**
 * Update a brand
 */
export const update = mutation({
  args: {
    id: v.id('brands'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    logoSvg: v.optional(v.string()),
    primaryHue: v.optional(v.number()),
    primaryChroma: v.optional(v.number()),
    secondaryHue: v.optional(v.number()),
    secondaryChroma: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('draft'),
        v.literal('deprecated')
      )
    ),
  },
  handler: async (ctx, args) => {
    // Brand edits require editor; changing publish status requires admin.
    await requireBrandRole(ctx, args.id, args.status !== undefined ? 'admin' : 'editor');

    await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.icon !== undefined && { icon: args.icon }),
      ...(args.logoSvg !== undefined && { logoSvg: args.logoSvg }),
      ...(args.primaryHue !== undefined && { primaryHue: args.primaryHue }),
      ...(args.primaryChroma !== undefined && {
        primaryChroma: args.primaryChroma,
      }),
      ...(args.secondaryHue !== undefined && {
        secondaryHue: args.secondaryHue,
      }),
      ...(args.secondaryChroma !== undefined && {
        secondaryChroma: args.secondaryChroma,
      }),
      ...(args.status !== undefined && { status: args.status }),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Delete a brand
 */
export const remove = mutation({
  args: { id: v.id('brands') },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.id);
    if (!brand) throw new Error('Brand not found');
    await requireBrandRole(ctx, args.id, 'admin');
    if (brand.isSystem) throw new Error('System brands cannot be deleted');

    // Cascade delete all related tables (by_brand index)
    const tablesToCascade = [
      'tokens',
      'tokenOverrides',
      'foundations',
      'colorScales',
      'appearanceConfigs',
      'surfaceTokenMappings',
      'textTokenMappings',
      'spacingConfigs',
      'dimensionConfigs',
      'shapeConfigs',
      'elevationConfigs',
      'motionConfigs',
      'materialConfigs',
      'figmaConnections',
      'syncHistory',
      'brandPresetScaleSelections',
      'brandOrnaments',
      'brandCSSCache',
      'brandPublications',
      'campaignAssets',
      'campaignMedia',
      'createAssets',
      'createMedia',
      'voiceConfigs',
      'voiceRules',
      'voiceSkills',
      'voiceEvalScenarios',
      'voiceEvalRuns',
      'voiceFeedback',
      'voicePublications',
    ] as const;

    for (const tableName of tablesToCascade) {
      const records = await ctx.db
        .query(tableName)
        .withIndex('by_brand', (q) => q.eq('brandId', args.id))
        .collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    // Delete tables with by_brand_component index (brandId is first field)
    const componentDecorations = await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) => q.eq('brandId', args.id))
      .collect();
    for (const record of componentDecorations) {
      await ctx.db.delete(record._id);
    }

    const componentRecipeSelections = await ctx.db
      .query('componentRecipeSelections')
      .withIndex('by_brand_component', (q) => q.eq('brandId', args.id))
      .collect();
    for (const record of componentRecipeSelections) {
      await ctx.db.delete(record._id);
    }

    // Delete sub-brand configs (use by_parent_brand index, not by_brand)
    const subBrandConfigs = await ctx.db
      .query('subBrandConfigs')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.id))
      .collect();
    for (const record of subBrandConfigs) {
      await ctx.db.delete(record._id);
    }

    // Delete campaigns and their chat messages (chatMessages reference campaignId, not brandId)
    const campaigns = await ctx.db
      .query('campaigns')
      .withIndex('by_brand', (q) => q.eq('brandId', args.id))
      .collect();
    for (const campaign of campaigns) {
      const chatMessages = await ctx.db
        .query('chatMessages')
        .withIndex('by_campaign', (q) => q.eq('campaignId', campaign._id))
        .collect();
      for (const msg of chatMessages) {
        await ctx.db.delete(msg._id);
      }
      await ctx.db.delete(campaign._id);
    }

    // Create section projects (chat messages are by projectId only)
    const createProjectsList = await ctx.db
      .query('createProjects')
      .withIndex('by_brand', (q) => q.eq('brandId', args.id))
      .collect();
    for (const project of createProjectsList) {
      const createMsgs = await ctx.db
        .query('createChatMessages')
        .withIndex('by_project', (q) => q.eq('projectId', project._id))
        .collect();
      for (const msg of createMsgs) {
        await ctx.db.delete(msg._id);
      }
      await ctx.db.delete(project._id);
    }

    // Delete the brand itself
    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Update brand status
 */
export const updateStatus = mutation({
  args: {
    id: v.id('brands'),
    status: v.union(
      v.literal('active'),
      v.literal('draft'),
      v.literal('deprecated')
    ),
  },
  handler: async (ctx, args) => {
    // Changing brand publish status is an admin action.
    await requireBrandRole(ctx, args.id, 'admin');

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Default brand configurations
 */
const DEFAULT_BRANDS = [
  {
    name: 'Jio Default',
    slug: 'jio-default',
    description: 'Base design system for all Jio brands',
    primaryHue: 280,
    primaryChroma: 0.15,
    secondaryHue: 140,
    secondaryChroma: 0.12,
    status: 'active' as const,
  },
  {
    name: 'JioCinema',
    slug: 'jiocinema',
    description: 'Entertainment streaming platform',
    primaryHue: 340,
    primaryChroma: 0.16,
    secondaryHue: 200,
    secondaryChroma: 0.12,
    status: 'active' as const,
  },
  {
    name: 'JioMart',
    slug: 'jiomart',
    description: 'E-commerce platform',
    primaryHue: 145,
    primaryChroma: 0.14,
    secondaryHue: 280,
    secondaryChroma: 0.12,
    status: 'active' as const,
  },
  {
    name: 'JioHotStar',
    slug: 'jiohotstar',
    description: 'Sports and entertainment streaming',
    primaryHue: 45,
    primaryChroma: 0.18,
    secondaryHue: 280,
    secondaryChroma: 0.12,
    status: 'active' as const,
  },
];

/**
 * Seed default brands only if the brands table is empty (first-time setup).
 * This prevents deleted brands from being recreated on page refresh.
 * Returns all brands (existing + newly created)
 */
export const seedDefaultBrands = mutation({
  args: {},
  handler: async (ctx) => {
    // Intentionally UNGATED: first-run bootstrap (only seeds when the brands
    // table is empty) and may run before auth is established during load.
    const existingBrands = await ctx.db.query('brands').collect();

    // Only seed if the table is completely empty (first-time setup)
    if (existingBrands.length > 0) {
      return {
        brands: existingBrands,
        created: 0,
      };
    }

    const now = Date.now();

    // Create default brands only on first-time setup
    const createdIds: string[] = [];
    for (const brandConfig of DEFAULT_BRANDS) {
      const brandId = await ctx.db.insert('brands', {
        ...brandConfig,
        createdAt: now,
        updatedAt: now,
      });
      createdIds.push(brandId);
    }

    // Return all brands
    const allBrands = await ctx.db.query('brands').collect();
    return {
      brands: allBrands,
      created: createdIds.length,
    };
  },
});

/**
 * Reset all component customisations for any brand back to defaults.
 * Clears tokenOverrides, componentDecorations, and componentRecipeSelections
 * but keeps all foundation configs (color, typography, surfaces, etc.) intact.
 */
export const resetBrandOverrides = mutation({
  args: { id: v.id('brands') },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.id, 'editor');

    // Clear tokenOverrides (has by_brand index)
    const tokenOverrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand', (q) => q.eq('brandId', args.id))
      .collect();
    for (const record of tokenOverrides) {
      await ctx.db.delete(record._id);
    }

    // Clear componentDecorations (has by_brand_component index)
    const decorations = await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) => q.eq('brandId', args.id))
      .collect();
    for (const record of decorations) {
      await ctx.db.delete(record._id);
    }

    // Clear componentRecipeSelections (has by_brand_component index)
    const recipes = await ctx.db
      .query('componentRecipeSelections')
      .withIndex('by_brand_component', (q) => q.eq('brandId', args.id))
      .collect();
    for (const record of recipes) {
      await ctx.db.delete(record._id);
    }

    await ctx.db.patch(args.id, { updatedAt: Date.now() });
    return args.id;
  },
});

/**
 * Ensure the One UI Theme system brand exists.
 * Safe to call on every app load — idempotent.
 */
export const ensureSystemBrand = mutation({
  args: {},
  handler: async (ctx) => {
    // Intentionally UNGATED: called on every app load during bootstrap, before
    // the Convex auth token is attached. Idempotent infra (ensures the One UI
    // system brand exists) — safe to run unauthenticated.
    const existing = await ctx.db
      .query('brands')
      .withIndex('by_slug', (q) => q.eq('slug', 'oneui-system'))
      .first();
    if (existing) return existing._id;

    const now = Date.now();
    const id = await ctx.db.insert('brands', {
      name: 'One UI Theme',
      slug: 'oneui-system',
      description: 'Platform default theme — configure component tokens for the baseline One UI look.',
      primaryHue: 220,
      primaryChroma: 0.0,
      secondaryHue: 220,
      secondaryChroma: 0.0,
      status: 'active',
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

/**
 * Reset all customisations on the One UI Theme system brand.
 * Clears token overrides and component decorations but keeps the brand record.
 */
export const resetSystemBrand = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformOwner(ctx);
    const brand = await ctx.db
      .query('brands')
      .withIndex('by_slug', (q) => q.eq('slug', 'oneui-system'))
      .first();
    if (!brand) throw new Error('One UI Theme brand not found');

    // Clear tokenOverrides (has by_brand index)
    const tokenOverrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand', (q) => q.eq('brandId', brand._id))
      .collect();
    for (const record of tokenOverrides) {
      await ctx.db.delete(record._id);
    }

    // Clear componentDecorations (has by_brand_component index — scan by brandId)
    const decorations = await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) => q.eq('brandId', brand._id))
      .collect();
    for (const record of decorations) {
      await ctx.db.delete(record._id);
    }

    // Clear componentRecipeSelections (has by_brand_component index)
    const recipes = await ctx.db
      .query('componentRecipeSelections')
      .withIndex('by_brand_component', (q) => q.eq('brandId', brand._id))
      .collect();
    for (const record of recipes) {
      await ctx.db.delete(record._id);
    }

    await ctx.db.patch(brand._id, { updatedAt: Date.now() });
    return brand._id;
  },
});
