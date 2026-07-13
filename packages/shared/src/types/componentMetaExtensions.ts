/**
 * componentMetaExtensions.ts
 *
 * Five additive descriptors round-2 audit blocker B3 calls out: per-SDK
 * platform status, Figma reverse-mapping, declared token consumption,
 * forbidden-pattern guard rails, and structured deprecation paths.
 *
 * Lives in a sibling file so consumers that don't yet use the extensions
 * keep their imports untouched. Every field is OPTIONAL on `ComponentMeta`
 * — adopters fill them in per component as they migrate.
 *
 * Future: when @jds/kb-core lands on dev, these types collapse into a
 * single re-export from kb-core. Until then they're locally declared so
 * this PR is independent of any @jds/* peer dep.
 */

// ---------------------------------------------------------------------------
// Per-SDK platform availability
// ---------------------------------------------------------------------------

export const SDK_IDS = ['web', 'rn', 'ios', 'android', 'flutter'] as const;
export type SdkId = (typeof SDK_IDS)[number];

export type PlatformStatus = 'alpha' | 'beta' | 'stable' | 'deprecated';

export interface PlatformAvailability {
  readonly status: PlatformStatus;
  /** Optional importPath override per platform; defaults to the meta's primary. */
  readonly importPath?: string;
  /** Optional note (e.g. "RN Card maps to <Surface><Container>" while a dedicated Card lands). */
  readonly note?: string;
}

export type ComponentPlatformsMatrix = Partial<Record<SdkId, PlatformAvailability>>;

// ---------------------------------------------------------------------------
// Figma mapping
// ---------------------------------------------------------------------------

/**
 * Figma component KEY (stable per component definition) + the variant
 * properties that narrow within the key's variant set. NEVER use Figma
 * node IDs — they mutate when designers add/remove variant properties.
 *
 * `keyHistory` is the hedge against Jio Design re-authoring a component
 * (new key, same semantic component). Reverse-lookup walks this list as
 * a fallback. Empty by default.
 */
export interface ComponentFigmaMapping {
  readonly componentKey: string;
  readonly variantProperties?: Readonly<Record<string, string>>;
  readonly keyHistory: readonly string[];
}

// ---------------------------------------------------------------------------
// Token consumption — locally defined enum families
// ---------------------------------------------------------------------------

export const COMPONENT_TOKEN_COLOR_ROLES = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;
export type ComponentTokenColorRole = (typeof COMPONENT_TOKEN_COLOR_ROLES)[number];

export const COMPONENT_TOKEN_SURFACE_MODES = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;
export type ComponentTokenSurfaceMode = (typeof COMPONENT_TOKEN_SURFACE_MODES)[number];

/**
 * Tokens a component declares it consumes. Drives:
 *   - the build-time token-claim integrity check (B6) — every var(--…) the
 *     implementation actually reads must appear here
 *   - downstream "swap raw hex for token" rewrites
 *   - editor token-panel filtering (only show tokens the component honors)
 */
export interface ComponentTokenConsumption {
  readonly color?: readonly ComponentTokenColorRole[];
  readonly surface?: readonly ComponentTokenSurfaceMode[];
  /** Typography variant identifiers, e.g. 'label.M' or 'body.L'. Free-form to avoid coupling. */
  readonly typography?: readonly string[];
  /** Spacing scale tokens, e.g. 'XS', '2XL'. */
  readonly spacing?: readonly string[];
  /** Shape tokens, e.g. 'pill', 'M'. */
  readonly shape?: readonly string[];
  /** Motion tokens, e.g. 'motion.duration.discreet.short'. */
  readonly motion?: readonly string[];
  /** Elevation levels [0..5]. */
  readonly elevation?: readonly number[];
}

// ---------------------------------------------------------------------------
// Forbidden patterns
// ---------------------------------------------------------------------------

export type ForbiddenPatternSeverity = 'error' | 'warn' | 'info';

export interface ForbiddenPattern {
  /**
   * Regular-expression sources that the prop value must NOT match.
   * Compiled by consumers via `new RegExp(source, 'i')`. Encode as plain
   * strings so the meta serialises cleanly to JSON.
   */
  readonly regexps: readonly string[];
  /** Human-readable LLM-rewrite hint. */
  readonly suggestion: string;
  readonly severity: ForbiddenPatternSeverity;
}

/**
 * Prop-name → forbidden-pattern. Common case: `{ backgroundColor: { regexps: ['^#'], … } }`
 * to block raw hex literals on colour props.
 */
export type ForbiddenPatternsMap = Readonly<Record<string, ForbiddenPattern>>;

// ---------------------------------------------------------------------------
// Deprecation
// ---------------------------------------------------------------------------

export interface ComponentDeprecationInfo {
  /** semver — when deprecation was announced. */
  readonly since: string;
  /** PascalCase name of the replacement component. */
  readonly useInstead: string;
  /** 1-2 sentence migration guidance. */
  readonly migrationNote: string;
  /**
   * Optional path (relative to the package root) to a jscodeshift / ts-morph
   * codemod. Drift-resistant when paired with `codemodTestFixture`.
   */
  readonly autoMigrationCodemod?: string;
  /** Optional before/after pair path that proves the codemod is reversible. */
  readonly codemodTestFixture?: string;
}
