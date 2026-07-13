/**
 * Build-time only — strips Convex brand payloads to fields consumed by
 * `foundationToNativeTheme` → `buildNativeTheme` and `OneUIBrandProvider`.
 *
 * Used by `generate-default-brand-data.mjs`. Not shipped in the package.
 */

type JsonRecord = Record<string, unknown>;

type AppearanceConfigLike = {
  accents?: Array<{ scaleName?: string }>;
  background?: { scaleName?: string };
};

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

export function trimFoundation(foundation: unknown): unknown {
  if (!foundation || typeof foundation !== 'object') return foundation;

  const src = foundation as JsonRecord;
  const appearanceConfig = src.appearanceConfig;
  const referencedScales = collectReferencedScaleNames(appearanceConfig);

  const out: JsonRecord = {};

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

  if (appearanceConfig !== undefined) {
    out.appearanceConfig = trimAppearanceConfig(appearanceConfig);
  }

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

  const typography = src.typography;
  if (typography && typeof typography === 'object') {
    const typoSrc = typography as JsonRecord;
    if (typoSrc.config !== undefined) {
      out.typography = { config: typoSrc.config };
    }
  }

  if (Array.isArray(src.customFonts)) {
    out.customFonts = trimCustomFonts(src.customFonts);
  }

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

  return out;
}

export function trimAppearanceConfig(appearanceConfig: unknown): unknown {
  if (!appearanceConfig || typeof appearanceConfig !== 'object') return appearanceConfig;
  const ac = appearanceConfig as JsonRecord;
  const { accents, background, accentCount } = ac;
  return { accentCount, accents, background };
}

export function trimComponents(components: unknown): unknown {
  if (!components || typeof components !== 'object') return undefined;
  const src = components as JsonRecord;
  const out: JsonRecord = {};

  const recipeSelections = src.recipeSelections;
  if (Array.isArray(recipeSelections)) {
    out.recipeSelections = recipeSelections.map((item) => {
      const row = item as JsonRecord;
      return {
        componentName: row.componentName,
        selections: row.selections,
      };
    });
  }

  const tokenOverrides = src.tokenOverrides;
  if (Array.isArray(tokenOverrides)) {
    out.tokenOverrides = tokenOverrides.map((item) => {
      const row = item as JsonRecord;
      return {
        componentName: row.componentName,
        tokenName: row.tokenName,
        value: row.value,
      };
    });
  }

  const componentThemeSelections = src.componentThemeSelections;
  if (Array.isArray(componentThemeSelections)) {
    out.componentThemeSelections = componentThemeSelections.map((item) => {
      const row = item as JsonRecord;
      return { familyId: row.familyId, selections: row.selections };
    });
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

export function trimCustomFonts(customFonts: unknown): unknown {
  if (!Array.isArray(customFonts)) return customFonts;
  return customFonts.map((item) => {
    const row = item as JsonRecord;
    return {
      familyName: row.familyName,
      name: row.name,
      category: row.category,
      isVariable: row.isVariable,
      weights: row.weights,
      fallback: row.fallback,
    };
  });
}

/** Full `BrandData` trim for default snapshot generation. */
export function trimBrandData(raw: { foundation?: unknown; components?: unknown }): {
  foundation: unknown;
  components: unknown;
} {
  return {
    foundation: trimFoundation(raw.foundation),
    components: trimComponents(raw.components),
  };
}
