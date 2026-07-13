/**
 * @jds/kb-core — shared knowledge-base core.
 *
 * Consumed as a strict, exact-version peerDep by every @jds/kb-<sdk> package
 * and by downstream AI code-generation tools. Hybrid drift strategy:
 *   (a) hard pinned peerDep
 *   (b) defensive commonKbVersion stamp on every kb-<sdk>/manifest.json
 *   (c) lock-step CI publish via Changesets in this monorepo
 */

// Version stamps + manifest shape
export {
  KB_SCHEMA_VERSION,
  KB_VERSION,
  BRAND_SET_VERSION,
  SDK_IDS,
  type SchemaVersion,
  type KbVersion,
  type BrandSetVersion,
  type SdkId,
  type KBManifest,
} from './types/version';

// Vocabulary
export {
  COLOR_ROLES,
  SURFACE_MODES,
  ATTENTION_LEVELS,
  ATTENTION_TO_SURFACE,
  type ColorRole,
  type SurfaceMode,
  type AttentionLevel,
} from './types/roles';

export {
  SPACING_SCALE,
  SHAPE_SCALE,
  type TypographyRole,
  type TypographyVariant,
  type Emphasis,
  type DisplaySize,
  type HeadlineSize,
  type TitleSize,
  type BodySize,
  type LabelSize,
  type CodeSize,
  type SpacingScale,
  type ShapeScale,
  type MotionDuration,
  type MotionEasing,
  type MotionToken,
  type ElevationLevel,
  type ComponentTokenConsumption,
} from './types/tokens';

// Brand foundation
export type {
  OkLchTriple,
  ColorScaleStep,
  ColorScale,
  FontReference,
  BrandFonts,
  ThemeModifiers,
  RecipeSelections,
  BrandFoundation,
} from './types/brand';
// NOTE: the brand-discovery *values* (getBrand / listBrands /
// resolveBrandFromConfig) are Node-only — they import `node:fs` / `__dirname`
// to read `dist/brands/<slug>.json`. Importing them from this main entry
// dragged `node:fs` into browser bundles (Storybook/Vite) and broke the web
// build. They now live behind the dedicated Node subpath `@jds/kb-core/node`.
// Browser consumers must NOT import this entry for brand data — load the
// snapshot JSON via `@jds/kb-core/brands/<slug>` (browser-safe) instead.

// Invariants
export {
  CORE_INVARIANTS,
  type CoreInvariants,
  type ZeroLiteralsRule,
  type SurfaceRules,
  type ShapeDefaults,
  type FocusHaloRules,
} from './types/invariants';

// Figma mapping
export type {
  FigmaMapping,
  FigmaReverseIndexEntry,
} from './types/figma';

// Composition rules
export type {
  ChildKind,
  SlotCardinality,
  SlotSpec,
  CompositionRule,
} from './types/composition';

// A11y
export type {
  AriaRole,
  A11yWeb,
  AccessibilityRoleRN,
  A11yRN,
  A11yIos,
  A11yAndroid,
  A11yFlutter,
} from './types/a11y';

// Render hints (per SDK)
export type {
  RenderHintsWeb,
  RenderHintsRN,
  RenderHintsIos,
  RenderHintsAndroid,
  RenderHintsFlutter,
} from './types/renderHints';

// Uniform component meta
export type {
  ComponentStatus,
  DeprecationInfo,
  JsonSchemaFragment,
  ComponentMetaUniform,
  VisualSignature,
  VisualSignatureIndex,
} from './types/componentMeta';

// Visual-signature matching thresholds — single source of truth across
// kb-* packages and downstream consumers.
export {
  PHASH_HAMMING_THRESHOLD,
  SSIM_MATCH_THRESHOLD,
} from './visualSignatures/thresholds';

// Visual-signature helpers — SDK-agnostic. Live in kb-core so kb-rn / kb-web
// / kb-ios / kb-android share one canonical implementation.
export {
  enumerateVariants,
  type VariantTuple,
} from './visualSignatures/enumerateVariants';
export { hammingDistance } from './visualSignatures/hammingDistance';

// Composition compiler
export { compileComposition, type CompiledComposition } from './composition/compile';

// KB graph builder — lifts latent meta relationships (composition / tokens /
// figma / source / deprecation) into a queryable node+edge graph.
export {
  buildKbGraph,
  type GraphInputMeta,
  type GraphNode,
  type GraphEdge,
  type GraphNodeKind,
  type GraphEdgeKind,
  type EdgeConfidence,
  type KbGraph,
  type BuildKbGraphOptions,
} from './graph/buildGraph';

// Shared schema fragments
export * from './schemas';

