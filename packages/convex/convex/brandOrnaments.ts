/**
 * brandOrnaments.ts
 *
 * Convex functions for managing brand ornament assets and component decoration assignments.
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getSvgDecorationComponents } from '@oneui/shared';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

const SVG_DECORATION_COMPONENTS = getSvgDecorationComponents().map(
  (capability) => capability.componentName,
);
const SVG_DECORATION_COMPONENT_LOOKUP = new Map(
  SVG_DECORATION_COMPONENTS.map((componentName) => [componentName.toLowerCase(), componentName]),
);

function resolveSvgDecorationComponent(componentName: string): string | null {
  return SVG_DECORATION_COMPONENT_LOOKUP.get(componentName.toLowerCase()) ?? null;
}

function isSvgDecorationComponent(componentName: string): boolean {
  return resolveSvgDecorationComponent(componentName) !== null;
}

// ============================================================================
// Ornament Assets
// ============================================================================

/**
 * List all ornament assets for a brand.
 */
export const listByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, { brandId }) => {
    if (!(await canReadBrand(ctx, brandId))) return [];
    return await ctx.db
      .query('brandOrnaments')
      .withIndex('by_brand', (q) => q.eq('brandId', brandId))
      .collect();
  },
});

/**
 * Get a single ornament asset by ID.
 */
export const get = query({
  args: { ornamentId: v.id('brandOrnaments') },
  handler: async (ctx, { ornamentId }) => {
    const doc = await ctx.db.get(ornamentId);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return doc;
  },
});

/**
 * Create a new ornament asset for a brand.
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.string(),
    svgContent: v.string(),
    aspectRatio: v.number(),
    category: v.string(),
  },
  handler: async (ctx, { brandId, name, svgContent, aspectRatio, category }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const now = Date.now();
    return await ctx.db.insert('brandOrnaments', {
      brandId,
      name,
      svgContent,
      aspectRatio,
      category,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing ornament asset.
 */
export const update = mutation({
  args: {
    ornamentId: v.id('brandOrnaments'),
    name: v.optional(v.string()),
    svgContent: v.optional(v.string()),
    aspectRatio: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { ornamentId, ...fields }) => {
    await requireBrandRoleForDoc(ctx, 'brandOrnaments', ornamentId, 'editor');
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (fields.name !== undefined) patch.name = fields.name;
    if (fields.svgContent !== undefined) patch.svgContent = fields.svgContent;
    if (fields.aspectRatio !== undefined) patch.aspectRatio = fields.aspectRatio;
    if (fields.category !== undefined) patch.category = fields.category;

    await ctx.db.patch(ornamentId, patch);
  },
});

/**
 * Delete an ornament asset and remove any decoration assignments that reference it.
 */
export const remove = mutation({
  args: { ornamentId: v.id('brandOrnaments') },
  handler: async (ctx, { ornamentId }) => {
    await requireBrandRoleForDoc(ctx, 'brandOrnaments', ornamentId, 'editor');
    // Remove decoration assignments referencing this ornament
    const assignments = await ctx.db
      .query('componentDecorations')
      .filter((q) => q.eq(q.field('ornamentId'), ornamentId))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    await ctx.db.delete(ornamentId);
  },
});

// ============================================================================
// Component Decoration Assignments
// ============================================================================

/**
 * Get the decoration assignment for a specific brand + component.
 */
export const getDecoration = query({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, { brandId, componentName }) => {
    if (!(await canReadBrand(ctx, brandId))) return null;
    const supportedComponentName = resolveSvgDecorationComponent(componentName);
    if (!supportedComponentName) return null;

    const currentRecord = await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', supportedComponentName)
      )
      .first();
    if (currentRecord) return currentRecord;

    return await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName)
      )
      .first();
  },
});

/**
 * Get all decoration assignments for a brand (all components).
 */
export const listDecorationsByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, { brandId }) => {
    if (!(await canReadBrand(ctx, brandId))) return [];
    // No by_brand index on componentDecorations, so filter
    const records = await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) => q.eq('brandId', brandId))
      .collect();
    return records
      .filter((record) => isSvgDecorationComponent(record.componentName))
      .map((record) => ({
        ...record,
        componentName: resolveSvgDecorationComponent(record.componentName) ?? record.componentName,
      }));
  },
});

/**
 * Assign or update an ornament decoration for a brand + component.
 */
export const upsertDecoration = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
    ornamentId: v.id('brandOrnaments'),
    placement: v.string(),
    mirror: v.boolean(),
  },
  handler: async (ctx, { brandId, componentName, ornamentId, placement, mirror }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const supportedComponentName = resolveSvgDecorationComponent(componentName);
    if (!supportedComponentName) {
      throw new Error(`SVG ornaments are not supported for ${componentName}`);
    }

    const existing = await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', supportedComponentName)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ornamentId,
        placement,
        mirror,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('componentDecorations', {
      brandId,
      componentName: supportedComponentName,
      ornamentId,
      placement,
      mirror,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Remove a decoration assignment for a brand + component.
 */
export const removeDecoration = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.string(),
  },
  handler: async (ctx, { brandId, componentName }) => {
    await requireBrandRole(ctx, brandId, 'editor');
    const existing = await ctx.db
      .query('componentDecorations')
      .withIndex('by_brand_component', (q) =>
        q.eq('brandId', brandId).eq('componentName', componentName)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
