/**
 * compositionRules.ts
 *
 * Convex queries and mutations for modular composition rule sections.
 * Supports inheritance: scope='base' on system brand, scope='brand' for overrides.
 *
 * Mirrors voiceRules.ts pattern. Includes seed data for 12 composition
 * rule sections extracted from the canvas system prompt and design-composition skill.
 */

import { query, mutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { COMPOSITION_SEED_SECTIONS } from '@oneui/shared';
import { internal } from './_generated/api';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

// ============================================
// Queries
// ============================================

/**
 * Get all composition rules for a brand
 */
export const getByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('compositionRules')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * Get resolved composition rules (base + brand merged).
 * Brand-scoped rules override base-scoped rules for the same sectionId.
 */
export const getResolved = query({
  args: {
    brandId: v.id('brands'),
    systemBrandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    // Fetch base rules (from system brand)
    const baseRules = await ctx.db
      .query('compositionRules')
      .withIndex('by_brand', (q) => q.eq('brandId', args.systemBrandId))
      .collect();

    // Fetch brand-specific overrides
    const brandRules = await ctx.db
      .query('compositionRules')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    // Merge: brand overrides win for same sectionId
    const brandMap = new Map(brandRules.map((r) => [r.sectionId, r]));
    const baseMap = new Map(baseRules.map((r) => [r.sectionId, r]));

    // Start with all base rules, overlay brand-specific
    const resolved = [];
    const seenSections = new Set<string>();

    // Brand rules first (they win)
    for (const rule of brandRules) {
      resolved.push({ ...rule, source: 'brand' as const });
      seenSections.add(rule.sectionId);
    }

    // Then base rules for sections not overridden
    for (const rule of baseRules) {
      if (!seenSections.has(rule.sectionId)) {
        resolved.push({ ...rule, source: 'base' as const });
        seenSections.add(rule.sectionId);
      }
    }

    // Sort by priority
    resolved.sort((a, b) => a.priority - b.priority);

    return resolved;
  },
});

/**
 * Get the seed rule sections (for reference/seeding)
 */
export const getSeedSections = query({
  args: {},
  handler: async () => {
    return COMPOSITION_SEED_SECTIONS;
  },
});

// Internal query for use by other Convex functions
export const getResolvedInternal = internalQuery({
  args: {
    brandId: v.id('brands'),
    systemBrandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    const baseRules = await ctx.db
      .query('compositionRules')
      .withIndex('by_brand', (q) => q.eq('brandId', args.systemBrandId))
      .collect();

    const brandRules = await ctx.db
      .query('compositionRules')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    const seenSections = new Set<string>();
    const resolved = [];

    for (const rule of brandRules) {
      resolved.push({ ...rule, source: 'brand' as const });
      seenSections.add(rule.sectionId);
    }
    for (const rule of baseRules) {
      if (!seenSections.has(rule.sectionId)) {
        resolved.push({ ...rule, source: 'base' as const });
        seenSections.add(rule.sectionId);
      }
    }

    resolved.sort((a, b) => a.priority - b.priority);
    return resolved;
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Seed default composition rules for a brand (from COMPOSITION_SEED_SECTIONS).
 * Creates base-scoped rules on the system brand.
 */
export const seedDefaults = mutation({
  args: {
    brandId: v.id('brands'),
    scope: v.union(v.literal('base'), v.literal('brand')),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('compositionRules')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    if (existing.length > 0) {
      throw new Error('Composition rules already exist for this brand. Use upsert instead.');
    }

    const now = Date.now();
    const ids = [];

    for (const section of COMPOSITION_SEED_SECTIONS) {
      const id = await ctx.db.insert('compositionRules', {
        brandId: args.brandId,
        sectionId: section.sectionId,
        scope: args.scope,
        title: section.title,
        content: section.content,
        priority: section.priority,
        isActive: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
      await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedRule, { id });
    }

    return ids;
  },
});

/**
 * Upsert a single composition rule section
 */
export const upsert = mutation({
  args: {
    brandId: v.id('brands'),
    sectionId: v.string(),
    scope: v.union(v.literal('base'), v.literal('brand')),
    title: v.string(),
    content: v.string(),
    priority: v.number(),
    isActive: v.optional(v.boolean()),
    contexts: v.optional(v.array(v.string())),
    vertical: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('compositionRules')
      .withIndex('by_brand_section', (q) =>
        q.eq('brandId', args.brandId).eq('sectionId', args.sectionId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        priority: args.priority,
        isActive: args.isActive ?? existing.isActive,
        contexts: args.contexts,
        vertical: args.vertical,
        version: existing.version + 1,
        updatedAt: now,
      });
      // Hybrid RAG (RFC 0002): schedule a re-embed after edits. Idempotent
      // via embeddingHash, so safe if content is unchanged.
      await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedRule, {
        id: existing._id,
      });
      return existing._id;
    }

    const newId = await ctx.db.insert('compositionRules', {
      brandId: args.brandId,
      sectionId: args.sectionId,
      scope: args.scope,
      title: args.title,
      content: args.content,
      priority: args.priority,
      isActive: args.isActive ?? true,
      version: 1,
      contexts: args.contexts,
      vertical: args.vertical,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedRule, {
      id: newId,
    });
    return newId;
  },
});

/**
 * Toggle a rule section active/inactive
 */
export const toggleActive = mutation({
  args: {
    id: v.id('compositionRules'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionRules', args.id, 'editor');

    await ctx.db.patch(args.id, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update rule content
 */
export const updateContent = mutation({
  args: {
    id: v.id('compositionRules'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { doc: rule } = await requireBrandRoleForDoc(ctx, 'compositionRules', args.id, 'editor');

    await ctx.db.patch(args.id, {
      content: args.content,
      version: rule.version + 1,
      updatedAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedRule, {
      id: args.id,
    });
  },
});
