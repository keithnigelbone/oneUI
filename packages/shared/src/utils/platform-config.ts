/**
 * platform-config.ts
 *
 * Unified platform configuration for the dimension scale system.
 * This is the single source of truth for platform parameters that feed
 * both typography and spacing/dimension calculations.
 *
 * Based on Typography PDF specification and DIN 1450 standard.
 */

/**
 * Density mode types
 * - compact: Tighter spacing, smaller base sizes
 * - default: Standard density
 * - open: More spacious, larger base sizes
 */
export type DensityMode = 'compact' | 'default' | 'open';

/**
 * Platform types for responsive calculations
 */
export type PlatformType = 'mobile' | 'desktop';

/**
 * Extended platform types for typography presets
 */
export type ExtendedPlatformType =
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'tv'
  | 'outdoor'
  | 'printA4'
  | 'printBusinessCard';

/**
 * Lighting condition affects DIN 1450 calculations
 */
export type LightingCondition = 'average' | 'good' | 'poor';

/**
 * Visual acuity of target user group
 */
export type VisualAcuity = 'average' | 'good' | 'low';

/**
 * Platform parameters for DIN 1450 base size calculation
 */
export interface PlatformParams {
  name: string;
  viewingDistance: number; // cm
  ppi: number; // pixels per inch
  pixelDensity: number; // device pixel ratio (@1x, @2x, @3x)
  xHeight: number; // x-height ratio (0.53 for JioType)
  lightingCondition: LightingCondition;
  visualAcuity: VisualAcuity;
}

/**
 * Density scale configuration with platform-specific values
 * Each density has different base sizes AND scale factors per platform
 */
export interface DensityScaleConfig {
  density: DensityMode;
  mobile: {
    baseSize: number; // Base font/dimension size in px
    scaleFactor: number; // Multiplier for scale steps
  };
  desktop: {
    baseSize: number;
    scaleFactor: number;
  };
}

/**
 * Viewport configuration for responsive interpolation
 */
export interface ViewportConfig {
  min: number; // 360px (mobile)
  max: number; // 1920px (desktop)
}

/**
 * Density configurations from Typography PDF
 *
 * | Density | Mobile Base | Desktop Base | Mobile Scale | Desktop Scale |
 * |---------|-------------|--------------|--------------|---------------|
 * | Compact | 14px        | 18px         | 1.1          | 1.3           |
 * | Default | 16px        | 20px         | 1.125        | 1.185         |
 * | Open    | 18px        | 22px         | 1.15         | 1.195         |
 */
export const DENSITY_CONFIGS: Record<DensityMode, DensityScaleConfig> = {
  compact: {
    density: 'compact',
    mobile: { baseSize: 14, scaleFactor: 1.1 },
    desktop: { baseSize: 18, scaleFactor: 1.3 },
  },
  default: {
    density: 'default',
    mobile: { baseSize: 16, scaleFactor: 1.125 },
    desktop: { baseSize: 20, scaleFactor: 1.185 },
  },
  open: {
    density: 'open',
    mobile: { baseSize: 18, scaleFactor: 1.15 },
    desktop: { baseSize: 22, scaleFactor: 1.195 },
  },
};

/**
 * Platform parameters from Typography PDF
 *
 * These are used for DIN 1450 base size calculation when
 * custom platform settings are needed.
 */
export const PLATFORM_PARAMS: Record<PlatformType, PlatformParams> = {
  mobile: {
    name: 'Mobile',
    viewingDistance: 30, // cm (~12 inches, arm's length)
    ppi: 458, // iPhone 15 Pro
    pixelDensity: 3, // @3x
    xHeight: 0.53,
    lightingCondition: 'average',
    visualAcuity: 'average',
  },
  desktop: {
    name: 'Desktop',
    viewingDistance: 50, // cm (~20 inches)
    ppi: 100, // Standard desktop monitor
    pixelDensity: 1, // @1x
    xHeight: 0.53,
    lightingCondition: 'good',
    visualAcuity: 'average',
  },
};

/**
 * Extended platform presets for typography calculations
 * Includes additional platforms like tablet, TV, print, outdoor
 */
export const EXTENDED_PLATFORM_PARAMS: Record<ExtendedPlatformType, PlatformParams> = {
  mobile: PLATFORM_PARAMS.mobile,
  tablet: {
    name: 'Tablet',
    viewingDistance: 40, // cm (~16 inches)
    ppi: 264, // iPad Pro
    pixelDensity: 2, // @2x
    xHeight: 0.53,
    lightingCondition: 'average',
    visualAcuity: 'average',
  },
  desktop: PLATFORM_PARAMS.desktop,
  tv: {
    name: 'TV',
    viewingDistance: 300, // cm (~10 feet, living room)
    ppi: 50, // 4K at 65"
    pixelDensity: 2,
    xHeight: 0.53,
    lightingCondition: 'average',
    visualAcuity: 'average',
  },
  outdoor: {
    name: 'Outdoor Signage',
    viewingDistance: 500, // cm (~16 feet)
    ppi: 72, // Print standard
    pixelDensity: 1,
    xHeight: 0.53,
    lightingCondition: 'good',
    visualAcuity: 'average',
  },
  printA4: {
    name: 'Print A4',
    viewingDistance: 40, // cm (~16 inches)
    ppi: 300, // High resolution print
    pixelDensity: 1,
    xHeight: 0.53,
    lightingCondition: 'good',
    visualAcuity: 'average',
  },
  printBusinessCard: {
    name: 'Business Card',
    viewingDistance: 30, // cm (close reading)
    ppi: 300,
    pixelDensity: 1,
    xHeight: 0.53,
    lightingCondition: 'good',
    visualAcuity: 'average',
  },
};

/**
 * Default viewport configuration for responsive interpolation
 */
export const DEFAULT_VIEWPORT_CONFIG: ViewportConfig = {
  min: 360, // Mobile breakpoint
  max: 1920, // Desktop breakpoint
};

/**
 * Get density configuration by mode
 */
export function getDensityConfig(density: DensityMode): DensityScaleConfig {
  return DENSITY_CONFIGS[density];
}

/**
 * Get platform parameters by platform type
 */
export function getPlatformParams(platform: PlatformType): PlatformParams {
  return PLATFORM_PARAMS[platform];
}

/**
 * Get extended platform parameters
 */
export function getExtendedPlatformParams(platform: ExtendedPlatformType): PlatformParams {
  return EXTENDED_PLATFORM_PARAMS[platform];
}

/**
 * Get all density modes
 */
export function getDensityModes(): DensityMode[] {
  return ['compact', 'default', 'open'];
}

/**
 * Get density mode label for UI display
 */
export function getDensityLabel(density: DensityMode): string {
  const labels: Record<DensityMode, string> = {
    compact: 'Compact',
    default: 'Default',
    open: 'Open',
  };
  return labels[density];
}

/**
 * Get density mode description
 */
export function getDensityDescription(density: DensityMode): string {
  const descriptions: Record<DensityMode, string> = {
    compact: 'Tighter spacing for data-dense interfaces',
    default: 'Standard spacing for most use cases',
    open: 'More spacious for readability-focused content',
  };
  return descriptions[density];
}

/**
 * Validate density mode
 */
export function isValidDensity(density: string): density is DensityMode {
  return ['compact', 'default', 'open'].includes(density);
}

/**
 * Validate platform type
 */
export function isValidPlatform(platform: string): platform is PlatformType {
  return ['mobile', 'desktop'].includes(platform);
}

// ============================================
// PLATFORM BREAKPOINTS & CONFIG BUILDER
// ============================================

import type {
  PlatformBreakpoint,
  PlatformCategory,
  PlatformDensityConfig,
  PlatformEntry,
  PlatformsFoundationConfig,
} from '../types/platforms';
import { computeDIN1450BaseSize } from './din1450';

/**
 * Platform preset definitions.
 * Each preset maps to DIN 1450 params via ExtendedPlatformType for calculations.
 *
 * "web" is responsive (mobile-to-desktop breakpoints).
 * Native variants are dedicated single-platform targets.
 * "print" and "outdoor" are container platforms: a single top-level entry
 * holding multiple format/context variants as nested breakpoints.
 */
export interface PlatformConfigPreset {
  id: string;
  label: string;
  description: string;
  /** Category — drives runtime selection behaviour + editor affordances */
  category: PlatformCategory;
  /** Maps to ExtendedPlatformType for DIN 1450 params lookup */
  din1450Source: ExtendedPlatformType;
  /** Default breakpoints (web gets full range, natives start empty) */
  defaultBreakpoints: PlatformBreakpoint[];
  /** Whether this platform is enabled by default */
  enabledByDefault: boolean;
}

export const PLATFORM_CONFIG_PRESETS: PlatformConfigPreset[] = [
  {
    id: 'web',
    label: 'Web',
    description: 'Responsive web — full breakpoint range from mobile to desktop',
    category: 'digital-responsive',
    din1450Source: 'desktop',
    defaultBreakpoints: [
      { id: 'mobile-360', label: 'Mobile', viewportWidth: 360, isActive: true },
      { id: 'tablet-768', label: 'Tablet', viewportWidth: 768, isActive: true },
      { id: 'tablet-landscape-1024', label: 'Tablet Landscape', viewportWidth: 1024, isActive: true },
      { id: 'desktop-1440', label: 'Desktop', viewportWidth: 1440, isActive: true },
      { id: 'desktop-1920', label: 'Desktop Large', viewportWidth: 1920, isActive: true },
    ],
    enabledByDefault: true,
  },
  {
    id: 'mobile-native',
    label: 'Mobile Native',
    description: 'Dedicated native mobile app (~30cm viewing distance)',
    category: 'digital-fixed',
    din1450Source: 'mobile',
    defaultBreakpoints: [
      { id: 'mobile-native-reference', label: 'Reference', viewportWidth: 390, viewportHeight: 844, units: 'px', isActive: true },
    ],
    enabledByDefault: true,
  },
  {
    id: 'tablet-native',
    label: 'Tablet Native',
    description: 'Dedicated native tablet app (~40cm viewing distance)',
    category: 'digital-fixed',
    din1450Source: 'tablet',
    defaultBreakpoints: [
      { id: 'tablet-native-reference', label: 'Reference', viewportWidth: 820, viewportHeight: 1180, units: 'px', isActive: true },
    ],
    enabledByDefault: false,
  },
  {
    id: 'desktop-native',
    label: 'Desktop Native',
    description: 'Dedicated native desktop app (~50cm viewing distance)',
    category: 'digital-fixed',
    din1450Source: 'desktop',
    defaultBreakpoints: [
      { id: 'desktop-native-reference', label: 'Reference', viewportWidth: 1440, viewportHeight: 900, units: 'px', isActive: true },
    ],
    enabledByDefault: false,
  },
  {
    id: 'tv-native',
    label: 'TV Native',
    description: 'Dedicated native TV app (~3m viewing distance)',
    category: 'digital-fixed',
    din1450Source: 'tv',
    defaultBreakpoints: [
      { id: 'tv-native-4k', label: '4K TV', viewportWidth: 3840, viewportHeight: 2160, units: 'px', isActive: true },
    ],
    enabledByDefault: true,
  },
  {
    id: 'print',
    label: 'Print',
    description: 'Print media — A4, A5, Business Card, Poster, and custom formats',
    category: 'print',
    din1450Source: 'printA4',
    defaultBreakpoints: [
      // Dimensions in mm — physical paper sizes
      { id: 'print-a4-portrait', label: 'A4 Portrait', viewportWidth: 210, viewportHeight: 297, units: 'mm', isActive: true },
      { id: 'print-a4-landscape', label: 'A4 Landscape', viewportWidth: 297, viewportHeight: 210, units: 'mm', isActive: true },
      { id: 'print-a5-portrait', label: 'A5 Portrait', viewportWidth: 148, viewportHeight: 210, units: 'mm', isActive: true },
      {
        id: 'print-business-card',
        label: 'Business Card',
        viewportWidth: 85,
        viewportHeight: 55,
        units: 'mm',
        isActive: true,
        // Business cards are read at ~30cm vs A4's ~40cm reference
        din1450Override: { viewingDistance: 30, ppi: 300, pixelDensity: 1 },
      },
    ],
    enabledByDefault: true,
  },
  {
    id: 'outdoor',
    label: 'Outdoor',
    description: 'Outdoor & physical signage — billboards, bus stops, indoor wayfinding',
    category: 'physical',
    din1450Source: 'outdoor',
    defaultBreakpoints: [
      { id: 'outdoor-billboard-large', label: 'Billboard (Large)', viewportWidth: 1920, viewportHeight: 1080, units: 'px', isActive: true },
      {
        id: 'outdoor-bus-stop',
        label: 'Bus Stop',
        viewportWidth: 1200,
        viewportHeight: 1800,
        units: 'mm',
        isActive: true,
        // Bus stop panels are read closer than billboards
        din1450Override: { viewingDistance: 200, ppi: 72, pixelDensity: 1 },
      },
      {
        id: 'outdoor-indoor-signage',
        label: 'Indoor Signage',
        viewportWidth: 600,
        viewportHeight: 900,
        units: 'mm',
        isActive: true,
        din1450Override: { viewingDistance: 150, ppi: 72, pixelDensity: 1 },
      },
    ],
    enabledByDefault: true,
  },
];

/**
 * Build default density configs from the global DENSITY_CONFIGS constant.
 */
function buildDefaultDensityConfigs(): PlatformDensityConfig[] {
  return getDensityModes().map((density) => {
    const config = DENSITY_CONFIGS[density];
    return {
      density,
      mobile: { ...config.mobile },
      desktop: { ...config.desktop },
    };
  });
}

/**
 * Scale density config base sizes proportionally to a platform's DIN 1450
 * calculated base size. Without this, all platforms share the same density
 * configs (mobile=16, desktop=20) and produce identical dimension overrides.
 *
 * Reference: desktop DIN 1450 base ≈ 19.5px → default density desktop=20px.
 * A platform with calculatedBaseSize=140 (outdoor) gets ratio ≈ 7.18×.
 *
 * The canonical formula lives in `./din1450.ts` (`computeDIN1450BaseSize`).
 * That file documents why this closed-form version differs from the public
 * `calculateDIN1450BaseSize` in `./dimension.ts`.
 */
const DESKTOP_REFERENCE_BASE = computeDIN1450BaseSize(
  PLATFORM_PARAMS.desktop.viewingDistance,
  PLATFORM_PARAMS.desktop.ppi,
  PLATFORM_PARAMS.desktop.pixelDensity,
);

function scaleDensityConfigs(
  baseDensityConfigs: PlatformDensityConfig[],
  calculatedBaseSize: number,
): PlatformDensityConfig[] {
  if (calculatedBaseSize <= 0) return baseDensityConfigs.map((dc) => ({ ...dc }));
  const ratio = calculatedBaseSize / DESKTOP_REFERENCE_BASE;
  if (Math.abs(ratio - 1) < 0.02) {
    return baseDensityConfigs.map((dc) => ({ ...dc }));
  }
  return baseDensityConfigs.map((dc) => ({
    ...dc,
    mobile: {
      ...dc.mobile,
      baseSize: Math.round(dc.mobile.baseSize * ratio * 10) / 10,
    },
    desktop: {
      ...dc.desktop,
      baseSize: Math.round(dc.desktop.baseSize * ratio * 10) / 10,
    },
  }));
}

/**
 * Determine how breakpoints are selected at runtime based on category.
 * `digital-responsive` → viewport-auto (matchMedia drives selection).
 * Everything else → manual (user picks via UI).
 */
function selectionModeForCategory(
  category: PlatformCategory,
): 'viewport-auto' | 'manual' {
  return category === 'digital-responsive' ? 'viewport-auto' : 'manual';
}

/**
 * Build a PlatformEntry from a PlatformConfigPreset using DIN 1450 params.
 */
function buildPlatformEntry(
  preset: PlatformConfigPreset,
  densityConfigs: PlatformDensityConfig[]
): PlatformEntry {
  const params = EXTENDED_PLATFORM_PARAMS[preset.din1450Source];
  const breakpoints = preset.defaultBreakpoints.map((bp) => ({ ...bp }));
  const activeBreakpoints = breakpoints.filter((bp) => bp.isActive);
  const viewportMin = activeBreakpoints.length > 0
    ? Math.min(...activeBreakpoints.map((bp) => bp.viewportWidth))
    : DEFAULT_VIEWPORT_CONFIG.min;
  const viewportMax = activeBreakpoints.length > 0
    ? Math.max(...activeBreakpoints.map((bp) => bp.viewportWidth))
    : DEFAULT_VIEWPORT_CONFIG.max;

  const calcBase = computeDIN1450BaseSize(
    params.viewingDistance,
    params.ppi,
    params.pixelDensity,
  );

  return {
    id: preset.id,
    label: preset.label,
    description: preset.description,
    isEnabled: preset.enabledByDefault,
    category: preset.category,
    breakpointSelectionMode: selectionModeForCategory(preset.category),
    viewingDistance: params.viewingDistance,
    ppi: params.ppi,
    pixelDensity: params.pixelDensity,
    calculatedBaseSize: calcBase,
    breakpoints,
    viewportMin,
    viewportMax,
    fluidScaling: activeBreakpoints.length >= 2 && preset.category === 'digital-responsive',
    densityConfigs: scaleDensityConfigs(densityConfigs, calcBase),
  };
}

/**
 * Build the default PlatformsFoundationConfig from PLATFORM_CONFIG_PRESETS
 * and DENSITY_CONFIGS. Used as initial state when no brand-specific config exists.
 */
export function buildDefaultPlatformsConfig(): PlatformsFoundationConfig {
  const defaultDensityConfigs = buildDefaultDensityConfigs();

  const platforms: PlatformEntry[] = PLATFORM_CONFIG_PRESETS.map((preset) =>
    buildPlatformEntry(preset, defaultDensityConfigs)
  );

  return {
    platforms,
    defaultPlatform: 'web',
    defaultDensity: 'default',
  };
}

/**
 * Migrate a legacy PlatformsFoundationConfig on load.
 *
 * Historical data may contain:
 *  - Separate `printA4` / `printBusinessCard` top-level platforms. Post-rework
 *    these collapse into a single `print` container with nested breakpoints.
 *  - Platform entries without a `category` field. Inferred from the id.
 *  - Platform entries without `breakpointSelectionMode`. Derived from category.
 *  - Stale default entries (`mobile-native` / `tablet-native` / `desktop-native`
 *    / `tv-native` / `outdoor`) that were seeded in V1 with empty breakpoints
 *    and `isEnabled: false`. Pre-Phase-3 these were placeholders; now they
 *    have real default breakpoints + `isEnabled: true` in the preset. We
 *    detect the untouched shape (empty `breakpoints` array) and refresh the
 *    entry from the preset so existing brands immediately see the activated
 *    platforms. Users who actually configured breakpoints keep their data.
 *
 * This function is pure and idempotent — calling it on an already-migrated
 * config returns the input unchanged. Safe to run on every load.
 */
export function migrateLegacyPlatformsConfig(
  config: PlatformsFoundationConfig,
): PlatformsFoundationConfig {
  if (!config || !Array.isArray(config.platforms)) return config;

  const inferCategory = (id: string): PlatformCategory => {
    if (id === 'web') return 'digital-responsive';
    if (id === 'print' || id === 'printA4' || id === 'printBusinessCard') return 'print';
    if (id === 'outdoor') return 'physical';
    if (id.endsWith('-native')) return 'digital-fixed';
    return 'digital-responsive';
  };

  // Step 1: fold legacy printA4 + printBusinessCard entries into a single `print` platform.
  const legacyPrintIds = new Set(['printA4', 'printBusinessCard']);
  const legacyPrintEntries = config.platforms.filter((p) => legacyPrintIds.has(p.id));
  const hasUnifiedPrint = config.platforms.some((p) => p.id === 'print');

  let migratedPlatforms: PlatformEntry[] = config.platforms;

  if (legacyPrintEntries.length > 0 && !hasUnifiedPrint) {
    // Build a new `print` entry from the unified preset, then merge legacy breakpoints in.
    const preset = PLATFORM_CONFIG_PRESETS.find((p) => p.id === 'print');
    if (preset) {
      const unifiedPrint = buildPlatformEntry(preset, buildDefaultDensityConfigs());
      // Any legacy breakpoints that don't already appear in the new default set are kept.
      const existingIds = new Set(unifiedPrint.breakpoints.map((bp) => bp.id));
      for (const legacy of legacyPrintEntries) {
        // Preserve enabled state: if either legacy entry was enabled, the unified one is too.
        if (legacy.isEnabled) unifiedPrint.isEnabled = true;
        for (const bp of legacy.breakpoints ?? []) {
          if (!existingIds.has(bp.id)) {
            unifiedPrint.breakpoints.push({ ...bp });
            existingIds.add(bp.id);
          }
        }
      }
      migratedPlatforms = [
        ...config.platforms.filter((p) => !legacyPrintIds.has(p.id)),
        unifiedPrint,
      ];
    }
  } else if (legacyPrintEntries.length > 0 && hasUnifiedPrint) {
    // A unified `print` already exists; drop the legacy entries to avoid duplication.
    migratedPlatforms = config.platforms.filter((p) => !legacyPrintIds.has(p.id));
  }

  // Step 2: populate missing `category` + `breakpointSelectionMode` on every entry.
  migratedPlatforms = migratedPlatforms.map((entry) => {
    if (entry.category && entry.breakpointSelectionMode) return entry;
    const category = entry.category ?? inferCategory(entry.id);
    return {
      ...entry,
      category,
      breakpointSelectionMode: entry.breakpointSelectionMode ?? selectionModeForCategory(category),
    };
  });

  // Step 3: refresh stale default entries that were seeded pre-Phase-3 with
  // empty breakpoints + isEnabled:false. An entry is considered "never touched
  // by the user" only when ALL of these hold:
  //   (a) id matches a current preset
  //   (b) breakpoints array is empty
  //   (c) DIN 1450 params (viewingDistance / ppi / pixelDensity) still match
  //       the preset's defaults — if the user opened the editor and typed
  //       a custom value before Phase 3 shipped, we must preserve it.
  // When all three conditions hold, the entry is replaced wholesale with the
  // fresh preset. Otherwise we leave the saved config alone.
  const presetMap = new Map(PLATFORM_CONFIG_PRESETS.map((p) => [p.id, p]));
  const defaultDensityConfigs = buildDefaultDensityConfigs();

  /** Returns true when entry's DIN params match the preset's untouched defaults. */
  function dinParamsMatchPreset(entry: PlatformEntry, preset: PlatformConfigPreset): boolean {
    const presetParams = EXTENDED_PLATFORM_PARAMS[preset.din1450Source];
    // Strict equality is safe here — these come from hand-authored constants
    // (integer cm / ppi / pixelDensity), not floating-point math. Any user
    // edit flips at least one of the three fields.
    return (
      entry.viewingDistance === presetParams.viewingDistance &&
      entry.ppi === presetParams.ppi &&
      entry.pixelDensity === presetParams.pixelDensity
    );
  }

  migratedPlatforms = migratedPlatforms.map((entry) => {
    const preset = presetMap.get(entry.id);
    if (!preset) return entry; // custom / unknown platform — leave untouched

    const hasEmptyBreakpoints = !entry.breakpoints || entry.breakpoints.length === 0;
    if (!hasEmptyBreakpoints) return entry; // user configured breakpoints — leave it alone

    if (!dinParamsMatchPreset(entry, preset)) {
      // User-edited DIN params — never refresh. Their custom values stay.
      // The only thing we do is ensure category / breakpointSelectionMode
      // are populated (already handled in Step 2 above).
      return entry;
    }

    // Genuinely untouched stale entry — safe to refresh from the preset.
    // We intentionally keep the entry's `label` and `description` in case the
    // user renamed it (cheap win even though the UI today doesn't change those
    // for non-custom platforms).
    const fresh = buildPlatformEntry(preset, defaultDensityConfigs);
    return {
      ...fresh,
      label: entry.label || fresh.label,
      description: entry.description || fresh.description,
    };
  });

  return {
    ...config,
    platforms: migratedPlatforms,
  };
}

/**
 * Build a custom platform entry with default DIN 1450 params (desktop baseline).
 * Used when users add a custom platform via the "Add Platform" action.
 */
export function buildCustomPlatformEntry(
  id: string,
  label: string
): PlatformEntry {
  const params = EXTENDED_PLATFORM_PARAMS.desktop;
  const calcBase = computeDIN1450BaseSize(
    params.viewingDistance,
    params.ppi,
    params.pixelDensity,
  );
  return {
    id,
    label,
    description: `Custom platform: ${label}`,
    isEnabled: true,
    viewingDistance: params.viewingDistance,
    ppi: params.ppi,
    pixelDensity: params.pixelDensity,
    calculatedBaseSize: calcBase,
    breakpoints: [],
    viewportMin: DEFAULT_VIEWPORT_CONFIG.min,
    viewportMax: DEFAULT_VIEWPORT_CONFIG.max,
    fluidScaling: false,
    densityConfigs: scaleDensityConfigs(buildDefaultDensityConfigs(), calcBase),
  };
}
