/**
 * Data Visualization Palettes - System-wide data vis color palette management
 *
 * Handles:
 * - Listing available collections and palettes
 * - Creating collections and seeding palettes
 * - Brand selection of a data vis palette collection + theme
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { generateFullScale } from './colorUtils';
import { requireBrandRole, requirePlatformOwner, canReadBrand } from './lib/auth';

// ============================================
// QUERIES
// ============================================

/**
 * List all data vis palette collections
 */
export const listCollections = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query('dataVisPaletteCollections')
      .order('desc')
      .collect();
  },
});

/**
 * Get all palettes for a specific theme + mode within a collection
 */
export const getPalettes = query({
  args: {
    collectionId: v.id('dataVisPaletteCollections'),
    themeName: v.string(),
    mode: v.union(v.literal('light'), v.literal('dark')),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection_theme_mode', (q) =>
        q
          .eq('collectionId', args.collectionId)
          .eq('themeName', args.themeName)
          .eq('mode', args.mode)
      )
      .collect();
  },
});

/**
 * Get palettes filtered by type (e.g. only 'categorical')
 */
export const getPalettesByType = query({
  args: {
    collectionId: v.id('dataVisPaletteCollections'),
    themeName: v.string(),
    mode: v.union(v.literal('light'), v.literal('dark')),
    paletteType: v.union(
      v.literal('categorical'),
      v.literal('monochromatic'),
      v.literal('sequential'),
      v.literal('divergingSemantic'),
      v.literal('divergingBrand'),
      v.literal('core'),
      v.literal('neutral'),
      v.literal('semantic'),
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection_theme_mode_type', (q) =>
        q
          .eq('collectionId', args.collectionId)
          .eq('themeName', args.themeName)
          .eq('mode', args.mode)
          .eq('paletteType', args.paletteType)
      )
      .collect();
  },
});

/**
 * List distinct theme names available within a collection
 */
export const listThemesInCollection = query({
  args: { collectionId: v.id('dataVisPaletteCollections') },
  handler: async (ctx, args) => {
    const palettes = await ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection', (q) => q.eq('collectionId', args.collectionId))
      .collect();
    return Array.from(new Set(palettes.map((p) => p.themeName))).sort();
  },
});

/**
 * Get the data vis palette selection for a brand
 */
export const getBrandSelection = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return ctx.db
      .query('brandDataVisPaletteSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();
  },
});

/**
 * Get the full resolved palette set for a brand (collection + theme + mode)
 */
export const getBrandPalettes = query({
  args: {
    brandId: v.id('brands'),
    mode: v.union(v.literal('light'), v.literal('dark')),
    // Optional override used when a sub-brand/variant is active (e.g. "MyJio").
    // When provided it is matched against theme names ahead of the brand name.
    matchName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const selection = await ctx.db
      .query('brandDataVisPaletteSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    // Resolve the collection to use (explicit selection wins, else first available).
    const firstCollection = await ctx.db
      .query('dataVisPaletteCollections')
      .order('asc')
      .first();
    if (!firstCollection) return null;

    const collectionId = selection?.collectionId ?? firstCollection._id;

    // The name to match against theme names: the sub-brand/variant name when
    // supplied (e.g. "MyJio"), otherwise the parent brand's name (e.g. "Jio").
    // Matching is normalised (case-insensitive, space/hyphen-agnostic) and takes
    // priority over any saved explicit selection so the active variant always wins.
    const brand = await ctx.db.get(args.brandId);
    const nameToMatch = args.matchName ?? brand?.name ?? '';

    // Collect all palettes for this collection to extract distinct theme names.
    // Collections are small (< 20 palette groups per theme × few themes), so this
    // single indexed fetch is low cost.
    const allPalettesInCollection = await ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection', (q) => q.eq('collectionId', collectionId))
      .collect();
    const distinctThemes = Array.from(new Set(allPalettesInCollection.map((p) => p.themeName)));
    const normalizedName = normalizeForMatch(nameToMatch);
    const matchedThemeName = nameToMatch
      ? (distinctThemes.find((t) => normalizeForMatch(t) === normalizedName) ?? null)
      : null;

    let themeName: string;
    if (matchedThemeName) {
      themeName = matchedThemeName;
    } else if (selection) {
      themeName = selection.themeName;
    } else {
      themeName = distinctThemes[0] ?? allPalettesInCollection[0]?.themeName;
      if (!themeName) return null;
    }

    const palettes = await ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection_theme_mode', (q) =>
        q
          .eq('collectionId', collectionId)
          .eq('themeName', themeName)
          .eq('mode', args.mode)
      )
      .collect();

    return { selection: selection ?? null, palettes };
  },
});

// ============================================
// MUTATIONS
// ============================================

// Valid palette types matching the schema
const PALETTE_TYPES = [
  'categorical',
  'monochromatic',
  'sequential',
  'divergingSemantic',
  'divergingBrand',
  'core',
  'neutral',
  'semantic',
] as const;
type PaletteType = typeof PALETTE_TYPES[number];

type RawColor = { valueOKLCH: string; valueHEX: string; token: string };
type RawColorMap = Record<string, RawColor>;
type RawSubGroupMap = Record<string, RawColorMap>;
type RawPaletteData = Record<string, RawColorMap | RawSubGroupMap>;

/**
 * Normalise a theme/brand name for fuzzy matching.
 * Strips spaces, hyphens and underscores, lowercases everything so that
 * "Jio Home" === "JioHome" === "jio-home" → "jiohome".
 */
function normalizeForMatch(s: string): string {
  return s.toLowerCase().replace(/[\s_-]/g, '');
}

/**
 * Detect whether a palette type's value is flat (colors directly)
 * or grouped (sub-groups containing colors).
 * A color entry always has `valueOKLCH`.
 */
function isColorEntry(val: unknown): val is RawColor {
  return typeof val === 'object' && val !== null && 'valueOKLCH' in val;
}

/**
 * Parse the raw JSON from a theme palette file (e.g. MyJio-Light.json).
 *
 * Accepted input shapes:
 *   A) Top-level key is the theme label: { "MyJio - Light": { categorical: {...}, ... } }
 *   B) Palette data directly:            { categorical: {...}, ... }
 *
 * Returns an array of palette rows ready to insert.
 */
function parsePaletteJson(
  raw: unknown,
  themeName: string,
  mode: 'light' | 'dark'
): Array<{
  themeName: string;
  mode: 'light' | 'dark';
  paletteType: PaletteType;
  name: string;
  colors: Array<{ index: string; valueOKLCH: string; valueHEX: string; token: string }>;
}> {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('JSON must be an object');
  }

  const topLevel = raw as Record<string, unknown>;
  const keys = Object.keys(topLevel);

  // Shape A: single top-level theme key whose value is the palette data
  let paletteData: RawPaletteData;
  const firstValue = topLevel[keys[0]];
  const isShapeA =
    keys.length === 1 &&
    typeof firstValue === 'object' &&
    firstValue !== null &&
    !PALETTE_TYPES.includes(keys[0] as PaletteType);

  if (isShapeA) {
    paletteData = firstValue as RawPaletteData;
  } else {
    paletteData = topLevel as RawPaletteData;
  }

  const rows: ReturnType<typeof parsePaletteJson> = [];

  for (const [typeKey, typeValue] of Object.entries(paletteData)) {
    if (!PALETTE_TYPES.includes(typeKey as PaletteType)) continue;
    const paletteType = typeKey as PaletteType;

    if (typeof typeValue !== 'object' || typeValue === null) continue;
    const typeObj = typeValue as Record<string, unknown>;
    const firstEntry = Object.values(typeObj)[0];

    if (isColorEntry(firstEntry)) {
      // Flat type — colors are direct children (e.g. divergingSemantic, core)
      const colors = Object.entries(typeObj)
        .filter(([, v]) => isColorEntry(v))
        .map(([index, v]) => {
          const c = v as RawColor;
          return { index, valueOKLCH: c.valueOKLCH, valueHEX: c.valueHEX, token: c.token };
        });
      rows.push({ themeName, mode, paletteType, name: paletteType, colors });
    } else {
      // Grouped type — sub-groups (e.g. categorical.bold, sequential.category1)
      // Also handles one extra level of nesting (e.g. categorical.extended.bold → name "extendedBold")
      for (const [subName, subValue] of Object.entries(typeObj)) {
        if (typeof subValue !== 'object' || subValue === null) continue;
        const subObj = subValue as Record<string, unknown>;
        const firstSubEntry = Object.values(subObj)[0];

        if (isColorEntry(firstSubEntry)) {
          // Standard flat sub-group: colors are direct children
          const colors = Object.entries(subObj)
            .filter(([, v]) => isColorEntry(v))
            .map(([index, v]) => {
              const c = v as RawColor;
              return { index, valueOKLCH: c.valueOKLCH, valueHEX: c.valueHEX, token: c.token };
            });
          if (colors.length > 0) {
            rows.push({ themeName, mode, paletteType, name: subName, colors });
          }
        } else {
          // Nested sub-group: e.g. categorical.extended.bold / categorical.extended.hover
          // Composed name: "extended" + "bold" → "extendedBold" → CSS token "ExtendedBold"
          for (const [nestedName, nestedValue] of Object.entries(subObj)) {
            if (typeof nestedValue !== 'object' || nestedValue === null) continue;
            const nestedObj = nestedValue as Record<string, unknown>;
            const colors = Object.entries(nestedObj)
              .filter(([, v]) => isColorEntry(v))
              .map(([index, v]) => {
                const c = v as RawColor;
                return { index, valueOKLCH: c.valueOKLCH, valueHEX: c.valueHEX, token: c.token };
              });
            if (colors.length > 0) {
              const composedName = `${subName}${nestedName.charAt(0).toUpperCase()}${nestedName.slice(1)}`;
              rows.push({ themeName, mode, paletteType, name: composedName, colors });
            }
          }
        }
      }
    }
  }

  return rows;
}

/**
 * Upload a theme's data vis palettes from its raw JSON file.
 *
 * - Creates the collection if it doesn't already exist.
 * - Replaces any existing palettes for the same themeName + mode.
 * - Call once per JSON file (light and dark are separate calls).
 *
 * Usage:
 *   npx convex run dataVisPalettes:uploadCollection \
 *     '{ "collectionName": "Jio Data Vis v1", "version": "v1.0.0",
 *        "themeName": "MyJio", "mode": "light",
 *        "jsonContent": "<paste file contents>" }'
 */
export const uploadCollection = mutation({
  args: {
    collectionName: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    setAsDefault: v.optional(v.boolean()),
    themeName: v.string(),
    mode: v.union(v.literal('light'), v.literal('dark')),
    jsonContent: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const now = Date.now();

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(args.jsonContent);
    } catch {
      throw new Error('Invalid JSON: could not parse file contents');
    }

    // Get or create the collection
    let collection = await ctx.db
      .query('dataVisPaletteCollections')
      .withIndex('by_name', (q) => q.eq('name', args.collectionName))
      .first();

    if (!collection) {
      if (args.setAsDefault) {
        const currentDefault = await ctx.db
          .query('dataVisPaletteCollections')
          .withIndex('by_default', (q) => q.eq('isDefault', true))
          .first();
        if (currentDefault) {
          await ctx.db.patch(currentDefault._id, { isDefault: false, updatedAt: now });
        }
      }
      const collectionId = await ctx.db.insert('dataVisPaletteCollections', {
        name: args.collectionName,
        description: args.description,
        version: args.version,
        isDefault: args.setAsDefault ?? false,
        createdAt: now,
        updatedAt: now,
      });
      collection = await ctx.db.get(collectionId);
    }

    if (!collection) throw new Error('Failed to create collection');

    // Delete existing palettes for this theme + mode so re-uploads are clean
    const existing = await ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection_theme_mode', (q) =>
        q.eq('collectionId', collection!._id).eq('themeName', args.themeName).eq('mode', args.mode)
      )
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    // Parse and insert
    const rows = parsePaletteJson(parsed, args.themeName, args.mode);
    for (const row of rows) {
      await ctx.db.insert('dataVisPalettes', { ...row, collectionId: collection._id, createdAt: now, updatedAt: now });
    }

    return {
      collection: args.collectionName,
      themeName: args.themeName,
      mode: args.mode,
      palettesInserted: rows.length,
      replacedExisting: existing.length,
    };
  },
});

/**
 * Add a single palette group to a collection
 * (e.g. categorical/bold for MyJio/light)
 */
export const addPalette = mutation({
  args: {
    collectionId: v.id('dataVisPaletteCollections'),
    themeName: v.string(),
    mode: v.union(v.literal('light'), v.literal('dark')),
    paletteType: v.union(
      v.literal('categorical'),
      v.literal('monochromatic'),
      v.literal('sequential'),
      v.literal('divergingSemantic'),
      v.literal('divergingBrand'),
      v.literal('core'),
      v.literal('neutral'),
      v.literal('semantic'),
    ),
    name: v.string(),
    colors: v.array(
      v.object({
        index: v.string(),
        valueOKLCH: v.string(),
        valueHEX: v.string(),
        token: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const now = Date.now();
    return ctx.db.insert('dataVisPalettes', {
      collectionId: args.collectionId,
      themeName: args.themeName,
      mode: args.mode,
      paletteType: args.paletteType,
      name: args.name,
      colors: args.colors,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Set or update a brand's data vis palette selection
 */
export const setBrandSelection = mutation({
  args: {
    brandId: v.id('brands'),
    collectionId: v.id('dataVisPaletteCollections'),
    themeName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    const existing = await ctx.db
      .query('brandDataVisPaletteSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        collectionId: args.collectionId,
        themeName: args.themeName,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert('brandDataVisPaletteSelections', {
      brandId: args.brandId,
      collectionId: args.collectionId,
      themeName: args.themeName,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Resolve the collection + theme for a brand using the same priority logic
 * as getBrandPalettes, but returning only the identifiers (lightweight).
 * Used by the DataVis viewer to stay in sync with the CSS injection.
 *
 * Priority:
 *   1. Brand-name → theme-name match (bypasses stale explicit selections)
 *   2. Explicit saved selection (for brands with no name-match theme)
 *   3. First available theme (universal fallback)
 */
export const getResolvedDataVisTheme = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const selection = await ctx.db
      .query('brandDataVisPaletteSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    const firstCollection = await ctx.db
      .query('dataVisPaletteCollections')
      .order('asc')
      .first();
    if (!firstCollection) return null;

    const collectionId = selection?.collectionId ?? firstCollection._id;

    const brand = await ctx.db.get(args.brandId);
    const brandName = brand?.name ?? '';

    const allPalettesInCollection = await ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection', (q) => q.eq('collectionId', collectionId))
      .collect();
    const distinctThemes = Array.from(new Set(allPalettesInCollection.map((p) => p.themeName)));
    const normalizedBrandName = normalizeForMatch(brandName);
    const matchedThemeName = brandName
      ? (distinctThemes.find((t) => normalizeForMatch(t) === normalizedBrandName) ?? null)
      : null;

    let themeName: string;
    if (matchedThemeName) {
      themeName = matchedThemeName;
    } else if (selection) {
      themeName = selection.themeName;
    } else {
      themeName = distinctThemes[0] ?? allPalettesInCollection[0]?.themeName;
      if (!themeName) return null;
    }

    return { collectionId: collectionId.toString(), themeName };
  },
});

/**
 * Remove a brand's explicit data vis palette selection so the automatic
 * name-matching fallback takes over. Useful for clearing stale selections.
 */
export const clearBrandDataVisSelection = mutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('brandDataVisPaletteSelections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Normalise a user-supplied entry name into a CSS-safe token segment.
 * "BJP Orange" → "BJPOrange", "positive!" → "Positive"
 */
function toTokenSafeName(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Upsert custom semantic palette entries for a collection + theme + mode.
 *
 * Each entry { name, baseColor } is expanded to a full 25-step OkLCH scale
 * using the same pipeline as brand color scales. The generated rows replace
 * all existing `semantic` palette entries for the given collection/theme/mode.
 *
 * CSS tokens emitted follow the grouped naming convention:
 *   --DataVis-Semantic-{SafeName}-{step}   e.g. --DataVis-Semantic-Positive-1300
 *   --DataVis-Semantic-{SafeName}-{step}-hex
 *
 * Maximum 20 entries to keep the token set bounded.
 */
export const upsertSemanticPalette = mutation({
  args: {
    collectionId: v.id('dataVisPaletteCollections'),
    themeName: v.string(),
    mode: v.union(v.literal('light'), v.literal('dark')),
    entries: v.array(
      v.object({
        name: v.string(),
        baseColor: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    if (args.entries.length > 20) {
      throw new Error('Maximum 20 semantic entries allowed');
    }

    const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

    for (const entry of args.entries) {
      if (!entry.name.trim()) {
        throw new Error('All entries must have a non-empty name');
      }
      if (!HEX_RE.test(entry.baseColor)) {
        throw new Error(
          `Entry "${entry.name}": baseColor must be a 6-digit hex (e.g. #22C55E)`
        );
      }
    }

    const now = Date.now();

    const existing = await ctx.db
      .query('dataVisPalettes')
      .withIndex('by_collection_theme_mode_type', (q) =>
        q
          .eq('collectionId', args.collectionId as Id<'dataVisPaletteCollections'>)
          .eq('themeName', args.themeName)
          .eq('mode', args.mode)
          .eq('paletteType', 'semantic')
      )
      .collect();

    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    for (const entry of args.entries) {
      const safeName = toTokenSafeName(entry.name) || 'Custom';
      const { steps } = generateFullScale(safeName, entry.baseColor);

      const colors = steps.map((s) => ({
        index: String(s.step),
        valueOKLCH: s.oklch,
        valueHEX: s.hex,
        token: `--DataVis-Semantic-${safeName}-${s.step}`,
      }));

      await ctx.db.insert('dataVisPalettes', {
        collectionId: args.collectionId as Id<'dataVisPaletteCollections'>,
        themeName: args.themeName,
        mode: args.mode,
        paletteType: 'semantic',
        name: entry.name,
        colors,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { entriesSaved: args.entries.length, replacedExisting: existing.length };
  },
});
