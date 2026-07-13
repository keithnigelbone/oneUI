/**
 * componentTokenOverrides.ts
 *
 * Convex queries and mutations for component-specific token overrides.
 * Used by the Component Token Editor for per-brand component customization.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { requireBrandRole, canReadBrand } from './lib/auth';

/**
 * Get all overrides for a specific component and brand
 */
export const getComponentOverrides = query({
  args: {
    componentName: v.string(),
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', args.brandId).eq('componentName', args.componentName)
      )
      .collect();
  },
});

/**
 * Get all overrides for a component and brand in a specific mode
 */
export const getComponentOverridesByMode = query({
  args: {
    componentName: v.string(),
    brandId: v.id('brands'),
    mode: v.union(v.literal('light'), v.literal('dark'), v.literal('dim')),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const overrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', args.brandId).eq('componentName', args.componentName)
      )
      .collect();

    return overrides.filter((o) => o.mode === args.mode);
  },
});

/**
 * Batch replace overrides for a component.
 * Deletes ALL existing overrides for this brand+component, then inserts the new set.
 * This is a true replace operation — no per-mode isolation, overrides apply to all themes.
 */
export const batchUpsertOverrides = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
    overrides: v.array(
      v.object({
        tokenName: v.string(),
        value: v.string(),
        scope: v.optional(v.string()), // 'global' | 'state' | 'variant' | combined scopes
        target: v.optional(v.object({
          variant: v.optional(v.string()),
          state: v.optional(v.string()),
          size: v.optional(v.string()),
          mediaContext: v.optional(v.string()),
        })),
        channel: v.optional(v.string()),
        valueKind: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();

    // Delete all existing overrides for this brand+component (clean replace)
    const existing = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', args.brandId).eq('componentName', args.componentName)
      )
      .collect();

    for (const record of existing) {
      await ctx.db.delete(record._id);
    }

    // Insert new overrides (mode-agnostic, stored as 'all')
    const results: string[] = [];
    for (const override of args.overrides) {
      const id = await ctx.db.insert('tokenOverrides', {
        brandId: args.brandId,
        componentName: args.componentName,
        tokenName: override.tokenName,
        mode: 'all',
        value: override.value,
        ...(override.scope !== undefined && { scope: override.scope }),
        ...(override.target !== undefined && { target: override.target }),
        ...(override.channel !== undefined && { channel: override.channel }),
        ...(override.valueKind !== undefined && { valueKind: override.valueKind }),
        createdAt: now,
        updatedAt: now,
      });
      results.push(id);
    }

    await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
      brandId: args.brandId,
    });

    return results;
  },
});

/**
 * Remove a single override for a component
 */
export const removeOverride = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
    tokenName: v.string(),
    mode: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const override = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', args.brandId).eq('componentName', args.componentName)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('tokenName'), args.tokenName),
          q.eq(q.field('mode'), args.mode)
        )
      )
      .first();

    if (override) {
      await ctx.db.delete(override._id);
      await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
        brandId: args.brandId,
      });
      return override._id;
    }

    return null;
  },
});

/**
 * Remove all overrides for a component in a specific brand
 */
export const removeAllForComponent = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const overrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', args.brandId).eq('componentName', args.componentName)
      )
      .collect();

    for (const override of overrides) {
      await ctx.db.delete(override._id);
    }

    if (overrides.length > 0) {
      await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
        brandId: args.brandId,
      });
    }

    return overrides.length;
  },
});

/**
 * Get components that have overrides for a brand
 */
export const getComponentsWithOverrides = query({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const overrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    // Extract unique component names
    const componentNames = new Set<string>();
    for (const override of overrides) {
      if (override.componentName) {
        componentNames.add(override.componentName);
      }
    }

    return Array.from(componentNames).map((name) => ({
      name,
      overrideCount: overrides.filter((o) => o.componentName === name).length,
    }));
  },
});

/**
 * Copy component overrides from one brand to another
 */
export const copyOverridesToBrand = mutation({
  args: {
    sourceBrandId: v.id('brands'),
    targetBrandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.targetBrandId, 'editor');
    const now = Date.now();

    // Get source overrides
    const sourceOverrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', args.sourceBrandId).eq('componentName', args.componentName)
      )
      .collect();

    // Remove existing target overrides
    const existingTarget = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', args.targetBrandId).eq('componentName', args.componentName)
      )
      .collect();

    for (const override of existingTarget) {
      await ctx.db.delete(override._id);
    }

    // Create new overrides in target brand
    const results: string[] = [];
    for (const override of sourceOverrides) {
      const id = await ctx.db.insert('tokenOverrides', {
        brandId: args.targetBrandId,
        componentName: args.componentName,
        tokenName: override.tokenName,
        mode: override.mode,
        value: override.value,
        ...(override.scope !== undefined && { scope: override.scope }),
        ...(override.target !== undefined && { target: override.target }),
        ...(override.channel !== undefined && { channel: override.channel }),
        ...(override.valueKind !== undefined && { valueKind: override.valueKind }),
        createdAt: now,
        updatedAt: now,
      });
      results.push(id);
    }

    return results;
  },
});

/**
 * Get component theme selections for a brand.
 */
export const getComponentThemeSelections = query({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, { brandId }) => {
    if (!(await canReadBrand(ctx, brandId))) return [];
    return await ctx.db
      .query('componentThemeSelections')
      .withIndex('by_brand_family', (q) => q.eq('brandId', brandId))
      .collect();
  },
});

/**
 * Insert or update component theme selections for a brand and family.
 */
export const upsertComponentThemeSelections = mutation({
  args: {
    brandId: v.id('brands'),
    familyId: v.string(),
    selections: v.any(),
  },
  handler: async (ctx, { brandId, familyId, selections }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const existing = await ctx.db
      .query('componentThemeSelections')
      .withIndex('by_brand_family', (q) =>
        q.eq('brandId', brandId).eq('familyId', familyId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        selections,
        updatedAt: Date.now(),
      });
      await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
        brandId,
      });
      return existing._id;
    }

    const id = await ctx.db.insert('componentThemeSelections', {
      brandId,
      familyId,
      selections,
      updatedAt: Date.now(),
    });

    await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
      brandId,
    });

    return id;
  },
});

/**
 * Delete the component theme selections row for a brand and family.
 *
 * Reset semantics: a deleted row is the canonical "inert" state — every
 * family decision falls back to its (inert) default, so the brand renders
 * exactly the manifest factory CSS for that family.
 */
export const deleteComponentThemeSelections = mutation({
  args: {
    brandId: v.id('brands'),
    familyId: v.string(),
  },
  handler: async (ctx, { brandId, familyId }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const existing = await ctx.db
      .query('componentThemeSelections')
      .withIndex('by_brand_family', (q) =>
        q.eq('brandId', brandId).eq('familyId', familyId)
      )
      .first();

    if (!existing) return false;

    await ctx.db.delete(existing._id);
    await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
      brandId,
    });
    return true;
  },
});

/**
 * Delete every component theme selections row for a brand ("Reset Global Theme").
 */
export const deleteAllComponentThemeSelections = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, { brandId }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const rows = await ctx.db
      .query('componentThemeSelections')
      .withIndex('by_brand_family', (q) => q.eq('brandId', brandId))
      .collect();

    for (const row of rows) {
      await ctx.db.delete(row._id);
    }

    if (rows.length > 0) {
      await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
        brandId,
      });
    }
    return rows.length;
  },
});

/**
 * Get all component theme selections, recipe selections and token overrides for a brand.
 * Used by Storybook to inject component-level customizations alongside
 * foundation tokens, ensuring Storybook matches the platform source of truth.
 */
export const getAllBrandComponentData = query({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, { brandId }) => {
    if (!(await canReadBrand(ctx, brandId))) return null;
    const [componentThemeSelections, recipeSelections, tokenOverrides] = await Promise.all([
      ctx.db
        .query('componentThemeSelections')
        .withIndex('by_brand_family', (q) => q.eq('brandId', brandId))
        .collect(),
      ctx.db
        .query('componentRecipeSelections')
        .withIndex('by_brand_component', (q) => q.eq('brandId', brandId))
        .collect(),
      ctx.db
        .query('tokenOverrides')
        .withIndex('by_brand', (q) => q.eq('brandId', brandId))
        .collect(),
    ]);

    const componentOverrides = tokenOverrides.filter(
      (o) => o.componentName != null
    );

    return { componentThemeSelections, recipeSelections, tokenOverrides: componentOverrides };
  },
});

/**
 * Get override statistics for a brand
 */
export const getOverrideStats = query({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const overrides = await ctx.db
      .query('tokenOverrides')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    const byComponent: Record<string, number> = {};
    const byMode: Record<string, number> = {};

    for (const override of overrides) {
      const componentName = override.componentName || 'global';
      byComponent[componentName] = (byComponent[componentName] || 0) + 1;
      byMode[override.mode] = (byMode[override.mode] || 0) + 1;
    }

    return {
      totalOverrides: overrides.length,
      byComponent,
      byMode,
    };
  },
});
