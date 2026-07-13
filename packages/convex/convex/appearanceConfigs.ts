import { query, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { requireBrandRole, canReadBrand } from './lib/auth';

const VALID_ROLES = [
  'primary', 'secondary',
  'neutral', 'sparkle', 'brand-bg',
  'positive', 'negative', 'warning', 'informative',
] as const;

const materialAssignmentsValidator = v.record(v.string(), v.string());

const appearanceMaterialsValidator = v.optional(v.object({
  materialAssignments: v.optional(materialAssignmentsValidator),
}));

export const getByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await ctx.db
      .query('appearanceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    brandId: v.id('brands'),
    accentCount: v.number(),
    background: v.object({
      scaleName: v.string(),
      backgroundStep: v.object({
        light: v.number(),
        dark: v.number(),
        dim: v.optional(v.number()),
      }),
    }),
    accents: v.array(v.object({
      role: v.string(),
      label: v.string(),
      scaleName: v.string(),
      baseStep: v.number(),
    })),
    logo: v.optional(v.object({
      scaleName: v.string(),
      baseStep: v.number(),
    })),
    materials: appearanceMaterialsValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    // Validate accentCount matches accents array length
    if (args.accents.length !== args.accentCount) {
      throw new Error(`accentCount (${args.accentCount}) must match accents array length (${args.accents.length})`);
    }

    // Validate accentCount range
    if (args.accentCount < 1 || args.accentCount > 9) {
      throw new Error('accentCount must be between 1 and 9');
    }

    // Validate roles
    for (const accent of args.accents) {
      if (!VALID_ROLES.includes(accent.role as any)) {
        throw new Error(`Invalid role "${accent.role}". Must be one of: ${VALID_ROLES.join(', ')}`);
      }
    }

    // Check for duplicate roles
    const roles = args.accents.map((a) => a.role);
    const uniqueRoles = new Set(roles);
    if (uniqueRoles.size !== roles.length) {
      throw new Error('Duplicate accent roles are not allowed');
    }

    const now = Date.now();

    // Check for existing config
    const existing = await ctx.db
      .query('appearanceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    let resultId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        accentCount: args.accentCount,
        background: args.background,
        accents: args.accents,
        logo: args.logo,
        materials: args.materials,
        updatedAt: now,
      });
      resultId = existing._id;
    } else {
      resultId = await ctx.db.insert('appearanceConfigs', {
        brandId: args.brandId,
        accentCount: args.accentCount,
        background: args.background,
        accents: args.accents,
        logo: args.logo,
        materials: args.materials,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Invalidate brand CSS cache when appearance config changes
    await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
      brandId: args.brandId,
    });

    return resultId;
  },
});
