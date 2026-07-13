/**
 * typography/v2.ts
 *
 * V2 RELATIONAL TYPOGRAPHY SYSTEM.
 *
 * Typography sizes = CSS aliases to dimension f-step variables. When platform
 * or density changes, typography cascades automatically through the dimension
 * scale. See `../../data/typography-roles.ts` for the canonical role / size
 * tables and helpers (`typographyTokenName`, `fStepToDimensionVar` etc.).
 *
 * Extracted from the original monolithic `typography.ts` so the legacy V1
 * scale-generation helpers and the modern V2 brand-CSS pipeline live in
 * separate files. The parent `typography.ts` re-exports everything here, so
 * existing callers that import from `@oneui/shared/utils/typography` continue
 * to work unchanged.
 */

import type { FStep } from '../../data/dimension-scales';
import {
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_SIZES,
  DEFAULT_FSTEP_ASSIGNMENTS,
  DEFAULT_LINE_HEIGHT_OFFSETS,
  FONT_WEIGHTS,
  FIXED_WEIGHT_ROLES,
  EMPHASIS_WEIGHT_ROLES,
  EMPHASIS_LEVELS,
  computeLineHeightFStep,
  fStepToDimensionVar,
  typographyTokenName,
  type TypographyRole,
} from '../../data/typography-roles';
import {
  resolveTypographyScriptSupport,
  scriptFontTokenName,
  type TypographyScriptSupportConfig,
  type ResolvedTypographyScriptConfig,
} from '../../data/typography-scripts';

// Re-export V2 types and constants so callers importing from this file get the
// same surface as importing from the legacy parent module.
export {
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_SIZES,
  DEFAULT_FSTEP_ASSIGNMENTS,
  DEFAULT_LINE_HEIGHT_OFFSETS,
  FONT_WEIGHTS,
  FIXED_WEIGHT_ROLES,
  EMPHASIS_WEIGHT_ROLES,
  EMPHASIS_LEVELS,
} from '../../data/typography-roles';
export type { TypographyRole, EmphasisLevel } from '../../data/typography-roles';

/**
 * Font slot assignable to a typography role via the Type Scale editor.
 * Code role is excluded — it always resolves to `--Typography-Font-Code`.
 */
export type RoleFontSlot = 'primary' | 'secondary';

/** Roles eligible for a font-slot override (Code is intentionally omitted). */
export type RoleFontSlotRole = Exclude<TypographyRole, 'code'>;

/**
 * V2 typography config — brand-customizable parts of the relational system.
 * Stored in Convex as `typographyV2` on the foundations table.
 */
export interface TypographyConfigV2 {
  /**
   * Font selection (4 slots).
   * `textFontId` / `headingFontId` are canonical (function-named slots).
   * The other pairs are deprecation aliases retained for existing brand
   * documents until cleanup. Readers should prefer the canonical names
   * with a fallback chain through the legacy ones.
   */
  fontSelection?: {
    textFontId?: string | null;
    headingFontId?: string | null;
    bodyFontId?: string | null;       // deprecated — alias of textFontId
    displayFontId?: string | null;    // deprecated — alias of headingFontId
    primaryFontId?: string | null;    // deprecated — alias of textFontId
    secondaryFontId?: string | null;  // deprecated — alias of headingFontId
    fallbackFontIds?: string[];
    codeFontId?: string | null;
  };
  /** Display f-step assignments (brand picks any 3 f-steps) */
  displayFSteps?: Partial<Record<string, FStep>>;
  /** Headline f-step assignments (brand picks any 3 f-steps) */
  headlineFSteps?: Partial<Record<string, FStep>>;
  /** Title f-step assignments (overrides system defaults) */
  titleFSteps?: Partial<Record<string, FStep>>;
  /** Body f-step assignments (overrides system defaults) */
  bodyFSteps?: Partial<Record<string, FStep>>;
  /** Label f-step assignments (overrides system defaults — connects Button, chip, nav text to the type scale) */
  labelFSteps?: Partial<Record<string, FStep>>;
  /** Code f-step assignments (overrides system defaults) */
  codeFSteps?: Partial<Record<string, FStep>>;
  /**
   * Per-role font slot override. Selects whether a role renders in the
   * brand's Primary or Secondary typeface. Applies to every size in the role
   * and across all viewports. When unset, all roles default to `primary`
   * (matching the legacy `--Typography-Font-Primary` behaviour).
   * Code role is not included — it always uses the dedicated Code slot.
   */
  roleFontSlots?: Partial<Record<RoleFontSlotRole, RoleFontSlot>>;
  /** Line height offsets per role */
  lineHeightOffsets?: Partial<Record<TypographyRole, number>>;
  /** Per-role weight overrides */
  weightOverrides?: Record<string, number>;
  /**
   * Per-font OpenType feature toggles. Keyed by font slot because ligatures are a
   * property of the font's glyph shaping, not of the role it's used for.
   * `ligatures` controls the `liga` feature; `contextualAlternates` controls `clig`.
   * Both default to `true` when undefined — override to `false` to disable.
   */
  fontFeatures?: {
    primary?: { ligatures?: boolean; contextualAlternates?: boolean };
    secondary?: { ligatures?: boolean; contextualAlternates?: boolean };
    code?: { ligatures?: boolean; contextualAlternates?: boolean };
  };
  /**
   * Per-role letter-spacing in em units. Applied via `--{Role}-LetterSpacing` token.
   * Default is `0` (no adjustment). Useful for tightening display/headline or
   * loosening small labels on variable fonts.
   */
  letterSpacing?: Partial<Record<TypographyRole, number>>;
  /**
   * Per-role optical sizing configuration.
   *
   * - `'auto'` (default) — `font-optical-sizing: auto`: browser maps the computed
   *   font-size to the `opsz` variable-font axis automatically. Best for all
   *   variable fonts; stroke weights and spacing adjust for the rendered size.
   * - `'disabled'` — `font-optical-sizing: none`: turns off automatic optical sizing.
   *   Use for non-variable fonts or when a specific fixed optical appearance is desired.
   * - `'manual'` — `font-optical-sizing: none` + emits `--{Role}-OpszVariation`
   *   (e.g. `'opsz' 72`) into brand CSS. Component CSS reads it via
   *   `font-variation-settings: var(--{Role}-OpszVariation, normal)`,
   *   fixing the opsz axis at the specified pt value regardless of rendered size.
   */
  opticalSizing?: Partial<Record<TypographyRole, {
    mode: 'auto' | 'disabled' | 'manual';
    opszValue?: number;
  }>>;
  /**
   * Global font rendering quality. Emitted as a separate `html { ... }` block.
   * Empty / undefined skips emission so callers can layer on their own defaults.
   */
  rendering?: {
    textRendering?: 'auto' | 'optimizeLegibility' | 'geometricPrecision' | 'optimizeSpeed';
    webkitFontSmoothing?: 'auto' | 'antialiased' | 'subpixel-antialiased';
    fontSynthesis?: 'auto' | 'none' | 'weight style';
  };
  /**
   * Script-specific typography support.
   *
   * Stored as part of the existing typography foundation. Missing values are
   * resolved from the built-in India core preset at runtime so old brand
   * documents do not need a destructive migration.
   */
  scriptSupport?: TypographyScriptSupportConfig;
}

/**
 * Generate CSS declarations for V2 typography system.
 * Only generates OVERRIDE tokens for values that differ from defaults.
 * Used by brand CSS injection pipeline.
 *
 * @param config Brand's V2 typography configuration
 * @returns CSS declaration string (no selector wrapping)
 */
export function generateTypographyCSSV2(config: TypographyConfigV2): string {
  const declarations: string[] = [];

  /** Return brand-configured f-step overrides for a role, or undefined if none. */
  const getRoleFSteps = (role: TypographyRole): Partial<Record<string, FStep>> | undefined => {
    switch (role) {
      case 'display':  return config.displayFSteps;
      case 'headline': return config.headlineFSteps;
      case 'title':    return config.titleFSteps;
      case 'body':     return config.bodyFSteps;
      case 'label':    return config.labelFSteps;
      case 'code':     return config.codeFSteps;
    }
  };

  // ── F-step overrides (all roles) ────────────────────────────────────────
  // For every role that has brand-configured f-steps, emit --FontSize and
  // --LineHeight overrides for any size whose f-step differs from the default
  // OR whose line-height offset differs. This connects Button (Label tokens),
  // body text (Body tokens), section headings (Title tokens), etc. to the
  // brand CSS injection pipeline.
  //
  // TODO(typography/L-group-bump): These overrides are emitted at `:root` in
  // @layer brand, which OUTRANKS the L-breakpoint-group bump in typography.css
  // (@layer base, keyed on `[data-Breakpoint=…]`). So a brand that CUSTOMIZES a
  // Display/Headline base step loses the large-screen step-up (Display-L #10→#14,
  // Headline-L #7→#9) — the brand `:root` value pins every viewport to the base
  // step. The editor preview uses `applyBreakpointGroupBump` and DOES show the
  // bump, so editor↔render diverge for customized Display/Headline brands.
  // Fix: for the two BREAKPOINT_BUMP_ROLES, also emit an
  // `[data-Breakpoint="L"]`
  // block applying `applyBreakpointGroupBump(role, size, fStep, 'L')`. Default
  // (non-customized) brands are unaffected — they fall through to the static CSS.
  for (const role of TYPOGRAPHY_ROLES) {
    const fStepOverrides = getRoleFSteps(role);
    if (!fStepOverrides) continue;

    const lhOffset = config.lineHeightOffsets?.[role] ?? DEFAULT_LINE_HEIGHT_OFFSETS[role];
    const defaultLhOffset = DEFAULT_LINE_HEIGHT_OFFSETS[role];

    for (const size of TYPOGRAPHY_SIZES[role]) {
      const fStep = fStepOverrides[size];
      if (!fStep) continue;

      const defaultFStep = DEFAULT_FSTEP_ASSIGNMENTS[role][size];
      const fStepChanged = fStep !== defaultFStep;
      const lhOffsetChanged = lhOffset !== defaultLhOffset;

      if (!fStepChanged && !lhOffsetChanged) continue;

      const name = typographyTokenName(role, size);
      if (fStepChanged) {
        declarations.push(`--${name}-FontSize: ${fStepToDimensionVar(fStep)};`);
      }
      // Line-height must be re-emitted whenever either f-step or offset changes
      declarations.push(`--${name}-LineHeight: ${fStepToDimensionVar(computeLineHeightFStep(fStep, lhOffset))};`);
    }
  }

  // ── Line height offset overrides (no f-step override for that size) ─────
  // When the offset changed but the f-step is still at its default (or no
  // f-step override object was provided), emit just the line-height token.
  if (config.lineHeightOffsets) {
    for (const role of TYPOGRAPHY_ROLES) {
      const offset = config.lineHeightOffsets[role];
      if (offset === undefined || offset === DEFAULT_LINE_HEIGHT_OFFSETS[role]) continue;

      const fStepOverrides = getRoleFSteps(role);

      for (const size of TYPOGRAPHY_SIZES[role]) {
        if (fStepOverrides?.[size]) continue;
        const fStep = DEFAULT_FSTEP_ASSIGNMENTS[role][size];
        const name = typographyTokenName(role, size);
        declarations.push(`--${name}-LineHeight: ${fStepToDimensionVar(computeLineHeightFStep(fStep, offset))};`);
      }
    }
  }

  // ── Role font slot overrides ────────────────────────────────────────────
  // Emit `--{Role}-FontFamily` when a role is assigned to the heading slot
  // (legacy slot key 'secondary' is the same as 'heading'; the V2 schema
  // still uses the legacy slot keys until a separate migration). The text
  // slot is the default (declared at :root in the base layer), so we skip
  // emitting it here to keep brand CSS lean. Code role is intentionally
  // excluded — it always resolves via `--Typography-Font-Code`.
  if (config.roleFontSlots) {
    for (const role of TYPOGRAPHY_ROLES) {
      if (role === 'code') continue;
      const slot = config.roleFontSlots[role as RoleFontSlotRole];
      if (slot !== 'secondary') continue;
      const roleName = role.charAt(0).toUpperCase() + role.slice(1);
      declarations.push(`--${roleName}-FontFamily: var(--Typography-Font-Heading, var(--Typography-Font-Display, var(--Typography-Font-Secondary)));`);
    }
  }

  // ── Weight overrides ────────────────────────────────────────────────────
  // Keys are full CSS variable names without leading '--'
  // e.g. "Label-FontWeight-High", "Body-FontWeight-Medium", "Display-L-FontWeight"
  if (config.weightOverrides) {
    for (const [key, weight] of Object.entries(config.weightOverrides)) {
      declarations.push(`--${key}: ${weight};`);
    }
  }

  // ── Font feature overrides (per font slot) ──────────────────────────────
  // Emit `--Typography-Features-{Slot}` as a value usable directly in
  // `font-feature-settings: var(...)`.
  if (config.fontFeatures) {
    for (const slot of ['primary', 'secondary', 'code'] as const) {
      const features = config.fontFeatures[slot];
      if (!features) continue;
      const value = buildFontFeatureValue(features);
      if (value === null) continue;
      const slotName = slot.charAt(0).toUpperCase() + slot.slice(1);
      declarations.push(`--Typography-Features-${slotName}: ${value};`);
    }
  }

  // ── Per-role letter-spacing overrides ───────────────────────────────────
  if (config.letterSpacing) {
    for (const role of TYPOGRAPHY_ROLES) {
      const value = config.letterSpacing[role];
      if (value === undefined || value === 0) continue;
      const name = role.charAt(0).toUpperCase() + role.slice(1);
      declarations.push(`--${name}-LetterSpacing: ${value}em;`);
    }
  }

  // ── Per-role optical sizing overrides ────────────────────────────────────
  if (config.opticalSizing) {
    for (const role of TYPOGRAPHY_ROLES) {
      const entry = config.opticalSizing[role];
      if (!entry || entry.mode === 'auto') continue;
      const roleName = role.charAt(0).toUpperCase() + role.slice(1);
      declarations.push(`--${roleName}-FontOpticalSizing: none;`);
      if (entry.mode === 'manual' && entry.opszValue !== undefined) {
        // Full font-variation-settings value so component CSS can use
        // `font-variation-settings: var(--{Role}-OpszVariation, normal)` directly.
        // CSS custom properties CAN hold a full font-variation-settings value
        // (e.g. "'opsz' 72") and substitute cleanly — the limitation is only with
        // using var() *inside* the axis number position (e.g. 'opsz' var(--n)).
        declarations.push(`--${roleName}-OpszVariation: 'opsz' ${entry.opszValue};`);
      }
    }
  }

  // ── Script font token fallbacks ──────────────────────────────────────────
  // The UI package resolves these IDs to actual font-family values after
  // custom-font lookup. The shared engine still emits stable tokens with
  // conservative fallbacks so exported CSS and server-side paths have a
  // complete variable surface.
  for (const script of resolveTypographyScriptSupport(config.scriptSupport)) {
    if (!script.enabled) continue;
    const uiToken = scriptFontTokenName(script, 'UI');
    const readingToken = scriptFontTokenName(script, 'Reading');
    declarations.push(`--${uiToken}: var(--Typography-Font-Script);`);
    declarations.push(`--${readingToken}: var(--${uiToken});`);
  }

  return declarations.join('\n  ');
}

const NON_CODE_ROLES = TYPOGRAPHY_ROLES.filter(
  (role): role is Exclude<TypographyRole, 'code'> => role !== 'code',
);

function getRoleFStepOverrides(
  config: TypographyConfigV2,
  role: TypographyRole,
): Partial<Record<string, FStep>> | undefined {
  switch (role) {
    case 'display':  return config.displayFSteps;
    case 'headline': return config.headlineFSteps;
    case 'title':    return config.titleFSteps;
    case 'body':     return config.bodyFSteps;
    case 'label':    return config.labelFSteps;
    case 'code':     return config.codeFSteps;
  }
}

function buildScriptSelector(script: ResolvedTypographyScriptConfig): string {
  const selectors = [`[data-script="${script.id}"]`];
  for (const lang of script.langTags) {
    selectors.push(`:lang(${lang})`);
  }
  return selectors.join(',\n  ');
}

function buildScriptReadingSelector(script: ResolvedTypographyScriptConfig): string {
  const selectors = [
    `[data-script="${script.id}"][data-script-mode="reading"]`,
    `[data-script="${script.id}"] [data-script-mode="reading"]`,
  ];
  for (const lang of script.langTags) {
    selectors.push(`:lang(${lang})[data-script-mode="reading"]`);
    selectors.push(`[data-script-mode="reading"] :lang(${lang})`);
  }
  return selectors.join(',\n  ');
}

function buildScriptContextDeclarations(
  config: TypographyConfigV2,
  script: ResolvedTypographyScriptConfig,
  mode: 'UI' | 'Reading',
): string[] {
  const declarations: string[] = [];
  const fontToken = scriptFontTokenName(script, mode);
  const deltas =
    mode === 'Reading'
      ? script.defaultLineHeightDeltas.reading
      : script.lineHeightDeltas;

  for (const role of NON_CODE_ROLES) {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    declarations.push(`--${roleName}-FontFamily: var(--${fontToken}, var(--Typography-Font-Script, var(--Typography-Font-Text)));`);

    const delta = deltas[role] ?? 0;
    if (delta === 0) continue;

    const fStepOverrides = getRoleFStepOverrides(config, role);
    const roleOffset = config.lineHeightOffsets?.[role] ?? DEFAULT_LINE_HEIGHT_OFFSETS[role];
    for (const size of TYPOGRAPHY_SIZES[role]) {
      const fStep = fStepOverrides?.[size] ?? DEFAULT_FSTEP_ASSIGNMENTS[role][size];
      const tokenName = typographyTokenName(role, size);
      declarations.push(`--${tokenName}-LineHeight: ${fStepToDimensionVar(computeLineHeightFStep(fStep, roleOffset + delta))};`);
    }
  }

  return declarations;
}

/**
 * Generate script-context CSS blocks for `[data-script]` and `:lang(...)`.
 *
 * These blocks remap only typography variables. Component CSS keeps reading
 * the ordinary `--Body-*`, `--Label-*`, etc. tokens, so script support flows
 * through the same foundation pipeline as other typography customisation.
 */
export function generateTypographyScriptContextCSS(config: TypographyConfigV2): string {
  const blocks: string[] = [];

  for (const script of resolveTypographyScriptSupport(config.scriptSupport)) {
    if (!script.enabled) continue;

    const uiDecls = buildScriptContextDeclarations(config, script, 'UI');
    blocks.push(`  ${buildScriptSelector(script)} {\n    ${uiDecls.join('\n    ')}\n  }`);

    const readingDecls = buildScriptContextDeclarations(config, script, 'Reading');
    blocks.push(`  ${buildScriptReadingSelector(script)} {\n    ${readingDecls.join('\n    ')}\n  }`);
  }

  return blocks.join('\n');
}

/**
 * Build a CSS value for `font-feature-settings` from the per-slot feature config.
 * Returns `null` when nothing is set (caller skips emission).
 *
 * The `liga` tag controls standard ligatures (the "fi", "fl" glyphs in fonts like
 * JioType Var). `clig` controls contextual ligatures. Both default to enabled in
 * modern browsers; emitting `0` disables them.
 */
function buildFontFeatureValue(features: {
  ligatures?: boolean;
  contextualAlternates?: boolean;
}): string | null {
  const parts: string[] = [];
  if (features.ligatures !== undefined) {
    parts.push(`"liga" ${features.ligatures ? 1 : 0}`);
  }
  if (features.contextualAlternates !== undefined) {
    parts.push(`"clig" ${features.contextualAlternates ? 1 : 0}`);
  }
  return parts.length ? parts.join(', ') : null;
}

/**
 * Generate a complete `html { ... }` block for global font rendering quality.
 * Returns `''` when no overrides are set so callers can skip injection.
 *
 * Emitted alongside the brand `:root` block via `wrapCSSForInjection`'s
 * `additionalBlocks` parameter.
 */
export function generateFontRenderingCSS(config: TypographyConfigV2): string {
  const rendering = config.rendering;
  const primaryLigaturesOff = config.fontFeatures?.primary?.ligatures === false;

  const lines: string[] = [];
  if (rendering?.textRendering) lines.push(`text-rendering: ${rendering.textRendering};`);
  if (rendering?.webkitFontSmoothing) {
    lines.push(`-webkit-font-smoothing: ${rendering.webkitFontSmoothing};`);
    // Pair with the Firefox-on-macOS equivalent for visual parity
    if (rendering.webkitFontSmoothing === 'antialiased') {
      lines.push(`-moz-osx-font-smoothing: grayscale;`);
    }
  }
  if (rendering?.fontSynthesis) lines.push(`font-synthesis: ${rendering.fontSynthesis};`);

  // When primary ligatures are turned off, reinforce at the html level too so
  // descendants that override `font-feature-settings` still suppress common
  // ligatures via the `font-variant-ligatures` property.
  if (primaryLigaturesOff) lines.push(`font-variant-ligatures: no-common-ligatures;`);

  if (!lines.length) return '';
  return `  html {\n    ${lines.join('\n    ')}\n  }`;
}

/**
 * Generate all CSS declarations for V2 typography (complete, not just overrides).
 * Used for static CSS generation or full brand CSS export.
 *
 * @param config Optional brand config (uses defaults if not provided)
 * @returns Complete CSS declaration string for all 25 typography sizes
 */
export function generateFullTypographyCSSV2(
  config?: TypographyConfigV2
): string {
  const declarations: string[] = [];

  for (const role of TYPOGRAPHY_ROLES) {
    const sizes = TYPOGRAPHY_SIZES[role];
    const defaultAssignments = DEFAULT_FSTEP_ASSIGNMENTS[role];
    const defaultLhOffset = DEFAULT_LINE_HEIGHT_OFFSETS[role];

    // Resolve f-step assignments (brand override or default — all roles now supported)
    const fStepOverrides = role === 'display'  ? config?.displayFSteps
      : role === 'headline' ? config?.headlineFSteps
      : role === 'title'    ? config?.titleFSteps
      : role === 'body'     ? config?.bodyFSteps
      : role === 'label'    ? config?.labelFSteps
      : role === 'code'     ? config?.codeFSteps
      : undefined;

    const lhOffset = config?.lineHeightOffsets?.[role] ?? defaultLhOffset;

    for (const size of sizes) {
      const fStep = (fStepOverrides?.[size] ?? defaultAssignments[size]) as FStep;
      const name = typographyTokenName(role, size);

      declarations.push(`--${name}-FontSize: ${fStepToDimensionVar(fStep)};`);
      declarations.push(`--${name}-LineHeight: ${fStepToDimensionVar(computeLineHeightFStep(fStep, lhOffset))};`);

      if ((FIXED_WEIGHT_ROLES as readonly string[]).includes(role)) {
        const weights = FONT_WEIGHTS[role as keyof typeof FONT_WEIGHTS] as Record<string, number>;
        const weightKey = `${name}-FontWeight`;
        const w = config?.weightOverrides?.[weightKey] ?? weights[size];
        if (w !== undefined) {
          declarations.push(`--${weightKey}: ${w};`);
        }
      }
    }

    if ((EMPHASIS_WEIGHT_ROLES as readonly string[]).includes(role)) {
      const weights = FONT_WEIGHTS[role as keyof typeof FONT_WEIGHTS] as Record<string, number>;
      for (const emphasis of EMPHASIS_LEVELS) {
        const key = `${typographyTokenName(role, 'FontWeight-' + emphasis.charAt(0).toUpperCase() + emphasis.slice(1))}`;
        const w = config?.weightOverrides?.[key] ?? weights[emphasis];
        declarations.push(`--${key}: ${w};`);
      }
    }
  }

  // Optical sizing mode tokens for all roles
  for (const role of TYPOGRAPHY_ROLES) {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    const entry = config?.opticalSizing?.[role];
    const mode = entry?.mode ?? 'auto';
    if (mode !== 'auto') {
      declarations.push(`--${roleName}-FontOpticalSizing: none;`);
      if (mode === 'manual' && entry?.opszValue !== undefined) {
        declarations.push(`--${roleName}-OpszVariation: 'opsz' ${entry.opszValue};`);
      }
    }
  }

  return declarations.join('\n  ');
}

/**
 * Format a V2 typography token reference for use in component CSS.
 * e.g., styleToTokenCssV2('display', 'L') →
 *   font-size: var(--Display-L-FontSize);
 *   font-weight: var(--Display-L-FontWeight);
 *   line-height: var(--Display-L-LineHeight);
 */
export function styleToTokenCssV2(role: TypographyRole, size: string): string {
  const name = typographyTokenName(role, size);
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);
  const lines = [
    `font-size: var(--${name}-FontSize);`,
    `line-height: var(--${name}-LineHeight);`,
    `letter-spacing: var(--${roleName}-LetterSpacing, 0);`,
  ];

  if ((FIXED_WEIGHT_ROLES as readonly string[]).includes(role)) {
    lines.push(`font-weight: var(--${name}-FontWeight);`);
  }

  lines.push(`font-optical-sizing: var(--${roleName}-FontOpticalSizing, auto);`);
  // When manual opsz mode is active, brand CSS injects --{Role}-OpszVariation (e.g. "'opsz' 72').
  // The fallback `normal` is a no-op when no override is set — weight is controlled
  // via font-weight, not font-variation-settings, so normal doesn't conflict.
  lines.push(`font-variation-settings: var(--${roleName}-OpszVariation, normal);`);

  return lines.join('\n');
}
