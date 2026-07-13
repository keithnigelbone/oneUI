/**
 * Theme entry point for `@oneui/ui-native`.
 *
 * Mount `<OneUINativeThemeProvider>` at the root of the app (passing a
 * `OneUINativeTheme` from `buildNativeTheme` or `defaultNativeTheme`),
 * wrap colored regions in `<Surface>`, and components inside read
 * resolved tokens via `useSurfaceTokens(appearance)`.
 */

export {
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
} from './SurfaceContext';

export { defaultNativeTheme, type DefaultNativeThemeOptions } from './defaultTheme';

export {
  RecipeProvider,
  useComponentRecipe,
  type RecipeProviderProps,
  type RecipeSelections,
} from './RecipeContext';

export {
  ComponentThemeProvider,
  useComponentTheme,
  type ComponentThemeProviderProps,
  type NativeComponentThemeSelections,
  type NativeComponentThemeValues,
} from './ComponentThemeContext';

export {
  resolveRecipeBorderRadius,
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
  type ComponentShapeFamily,
} from './recipeCornerRadius';

export {
  resolveTypographyFontWeightRef,
  resolveTypographyFontWeightStyle,
  resolveTypographyDimensionRef,
  resolveTextTransformRef,
} from './recipeTypography';

export {
  resolveComponentScalarTokens,
  useResolvedComponentTokens,
  type ResolvedScalarTokens,
} from './componentTokenResolver';

export {
  ReduceMotionProvider,
  useReduceMotion,
  type ReduceMotionProviderProps,
} from './ReduceMotionContext';

export {
  DecorationProvider,
  useComponentDecoration,
  type DecorationProviderProps,
} from './DecorationContext';

export {
  MotionProvider,
  useMotion,
  DEFAULT_MOTION,
  type MotionProviderProps,
  type MotionOverrides,
  type NativeMotion,
  type SpringTuning,
  type TapScaleTokens,
  type SpinnerMotion,
} from './MotionContext';

export {
  useTypographyTokens,
  selectTypographyTokens,
  mergeTypographyLanguageOptions,
  type TypographyRole,
  type Emphasis,
  type SizeForRole,
  type TypographyTokenOptions,
} from './useTypographyTokens';

export {
  typographyToTextStyle,
  mergeTypographyTextStyle,
} from './typographyToTextStyle';

export {
  OneUIBrandProvider,
  type OneUIBrandProviderProps,
  type BrandData,
  type ThemeData,
  type ThemeColorScale,
} from './OneUIBrandProvider';

export { getCdnBrandData, getCdnThemeData, registerBrandCache } from './cdn';

export { DEFAULT_JIO_BRAND_DATA } from '../brand-data';

export {
  TypographyLanguageProvider,
  useTypographyLanguage,
  useOptionalTypographyLanguage,
  type TypographyLanguageContextValue,
  type TypographyLanguageProviderProps,
} from './TypographyLanguageContext';

export {
  SUPPORTED_TYPOGRAPHY_LOCALES,
  TYPOGRAPHY_LOCALE_LABELS,
  isTypographyLocale,
  normalizeTypographyLocaleTag,
  resolveTypographyLanguage,
  enabledScriptIdsFromTheme,
  type TypographyLocale,
  type ResolvedTypographyLanguage,
} from './typography-locales';

export { useBrandFonts, type UseBrandFontsResult } from './useBrandFonts';

export {
  foundationToNativeTheme,
  DEFAULT_JIO_TYPE_WEIGHT_FAMILIES,
  type FontFamilyOverrides,
} from './foundationToNativeTheme';

export {
  buildStaticWeightFamilyMap,
  snapToStandardCssWeight,
  typographySlotForRole,
  resolveStaticWeightFamily,
  mergeStaticWeightFamilyConfig,
  CSS_WEIGHT_FAMILY_SUFFIX,
  STANDARD_CSS_WEIGHTS,
} from '@oneui/shared/engine';
export type {
  TypographyFontSlot,
  StandardCssWeight,
  StaticWeightFamilyMap,
  StaticWeightFamiliesBySlot,
  StaticWeightFamilyPrefixConfig,
} from '@oneui/shared/engine';

// Re-export the engine types + builder consumers reach for. Avoids forcing
// every app to add a deep import from `@oneui/shared/engine`.
export {
  buildNativeMotion,
  buildNativeElevation,
  buildNativeDimensions,
  buildNativeTheme,
  resolveNativeContextRoles,
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
} from '@oneui/shared/engine';

export {
  MaterialContextProvider,
  useBrandMaterial,
  useRoleMaterial,
} from './MaterialContext';

