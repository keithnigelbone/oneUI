/**
 * materials.ts
 *
 * Convex queries and mutations for Materials System management.
 * Supports four material categories:
 * - Translucent: Opacity-based overlays (10%, 25%, 50%, 75%)
 * - Frosted: Blur-based glass effects (4px-32px blur)
 * - Glass: Advanced glass with backdrop-blur + gradient highlights
 * - Metallic: Gradient-based materials (gold, silver, bronze, platinum, rose-gold)
 */

import { query, mutation } from './_generated/server';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';
import { DEFAULT_METALLIC_PRESETS } from '@oneui/shared/engine';
import { metallicConfigValidator, metallicMaterialValidator, metallicPresetValidator } from './materialValidators';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

async function invalidateBrandCSS(ctx: any, brandId: Id<'brands'>) {
  await ctx.runMutation(internal.brandCSSCache.invalidateInternal, { brandId });
}

/**
 * Default material configurations based on PRD-07
 */
const DEFAULT_MATERIALS = {
  translucent: {
    light: {
      minimal: 0.1,
      subtle: 0.25,
      moderate: 0.5,
      heavy: 0.75,
    },
    dark: {
      minimal: 0.1,
      subtle: 0.25,
      moderate: 0.5,
      heavy: 0.75,
    },
  },
  frosted: {
    blur: {
      ultraThin: 4,
      thin: 8,
      regular: 16,
      thick: 24,
      ultraThick: 32,
    },
    backgroundOpacity: {
      ultraThin: 0.3,
      thin: 0.5,
      regular: 0.65,
      thick: 0.75,
      ultraThick: 0.85,
    },
  },
  glass: {
    blur: {
      regular: 20,
      clear: 12,
    },
    saturation: {
      regular: 180,
      clear: 150,
    },
    highlightIntensity: {
      minimal: 0.12,
      moderate: 0.25,
      strong: 0.4,
    },
    tintOpacity: {
      light: 0.45,
      dark: 0.45,
    },
  },
  metallic: DEFAULT_METALLIC_PRESETS,
} as const;

const metallicPresetNameValidator = v.union(
  v.literal('gold'),
  v.literal('silver'),
  v.literal('bronze'),
  v.literal('custom'),
  v.literal('platinum'),
  v.literal('roseGold'),
);

/**
 * Type for material configuration
 */
export type MaterialConfig = typeof DEFAULT_MATERIALS;

/**
 * Get material configuration for a brand
 */
export const get = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();
  },
});

/**
 * List all material configurations
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('materialConfigs').collect();
  },
});

/**
 * Create material configuration with default values
 */
export const createDefaults = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    // Check if already exists
    const existing = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      throw new Error('Material configuration already exists for this brand');
    }

    const now = Date.now();

    const id = await ctx.db.insert('materialConfigs', {
      brandId: args.brandId,
      translucent: DEFAULT_MATERIALS.translucent,
      frosted: DEFAULT_MATERIALS.frosted,
      glass: DEFAULT_MATERIALS.glass,
      metallic: DEFAULT_MATERIALS.metallic,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return id;
  },
});

/**
 * Create material configuration with custom values
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    translucent: v.object({
      light: v.object({
        minimal: v.number(),
        subtle: v.number(),
        moderate: v.number(),
        heavy: v.number(),
      }),
      dark: v.object({
        minimal: v.number(),
        subtle: v.number(),
        moderate: v.number(),
        heavy: v.number(),
      }),
    }),
    frosted: v.object({
      blur: v.object({
        ultraThin: v.number(),
        thin: v.number(),
        regular: v.number(),
        thick: v.number(),
        ultraThick: v.number(),
      }),
      backgroundOpacity: v.object({
        ultraThin: v.number(),
        thin: v.number(),
        regular: v.number(),
        thick: v.number(),
        ultraThick: v.number(),
      }),
    }),
    glass: v.object({
      blur: v.object({
        regular: v.number(),
        clear: v.number(),
      }),
      saturation: v.object({
        regular: v.number(),
        clear: v.number(),
      }),
      highlightIntensity: v.object({
        minimal: v.number(),
        moderate: v.number(),
        strong: v.number(),
      }),
      tintOpacity: v.object({
        light: v.number(),
        dark: v.number(),
      }),
    }),
    metallic: metallicConfigValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    // Check if already exists
    const existing = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      throw new Error('Material configuration already exists for this brand');
    }

    const now = Date.now();

    const id = await ctx.db.insert('materialConfigs', {
      brandId: args.brandId,
      translucent: args.translucent,
      frosted: args.frosted,
      glass: args.glass,
      metallic: args.metallic,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return id;
  },
});

/**
 * Update entire material configuration
 */
export const update = mutation({
  args: {
    id: v.id('materialConfigs'),
    translucent: v.optional(
      v.object({
        light: v.object({
          minimal: v.number(),
          subtle: v.number(),
          moderate: v.number(),
          heavy: v.number(),
        }),
        dark: v.object({
          minimal: v.number(),
          subtle: v.number(),
          moderate: v.number(),
          heavy: v.number(),
        }),
      })
    ),
    frosted: v.optional(
      v.object({
        blur: v.object({
          ultraThin: v.number(),
          thin: v.number(),
          regular: v.number(),
          thick: v.number(),
          ultraThick: v.number(),
        }),
        backgroundOpacity: v.object({
          ultraThin: v.number(),
          thin: v.number(),
          regular: v.number(),
          thick: v.number(),
          ultraThick: v.number(),
        }),
      })
    ),
    glass: v.optional(
      v.object({
        blur: v.object({
          regular: v.number(),
          clear: v.number(),
        }),
        saturation: v.object({
          regular: v.number(),
          clear: v.number(),
        }),
        highlightIntensity: v.object({
          minimal: v.number(),
          moderate: v.number(),
          strong: v.number(),
        }),
        tintOpacity: v.object({
          light: v.number(),
          dark: v.number(),
        }),
      })
    ),
    metallic: v.optional(metallicConfigValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'materialConfigs', args.id, 'editor');
    const config = await ctx.db.get(args.id);
    if (!config) {
      throw new Error('Material configuration not found');
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.translucent !== undefined) {
      updates.translucent = args.translucent;
    }
    if (args.frosted !== undefined) {
      updates.frosted = args.frosted;
    }
    if (args.glass !== undefined) {
      updates.glass = args.glass;
    }
    if (args.metallic !== undefined) {
      updates.metallic = args.metallic;
    }
    if (args.isActive !== undefined) {
      updates.isActive = args.isActive;
    }

    await ctx.db.patch(args.id, updates);

    await invalidateBrandCSS(ctx, config.brandId);

    return args.id;
  },
});

/**
 * Update translucent settings only
 */
export const updateTranslucent = mutation({
  args: {
    brandId: v.id('brands'),
    translucent: v.object({
      light: v.object({
        minimal: v.number(),
        subtle: v.number(),
        moderate: v.number(),
        heavy: v.number(),
      }),
      dark: v.object({
        minimal: v.number(),
        subtle: v.number(),
        moderate: v.number(),
        heavy: v.number(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      translucent: args.translucent,
      updatedAt: Date.now(),
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Update frosted settings only
 */
export const updateFrosted = mutation({
  args: {
    brandId: v.id('brands'),
    frosted: v.object({
      blur: v.object({
        ultraThin: v.number(),
        thin: v.number(),
        regular: v.number(),
        thick: v.number(),
        ultraThick: v.number(),
      }),
      backgroundOpacity: v.object({
        ultraThin: v.number(),
        thin: v.number(),
        regular: v.number(),
        thick: v.number(),
        ultraThick: v.number(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      frosted: args.frosted,
      updatedAt: Date.now(),
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Update glass settings only
 */
export const updateGlass = mutation({
  args: {
    brandId: v.id('brands'),
    glass: v.object({
      blur: v.object({
        regular: v.number(),
        clear: v.number(),
      }),
      saturation: v.object({
        regular: v.number(),
        clear: v.number(),
      }),
      highlightIntensity: v.object({
        minimal: v.number(),
        moderate: v.number(),
        strong: v.number(),
      }),
      tintOpacity: v.object({
        light: v.number(),
        dark: v.number(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      glass: args.glass,
      updatedAt: Date.now(),
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Update metallic settings only
 */
export const updateMetallic = mutation({
  args: {
    brandId: v.id('brands'),
    metallic: metallicConfigValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      metallic: args.metallic,
      updatedAt: Date.now(),
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Update a single metallic preset
 */
export const updateMetallicPreset = mutation({
  args: {
    brandId: v.id('brands'),
    preset: metallicPresetNameValidator,
    values: metallicPresetValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    const updatedMetallic = {
      ...config.metallic,
      [args.preset]: args.values,
    };

    await ctx.db.patch(config._id, {
      metallic: updatedMetallic,
      updatedAt: Date.now(),
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Update the full variant list of a single metallic material (e.g. all golds).
 * Persists the new `{ variants: [...] }` shape; the engine emits one token set
 * per variant (base variant keeps the legacy unsuffixed tokens).
 */
export const updateMetallicVariants = mutation({
  args: {
    brandId: v.id('brands'),
    preset: metallicPresetNameValidator,
    material: metallicMaterialValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    const updatedMetallic = {
      ...config.metallic,
      [args.preset]: args.material,
    };

    await ctx.db.patch(config._id, {
      metallic: updatedMetallic,
      updatedAt: Date.now(),
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Clone material configuration from one brand to another
 */
export const cloneForBrand = mutation({
  args: {
    sourceBrandId: v.id('brands'),
    targetBrandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.targetBrandId, 'editor');
    if (args.sourceBrandId === args.targetBrandId) {
      throw new Error('Source and target brand cannot be the same');
    }

    const sourceConfig = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.sourceBrandId))
      .first();

    if (!sourceConfig) {
      throw new Error('Source brand does not have material configuration');
    }

    // Check if target already has config
    const existingTarget = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.targetBrandId))
      .first();

    if (existingTarget) {
      throw new Error('Target brand already has material configuration');
    }

    const now = Date.now();

    const id = await ctx.db.insert('materialConfigs', {
      brandId: args.targetBrandId,
      translucent: sourceConfig.translucent,
      frosted: sourceConfig.frosted,
      glass: sourceConfig.glass,
      metallic: sourceConfig.metallic,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await invalidateBrandCSS(ctx, args.targetBrandId);

    return id;
  },
});

/**
 * Delete material configuration for a brand
 */
export const remove = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    await ctx.db.delete(config._id);

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Reset material configuration to defaults
 */
export const resetToDefaults = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Material configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      translucent: DEFAULT_MATERIALS.translucent,
      frosted: DEFAULT_MATERIALS.frosted,
      glass: DEFAULT_MATERIALS.glass,
      metallic: DEFAULT_MATERIALS.metallic,
      updatedAt: Date.now(),
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return config._id;
  },
});

/**
 * Get or create material configuration for a brand
 * Useful for ensuring a brand always has material config
 */
export const getOrCreate = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('materialConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      return existing;
    }

    const now = Date.now();

    const id = await ctx.db.insert('materialConfigs', {
      brandId: args.brandId,
      translucent: DEFAULT_MATERIALS.translucent,
      frosted: DEFAULT_MATERIALS.frosted,
      glass: DEFAULT_MATERIALS.glass,
      metallic: DEFAULT_MATERIALS.metallic,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await invalidateBrandCSS(ctx, args.brandId);

    return await ctx.db.get(id);
  },
});

/**
 * Get default material configuration (for reference/preview)
 */
export const getDefaults = query({
  args: {},
  handler: async () => {
    return DEFAULT_MATERIALS;
  },
});
