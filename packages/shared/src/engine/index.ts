/**
 * Brand CSS Engine — Framework-Agnostic Core
 *
 * Pure functions for computing and validating brand CSS injection.
 * No React dependency. Usable from:
 * - Browser (via useBrandCSS hook in @oneui/ui)
 * - Convex actions (server-side pre-computation)
 * - CLI tools (build-time brand CSS generation)
 * - Non-React consumers
 */

// Types
export type { EngineAvailableScale, AvailableScale, EngineColorPalette, BrandCSSValidation, SurfaceContextCSSValidation, InjectionMode, SurfaceLevel, SurfaceContext } from './types';

// Palette utilities (scale → palette conversion)
export { buildPaletteFromScale } from './paletteUtils';

// Scale building
export { buildAvailableScales } from './buildAvailableScales';

// CSS validation
export { validateBrandCSS, validateBrandCSSSignature, validateSurfaceContextCSS } from './validateBrandCSS';
export type { BrandCSSSignatureResult } from './validateBrandCSS';

// Composition code-mode quality gates
export {
  evaluateCompositionDesignGate,
  formatDesignGateIssues,
  inferCompositionDesignArchetype,
} from './compositionDesignGate';
export type {
  CompositionDesignArchetype,
  DesignGateIssue,
  DesignGateResult,
  DesignGateSeverity,
  EvaluateCompositionDesignGateOptions,
} from './compositionDesignGate';

// CSS wrapping
export { wrapCSSForInjection } from './wrapCSS';

// Token boundary enforcement
export { filterBrandDeclarations, BRAND_ALLOWED_PREFIXES, BRAND_ALLOWED_REGEX } from './tokenBoundary';

// Token manifest (canonical schema — source of truth for allowlist)
export { TOKEN_FAMILIES, getAllowedPrefixes, getFamiliesByCategory, getAppearanceRolePrefixes } from './tokenManifest';
export type { TokenFamily } from './tokenManifest';

// Cache key generation
export { computeInputHash, computeMotionFingerprint, computeElevationFingerprint } from './cacheKey';

// Performance benchmarking
export { measureSharedPipeline, measureSharedPipelineAverage } from './benchmark';
export type { PipelineTimings, PipelineBenchmarkResult } from './benchmark';

// Color math utilities (hex/RGB, contrast, blending)
export {
  hexToRgbTuple,
  parseRgbFromHexLoose,
  normalizeSolidCssHex,
  hexToRgb,
  rgbToHex,
  preParseRGBPalette,
  getRelativeLuminance,
  getContrastRatio as getContrastRatioHex,
  getContrastRatioRGB,
  blendWithAlpha,
  blendWithAlphaRGB,
  findAlphaForContrast,
  findAlphaForContrastRGB,
  isLightSurface,
  getContrastDirection,
  getDynamicContrastDirection,
  getDynamicContrastDirectionRGB,
  getWcagLevel,
  getReadableTextColor,
  createWcagCompliance,
  createScaleResult,
  createScaleResultRGB,
  getBoldStepOffset,
  RGB_GRAY,
  RGB_BLACK,
  RGB_WHITE,
} from './colorMath';
export type {
  ColorPalette,
  ContrastDirection,
  RGB,
  RGBPalette,
  WCAGCompliance,
  ScaleResult,
} from './colorMath';

// CSS parser utility
export { parseCSSDeclarationsToVars } from './cssParser';

// Motion CSS generation (brand-injectable motion tokens)
export { generateMotionCSS, generateDefaultMotionCSS } from './motionCSS';

// Elevation CSS generation (brand-injectable shadow elevation tokens)
export { generateElevationCSS, elevationLevelToBoxShadow } from './elevationCSS';
export type { ElevationFoundationConfig } from './elevationCSS';

// Grid CSS generation (brand-injectable per-platform grid overrides)
export { generateGridCSS, hasGridOverrides, normalizeGridConfig } from './gridCSS';
export type { BrandGridConfig, GridPlatformConfig, ContainerDefaultVariant } from './gridCSS';

// Gradient CSS generation (brand-injectable gradient fills + on-colors)
export { generateGradientCSS, gradientToCSS } from './gradientCSS';
export type {
  GradientType,
  RadialShape,
  GradientStop,
  GradientDef,
  GradientsFoundationConfig,
} from '../types/gradients';

// Material CSS generation (brand-injectable material effect tokens)
export {
  DEFAULT_METALLIC_PRESETS,
  MATERIAL_ASSIGNMENT_TARGETS,
  MAX_METALLIC_VARIANTS,
  METALLIC_GRADIENT_TYPES,
  METALLIC_PRESETS,
  METALLIC_PROPERTIES,
  VISIBLE_METALLIC_PRESETS,
  buildMetallicFillGradient,
  buildMetallicFillTokenGradient,
  buildMetallicStrokeGradient,
  buildMetallicStrokeTokenGradient,
  generateMaterialAssignmentCSS,
  generateMaterialAssignmentTokenEntries,
  generateMetallicMaterialCSS,
  generateMetallicTokenEntries,
  getEnabledMetallicPresets,
  getMetallicTokenLabel,
  getMetallicTokenPrefix,
  getMetallicVariantSegments,
  getMetallicVariantTokenPrefix,
  mergeMaterialConfigWithFoundationConfig,
  normalizeActiveMetallicMap,
  normalizeMaterialAssignments,
  normalizeMetallicConfig,
  normalizeMetallicMaterials,
} from './materialCSS';
export type {
  ActiveMetallicMap,
  MaterialAssignmentMap,
  MaterialAssignmentTarget,
  MetallicConfig,
  MetallicGradientType,
  MetallicMaterial,
  MetallicMaterialsConfig,
  MetallicPreset,
  MetallicPresetName,
  MetallicProperty,
  MetallicTokenEntry,
  MetallicVariant,
  VisibleMetallicPresetName,
} from './materialCSS';

// Material resolver for native (gradient stop arrays for expo-linear-gradient / react-native-svg)
export { resolveMaterials } from './materialNative';
export type { ResolvedMaterials, ResolvedMetallicGradient } from './materialNative';

// SVG metallic paint helpers — shared between web and native Logo rendering
export {
  applyMetallicToSvg,
  injectMetallicGradientDef,
  type LogoMaterial,
  type LogoMaterialTarget,
} from './materialSvg';

// Surface algorithm — relative step computation
export {
  STEPS,
  APPEARANCE_ROLES,
  CONTEXT_SURFACE_TOKENS,
  MEDIA_CONTEXTS,
  resolveSurface,
  resolveContent,
  resolveState,
  resolveTokenSet,
  resolveMultiRoleTokenSets,
  resolveContextTokenSet,
  resolveInteractionOverlay,
  resolveFocusRing,
  contrastDir,
  textOnBg,
  computeContrastDir,
  computeDarkerBaseStep,
  buildScaleDefinition,
  opacityFromStep,
  resolveMediaSurface,
  resolveMediaContent,
  resolveMediaInteraction,
  resolveMediaFocusRing,
  getTransparentBaseHex,
} from './surfaceNew';
export type {
  Step,
  SurfaceToken,
  ContentToken,
  StateToken,
  SemanticToken,
  AppearanceRole,
  ContrastDir,
  ScaleDefinition,
  BuildScaleDefinitionOptions,
  ResolvedSurface,
  ResolvedContent,
  ResolvedTokenSet,
  ThemeConfig,
  MultiRoleTokenSets,
  MediaContext,
  MaterialVariant,
  MediaInteractionState,
  InteractionState,
  FocusRingToken,
  TransparentMaterial,
  MediaInteractionOverlay,
  MediaFocusRingResult,
} from './surfaceNew';

// CSS generation
export {
  roleLabel,
  generateRoleCSS,
  generateBackwardCompatAliases,
  dedupeDeclarationsKeepLast,
  generateMultiRoleRootCSS,
  generateSurfaceContextCSS,
  generateSurfaceStepLookupCSS,
  generateSurfaceStepLookupCSSSplit,
  generateAppearanceRedirectCSS,
  generateContextBoundaryCSS,
  generateTransparentMaterialCSS,
  generateFullCSS,
  SURFACE_STEP_BOLD_LIGHT,
  SURFACE_STEP_BOLD_DARK,
} from './cssGenNew';
export { resolveSurfaceStep } from './surfaceNew';

// Shared ThemeConfig assembly — used by useBrandCSS, precompute, native.
export { buildThemeConfig } from './buildThemeConfig';
export type { ThemeConfigAppearanceInput } from './buildThemeConfig';

// Native theme builder — same data path as useBrandCSS, returns a flat JS
// object ready for React Native consumers (no CSS round trip).
export {
  buildNativeTheme,
  resolveNativeContextRoles,
  validateNativeTheme,
} from './buildNativeTheme';
export type {
  OneUINativeTheme,
  NativeRoleTokens,
  NativeAppearanceConfig,
  BuildNativeThemeInput,
  NativeThemeContext,
  NativeThemeValidation,
} from './buildNativeTheme';

export { buildNativeMotion } from './buildNativeMotion';
export type {
  ResolvedNativeMotion,
  ResolvedNativeMotionEasings,
  EasingCurveResolved,
  NativeMotionConfigInput,
  MotionDistances,
  SpringTuning,
  TapScaleTokens,
  SpinnerMotion,
} from './buildNativeMotion';

export { buildNativeElevation } from './buildNativeElevation';
export type {
  ResolvedNativeElevation,
  ResolvedElevationLevel,
  NativeElevationConfigInput,
  NativeElevationLevelInput,
  NativeElevationShadowLayer,
} from './buildNativeElevation';

// Native dimensions — spacing + shape resolved from f-step scale.
export { buildNativeDimensions } from './buildNativeDimensions';
export type {
  NativeDimensions,
  NativeSpacing,
  NativeShape,
} from './buildNativeDimensions';

// Native typography resolution — Typography V2 → numeric RN values.
export { buildNativeTypography } from './buildNativeTypography';
export type {
  NativeTypography,
  NativeTypographyConfig,
  NativeRoleTypography,
  NativeEmphasisTypography,
  NativeTypeStyle,
  NativeCustomFontDescriptor,
  FontWeightValue,
} from './buildNativeTypography';

export {
  buildStaticWeightFamilyMap,
  snapToStandardCssWeight,
  typographySlotForRole,
  resolveStaticWeightFamily,
  resolveStaticWeightFamilyForRole,
  mergeStaticWeightFamilyConfig,
  mergeWithJioBundledStaticDefaults,
  JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES,
  CSS_WEIGHT_FAMILY_SUFFIX,
  STANDARD_CSS_WEIGHTS,
} from './staticFontFamilies';
export type {
  TypographyFontSlot,
  StandardCssWeight,
  StaticWeightFamilyMap,
  StaticWeightFamiliesBySlot,
  StaticWeightFamilyPrefixConfig,
} from './staticFontFamilies';

// Brand-BG + accent FG-Bold anchoring (ribbon, sub-brand scoped CSS)
export {
  effectiveBrandBgBaseStep,
  synthesizeBrandBgIfMissing,
  isAppearanceRoleAnchoringBold,
  APPEARANCE_ROLES_ANCHOR_BOLD,
} from './brandBgAppearance';
export type { BackgroundForBrandBgSynthesis } from './brandBgAppearance';

// Server-side CSS precomputation pipeline
export { precomputeBrandCSSNew } from './precompute';

// Resolved-token JSON export (per-foundation + brand-wide)
export { extractResolvedTokens, sliceExportByFoundation } from './tokenExtract';
export type { BrandTokenExport, FoundationBucket, FoundationDataLike } from './tokenExtract';

// Voice engine — compiler, tone guard, validation, caching
export { compileVoiceRules, compileSkillPrompt } from './voiceCompiler';
export { runToneGuard } from './voiceToneGuard';
export { validateVoiceConfig } from './voiceValidator';
export type { VoiceValidation } from './voiceValidator';
export { computeVoiceHash } from './voiceCacheKey';

// Voice engine types (AI agent rules compiler)
export type {
  ToneProfile,
  LanguageConfig,
  CommunicationStyle,
  NavarAsaState,
  EmotionalIntelligenceConfig,
  ChannelId,
  ChannelConfig,
  ChannelDefaults,
  VoiceContext,
  VoiceConfig,
  VoiceRule,
  ResolvedVoiceRule,
  VoiceSkill,
  VoiceSkillExample,
  ToneGuardCheck,
  ToneGuardResult,
  EvalRubric,
  EvalScenario,
  EvalDimensionScore,
  EvalScenarioResult,
  CompiledVoicePrompt,
  FeedbackSource,
  FeedbackRating,
  FeedbackStatus,
  FeedbackResolutionAction,
  VoiceFeedback,
} from './voiceTypes';
export { VOICE_CONTEXTS, DEFAULT_SECTION_CONTEXTS } from './voiceTypes';

// Voice evaluation runner (judge prompts, scoring, aggregation)
export { buildJudgePrompt, computeWeightedScore, buildScenarioResult, aggregateResults } from './voiceEvalRunner';
export type { JudgeDimensionResult, JudgeBehaviorResult, JudgeForbiddenResult, JudgeResponse, RunSummary } from './voiceEvalRunner';

// Composition engine — compiler, validator, caching
export { compileCompositionRules, getDefaultCompositionConfig } from './compositionCompiler';
export {
  normalizeCompositionAST,
  VALID_SEMANTIC_ICON_NAMES,
  type CompositionASTNormalizationIssue,
  type CompositionASTNormalizationResult,
} from './compositionASTNormalizer';
export { validateComposition, validateSkill } from './compositionValidator';
export type {
  SkillIssue,
  SkillIssueCode,
  SkillValidationResult,
} from './compositionValidator';
export {
  PLAYGROUND_COMPONENT_ALLOWLIST,
  PLAYGROUND_ICON_NAMES,
  buildTSXSystemPrompt,
  buildTSXUserPrompt,
  buildTSXRevisionPrompt,
  buildTSXRepairPrompt,
  stripTSXFences,
  isPlaygroundComponent,
  type PlaygroundComponent,
} from './compositionCodePrompt';
export {
  PLAYGROUND_IMAGE_ASSETS,
  PLAYGROUND_IMAGE_FALLBACK_SRC,
  PLAYGROUND_IMAGE_URLS,
  isPlaygroundImageUrl,
  formatPlaygroundImagePromptList,
  type PlaygroundImageAsset,
} from './playgroundImageAssets';
// `validateCompositionCode` / `formatValidationIssues` are intentionally NOT
// re-exported here. Their implementation pulls in `@babel/parser`, `@babel/traverse`,
// and `@babel/types`, which all reference `process.env` and break browser bundles
// (Storybook, Vite preview, etc.) the moment any story imports from this barrel.
// Server-side consumers must import them directly from
// `@oneui/shared/engine/compositionCodeValidator`. Types are safe to re-export
// because TS strips them at build time.
export type {
  CodeIssue,
  CodeIssueSeverity,
  CodeValidationResult,
} from './compositionCodeValidator';
export { computeCompositionHash } from './compositionCacheKey';
export { serializeBrandToDesignMd } from './compositionDesignMdExporter';
export type {
  DesignMdExporterInput,
  DesignMdExporterBrand,
  DesignMdColorConfig,
  DesignMdPresetSelection,
  DesignMdSkill,
} from './compositionDesignMdExporter';
// `DESIGN_MD_SPEC_ALPHA` (~14 KB) is intentionally NOT re-exported here. Import
// it directly via `@oneui/shared/engine/compositionDesignMdSpec` from the one
// consumer that needs it (the design agent executor) so other engine consumers
// don't pay the module parse cost.

// Composition engine types (Design Composition Agent)
export type {
  CompositionContext,
  BrandVertical,
  LayoutPersonality,
  CompositionConfig,
  CompositionRule,
  ResolvedCompositionRule,
  CompositionSkill,
  CompositionSkillExample,
  ValidationSeverity,
  CompositionCheck,
  CompositionValidationResult,
  CompositionEvalRubric,
  CompositionEvalScenario,
  CompositionEvalDimensionScore,
  CompositionEvalResult,
  CompiledCompositionPrompt,
  CompositionFeedbackSource,
  CompositionFeedbackRating,
  CompositionFeedbackStatus,
  CompositionFeedbackResolutionAction,
  CompositionFeedback,
  ReferenceScreen,
  ResolveReferencesInput,
  ScoredReference,
} from './compositionTypes';

// Reference UI library — vision-grounded composition
export { resolveReferences, renderReferencePrecedent } from './referenceResolver';

// Context pack — external-agent API assembly
export { assembleContextPack } from './contextPack';
export type {
  ContextPackInput,
  ContextPackResult,
  ContextPackImage,
  SkillPack,
} from './contextPack';

// Hybrid RAG retrieval — pure merge/de-dupe layer (RFC 0002)
export { retrieveRelevantContext, INVARIANT_SECTION_IDS } from './retrieveRelevantContext';
export type {
  RuleSearchHit,
  ReferenceSearchHit,
  SkillSearchHit,
  SearchPayload,
  RetrievalTrace,
  RetrievalTraceEntry,
  RetrieveRelevantContextInput,
  RetrieveRelevantContextResult,
} from './retrieveRelevantContext';
export {
  COMPOSITION_CONTEXTS,
  BRAND_VERTICALS,
  DEFAULT_COMPOSITION_CONTEXTS,
  GENERATION_PHASES,
  GENERATION_PHASE_SPECS,
  isCompositionContext,
} from './compositionTypes';
export type {
  GenerationPhase,
  GenerationPhaseSpec,
  DirectionId,
} from './compositionTypes';

// Phased generation (junior-designer workflow)
export { buildPhasedUserPrompt } from './compositionPhasedCompiler';
export type { BuildPhasedPromptArgs } from './compositionPhasedCompiler';

// Shared LLM/AST utilities (used by all composition routes + the playground)
export { computeASTHash, computeCodeHash } from './astHash';
export { stripJSONFences } from './llmJSON';
export { VALIDATOR_CHECK_IDS } from './compositionValidator';
export type { ValidatorCheckId } from './compositionValidator';

// Composition evaluation runner (judge prompts, scoring, aggregation, critique)
export {
  buildCompositionJudgePrompt,
  computeCompositionWeightedScore,
  buildCompositionEvalResult,
  buildCritiquePrompt,
  parseCritiqueResponse,
  CRITIQUE_DIMENSION_LABELS,
} from './compositionEvalRunner';
export type {
  JudgeResponse as CompositionJudgeResponse,
  CritiqueResponse,
  CritiqueDimensionId,
  CritiqueDimensionScore,
  CritiqueKeepItem,
  CritiqueFixItem,
  CritiqueFixSeverity,
  CritiqueQuickWin,
} from './compositionEvalRunner';
export { COMPOSITION_SEED_SECTIONS, buildSeedRules } from './compositionSeedRules';

// Figma↔OneUI parity engine
export {
  inferCSSTokenName,
  buildMappingTable,
  compareTokenValues,
  checkComponentParity,
  checkComponentParityFromBindings,
  summarizeParity,
  buildSpacingParityMatrix,
} from './parityEngine';
export type {
  FigmaComponentBinding,
  ParityMapping,
  ParityEntry,
  ParitySummary,
  SpacingParityRow,
  SpacingParityMatrix,
} from './parityEngine';
