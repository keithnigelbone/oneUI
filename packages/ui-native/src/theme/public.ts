/**
 * Public theme API for `@oneui/ui-native/theme`.
 *
 * This is the curated, semver-stable surface exposed to consumers. It re-exports
 * the app-facing subset of the full internal theme barrel (`./index`). Symbols
 * NOT listed here are package-internal (component-authoring resolvers, recipe /
 * weight / context plumbing) and intentionally unexported — see the audit
 * Phase 4–6. Component-authoring helpers that remain reachable live behind
 * `@oneui/ui-native/internal`.
 *
 * Do not add resolver/builder internals here without a deliberate API decision.
 */

export {
  // Providers + surface read API
  OneUINativeThemeProvider,
  Surface,
  useOneUITheme,
  useOptionalOneUITheme,
  useSurfaceTokens,
  useSurfaceAppearance,
  useSurfaceContext,
  useElevation,
  type OneUINativeThemeProviderProps,
  type SurfaceProps,
  type SurfaceContextValue,

  // Theme construction
  defaultNativeTheme,
  type DefaultNativeThemeOptions,
  buildNativeMotion,
  buildNativeElevation,
  buildNativeDimensions,
  buildNativeTheme,

  // Recipe configuration (app-level; the resolver hook is internal)
  RecipeProvider,
  type RecipeProviderProps,
  type RecipeSelections,

  // Motion
  ReduceMotionProvider,
  useReduceMotion,
  type ReduceMotionProviderProps,
  MotionProvider,
  useMotion,
  DEFAULT_MOTION,
  type MotionProviderProps,
  type MotionOverrides,
  type NativeMotion,
  type SpringTuning,
  type TapScaleTokens,
  type SpinnerMotion,

  // Decoration
  DecorationProvider,
  useComponentDecoration,
  type DecorationProviderProps,

  // Typography (token read API; the TextStyle converters are internal)
  useTypographyTokens,
  selectTypographyTokens,
  mergeTypographyLanguageOptions,
  type TypographyRole,
  type Emphasis,
  type SizeForRole,
  type TypographyTokenOptions,
  useBrandFonts,
  type UseBrandFontsResult,
  TypographyLanguageProvider,
  useTypographyLanguage,
  useOptionalTypographyLanguage,
  type TypographyLanguageContextValue,
  type TypographyLanguageProviderProps,
  SUPPORTED_TYPOGRAPHY_LOCALES,
  TYPOGRAPHY_LOCALE_LABELS,
  isTypographyLocale,
  normalizeTypographyLocaleTag,
  resolveTypographyLanguage,
  enabledScriptIdsFromTheme,
  type TypographyLocale,
  type ResolvedTypographyLanguage,
  type TypographyFontSlot,
  type StandardCssWeight,
  type StaticWeightFamilyMap,
  type StaticWeightFamiliesBySlot,
  type StaticWeightFamilyPrefixConfig,

  // Brand data
  OneUIBrandProvider,
  type OneUIBrandProviderProps,
  type BrandData,
  type ThemeData,
  type ThemeColorScale,
  getCdnBrandData,
  getCdnThemeData,
  registerBrandCache,
  DEFAULT_JIO_BRAND_DATA,
  foundationToNativeTheme,
  DEFAULT_JIO_TYPE_WEIGHT_FAMILIES,
  type FontFamilyOverrides,

  // Materials
  MaterialContextProvider,
  useBrandMaterial,
  useRoleMaterial,

  // Engine types consumers reach for
  type OneUINativeTheme,
  type NativeRoleTokens,
  type BuildNativeThemeInput,
  type NativeThemeContext,
  type NativeAppearanceConfig,
  type NativeTypography,
  type NativeTypographyConfig,
  type NativeTypeStyle,
  type NativeCustomFontDescriptor,
  type NativeDimensions,
  type NativeSpacing,
  type NativeShape,
  type SurfaceToken,
  type ContentToken,
  type StateToken,
  type ResolvedNativeMotion,
  type ResolvedNativeElevation,
  type NativeMotionConfigInput,
  type NativeElevationConfigInput,
  type ResolvedMaterials,
  type ResolvedMetallicGradient,
  type MaterialAssignmentTarget,
} from './index';
