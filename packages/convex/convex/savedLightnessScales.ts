/**
 * savedLightnessScales.ts
 *
 * Convex functions for managing user-saved lightness scale presets
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireUser } from './lib/auth';

// Note: Using v.any() for values because Convex validators don't support
// numeric string keys like '100', '200', etc.

/**
 * List all saved lightness scales
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('savedLightnessScales')
      .order('desc')
      .collect();
  },
});

/**
 * Get a saved lightness scale by ID
 */
export const get = query({
  args: {
    id: v.id('savedLightnessScales'),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Save a new lightness scale preset
 */
export const save = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    values: v.any(),
  },
  handler: async (ctx, { name, description, values }) => {
    await requireUser(ctx);
    const now = Date.now();

    // Check if name already exists
    const existing = await ctx.db
      .query('savedLightnessScales')
      .withIndex('by_name', (q) => q.eq('name', name))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        description,
        values,
        updatedAt: now,
      });
      return { id: existing._id, updated: true };
    }

    // Create new
    const id = await ctx.db.insert('savedLightnessScales', {
      name,
      description,
      values,
      createdAt: now,
      updatedAt: now,
    });

    return { id, updated: false };
  },
});

/**
 * Update an existing lightness scale
 */
export const update = mutation({
  args: {
    id: v.id('savedLightnessScales'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    values: v.optional(v.any()),
  },
  handler: async (ctx, { id, name, description, values }) => {
    await requireUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error('Lightness scale not found');
    }

    await ctx.db.patch(id, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(values !== undefined && { values }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a saved lightness scale
 */
export const remove = mutation({
  args: {
    id: v.id('savedLightnessScales'),
  },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
    return { success: true };
  },
});
