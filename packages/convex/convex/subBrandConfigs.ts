/**
 * subBrandConfigs.ts
 *
 * CRUD for sub-brand configurations.
 * Sub-brands are theme variants of a parent brand that define exactly 4 color roles:
 * primary, secondary, sparkle, brand-bg. All other foundations (typography, spacing,
 * icons, etc.) are inherited from the parent brand.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, canReadBrand } from './lib/auth';

const brandBgValidator = v.object({
  scaleName: v.string(),
  backgroundStep: v.object({ light: v.number(), dark: v.number() }),
});

const materialAssignmentsValidator = v.record(v.string(), v.string());

const appearanceMaterialsValidator = v.optional(v.object({
  materialAssignments: v.optional(materialAssignmentsValidator),
}));

/**
 * Get all sub-brands for a parent brand, ordered by creation time.
 */
export const getByParentBrand = query({
  args: { parentBrandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.parentBrandId))) return [];
    return await ctx.db
      .query('subBrandConfigs')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.parentBrandId))
      .order('asc')
      .collect();
  },
});

/**
 * Get ALL sub-brand configs across every parent brand, grouped by parentBrandId.
 * Used by the unified BrandPicker so it can render the whole tree from a
 * single subscription instead of N per-brand queries.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('subBrandConfigs').collect();
    const byParent: Record<string, typeof all> = {};
    for (const config of all) {
      const key = config.parentBrandId as unknown as string;
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(config);
    }
    return byParent;
  },
});

/**
 * Get a single sub-brand config by ID.
 */
export const getById = query({
  args: { id: v.id('subBrandConfigs') },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.parentBrandId))) return null;
    return doc;
  },
});

/**
 * Create or update a sub-brand config.
 * If `id` is provided and exists, it patches the record. Otherwise, inserts a new one.
 */
export const upsert = mutation({
  args: {
    id: v.optional(v.id('subBrandConfigs')),
    parentBrandId: v.id('brands'),
    name: v.string(),
    slug: v.string(),
    primary:   v.object({ scaleName: v.string(), baseStep: v.number() }),
    secondary: v.object({ scaleName: v.string(), baseStep: v.number() }),
    sparkle:   v.object({ scaleName: v.string(), baseStep: v.number() }),
    brandBg: brandBgValidator,
    materials: appearanceMaterialsValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.parentBrandId, 'editor');
    // Verify parent brand exists
    const parent = await ctx.db.get(args.parentBrandId);
    if (!parent) throw new Error('Parent brand not found');

    const now = Date.now();
    const { id, ...fields } = args;

    if (id) {
      const existing = await ctx.db.get(id);
      if (!existing) throw new Error('Sub-brand not found');
      await ctx.db.patch(id, { ...fields, updatedAt: now });
      return id;
    }

    // Check for duplicate slug within the same parent brand
    const all = await ctx.db
      .query('subBrandConfigs')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.parentBrandId))
      .collect();
    if (all.some((s) => s.slug === args.slug)) {
      throw new Error(`A sub-brand with slug "${args.slug}" already exists for this brand`);
    }

    return await ctx.db.insert('subBrandConfigs', {
      ...fields,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Delete a sub-brand config.
 */
export const remove = mutation({
  args: { id: v.id('subBrandConfigs') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error('Sub-brand not found');
    await requireBrandRole(ctx, existing.parentBrandId, 'editor');
    await ctx.db.delete(args.id);
    return args.id;
  },
});
