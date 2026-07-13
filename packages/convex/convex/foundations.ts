/**
 * foundations.ts
 *
 * Convex queries and mutations for foundation configuration management.
 * Handles all 8 foundation types: color, surfaces, typography, spacing, shape, elevation, motion, icons.
 */

import { query, mutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { requireBrandRole, requireBrandRoleForDoc, requirePlatformOwner, canReadBrand } from './lib/auth';
import { resolveFontFiles, staticWeights } from './lib/fontFiles';
import {
  SPACING_TOKENS,
  getSvgDecorationComponents,
  migrateLegacyPlatformsConfig,
  resolveHeadingFontId,
  resolveTextFontId,
  type FontSelectionSlotsLike,
  type PlatformsFoundationConfig,
} from '@oneui/shared';

const SVG_DECORATION_COMPONENT_LOOKUP = new Map(
  getSvgDecorationComponents().map((capability) => [
    capability.componentName.toLowerCase(),
    capability.componentName,
  ])
);

// Foundation type union for validation
const foundationType = v.union(
  v.literal('color'),
  v.literal('surfaces'),
  v.literal('materials'),
  v.literal('typography'),
  v.literal('spacing'), // Legacy - use 'dimension' for new implementations
  v.literal('dimension'),
  v.literal('shape'),
  v.literal('elevation'),
  v.literal('motion'),
  v.literal('icons'),
  v.literal('platforms'),
  v.literal('voice'),
  v.literal('grid'),
  v.literal('gradients')
);

const CANONICAL_SPACING_TOKENS = new Set<string>(SPACING_TOKENS);

const MATERIAL_MODES = ['solid', 'transparent'] as const;
const MEDIA_CONTEXTS = ['dynamic', 'dark', 'light'] as const;
const MATERIAL_SURFACE_MODES = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
  'blend',
] as const;

type MaterialMode = typeof MATERIAL_MODES[number];
type MediaContext = typeof MEDIA_CONTEXTS[number];
type MaterialSurfaceMode = typeof MATERIAL_SURFACE_MODES[number];
type ActiveMetalName = 'bronze' | 'silver' | 'gold' | 'custom';

interface MaterialsFoundationConfig {
  version: 1;
  algorithm: 'oneui-material-media-v1';
  capabilities: {
    materialModes: readonly MaterialMode[];
    mediaContexts: readonly MediaContext[];
    surfaceModes: readonly MaterialSurfaceMode[];
  };
  defaultMaterialMode: MaterialMode;
  defaultMediaContext: MediaContext;
  effectsSource: 'materialConfigs';
  activeMetals: Record<ActiveMetalName, boolean>;
  materialAssignments?: unknown;
  subBrandMaterialAssignments?: unknown;
  metallic?: unknown;
}

const DEFAULT_ACTIVE_METALS: Record<ActiveMetalName, boolean> = {
  bronze: true,
  silver: true,
  gold: true,
  custom: false,
};

const DEFAULT_MATERIALS_FOUNDATION_CONFIG: MaterialsFoundationConfig = {
  version: 1,
  algorithm: 'oneui-material-media-v1',
  capabilities: {
    materialModes: MATERIAL_MODES,
    mediaContexts: MEDIA_CONTEXTS,
    surfaceModes: MATERIAL_SURFACE_MODES,
  },
  defaultMaterialMode: 'solid',
  defaultMediaContext: 'dynamic',
  effectsSource: 'materialConfigs',
  activeMetals: DEFAULT_ACTIVE_METALS,
};

const LEGACY_SPACING_TOKEN_TO_NUMERIC: Record<string, string> = {
  '5XS': '1',
  '4XS': '1-5',
  '3XS': '2',
  '2XS': '2-5',
  XS: '3',
  S: '3-5',
  M: '4',
  L: '4-5',
  XL: '5',
  '2XL': '6',
  '3XL': '7',
  '4XL': '8',
  '5XL': '9',
};

const FSTEP_TO_NUMERIC_SPACING_TOKEN: Record<string, string> = {
  'f-8': '0',
  'f-7': '0-5',
  'f-6': '1',
  'f-5': '1-5',
  'f-4': '2',
  'f-3': '2-5',
  'f-2': '3',
  'f-1': '3-5',
  f0: '4',
  f1: '4-5',
  f2: '5',
  'f2-5': '5-5',
  f3: '6',
  f4: '7',
  f5: '8',
  f6: '9',
  f7: '10',
  f8: '12',
  f9: '14',
  f10: '16',
  f11: '18',
  f12: '20',
  f13: '24',
  f14: '28',
  f15: '32',
  f16: '40',
};

function normalizeSpacingTokenName(token: string, fStep?: string): string {
  const hasSpacingPrefix = token.startsWith('Spacing-');
  const rawToken = hasSpacingPrefix ? token.slice('Spacing-'.length) : token;
  const normalizedFStep = fStep?.replace(/^Dimension-/, '');
  const numericToken = normalizedFStep
    ? FSTEP_TO_NUMERIC_SPACING_TOKEN[normalizedFStep]
    : undefined;
  const normalized =
    numericToken ??
    (CANONICAL_SPACING_TOKENS.has(rawToken)
      ? rawToken
      : LEGACY_SPACING_TOKEN_TO_NUMERIC[rawToken]) ??
    rawToken;

  return hasSpacingPrefix ? `Spacing-${normalized}` : normalized;
}

function normalizeSpacingFoundationValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeSpacingFoundationValue);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const source = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(source)) {
    normalized[normalizeSpacingTokenName(key)] = normalizeSpacingFoundationValue(entry);
  }

  if (typeof source.token === 'string') {
    normalized.token = normalizeSpacingTokenName(
      source.token,
      typeof source.fStep === 'string' ? source.fStep : undefined
    );
  }

  return normalized;
}

function isPlatformsFoundationConfig(config: unknown): config is PlatformsFoundationConfig {
  return (
    !!config &&
    typeof config === 'object' &&
    Array.isArray((config as { platforms?: unknown }).platforms)
  );
}

function normalizeMaterialsFoundationConfig(config: unknown): MaterialsFoundationConfig {
  if (!config || typeof config !== 'object') {
    return DEFAULT_MATERIALS_FOUNDATION_CONFIG;
  }

  const source = config as Record<string, unknown>;
  const defaultMaterialMode = MATERIAL_MODES.includes(source.defaultMaterialMode as MaterialMode)
    ? source.defaultMaterialMode as MaterialMode
    : DEFAULT_MATERIALS_FOUNDATION_CONFIG.defaultMaterialMode;
  const defaultMediaContext = MEDIA_CONTEXTS.includes(source.defaultMediaContext as MediaContext)
    ? source.defaultMediaContext as MediaContext
    : DEFAULT_MATERIALS_FOUNDATION_CONFIG.defaultMediaContext;
  const sourceActiveMetals = source.activeMetals && typeof source.activeMetals === 'object' && !Array.isArray(source.activeMetals)
    ? source.activeMetals as Partial<Record<ActiveMetalName, unknown>>
    : {};
  const activeMetals: Record<ActiveMetalName, boolean> = { ...DEFAULT_ACTIVE_METALS };
  for (const preset of Object.keys(DEFAULT_ACTIVE_METALS) as ActiveMetalName[]) {
    if (typeof sourceActiveMetals[preset] === 'boolean') {
      activeMetals[preset] = sourceActiveMetals[preset];
    }
  }

  return {
    ...DEFAULT_MATERIALS_FOUNDATION_CONFIG,
    defaultMaterialMode,
    defaultMediaContext,
    activeMetals,
    ...(source.materialAssignments && typeof source.materialAssignments === 'object' && !Array.isArray(source.materialAssignments)
      ? { materialAssignments: source.materialAssignments }
      : {}),
    ...(source.subBrandMaterialAssignments && typeof source.subBrandMaterialAssignments === 'object' && !Array.isArray(source.subBrandMaterialAssignments)
      ? { subBrandMaterialAssignments: source.subBrandMaterialAssignments }
      : {}),
    ...(source.metallic && typeof source.metallic === 'object' && !Array.isArray(source.metallic)
      ? { metallic: source.metallic }
      : {}),
  };
}

function normalizeFoundationConfig(type: string, config: unknown): unknown {
  if (type === 'spacing') {
    return normalizeSpacingFoundationValue(config);
  }

  if (type === 'materials') {
    return normalizeMaterialsFoundationConfig(config);
  }

  if (type === 'platforms' && isPlatformsFoundationConfig(config)) {
    return migrateLegacyPlatformsConfig(config);
  }

  return config;
}

function normalizeFoundationRecord<T extends { type: string; config?: unknown } | null | undefined>(
  foundation: T
): T {
  if (!foundation) return foundation;
  return {
    ...foundation,
    config: normalizeFoundationConfig(foundation.type, foundation.config),
  } as T;
}

function configsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Get all foundations for a brand
 */
export const list = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const foundations = await ctx.db
      .query('foundations')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
    return foundations.map(normalizeFoundationRecord);
  },
});

/**
 * Get a single foundation by ID
 */
export const get = query({
  args: { id: v.id('foundations') },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return normalizeFoundationRecord(doc);
  },
});

/**
 * Get a foundation by brand and type
 */
export const getByType = query({
  args: {
    brandId: v.id('brands'),
    type: foundationType,
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const foundation = await ctx.db
      .query('foundations')
      .withIndex('by_brand_type', (q) => q.eq('brandId', args.brandId).eq('type', args.type))
      .first();
    return normalizeFoundationRecord(foundation);
  },
});

/**
 * Get all active foundations for a brand
 */
export const listActive = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const foundations = await ctx.db
      .query('foundations')
      .withIndex('by_brand_active', (q) => q.eq('brandId', args.brandId).eq('isActive', true))
      .collect();
    return foundations.map(normalizeFoundationRecord);
  },
});

/**
 * Create a new foundation
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    type: foundationType,
    config: v.any(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');

    // Check if foundation already exists for this brand/type
    const existing = await ctx.db
      .query('foundations')
      .withIndex('by_brand_type', (q) => q.eq('brandId', args.brandId).eq('type', args.type))
      .first();

    if (existing) {
      throw new Error(`Foundation of type '${args.type}' already exists for this brand`);
    }

    const now = Date.now();
    const config = normalizeFoundationConfig(args.type, args.config);

    const foundationId = await ctx.db.insert('foundations', {
      brandId: args.brandId,
      type: args.type,
      config,
      version: 1,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return foundationId;
  },
});

/**
 * Update a foundation's config
 */
export const update = mutation({
  args: {
    id: v.id('foundations'),
    config: v.any(),
  },
  handler: async (ctx, args) => {
    const { doc: foundation } = await requireBrandRoleForDoc(ctx, 'foundations', args.id, 'editor');
    const config = normalizeFoundationConfig(foundation.type, args.config);

    await ctx.db.patch(args.id, {
      config,
      version: foundation.version + 1,
      updatedAt: Date.now(),
    });

    // Invalidate brand CSS cache when foundations change
    await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
      brandId: foundation.brandId,
    });

    return args.id;
  },
});

/**
 * Update foundation by brand and type (upsert pattern)
 */
export const upsertByType = mutation({
  args: {
    brandId: v.id('brands'),
    type: foundationType,
    config: v.any(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');

    const existing = await ctx.db
      .query('foundations')
      .withIndex('by_brand_type', (q) => q.eq('brandId', args.brandId).eq('type', args.type))
      .first();

    const now = Date.now();
    const config = normalizeFoundationConfig(args.type, args.config);

    let resultId;
    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        config,
        version: existing.version + 1,
        updatedAt: now,
      });
      resultId = existing._id;
    } else {
      // Create new
      resultId = await ctx.db.insert('foundations', {
        brandId: args.brandId,
        type: args.type,
        config,
        version: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Invalidate brand CSS cache when foundations change
    await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
      brandId: args.brandId,
    });

    return resultId;
  },
});

/**
 * Persist server-side foundation migrations for existing Convex records.
 *
 * Query handlers normalize on read, so the app behaves correctly immediately.
 * This mutation is the explicit write-through step for old untouched records
 * that still contain legacy platform/spacing config shapes.
 */
export const normalizePersistedConfigs = mutation({
  args: { brandId: v.optional(v.id('brands')) },
  handler: async (ctx, args) => {
    // Brand-scoped normalize needs editor on that brand; a global pass is owner-only.
    if (args.brandId === undefined) {
      await requirePlatformOwner(ctx);
    } else {
      await requireBrandRole(ctx, args.brandId, 'editor');
    }
    const brandId = args.brandId;
    const foundations =
      brandId === undefined
        ? await ctx.db.query('foundations').collect()
        : await ctx.db
            .query('foundations')
            .withIndex('by_brand', (q) => q.eq('brandId', brandId))
            .collect();

    const now = Date.now();
    let updated = 0;
    const changedBrandIds = new Set<Id<'brands'>>();

    for (const foundation of foundations) {
      const config = normalizeFoundationConfig(foundation.type, foundation.config);
      if (configsEqual(config, foundation.config)) continue;

      await ctx.db.patch(foundation._id, {
        config,
        version: foundation.version + 1,
        updatedAt: now,
      });
      updated += 1;
      changedBrandIds.add(foundation.brandId);
    }

    for (const brandId of changedBrandIds) {
      await ctx.runMutation(internal.brandCSSCache.invalidateInternal, { brandId });
    }

    return {
      checked: foundations.length,
      updated,
    };
  },
});

/**
 * Toggle foundation active status
 */
export const setActive = mutation({
  args: {
    id: v.id('foundations'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'foundations', args.id, 'editor');

    await ctx.db.patch(args.id, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Clone all foundations from one brand to another
 */
export const cloneForBrand = mutation({
  args: {
    sourceBrandId: v.id('brands'),
    targetBrandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    if (args.sourceBrandId === args.targetBrandId) {
      throw new Error('Source and target brand cannot be the same');
    }
    // Reading the source brand's foundations requires read access there — a
    // member of the target brand must NOT be able to siphon a brand they cannot
    // see. System brands stay clonable (canReadBrand allows the One UI baseline).
    if (!(await canReadBrand(ctx, args.sourceBrandId))) {
      throw new Error('Not authorized: you cannot read the source brand');
    }
    // Writing cloned foundations into the target brand requires editor there.
    await requireBrandRole(ctx, args.targetBrandId, 'editor');

    // Get all foundations from source brand
    const sourceFoundations = await ctx.db
      .query('foundations')
      .withIndex('by_brand', (q) => q.eq('brandId', args.sourceBrandId))
      .collect();

    const now = Date.now();
    const clonedIds: string[] = [];

    for (const foundation of sourceFoundations) {
      // Check if foundation type already exists for target brand
      const existing = await ctx.db
        .query('foundations')
        .withIndex('by_brand_type', (q) =>
          q.eq('brandId', args.targetBrandId).eq('type', foundation.type)
        )
        .first();

      if (!existing) {
        const newId = await ctx.db.insert('foundations', {
          brandId: args.targetBrandId,
          type: foundation.type,
          config: normalizeFoundationConfig(foundation.type, foundation.config), // Deep clone happens automatically
          version: 1,
          isActive: foundation.isActive,
          createdAt: now,
          updatedAt: now,
        });
        clonedIds.push(newId);
      }
    }

    return {
      clonedCount: clonedIds.length,
      clonedIds,
    };
  },
});

/**
 * Delete a foundation
 */
export const remove = mutation({
  args: { id: v.id('foundations') },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'foundations', args.id, 'editor');

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Sync platform and viewing distance settings across typography and spacing foundations
 * When platform/viewing distance changes in one, it should update the other
 */
export const syncPlatform = mutation({
  args: {
    brandId: v.id('brands'),
    platform: v.string(),
    density: v.optional(v.string()),
    // DIN 1450 viewing distance parameters
    baseSize: v.optional(v.number()),
    viewingDistance: v.optional(v.number()),
    ppi: v.optional(v.number()),
    pixelDensity: v.optional(v.number()),
    fluidScaling: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');

    const now = Date.now();
    const foundationTypes = ['typography', 'dimension', 'spacing'] as const;

    for (const type of foundationTypes) {
      const existing = await ctx.db
        .query('foundations')
        .withIndex('by_brand_type', (q) => q.eq('brandId', args.brandId).eq('type', type))
        .first();

      if (existing) {
        // Update platform, density, and viewing distance params in existing config
        const updatedConfig = {
          ...existing.config,
          platform: args.platform,
          ...(args.density !== undefined && { density: args.density }),
          ...(args.baseSize !== undefined && { baseSize: args.baseSize }),
          ...(args.viewingDistance !== undefined && { viewingDistance: args.viewingDistance }),
          ...(args.ppi !== undefined && { ppi: args.ppi }),
          ...(args.pixelDensity !== undefined && { pixelDensity: args.pixelDensity }),
          ...(args.fluidScaling !== undefined && { fluidScaling: args.fluidScaling }),
        };

        await ctx.db.patch(existing._id, {
          config: updatedConfig,
          version: existing.version + 1,
          updatedAt: now,
        });
      }
    }

    return { synced: foundationTypes.length };
  },
});

/**
 * Get available platforms for a brand from dimension configs.
 * Returns platform configs with their display names and settings.
 */
export const getAvailablePlatforms = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const dimensionConfigs = await ctx.db
      .query('dimensionConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    const platformMetadata: Record<string, { label: string; description: string }> = {
      mobile: { label: 'Mobile', description: 'Smartphone devices' },
      tablet: { label: 'Tablet', description: 'Tablet devices' },
      desktop: { label: 'Desktop', description: 'Desktop/laptop screens' },
      tv: { label: 'TV', description: 'Television displays' },
    };

    const platforms: Array<{
      id: string;
      label: string;
      description: string;
      viewingDistance?: number;
      ppi?: number;
      pixelDensity?: number;
      baseSize?: number;
      scaleFactor?: number;
      hasTypography: boolean;
      hasDimensions: boolean;
    }> = [];

    const platformsFromDimensions = new Set<string>();
    for (const config of dimensionConfigs) {
      if (config.mobile) platformsFromDimensions.add('mobile');
      if (config.desktop) platformsFromDimensions.add('desktop');
    }

    if (platformsFromDimensions.size === 0) {
      return Object.entries(platformMetadata).map(([id, meta]) => ({
        id,
        label: meta.label,
        description: meta.description,
        hasTypography: false,
        hasDimensions: false,
      }));
    }

    for (const platformId of platformsFromDimensions) {
      const meta = platformMetadata[platformId] || {
        label: platformId.charAt(0).toUpperCase() + platformId.slice(1),
        description: `${platformId} platform`,
      };

      const dimensionConfig = dimensionConfigs.find((c) => {
        if (platformId === 'mobile') return !!c.mobile;
        if (platformId === 'desktop') return !!c.desktop;
        return false;
      });

      const platformData =
        platformId === 'mobile'
          ? dimensionConfig?.mobile
          : platformId === 'desktop'
            ? dimensionConfig?.desktop
            : undefined;

      platforms.push({
        id: platformId,
        label: meta.label,
        description: meta.description,
        viewingDistance: platformData?.viewingDistance,
        ppi: platformData?.ppi,
        pixelDensity: platformData?.pixelDensity,
        baseSize: platformData?.baseSize,
        scaleFactor: platformData?.scaleFactor,
        hasTypography: false,
        hasDimensions: !!dimensionConfig,
      });
    }

    // Sort platforms in logical order: mobile, tablet, desktop, tv
    const platformOrder = ['mobile', 'tablet', 'desktop', 'tv'];
    platforms.sort((a, b) => {
      const aIndex = platformOrder.indexOf(a.id);
      const bIndex = platformOrder.indexOf(b.id);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return platforms;
  },
});

/**
 * Get foundation statistics for a brand
 */
export const getStats = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const foundations = await ctx.db
      .query('foundations')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    const foundationTypes = [
      'color',
      'surfaces',
      'materials',
      'typography',
      'dimension',
      'shape',
      'elevation',
      'motion',
      'icons',
      'platforms',
      'voice',
      'grid',
      'gradients',
    ];

    const configured: Record<string, boolean> = {};
    const versions: Record<string, number> = {};

    for (const type of foundationTypes) {
      const foundation = foundations.find((f) => f.type === type);
      configured[type] = !!foundation;
      versions[type] = foundation?.version ?? 0;
    }

    return {
      total: foundations.length,
      configured,
      versions,
      allConfigured: foundations.length === foundationTypes.length,
    };
  },
});

/**
 * Load the same payload as `getBrandOverviewData` (for reuse in other queries).
 * `themeConfig` is **not** included — run `buildNativeTheme` on the client or use
 * `nativeTheme:getNativeThemeSnapshot` (schema v2 adds `designSystem`: component tokens + dimensions).
 */
export async function loadBrandOverviewPayload(ctx: any, brandId: Id<'brands'>) {
  // Fetch all foundations for this brand in one query
  const foundations = await ctx.db
    .query('foundations')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .collect();

  // Build a map for easy access by type
  const foundationsByType: Record<string, (typeof foundations)[0] | undefined> = {};
  for (const f of foundations) {
    foundationsByType[f.type] = normalizeFoundationRecord(f);
  }

  // Calculate stats
  const foundationTypes = [
    'color',
    'surfaces',
    'materials',
    'typography',
    'dimension',
    'shape',
    'elevation',
    'motion',
    'icons',
    'platforms',
    'voice',
    'grid',
    'gradients',
  ];

  const configured: Record<string, boolean> = {};
  const versions: Record<string, number> = {};

  for (const type of foundationTypes) {
    const foundation = foundationsByType[type];
    configured[type] = !!foundation;
    versions[type] = foundation?.version ?? 0;
  }

  const stats = {
    total: foundations.length,
    configured,
    versions,
    allConfigured: foundations.length === foundationTypes.length,
  };

  // ---- Preset color scale selection (lightweight) ----
  const presetSelectionRecord = await ctx.db
    .query('brandPresetScaleSelections')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .first();

  let presetSelection = null;
  if (presetSelectionRecord) {
    const collection = await ctx.db.get(presetSelectionRecord.collectionId);
    const allCollectionScales = await ctx.db
      .query('presetColorScales')
      .withIndex('by_collection', (q: any) =>
        q.eq('collectionId', presetSelectionRecord.collectionId)
      )
      .collect();
    const selectedScaleSet = new Set(presetSelectionRecord.selectedScales);
    const selectedScales = allCollectionScales
      .filter((scale: any) => selectedScaleSet.has(scale.name))
      .map((scale: any) => ({
        _id: scale._id,
        name: scale.name,
        baseStep: scale.baseStep,
        baseColor: scale.steps.find((step: any) => step.step === scale.baseStep)?.oklch || '',
        // Include full steps array so buildAvailableScales uses exact designer-defined
        // OKLCH values instead of algorithmically regenerating from baseColor alone.
        // Without this, useBrandCSS produces darker/approximated colors.
        steps: scale.steps,
      }));
    presetSelection = collection
      ? {
          collection: {
            _id: collection._id,
            name: (collection as any).name,
            version: (collection as any).version,
          },
          selectedScales,
          selectedScaleNames: presetSelectionRecord.selectedScales,
        }
      : null;
  }

  // ---- Appearance config (multi-accent) ----
  const appearanceConfig = await ctx.db
    .query('appearanceConfigs')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .first();

  // ---- Available platforms (from dimension configs). Legacy `typographyConfigs` was
  // removed from schema (typography lives on `foundations` type typography). ----
  const dimensionConfigs = await ctx.db
    .query('dimensionConfigs')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .collect();

  const platformMetadata: Record<string, { label: string; description: string }> = {
    mobile: { label: 'Mobile', description: 'Smartphone devices' },
    tablet: { label: 'Tablet', description: 'Tablet devices' },
    desktop: { label: 'Desktop', description: 'Desktop/laptop screens' },
    tv: { label: 'TV', description: 'Television displays' },
  };

  const platformsFromDimensions = new Set<string>();
  for (const config of dimensionConfigs) {
    if ((config as any).mobile) platformsFromDimensions.add('mobile');
    if ((config as any).desktop) platformsFromDimensions.add('desktop');
  }
  const allPlatformIds = new Set<string>([...platformsFromDimensions]);

  const platformOrder = ['mobile', 'tablet', 'desktop', 'tv'];
  const availablePlatforms =
    allPlatformIds.size === 0
      ? Object.entries(platformMetadata).map(([id, meta]) => ({
          id,
          label: meta.label,
          description: meta.description,
          hasTypography: false,
          hasDimensions: false,
        }))
      : [...allPlatformIds]
          .map((id: string) => {
            const meta = platformMetadata[id] || { label: id, description: `${id} platform` };
            return {
              id,
              label: meta.label,
              description: meta.description,
              hasTypography: false,
              hasDimensions: platformsFromDimensions.has(id),
            };
          })
          .sort((a, b) => {
            return (
              (platformOrder.indexOf(a.id) === -1 ? 999 : platformOrder.indexOf(a.id)) -
              (platformOrder.indexOf(b.id) === -1 ? 999 : platformOrder.indexOf(b.id))
            );
          });

  // ---- Resolve custom (uploaded) fonts referenced by typography fontSelection ----
  const typographyFoundation = foundationsByType['typography'];
  const fontSelection = (typographyFoundation?.config as Record<string, unknown> | undefined)
    ?.fontSelection as (FontSelectionSlotsLike & { fallbackFontIds?: string[] }) | undefined;

  const uploadedFontIds = new Set<string>();
  if (fontSelection) {
    const candidateIds = [
      resolveTextFontId(fontSelection),
      resolveHeadingFontId(fontSelection),
      ...(fontSelection.fallbackFontIds || []),
    ];
    for (const id of candidateIds) {
      if (id && id.startsWith('uploaded-')) {
        uploadedFontIds.add(id.replace('uploaded-', ''));
      }
    }
  }

  let customFontsForBrand: Array<Record<string, unknown>> = [];
  if (uploadedFontIds.size > 0) {
    const resolved = await Promise.all(
      [...uploadedFontIds].map(async (convexId) => {
        try {
          return await ctx.db.get(convexId as Id<'customFonts'>);
        } catch {
          return null;
        }
      })
    );
    customFontsForBrand = (
      await Promise.all(
        resolved
          .filter((f: any): f is NonNullable<typeof f> => f !== null)
          .map(async (f: any) => {
            // Re-resolve storage URLs against THIS deployment so records seeded
            // from another deployment don't 404 in the brand-wide font loader,
            // and drop weights whose file is absent here. Mirrors customFonts.list.
            const resolvedFiles = await resolveFontFiles(ctx, f);
            // No file resolvable here → skip so the loader falls back cleanly
            // instead of throwing a NetworkError on a dead URL.
            if (resolvedFiles.length === 0) return null;
            return {
              _id: f._id,
              name: f.name,
              familyName: f.familyName,
              fileUrl: resolvedFiles[0].fileUrl,
              files: resolvedFiles.map((r) => ({ fileUrl: r.fileUrl, weight: r.weight, fileFormat: r.fileFormat })),
              category: f.category,
              weights: f.isVariable ? f.weights : staticWeights(resolvedFiles),
              isVariable: f.isVariable,
              fallback: f.fallback,
            };
          })
      )
    ).filter((f): f is NonNullable<typeof f> => f !== null);
  }

  // ---- Component decorations (ornaments) ----
  const decorationRecords = await ctx.db
    .query('componentDecorations')
    .withIndex('by_brand_component', (q: any) => q.eq('brandId', brandId))
    .collect();

  const allBrandOrnaments = await ctx.db
    .query('brandOrnaments')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .collect();
  const ornamentMap = new Map(allBrandOrnaments.map((o: any) => [o._id, o]));

  const decorations = decorationRecords
    .filter((record: any) =>
      SVG_DECORATION_COMPONENT_LOOKUP.has(record.componentName.toLowerCase())
    )
    .map((record: any) => {
      const ornament = ornamentMap.get(record.ornamentId) as any;
      if (!ornament) return null;
      return {
        componentName:
          SVG_DECORATION_COMPONENT_LOOKUP.get(record.componentName.toLowerCase()) ??
          record.componentName,
        svgContent: ornament.svgContent,
        aspectRatio: ornament.aspectRatio,
        mirror: record.mirror,
        placement: record.placement,
      };
    })
    .filter((d: any): d is NonNullable<typeof d> => d !== null);

  const motionConfigRow = await ctx.db
    .query('motionConfigs')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .first();

  const elevationConfigRow = await ctx.db
    .query('elevationConfigs')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .first();

  const materialConfig = await ctx.db
    .query('materialConfigs')
    .withIndex('by_brand', (q: any) => q.eq('brandId', brandId))
    .first();

  const motionConfig = motionConfigRow
    ? {
        baseDuration: motionConfigRow.baseDuration,
        easings: motionConfigRow.easings,
      }
    : null;

  const elevationConfig = elevationConfigRow ? { levels: elevationConfigRow.levels } : null;

  return {
    typography: foundationsByType['typography'] ?? null,
    surfaces: foundationsByType['surfaces'] ?? null,
    materials: foundationsByType['materials'] ?? null,
    color: foundationsByType['color'] ?? null,
    icons: foundationsByType['icons'] ?? null,
    dimension: foundationsByType['dimension'] ?? null,
    spacing: foundationsByType['spacing'] ?? null,
    shape: foundationsByType['shape'] ?? null,
    elevation: foundationsByType['elevation'] ?? null,
    motion: foundationsByType['motion'] ?? null,
    platforms: foundationsByType['platforms'] ?? null,
    grid: foundationsByType['grid'] ?? null,
    gradients: foundationsByType['gradients'] ?? null,
    stats,
    presetSelection,
    appearanceConfig: appearanceConfig ?? null,
    availablePlatforms,
    decorations,
    customFonts: customFontsForBrand,
    motionConfig,
    elevationConfig,
    materialConfig: materialConfig ?? null,
  };
}

async function getBrandOverviewDataHandler(ctx: any, args: { brandId: Id<'brands'> }) {
  if (!(await canReadBrand(ctx, args.brandId))) return null;
  return loadBrandOverviewPayload(ctx, args.brandId);
}

export const getBrandOverviewData = query({
  args: { brandId: v.id('brands') },
  handler: getBrandOverviewDataHandler,
});

/**
 * Internal version of getBrandOverviewData for server-side actions.
 * Shares the same handler function to avoid code duplication.
 */
export const getBrandOverviewDataInternal = internalQuery({
  args: { brandId: v.id('brands') },
  handler: getBrandOverviewDataHandler,
});
