/**
 * Preset Color Scales - System-wide color palette management
 *
 * This module handles:
 * - Uploading JSON color scale collections (like ColourScaleJio_v1010.json)
 * - Listing available preset collections and scales
 * - Brand selection of preset scales
 *
 * Preset scales are read-only and fixed - users cannot modify them.
 * Brands can either select from presets OR create custom scales (one-to-one).
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { requireBrandRole, requirePlatformOwner, requireUser, canReadBrand } from './lib/auth';

// JSON schema type for uploaded color scale files
// Matches the structure of ColourScaleJio_v1010.json
interface ColorScaleJsonStep {
  [step: string]: string; // "100": "oklch(...)", "200": "oklch(...)", etc.
}

interface ColorScaleJsonEntry extends ColorScaleJsonStep {
  base: string; // The base step, e.g., "1700"
}

interface ColorScaleJsonFile {
  [scaleName: string]: ColorScaleJsonEntry;
}

// Valid step values (100-2500 in increments of 100)
const VALID_STEPS = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '1000',
  '1100',
  '1200',
  '1300',
  '1400',
  '1500',
  '1600',
  '1700',
  '1800',
  '1900',
  '2000',
  '2100',
  '2200',
  '2300',
  '2400',
  '2500',
] as const;

/**
 * Validate the JSON structure of an uploaded color scale file
 */
function validateColorScaleJson(json: unknown): {
  valid: boolean;
  errors: string[];
  data?: ColorScaleJsonFile;
} {
  const errors: string[] = [];

  if (typeof json !== 'object' || json === null) {
    return { valid: false, errors: ['Invalid JSON: expected an object'] };
  }

  const data = json as Record<string, unknown>;

  for (const [scaleName, scaleData] of Object.entries(data)) {
    if (typeof scaleData !== 'object' || scaleData === null) {
      errors.push(`Scale "${scaleName}": expected an object`);
      continue;
    }

    const scale = scaleData as Record<string, unknown>;

    // Check for base property
    if (!('base' in scale)) {
      errors.push(`Scale "${scaleName}": missing "base" property`);
    } else if (typeof scale.base !== 'string') {
      errors.push(`Scale "${scaleName}": "base" must be a string`);
    } else if (!VALID_STEPS.includes(scale.base as (typeof VALID_STEPS)[number])) {
      errors.push(
        `Scale "${scaleName}": invalid base step "${scale.base}". Must be one of: ${VALID_STEPS.join(', ')}`
      );
    }

    // Check for all 25 steps
    for (const step of VALID_STEPS) {
      if (!(step in scale)) {
        errors.push(`Scale "${scaleName}": missing step "${step}"`);
      } else if (typeof scale[step] !== 'string') {
        errors.push(`Scale "${scaleName}": step "${step}" must be a string`);
      } else {
        // Validate oklch format
        const oklchValue = scale[step] as string;
        if (!oklchValue.startsWith('oklch(') || !oklchValue.endsWith(')')) {
          errors.push(
            `Scale "${scaleName}": step "${step}" must be in oklch() format, got "${oklchValue}"`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as ColorScaleJsonFile) : undefined,
  };
}

// ============================================
// QUERIES
// ============================================

/**
 * List all preset color scale collections
 */
export const listCollections = query({
  args: {},
  handler: async (ctx) => {
    const collections = await ctx.db
      .query('presetColorScaleCollections')
      .order('desc')
      .collect();

    return collections;
  },
});

/**
 * Get a single collection by ID with all its scales
 * NOTE: This can return large payloads (1MB+). Use getCollectionSummary for initial load.
 */
export const getCollection = query({
  args: { collectionId: v.id('presetColorScaleCollections') },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) return null;

    const scales = await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    return {
      ...collection,
      scales,
    };
  },
});

/**
 * Get collection with scale summaries only (no steps data)
 * Much faster - returns ~10KB instead of 1MB+
 */
export const getCollectionSummary = query({
  args: { collectionId: v.id('presetColorScaleCollections') },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) return null;

    const scales = await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    // Return only summary data - no steps (the heavy part)
    const scaleSummaries = scales.map(s => ({
      _id: s._id,
      name: s.name,
      baseStep: s.baseStep,
      // Include just the base color for preview
      baseColor: s.steps.find(step => step.step === s.baseStep)?.oklch || '',
    }));

    return {
      ...collection,
      scales: scaleSummaries,
    };
  },
});

/**
 * Get a single scale with full steps data
 * Use this to load steps on demand
 */
export const getScale = query({
  args: { scaleId: v.id('presetColorScales') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scaleId);
  },
});

/**
 * Get the default collection (if any)
 */
export const getDefaultCollection = query({
  args: {},
  handler: async (ctx) => {
    const collection = await ctx.db
      .query('presetColorScaleCollections')
      .withIndex('by_default', (q) => q.eq('isDefault', true))
      .first();

    if (!collection) return null;

    const scales = await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q) => q.eq('collectionId', collection._id))
      .collect();

    return {
      ...collection,
      scales,
    };
  },
});

/**
 * List all scales in a collection
 */
export const listScales = query({
  args: { collectionId: v.id('presetColorScaleCollections') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();
  },
});

/**
 * Get a brand's selected preset scales
 * WARNING: This returns full step data (1MB+). Use getBrandSelectionLightweight for overview pages.
 */
export const getBrandSelection = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const selection = await ctx.db
      .query('brandPresetScaleSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!selection) return null;

    const collection = await ctx.db.get(selection.collectionId);
    if (!collection) return null;

    // Parallel indexed lookups instead of sequential N+1 queries
    const selectedScales = (await Promise.all(
      selection.selectedScales.map(scaleName =>
        ctx.db
          .query('presetColorScales')
          .withIndex('by_collection_name', (q) =>
            q.eq('collectionId', selection.collectionId).eq('name', scaleName)
          )
          .first()
      )
    )).filter((s): s is NonNullable<typeof s> => s !== null);

    return {
      collection,
      selectedScales,
      selectedScaleNames: selection.selectedScales,
    };
  },
});

/**
 * Get a brand's selected preset scales with minimal data (lightweight version)
 * Returns ~10KB instead of 1MB+ - suitable for overview pages
 * Use getScaleStepValues to fetch specific step values on-demand
 */
export const getBrandSelectionLightweight = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const selection = await ctx.db
      .query('brandPresetScaleSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!selection) return null;

    const collection = await ctx.db.get(selection.collectionId);
    if (!collection) return null;

    // Parallel indexed lookups instead of sequential N+1 queries
    const selectedScales = (await Promise.all(
      selection.selectedScales.map(scaleName =>
        ctx.db
          .query('presetColorScales')
          .withIndex('by_collection_name', (q) =>
            q.eq('collectionId', selection.collectionId).eq('name', scaleName)
          )
          .first()
      )
    )).filter((s): s is NonNullable<typeof s> => s !== null);

    // Return lightweight summaries (no full step data)
    const scaleSummaries = selectedScales.map(s => ({
      _id: s._id,
      name: s.name,
      baseStep: s.baseStep,
      // Include just the base color for preview
      baseColor: s.steps.find(step => step.step === s.baseStep)?.oklch || '',
    }));

    return {
      collection: {
        _id: collection._id,
        name: collection.name,
        version: collection.version,
      },
      selectedScales: scaleSummaries,
      selectedScaleNames: selection.selectedScales,
    };
  },
});

/**
 * Get specific step values for multiple scales (on-demand loading)
 * Use this to fetch only the steps you need instead of all 25 steps per scale
 */
export const getScaleStepValues = query({
  args: {
    brandId: v.id('brands'),
    steps: v.array(v.object({
      scaleName: v.string(),
      stepNumber: v.string(), // "100" to "2500"
    })),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const selection = await ctx.db
      .query('brandPresetScaleSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!selection) return null;

    // Deduplicate requested scale names
    const uniqueScaleNames = [...new Set(args.steps.map(s => s.scaleName))];

    // Parallel indexed lookups for needed scales (no sequential N+1)
    const validScaleNames = uniqueScaleNames.filter(name => selection.selectedScales.includes(name));
    const scales = (await Promise.all(
      validScaleNames.map(scaleName =>
        ctx.db
          .query('presetColorScales')
          .withIndex('by_collection_name', (q) =>
            q.eq('collectionId', selection.collectionId).eq('name', scaleName)
          )
          .first()
      )
    )).filter((s): s is NonNullable<typeof s> => s !== null);

    const scaleMap = new Map<string, Map<string, string>>();
    for (const scale of scales) {
      const stepMap = new Map<string, string>();
      for (const step of scale.steps) {
        stepMap.set(step.step, step.oklch);
      }
      scaleMap.set(scale.name, stepMap);
    }

    // Return requested step values
    const results: Record<string, Record<string, string>> = {};
    for (const { scaleName, stepNumber } of args.steps) {
      const stepMap = scaleMap.get(scaleName);
      if (stepMap) {
        if (!results[scaleName]) {
          results[scaleName] = {};
        }
        results[scaleName][stepNumber] = stepMap.get(stepNumber) || '';
      }
    }

    return results;
  },
});

/**
 * Resolve step references to OKLCH values (server-side resolution)
 * Takes references like "Primary-1300", "Neutral-2500" and returns OKLCH values
 * Much more efficient than fetching all steps - only fetches what's needed
 */
export const resolveStepReferences = query({
  args: {
    brandId: v.id('brands'),
    references: v.array(v.string()), // ["Primary-1300", "Neutral-2500", ...]
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const selection = await ctx.db
      .query('brandPresetScaleSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!selection) return {};

    // Parse references to extract unique scale names
    const parsedRefs: Array<{ ref: string; scaleName: string; stepNumber: string }> = [];
    const uniqueScaleNames = new Set<string>();
    for (const ref of args.references) {
      const match = ref.match(/^(.+)-(\d+)$/);
      if (!match) continue;
      const [, scaleName, stepNumber] = match;
      parsedRefs.push({ ref, scaleName, stepNumber });
      uniqueScaleNames.add(scaleName);
    }

    // Parallel indexed lookups for needed scales (no sequential N+1)
    const validScaleNames = [...uniqueScaleNames].filter(name => selection.selectedScales.includes(name));
    const scales = (await Promise.all(
      validScaleNames.map(scaleName =>
        ctx.db
          .query('presetColorScales')
          .withIndex('by_collection_name', (q) =>
            q.eq('collectionId', selection.collectionId).eq('name', scaleName)
          )
          .first()
      )
    )).filter((s): s is NonNullable<typeof s> => s !== null);

    const scaleMap = new Map<string, Map<string, string>>();
    for (const scale of scales) {
      const stepMap = new Map<string, string>();
      for (const step of scale.steps) {
        stepMap.set(step.step, step.oklch);
      }
      scaleMap.set(scale.name, stepMap);
    }

    // Resolve references
    const results: Record<string, string> = {};
    for (const { ref, scaleName, stepNumber } of parsedRefs) {
      const stepMap = scaleMap.get(scaleName);
      if (stepMap) {
        results[ref] = stepMap.get(stepNumber) || '';
      }
    }

    return results;
  },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Upload a new color scale collection from JSON
 * Creates the collection and all its scales in one transaction
 */
export const uploadCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    jsonContent: v.string(), // Raw JSON string
    setAsDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const now = Date.now();

    // Parse and validate JSON
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(args.jsonContent);
    } catch {
      throw new Error('Invalid JSON format: ' + (args.jsonContent.substring(0, 100) + '...'));
    }

    const validation = validateColorScaleJson(parsedJson);
    if (!validation.valid || !validation.data) {
      throw new Error('JSON validation failed:\n' + validation.errors.join('\n'));
    }

    // Check if collection with same name exists
    const existingCollection = await ctx.db
      .query('presetColorScaleCollections')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (existingCollection) {
      throw new Error(`A collection with name "${args.name}" already exists`);
    }

    // If setting as default, unset other defaults
    if (args.setAsDefault) {
      const currentDefault = await ctx.db
        .query('presetColorScaleCollections')
        .withIndex('by_default', (q) => q.eq('isDefault', true))
        .first();

      if (currentDefault) {
        await ctx.db.patch(currentDefault._id, { isDefault: false, updatedAt: now });
      }
    }

    // Create the collection
    const collectionId = await ctx.db.insert('presetColorScaleCollections', {
      name: args.name,
      description: args.description,
      version: args.version,
      isDefault: args.setAsDefault ?? false,
      createdAt: now,
      updatedAt: now,
    });

    // Create all scales
    const scaleNames: string[] = [];
    for (const [scaleName, scaleData] of Object.entries(validation.data)) {
      // Extract steps
      const steps: Array<{ step: string; oklch: string }> = [];
      for (const step of VALID_STEPS) {
        steps.push({
          step,
          oklch: scaleData[step],
        });
      }

      await ctx.db.insert('presetColorScales', {
        collectionId,
        name: scaleName,
        baseStep: scaleData.base,
        steps,
        createdAt: now,
        updatedAt: now,
      });

      scaleNames.push(scaleName);
    }

    return {
      collectionId,
      scaleCount: scaleNames.length,
      scaleNames,
    };
  },
});

/**
 * Delete a color scale collection and all its scales
 */
export const deleteCollection = mutation({
  args: { collectionId: v.id('presetColorScaleCollections') },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    // Delete all scales in the collection
    const scales = await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    for (const scale of scales) {
      await ctx.db.delete(scale._id);
    }

    // Delete all brand selections for this collection
    const selections = await ctx.db
      .query('brandPresetScaleSelections')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    for (const selection of selections) {
      await ctx.db.delete(selection._id);
    }

    // Delete the collection
    await ctx.db.delete(args.collectionId);

    return { deleted: true, scalesDeleted: scales.length };
  },
});

/**
 * Rename/update a collection's name and version
 */
export const renameCollection = mutation({
  args: {
    collectionId: v.id('presetColorScaleCollections'),
    name: v.string(),
    version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const now = Date.now();

    await ctx.db.patch(args.collectionId, {
      name: args.name,
      ...(args.version !== undefined && { version: args.version }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Get a single collection with all its scales (for export)
 */
export const getCollectionWithScales = query({
  args: { collectionId: v.id('presetColorScaleCollections') },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) return null;

    const scales = await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    // Build export-ready format matching the original JSON structure
    const exportData: Record<string, Record<string, string>> = {};

    for (const scale of scales) {
      const scaleData: Record<string, string> = {
        base: scale.baseStep,
      };

      for (const step of scale.steps) {
        scaleData[step.step] = step.oklch;
      }

      exportData[scale.name] = scaleData;
    }

    return {
      collection,
      scales,
      exportData,
    };
  },
});

/**
 * Set a collection as the default
 */
export const setDefaultCollection = mutation({
  args: { collectionId: v.id('presetColorScaleCollections') },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const now = Date.now();

    // Unset current default
    const currentDefault = await ctx.db
      .query('presetColorScaleCollections')
      .withIndex('by_default', (q) => q.eq('isDefault', true))
      .first();

    if (currentDefault) {
      await ctx.db.patch(currentDefault._id, { isDefault: false, updatedAt: now });
    }

    // Set new default
    await ctx.db.patch(args.collectionId, { isDefault: true, updatedAt: now });

    return { success: true };
  },
});

/**
 * Select preset scales for a brand
 */
export const selectScalesForBrand = mutation({
  args: {
    brandId: v.id('brands'),
    collectionId: v.id('presetColorScaleCollections'),
    selectedScales: v.array(v.string()), // Array of scale names
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();

    // Validate that all selected scales exist in the collection
    // Only validate if the collection has scales (skip for legacy/migrated data)
    const scales = await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    const availableScaleNames = scales.map((s) => s.name);

    // Only validate if collection has scales (allows sync of legacy data)
    if (availableScaleNames.length > 0) {
      const invalidScales = args.selectedScales.filter(
        (name) => !availableScaleNames.includes(name)
      );

      if (invalidScales.length > 0) {
        throw new Error(
          `Invalid scale names: ${invalidScales.join(', ')}. Available: ${availableScaleNames.join(', ')}`
        );
      }
    }

    // Check for existing selection
    const existingSelection = await ctx.db
      .query('brandPresetScaleSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existingSelection) {
      // Update existing selection
      await ctx.db.patch(existingSelection._id, {
        collectionId: args.collectionId,
        selectedScales: args.selectedScales,
        updatedAt: now,
      });
      return { updated: true, selectionId: existingSelection._id };
    } else {
      // Create new selection
      const selectionId = await ctx.db.insert('brandPresetScaleSelections', {
        brandId: args.brandId,
        collectionId: args.collectionId,
        selectedScales: args.selectedScales,
        createdAt: now,
        updatedAt: now,
      });
      return { created: true, selectionId };
    }
  },
});

/**
 * Remove brand's preset scale selection (switch to custom scales)
 */
export const removeBrandSelection = mutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const selection = await ctx.db
      .query('brandPresetScaleSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (selection) {
      await ctx.db.delete(selection._id);
      return { removed: true };
    }

    return { removed: false, message: 'No selection found' };
  },
});

/**
 * Validate JSON without creating (for preview)
 */
export const validateJson = mutation({
  args: { jsonContent: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(args.jsonContent);
    } catch (e) {
      return {
        valid: false,
        errors: ['Invalid JSON format'],
        preview: null,
      };
    }

    const validation = validateColorScaleJson(parsedJson);

    if (!validation.valid || !validation.data) {
      return {
        valid: false,
        errors: validation.errors,
        preview: null,
      };
    }

    // Generate preview data
    const preview = Object.entries(validation.data).map(([name, data]) => ({
      name,
      baseStep: data.base,
      stepCount: VALID_STEPS.length,
      // Get the base color for preview
      baseColor: data[data.base],
    }));

    return {
      valid: true,
      errors: [],
      preview,
    };
  },
});
