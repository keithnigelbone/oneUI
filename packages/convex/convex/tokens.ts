/**
 * tokens.ts
 *
 * Convex queries and mutations for token management
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, canReadBrand } from './lib/auth';
import { resolveToken, resolveTokenAllModes } from './utils/tokenResolver';
import {
  generateColorTokens,
  generateSurfaceTokens,
  generateTextTokens,
  generateTypographyTokens,
  generateDimensionTokens,
  generateGridTokens,
  generateSpacingTokens,
  generateShapeTokens,
  generateStrokeTokens,
  generateElevationTokens,
  generateMotionTokens,
  generateMaterialTokens,
  type GeneratedToken,
} from './tokenGenerators';

/**
 * List tokens for a brand with optional filters
 * Uses compound indexes for efficient server-side filtering
 */
export const list = query({
  args: {
    brandId: v.id('brands'),
    category: v.optional(v.string()),
    mode: v.optional(v.string()),
    excludeDeprecated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    // Use the most specific compound index available based on provided filters
    let tokens;

    if (args.category && args.mode) {
      // Use the most specific index: by_brand_category_mode
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand_category_mode', (qb) =>
          qb.eq('brandId', args.brandId).eq('category', args.category!).eq('mode', args.mode as 'light' | 'dark' | 'dim')
        )
        .collect();
    } else if (args.category) {
      // Use by_brand_category index
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand_category', (qb) =>
          qb.eq('brandId', args.brandId).eq('category', args.category!)
        )
        .collect();
    } else if (args.mode) {
      // Use by_brand_mode index
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand_mode', (qb) =>
          qb.eq('brandId', args.brandId).eq('mode', args.mode as 'light' | 'dark' | 'dim')
        )
        .collect();
    } else {
      // No specific filters, use basic by_brand index
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand', (qb) => qb.eq('brandId', args.brandId))
        .collect();
    }

    // Filter deprecated in code (small number of results expected)
    if (args.excludeDeprecated) {
      return tokens.filter((t) => !t.deprecated);
    }

    return tokens;
  },
});

/**
 * Get a single token by ID.
 * Read-scoped: authenticated non-members get null (anonymous tooling passes).
 */
export const get = query({
  args: { id: v.id('tokens') },
  handler: async (ctx, args) => {
    const token = await ctx.db.get(args.id);
    if (!token) return null;
    if (!(await canReadBrand(ctx, token.brandId))) return null;
    return token;
  },
});

/**
 * Search tokens with fuzzy matching
 * Uses compound indexes for efficient pre-filtering before text search
 */
export const search = query({
  args: {
    brandId: v.id('brands'),
    query: v.string(),
    category: v.optional(v.string()),
    mode: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    // Use compound indexes to pre-filter before text search
    let tokens;

    if (args.category && args.mode) {
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand_category_mode', (qb) =>
          qb.eq('brandId', args.brandId).eq('category', args.category!).eq('mode', args.mode as 'light' | 'dark' | 'dim')
        )
        .collect();
    } else if (args.category) {
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand_category', (qb) =>
          qb.eq('brandId', args.brandId).eq('category', args.category!)
        )
        .collect();
    } else if (args.mode) {
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand_mode', (qb) =>
          qb.eq('brandId', args.brandId).eq('mode', args.mode as 'light' | 'dark' | 'dim')
        )
        .collect();
    } else {
      tokens = await ctx.db
        .query('tokens')
        .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
        .collect();
    }

    // Text search on the pre-filtered results
    const lowerQuery = args.query.toLowerCase();
    const results = tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.value.toLowerCase().includes(lowerQuery) ||
        (t.description?.toLowerCase().includes(lowerQuery) ?? false)
    );

    return results.slice(0, args.limit || 50);
  },
});

/**
 * Resolve a token value with inheritance
 */
export const resolve = query({
  args: {
    brandId: v.id('brands'),
    tokenName: v.string(),
    mode: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await resolveToken(ctx, args.brandId, args.tokenName, args.mode);
  },
});

/**
 * Resolve a token across all modes
 */
export const resolveAllModes = query({
  args: {
    brandId: v.id('brands'),
    tokenName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await resolveTokenAllModes(ctx, args.brandId, args.tokenName);
  },
});

/**
 * Get components that use a token
 */
export const getUsage = query({
  args: { tokenName: v.string() },
  handler: async () => {
    // For now, return empty array - full implementation would query component data
    return [];
  },
});

/**
 * Sync tokens from Figma
 */
export const sync = mutation({
  args: {
    brandId: v.id('brands'),
    tokensToAdd: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        value: v.string(),
        mode: v.string(),
        description: v.optional(v.string()),
        figmaId: v.optional(v.string()),
        figmaKey: v.optional(v.string()),
      })
    ),
    tokensToUpdate: v.array(
      v.object({
        id: v.id('tokens'),
        value: v.string(),
        description: v.optional(v.string()),
      })
    ),
    tokensToRemove: v.array(v.id('tokens')),
    sourceDetails: v.optional(
      v.object({
        fileKey: v.string(),
        fileName: v.optional(v.string()),
        collectionsProcessed: v.optional(v.array(v.string())),
      })
    ),
    // DEPRECATED: ignored — attribution is derived server-side (see below).
    syncedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    const startTime = now;

    // Add new tokens (with deduplication -- upsert if already exists)
    const addedNames: string[] = [];
    for (const token of args.tokensToAdd) {
      // Check if token already exists for this brand+name+mode
      const existing = await ctx.db
        .query('tokens')
        .withIndex('by_brand_category_mode', (q) =>
          q.eq('brandId', args.brandId).eq('category', token.category).eq('mode', token.mode as 'light' | 'dark' | 'dim')
        )
        .filter((q) => q.eq(q.field('name'), token.name))
        .first();

      if (existing) {
        // Update existing token instead of creating duplicate
        await ctx.db.patch(existing._id, {
          value: token.value,
          ...(token.description !== undefined && { description: token.description }),
          ...(token.figmaId !== undefined && { figmaId: token.figmaId }),
          ...(token.figmaKey !== undefined && { figmaKey: token.figmaKey }),
          source: 'figma',
          updatedAt: now,
        });
      } else {
        await ctx.db.insert('tokens', {
          name: token.name,
          category: token.category,
          value: token.value,
          mode: token.mode as 'light' | 'dark' | 'dim',
          description: token.description,
          brandId: args.brandId,
          deprecated: false,
          figmaId: token.figmaId,
          figmaKey: token.figmaKey,
          source: 'figma',
          createdAt: now,
          updatedAt: now,
        });
      }
      addedNames.push(token.name);
    }

    // Update existing tokens
    const updatedNames: string[] = [];
    for (const token of args.tokensToUpdate) {
      const existing = await ctx.db.get(token.id);
      await ctx.db.patch(token.id, {
        value: token.value,
        ...(token.description !== undefined && {
          description: token.description,
        }),
        updatedAt: now,
      });
      if (existing) {
        updatedNames.push(existing.name);
      }
    }

    // Remove tokens
    const removedNames: string[] = [];
    for (const tokenId of args.tokensToRemove) {
      const existing = await ctx.db.get(tokenId);
      await ctx.db.delete(tokenId);
      if (existing) {
        removedNames.push(existing.name);
      }
    }

    const durationMs = Date.now() - startTime;

    // Record sync history
    await ctx.db.insert('syncHistory', {
      brandId: args.brandId,
      source: 'figma',
      sourceDetails: args.sourceDetails,
      tokensAdded: args.tokensToAdd.length,
      tokensUpdated: args.tokensToUpdate.length,
      tokensRemoved: args.tokensToRemove.length,
      tokenDetails: {
        addedNames,
        updatedNames,
        removedNames,
      },
      status: 'success',
      // Server-derived identity; the client-supplied syncedBy arg is ignored
      // so sync attribution can't be spoofed.
      syncedBy: user.email,
      durationMs,
      syncedAt: now,
    });

    return {
      added: args.tokensToAdd.length,
      updated: args.tokensToUpdate.length,
      removed: args.tokensToRemove.length,
      durationMs,
    };
  },
});

/**
 * Generate/sync tokens from foundation configuration
 * This bridges the gap between foundation config and actual tokens
 */
export const generateFromFoundation = mutation({
  args: {
    brandId: v.id('brands'),
    foundationType: v.union(
      v.literal('color'),
      v.literal('typography'),
      v.literal('spacing'),
      v.literal('shape'),
      v.literal('elevation'),
      v.literal('motion')
    ),
    tokens: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        value: v.string(),
        mode: v.string(),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    const startTime = now;

    // Get existing tokens for this brand and category prefix
    const categoryPrefix = `${args.foundationType}/`;
    const existingTokens = await ctx.db
      .query('tokens')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    // Filter to only foundation-generated tokens (those with matching category prefix or foundation source)
    const foundationTokens = existingTokens.filter(
      (t) =>
        t.category.startsWith(categoryPrefix) ||
        t.source === 'foundation'
    );

    // Create a map for quick lookup
    const existingMap = new Map(
      foundationTokens.map((t) => [`${t.name}:${t.mode}`, t])
    );

    const addedNames: string[] = [];
    const updatedNames: string[] = [];

    // Upsert tokens
    for (const token of args.tokens) {
      const key = `${token.name}:${token.mode}`;
      const existing = existingMap.get(key);

      if (existing) {
        // Update if value changed
        if (existing.value !== token.value || existing.description !== token.description) {
          await ctx.db.patch(existing._id, {
            value: token.value,
            description: token.description,
            category: token.category,
            source: 'foundation',
            updatedAt: now,
          });
          updatedNames.push(token.name);
        }
        existingMap.delete(key); // Mark as processed
      } else {
        // Create new token
        await ctx.db.insert('tokens', {
          name: token.name,
          category: token.category,
          value: token.value,
          mode: token.mode as 'light' | 'dark' | 'dim',
          description: token.description,
          brandId: args.brandId,
          deprecated: false,
          source: 'foundation',
          createdAt: now,
          updatedAt: now,
        });
        addedNames.push(token.name);
      }
    }

    // Remove tokens that are no longer in the foundation config
    // (Only remove tokens that were originally created by foundation)
    const removedNames: string[] = [];
    for (const [, token] of existingMap) {
      if (token.source === 'foundation') {
        await ctx.db.delete(token._id);
        removedNames.push(token.name);
      }
    }

    const durationMs = Date.now() - startTime;

    // Record sync history
    await ctx.db.insert('syncHistory', {
      brandId: args.brandId,
      source: 'foundation',
      sourceDetails: {
        fileKey: `foundation:${args.foundationType}`,
        fileName: `${args.foundationType} foundation`,
      },
      tokensAdded: addedNames.length,
      tokensUpdated: updatedNames.length,
      tokensRemoved: removedNames.length,
      tokenDetails: {
        addedNames: [...new Set(addedNames)], // Dedupe
        updatedNames: [...new Set(updatedNames)],
        removedNames: [...new Set(removedNames)],
      },
      status: 'success',
      durationMs,
      syncedAt: now,
    });

    return {
      added: addedNames.length,
      updated: updatedNames.length,
      removed: removedNames.length,
      durationMs,
    };
  },
});

/**
 * List all tokens directly from foundation configurations
 * This is the source of truth - reads live from all foundation config tables
 * Returns tokens generated on-the-fly from current foundation data
 *
 * Delegates to per-foundation-type generators in tokenGenerators.ts
 */
export const listFromFoundations = query({
  args: {
    brandId: v.id('brands'),
    category: v.optional(v.string()),
    mode: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('dim'))),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const modes: Array<'light' | 'dark' | 'dim'> = args.mode ? [args.mode] : ['light', 'dark', 'dim'];
    const cat = args.category;

    // Build array of generator promises based on category filter
    const generators: Promise<GeneratedToken[]>[] = [];

    if (!cat || cat === 'color') {
      generators.push(generateColorTokens(ctx, args.brandId, modes));
    }
    if (!cat || cat === 'color' || cat === 'surface') {
      generators.push(generateSurfaceTokens(ctx, args.brandId, modes));
    }
    if (!cat || cat === 'color' || cat === 'text') {
      generators.push(generateTextTokens(ctx, args.brandId, modes));
    }
    if (!cat || cat === 'typography') {
      generators.push(generateTypographyTokens(ctx, args.brandId));
    }
    if (!cat || cat === 'spacing' || cat === 'dimension') {
      generators.push(generateDimensionTokens(ctx, args.brandId));
    }
    if (!cat || cat === 'grid' || cat === 'spacing') {
      generators.push(generateGridTokens(ctx, args.brandId, cat === 'grid' || cat === 'spacing' ? cat : undefined));
    }
    if (!cat || cat === 'spacing') {
      generators.push(generateSpacingTokens(ctx, args.brandId));
    }
    if (!cat || cat === 'shape') {
      generators.push(generateShapeTokens(ctx, args.brandId));
    }
    if (!cat || cat === 'stroke' || cat === 'border') {
      generators.push(generateStrokeTokens(ctx, args.brandId));
    }
    if (!cat || cat === 'elevation') {
      generators.push(generateElevationTokens(ctx, args.brandId));
    }
    if (!cat || cat === 'motion') {
      generators.push(generateMotionTokens(ctx, args.brandId));
    }
    if (!cat || cat === 'material') {
      generators.push(generateMaterialTokens(ctx, args.brandId, modes));
    }

    const results = await Promise.all(generators);
    return results.flat();
  },
});
