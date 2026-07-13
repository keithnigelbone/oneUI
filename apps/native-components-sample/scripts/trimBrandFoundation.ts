/**
 * trimBrandFoundation.ts
 *
 * Strips Convex `getBrandOverviewData` foundation payloads to fields consumed
 * by `@oneui/ui-native` (`foundationToNativeTheme` → `buildNativeTheme`).
 * Used by exportBrandData.ts and available for offline re-trimming of JSON.
 */

type JsonRecord = Record<string, unknown>;

type AppearanceConfigLike = {
  accents?: Array<{ scaleName?: string }>;
  background?: { scaleName?: string };
};

/** Scale names referenced by appearanceConfig + built-in Neutral (always required). */
export function collectReferencedScaleNames(appearanceConfig: unknown): Set<string> {
  const names = new Set<string>(['neutral']);
  if (!appearanceConfig || typeof appearanceConfig !== 'object') return names;

  const ac = appearanceConfig as AppearanceConfigLike;
  for (const accent of ac.accents ?? []) {
    if (accent.scaleName) names.add(accent.scaleName.toLowerCase());
  }
  if (ac.background?.scaleName) {
    names.add(ac.background.scaleName.toLowerCase());
  }
  return names;
}

function scaleNameMatches(name: string | undefined, referenced: Set<string>): boolean {
  if (!name) return false;
  return referenced.has(name.toLowerCase());
}

function filterScalesByName<T extends { name?: string }>(
  scales: T[] | undefined | null,
  referenced: Set<string>,
): T[] {
  if (!scales?.length) return [];
  return scales.filter((s) => scaleNameMatches(s.name, referenced));
}

/**
 * Strip foundation overview data to fields consumed by the native theme pipeline.
 * Filters color scales to those referenced by the brand's own appearanceConfig.
 * Sub-brand delta scales are stored in the sub-brand themeData files themselves.
 */
export function trimFoundation(foundation: unknown): unknown {
  if (!foundation || typeof foundation !== 'object') return foundation;

  const src = foundation as JsonRecord;
  const appearanceConfig = src.appearanceConfig;
  const referencedScales = collectReferencedScaleNames(appearanceConfig);

  const out: JsonRecord = {};

  // color.config — required; filter brandScales + savedCustomScales to referenced names
  const colorEnvelope = src.color;
  if (colorEnvelope && typeof colorEnvelope === 'object') {
    const colorSrc = colorEnvelope as JsonRecord;
    const config = colorSrc.config;
    if (config && typeof config === 'object') {
      const configSrc = config as JsonRecord;
      const trimmedConfig: JsonRecord = {};

      if (configSrc.lightnessScale !== undefined) {
        trimmedConfig.lightnessScale = configSrc.lightnessScale;
      }

      const brandScales = filterScalesByName(
        configSrc.brandScales as Array<{ name?: string }> | undefined,
        referencedScales,
      );
      if (brandScales.length > 0) trimmedConfig.brandScales = brandScales;

      const savedCustomScales = filterScalesByName(
        configSrc.savedCustomScales as Array<{ name?: string }> | undefined,
        referencedScales,
      );
      if (savedCustomScales.length > 0) trimmedConfig.savedCustomScales = savedCustomScales;

      out.color = { config: trimmedConfig };
    }
  }

  if (appearanceConfig !== undefined) out.appearanceConfig = appearanceConfig;

  // presetSelection — engine only reads selectedScales (matched by scale name)
  const presetSelection = src.presetSelection;
  if (presetSelection && typeof presetSelection === 'object') {
    const presetSrc = presetSelection as JsonRecord;
    const selectedScales = filterScalesByName(
      presetSrc.selectedScales as Array<{ name?: string }> | undefined,
      referencedScales,
    );
    if (selectedScales.length > 0) {
      out.presetSelection = { selectedScales };
    }
  }

  // typography — foundations envelope; foundationToNativeTheme reads .config
  const typography = src.typography;
  if (typography && typeof typography === 'object') {
    const typoSrc = typography as JsonRecord;
    if (typoSrc.config !== undefined) {
      out.typography = { config: typoSrc.config };
    }
  }

  if (Array.isArray(src.customFonts)) {
    out.customFonts = src.customFonts;
  }

  // motion — foundationToNativeTheme reads motion.config when motionConfig is null
  const motion = src.motion;
  if (motion && typeof motion === 'object') {
    const motionSrc = motion as JsonRecord;
    const motionConfig = motionSrc.config;
    if (motionConfig && typeof motionConfig === 'object') {
      const mc = motionConfig as JsonRecord;
      const slimMotionConfig: JsonRecord = {};
      if (mc.baseDuration !== undefined) slimMotionConfig.baseDuration = mc.baseDuration;
      if (mc.easings !== undefined) slimMotionConfig.easings = mc.easings;
      if (Object.keys(slimMotionConfig).length > 0) {
        out.motion = { config: slimMotionConfig };
      }
    }
  }

  if (src.motionConfig != null) out.motionConfig = src.motionConfig;
  if (src.elevationConfig != null) out.elevationConfig = src.elevationConfig;

  // materials foundation envelope — keep config slim (assignments + active presets + stop overrides)
  const materials = src.materials;
  if (materials && typeof materials === 'object') {
    const m = materials as JsonRecord;
    if (m.config && typeof m.config === 'object') {
      const cfg = m.config as JsonRecord;
      const slim: JsonRecord = {};
      if (cfg.activeMetals) slim.activeMetals = cfg.activeMetals;
      if (cfg.materialAssignments) slim.materialAssignments = cfg.materialAssignments;
      if (cfg.metallic) slim.metallic = cfg.metallic;
      if (Object.keys(slim).length) out.materials = { config: slim };
    }
  }

  // effects/materialConfigs row — keep metallic only (translucent/frosted/glass are static)
  if (src.materialConfig && typeof src.materialConfig === 'object') {
    const mc = src.materialConfig as JsonRecord;
    if (mc.metallic !== undefined) out.materialConfig = { metallic: mc.metallic };
  }

  return out;
}
