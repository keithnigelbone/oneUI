import {
  buildNativeTheme,
  JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES,
  type OneUINativeTheme,
  type NativeAppearanceConfig,
  type NativeTypographyConfig,
  type NativeCustomFontDescriptor,
  type NativeTypeStyle,
  type StaticWeightFamilyMap,
  type NativeMotionConfigInput,
  type NativeElevationConfigInput,
} from '@oneui/shared/engine';

export interface FontFamilyOverrides {
  primary?: StaticWeightFamilyMap;
  secondary?: StaticWeightFamilyMap;
  /** Per-weight static cuts for code (monospace). Omit when using `codeFontFamily`. */
  code?: StaticWeightFamilyMap;
  /**
   * Expo `useFonts` family name for code typography (variable mono).
   * When set, code sizes use this family + numeric `fontWeight` (not JioType static cuts).
   */
  codeFontFamily?: string;
}

function mergeStaticWeightSlot(
  slot: 'primary' | 'secondary' | 'code',
  fontFamilyOverrides: FontFamilyOverrides | undefined,
  brandSlot: Partial<StaticWeightFamilyMap> | undefined,
): StaticWeightFamilyMap {
  if (slot === 'code') {
    return { ...brandSlot, ...fontFamilyOverrides?.code } as StaticWeightFamilyMap;
  }
  return {
    ...DEFAULT_JIO_TYPE_WEIGHT_FAMILIES,
    ...brandSlot,
    ...fontFamilyOverrides?.[slot],
  };
}

/** Apply bundled variable mono — strips static-cut flags so `fontWeight` drives the axis. */
function applyCodeFontFamily(theme: OneUINativeTheme, family: string): OneUINativeTheme {
  const codeTree = theme.typography.code;
  const sizes = { ...codeTree.sizes } as Record<string, NativeTypeStyle>;
  for (const key of Object.keys(sizes)) {
    const style = sizes[key];
    const { weightViaFontFamily: _omit, ...rest } = style;
    sizes[key] = { ...rest, fontFamily: family };
  }
  const { code: _codeStatic, ...staticWithoutCode } = theme.typography.staticWeightFamilies ?? {};
  return {
    ...theme,
    typography: {
      ...theme.typography,
      fontFamilies: { ...theme.typography.fontFamilies, code: family },
      staticWeightFamilies: staticWithoutCode,
      code: { ...codeTree, sizes },
    },
  };
}

/**
 * Default JioType static weight → Expo font family name mapping.
 *
 * These are the canonical family names all Jio native apps register via
 * `expo-font` / `useFonts`. Weights without a dedicated cut snap to the
 * nearest available file (e.g. 200 → Hairline, 600 → Bold).
 *
 * Apps that load fonts under different names can override per-slot via
 * the `fontFamilyOverrides` prop on `OneUIBrandProvider`. Apps using the
 * variable font (`JioType Var`) instead of static cuts do not need to
 * override this — `customFonts` from Convex handles the variable font
 * family name automatically.
 */
/** @deprecated Use `JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES` from `@oneui/shared/engine`. */
export const DEFAULT_JIO_TYPE_WEIGHT_FAMILIES: StaticWeightFamilyMap =
  JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES;

/**
 * Adapts the Convex `getBrandOverviewData` payload to `buildNativeTheme`.
 *
 * Static weight family resolution per slot (lowest → highest priority):
 *   DEFAULT_JIO_TYPE_WEIGHT_FAMILIES → brand `staticWeightFamilies` → `fontFamilyOverrides`
 *   (host app wins when overrides are passed — e.g. bundled `JioType` Expo keys).
 *
 * Shape mapping:
 * - `color` is a foundations envelope: `{ type: 'color', config, ... }` → `colorConfig = fd.color.config`
 * - `appearanceConfig` is the raw appearance doc (no `.config` wrapper)
 * - `typography` is a foundations envelope: `fd.typography.config` holds the V2 config
 * - `customFonts` is a flat array shaped like `NativeCustomFontDescriptor`
 * - `motionConfig` / `elevationConfig` are slim rows from their respective Convex tables
 */
// fallow-ignore-next-line complexity
export function foundationToNativeTheme(
  foundationData: unknown,
  mode: 'light' | 'dark',
  fontFamilyOverrides?: FontFamilyOverrides,
  density?: 'compact' | 'default' | 'open',
): OneUINativeTheme | null {
  if (!foundationData || typeof foundationData !== 'object') return null;
  const fd = foundationData as {
    color?: { config?: unknown } | null;
    appearanceConfig?: unknown;
    presetSelection?: unknown;
    typography?: { config?: unknown } | null;
    customFonts?: NativeCustomFontDescriptor[];
    /** Slim row from `motionConfigs` table — present only when a brand has saved motion settings there. */
    motionConfig?: NativeMotionConfigInput | null;
    /** Full motion foundation doc — `getBrandOverviewData` always returns this when the brand has a motion foundation. */
    motion?: { config?: { baseDuration?: unknown; easings?: unknown } } | null;
    elevationConfig?: NativeElevationConfigInput | null;
    /** Materials foundation envelope — carries activeMetals, materialAssignments, metallic stop overrides. */
    materials?: { config?: unknown } | null;
    /** Slim row from `materialConfigs` Convex table — carries per-preset stop overrides. */
    materialConfig?: unknown;
  };
  const colorConfig = fd.color?.config;
  if (!colorConfig) return null;

  const typographyFromFoundation = (fd.typography?.config ?? null) as NativeTypographyConfig | null;
  // V2 typography may be nested under `.typographyV2`; fall back to the root config.
  const typographyInner = typographyFromFoundation?.typographyV2 ?? typographyFromFoundation;

  const brandStatic = typographyInner?.staticWeightFamilies;
  const codeUsesVariableMono = Boolean(fontFamilyOverrides?.codeFontFamily);
  const resolvedTypography: NativeTypographyConfig = {
    ...typographyFromFoundation,
    // Full per-weight maps are authoritative; drop brand prefix so
    // `buildNativeTypography` does not synthesize `JioType-Regular` (unregistered).
    ...(fontFamilyOverrides ? { staticWeightFamilyPrefix: undefined } : null),
    staticWeightFamilies: {
      primary: mergeStaticWeightSlot('primary', fontFamilyOverrides, brandStatic?.primary),
      secondary: mergeStaticWeightSlot('secondary', fontFamilyOverrides, brandStatic?.secondary),
      ...(codeUsesVariableMono
        ? fontFamilyOverrides?.code
          ? { code: fontFamilyOverrides.code }
          : { code: {} }
        : { code: mergeStaticWeightSlot('code', fontFamilyOverrides, brandStatic?.code) }),
    },
  };

  // Motion: prefer the dedicated `motionConfigs` slim row when available.
  // Fall back to the full motion foundation doc (`motion.config`) which `getBrandOverviewData`
  // always returns when the brand has configured motion — `motionConfig` is only populated
  // when a separate `motionConfigs` table row exists (not all brands have one).
  const motionFoundationConfig = fd.motion?.config;
  const motionConfigResolved: NativeMotionConfigInput =
    fd.motionConfig ??
    (motionFoundationConfig?.baseDuration !== undefined
      ? (motionFoundationConfig as NativeMotionConfigInput)
      : null);

  const built = buildNativeTheme(
    {
      colorConfig,
      appearanceConfig: (fd.appearanceConfig ?? null) as NativeAppearanceConfig | null,
      presetSelection: fd.presetSelection,
      typographyConfig: resolvedTypography,
      customFonts: fd.customFonts ?? [],
      motionConfig: motionConfigResolved ?? undefined,
      elevationConfig: fd.elevationConfig ?? undefined,
      materialConfig: (fd as { materialConfig?: unknown }).materialConfig,
      materialsFoundationConfig: fd.materials?.config,
    },
    { theme: mode, ...(density !== undefined ? { density } : {}) },
  );

  const codeFontFamily = fontFamilyOverrides?.codeFontFamily;
  if (!built || !codeFontFamily) return built;
  return applyCodeFontFamily(built, codeFontFamily);
}
