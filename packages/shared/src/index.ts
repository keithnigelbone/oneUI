// Core type definitions
export * from './types/tokens';
export * from './types/componentOverrideData';
export * from './types/nativeDimensionPayload';
export * from './types/appearance';
export * from './types/brands';
export * from './types/components';
export * from './types/componentTokens';
export * from './types/componentRecipes';
export * from './types/componentMeta';
export * from './types/componentMetaExtensions';
export * from './types/componentAST';
export * from './types/componentDocumentation';
export * from './types/coreInvariants';
export * from './types/figma';
export * from './types/presetColorScales';
export * from './types/icons';
export * from './iconRegistry';
export * from './types/platforms';
export * from './types/ornaments';
export * from './types/gradients';
// Note: dimension types are exported from ./utils/dimension to avoid conflicts

// Constants
export * from './constants/shape-system';
export * from './componentThemes';
export * from './componentDecorationCapabilities';

// Utils
export * from './utils/validators';
export * from './utils/recipeResolver';
export * from './utils/spacingLadder';
export { buildPropsSchema } from './utils/buildPropsSchema';
export * from './utils/subBrandFoundation';
export {
  getGreeting,
  bucketForHour,
  type GreetingBucket,
  type GreetingResult,
  type GreetingOptions,
} from './utils/greeting';
export {
  resolveModeFromPath,
  type ModeWithPrefixes,
} from './utils/resolveMode';
export {
  extractText,
  isToolPart,
  getToolName,
  type MessageLike,
  type ToolPartLike,
} from './utils/chatMessageHelpers';
export {
  extractBrandFoundationSummary,
  type ExtractBrandSummaryInput,
} from './utils/brandFoundationSummary';
export {
  retailBrandUsesTiraCapsuleActions,
  withRetailTiraCapsuleButtonRadii,
  maybeApplyRetailTiraCapsuleButtons,
} from './utils/retailBrandCapsuleButtons';

// Foundation utilities
export * from './utils/colorScale';
export * from './utils/accessibility';
export * from './utils/platform-config';
export * from './utils/dimension';
// Typography re-exports from dimension, so import selectively to avoid conflicts
export {
  // Types
  type PlatformPreset,
  type TypographyStyle,
  type TypeScaleConfig,
  type SemanticWeight,
  // Constants
  PLATFORM_PRESETS,
  SCALE_FACTOR_PRESETS,
  WEIGHT_MAPPING,
  // Functions
  getScaleFactorForDensity,
  calculateBaseSize,
  calculateBaseSizeFromPreset,
  getBaseSizeForDensity,
  generateTypeScale,
  generateTypeScaleFromDimension,
  generateTypographyStyles,
  generateTypographyStylesForDensity,
  getWeightValue,
  getNearestSemanticWeight,
  styleToCss,
  styleToTokenCss,
  isValidScaleFactor,
  getSizeAtPosition,
  getStyleNames,
  getStyleCategory,
  getStylePosition,
  getStyleFStep,
  // V2 relational typography system
  type TypographyConfigV2,
  type TypographyRole,
  type EmphasisLevel,
  type RoleFontSlot,
  type RoleFontSlotRole,
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_SIZES,
  DEFAULT_FSTEP_ASSIGNMENTS,
  DEFAULT_LINE_HEIGHT_OFFSETS,
  FONT_WEIGHTS,
  FIXED_WEIGHT_ROLES,
  EMPHASIS_WEIGHT_ROLES,
  EMPHASIS_LEVELS,
  generateTypographyCSSV2,
  generateFullTypographyCSSV2,
  generateTypographyScriptContextCSS,
  generateFontRenderingCSS,
  styleToTokenCssV2,
} from './utils/typography';

// V2 typography data layer re-exports
export {
  FONT_SLOTS,
  FONT_SLOT_ROLES,
  DEFAULT_FONT_FAMILIES,
  BRAND_CUSTOMIZABLE_ROLES,
  OPTICAL_SIZING_ENTRIES,
  TYPOGRAPHY_SIZE_COUNT,
  parseFStepNumber,
  computeLineHeightFStep,
  fStepToDimensionVar,
  shiftFStep,
  applyBreakpointGroupBump,
  L_GROUP_FSTEP_DELTA,
  BREAKPOINT_BUMP_ROLES,
  getFixedWeight,
  getEmphasisWeight,
  usesOpticalSizing,
  typographyTokenName,
  getAllTypographyEntries,
} from './data/typography-roles';
export type {
  FontSlot,
  BrandCustomizableRole,
  FixedWeightRole,
  EmphasisWeightRole,
  DisplaySize,
  HeadlineSize,
  TitleSize,
  BodySize,
  LabelSize,
  CodeSize,
} from './data/typography-roles';
// Spacing re-exports from dimension, so import selectively to avoid conflicts
export {
  // Types
  type SpacingConfig,
  type SpacingStep,
  type DynamicSpacingTokenName,
  // Constants
  SPACING_TOKENS,
  SPACING_TO_FSTEP,
  RESPONSIVE_SPACING_TOKENS,
  DEFAULT_SPACING_CONFIG,
  // Functions
  generateSpacingScale,
  generateResponsiveSpacingScale,
  getSpacingValue,
  spacingToTokenCss,
  generateSpacingCss,
  meetsTouchTarget,
  getMinTouchTargetToken,
  validateSpacingConfig,
  getDensityLabel,
  getDensityModes,
  getSpacingFStep,
  compareSpacingApproaches,
  isResponsiveSpacingToken,
  generateExtendedSpacingTokens,
  getDynamicSpacingToFStep,
} from './utils/spacing';
export * from './utils/platform-tokens';
export * from './utils/componentContextExtractor';
export * from './utils/documentationMarkdown';
export * from './utils/elevation';
export * from './utils/motion';
export * from './utils/ornamentSvg';
// Component preview style helpers (shared between library override CSS and
// the platform's ComponentTokenEditor). Pure utilities — no React.
export {
  buildComponentPreviewStyles,
  expandManifestDefaults,
  filterNonColorTokens,
  mergeComponentPreviewOverrides,
  type DraftOverrideEntry,
} from './utils/componentPreviewStyles';
// Static dimension tables (per-platform × density ColourTool/platform values)
export * from './data/dimension-scales';
export * from './data/stroke-scale';
// Font catalog + helpers (moved from packages/ui so library hooks no longer depend on
// a platform-only component tree).
export * from './data/fonts';
export * from './data/typography-scripts';
// Canonical spacing → dimension f-step mapping
export {
  SPACING_SIZES,
  NEGATIVE_SPACING_SIZES,
  DENSITY_SHIFTS,
  generateSpacingAliases,
  generateSpacingAliasBlock,
} from './data/spacing-aliases';

// Dimension CSS generation + structured contexts for native clients
export {
  generateDimensionCSS,
  buildStructuredDimensionContexts,
  pickStructuredDimensionContext,
  mapNativePlatformToV2DimensionPlatform,
  SCALE_RATIOS,
  GRID_MARGIN_RATIO,
  GRID_GUTTER_RATIO,
  BASE_F0_INDEX,
  computeScaleFromBase,
  interpolateValue,
  getBaseSizesForBreakpoint,
} from './utils/dimensionCSS';

// Code generation (AST → source)
export * from './codegen';

// AST Templates (predefined component compositions)
export * from './templates';

// Brand CSS Engine (framework-agnostic pure functions)
export * from './engine';
