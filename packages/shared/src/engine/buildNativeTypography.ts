/**
 * buildNativeTypography.ts
 *
 * Pure builder that resolves a brand's Typography V2 config + dimension
 * scale into numeric, React Native-ready style tokens.
 *
 * Mirrors the web `generateFullTypographyCSSV2` pipeline:
 * - 25 sizes across 6 roles (Display, Headline, Title, Body, Label, Code)
 * - Per-role line-height offsets (display:0, headline:0, title:1, body:3,
 *   label:0, code:2 by default; brand-overridable)
 * - F-step → pixel resolution via `getDimensionValue` (DIN 1450 anchored)
 * - Fixed-weight roles (Display/Headline/Title) use per-size weights;
 *   emphasis-weight roles (Body/Label/Code) expose high/medium/low
 * - Font slot resolution: heading roles → `headingFontId`, code → `codeFontId`,
 *   everything else → `textFontId`. Falls back to the default family name when
 *   no brand override is set so RN can show *something* before custom fonts
 *   load.
 *
 * RN platform → web breakpoint mapping: native always resolves against
 * `S` (mobile breakpoint), which matches the dimension table the web
 * engine uses for the smallest viewport. A future expansion can drive
 * tablet (`M`) from `context.platform === 'tablet'`.
 */

import {
  TYPOGRAPHY_SIZES,
  DEFAULT_FSTEP_ASSIGNMENTS,
  DEFAULT_LINE_HEIGHT_OFFSETS,
  FONT_WEIGHTS,
  EMPHASIS_LEVELS,
  DEFAULT_FONT_FAMILIES,
  computeLineHeightFStep,
  typographyTokenName,
  type TypographyRole,
  type FixedWeightRole,
  type EmphasisWeightRole,
  type EmphasisLevel,
} from '../data/typography-roles';
import {
  getDimensionValue,
  type FStep,
  type BreakpointId,
  type DensityId,
} from '../data/dimension-scales';
import {
  resolveTextFontId,
  resolveHeadingFontId,
  getFontById,
  getConvexIdFromFontId,
} from '../data/fonts';
import {
  resolveTypographyScriptSupport,
  type TypographyScriptSupportConfig,
} from '../data/typography-scripts';
import {
  mergeStaticWeightFamilyConfig,
  mergeWithJioBundledStaticDefaults,
  resolveStaticWeightFamilyForRole,
  type StaticWeightFamiliesBySlot,
  type StaticWeightFamilyPrefixConfig,
} from './staticFontFamilies';

// ============================================================================
// Inputs
// ============================================================================

/** Loose Typography V2 config shape (matches Convex foundations[type='typography'].config). */
export interface NativeTypographyConfig {
  /** Full foundation documents may pass V2 nested here; the builder unwraps it. */
  typographyV2?: NativeTypographyConfig;
  fontSelection?: {
    textFontId?: string | null;
    headingFontId?: string | null;
    codeFontId?: string | null;
    bodyFontId?: string | null;
    displayFontId?: string | null;
    primaryFontId?: string | null;
    secondaryFontId?: string | null;
    fallbackFontIds?: string[];
  };
  displayFSteps?: Partial<Record<string, FStep>>;
  headlineFSteps?: Partial<Record<string, FStep>>;
  titleFSteps?: Partial<Record<string, FStep>>;
  bodyFSteps?: Partial<Record<string, FStep>>;
  labelFSteps?: Partial<Record<string, FStep>>;
  codeFSteps?: Partial<Record<string, FStep>>;
  lineHeightOffsets?: Partial<Record<TypographyRole, number>>;
  weightOverrides?: Record<string, number>;
  letterSpacing?: Partial<Record<TypographyRole, number>>;
  scriptSupport?: TypographyScriptSupportConfig;
  /**
   * Expo `useFonts` key prefix per slot (e.g. `JioTypeUI` → `JioTypeUI-Bold`).
   * Merged with `staticWeightFamilies` at build time.
   */
  staticWeightFamilyPrefix?: StaticWeightFamilyPrefixConfig;
  /** Explicit weight → family overrides per slot (wins over prefix-derived map). */
  staticWeightFamilies?: StaticWeightFamiliesBySlot;
}

export interface NativeCustomFontDescriptor {
  /** Convex `_id` of the customFonts row. */
  _id: string;
  /** Family name to register with `expo-font` (e.g. `'JioType Var'`). */
  familyName: string;
  /** Public URL of the font file. */
  fileUrl: string;
  /** Available numeric weights as strings (e.g. `['400','500','700']`). */
  weights?: string[];
  /** Variable font flag — informational; expo-font registers either way. */
  isVariable?: boolean;
}

// ============================================================================
// Output
// ============================================================================

/**
 * Numeric font-weight values React Native's `TextStyle.fontWeight` accepts.
 * Narrower than `number` so consumers can spread `NativeTypeStyle` into a
 * `<Text style>` without casting.
 */
export type FontWeightValue = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/** A single resolved typography style ready for `Text` style props. */
export interface NativeTypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeightValue;
  fontFamily: string;
  /**
   * When true, weight is carried by a static per-weight `fontFamily`; omit
   * `fontWeight` on `<Text>` to avoid Android synthetic bolding.
   */
  weightViaFontFamily?: boolean;
  /** Pre-converted to px (em × fontSize). Drop-in compatible with `TextStyle.letterSpacing`. */
  letterSpacing?: number;
}

export interface NativeRoleTypography<S extends string = string> {
  /** Per-size resolved styles. For emphasis roles, default emphasis is `medium`. */
  sizes: Record<S, NativeTypeStyle>;
}

export interface NativeEmphasisTypography<S extends string = string> {
  sizes: Record<S, NativeTypeStyle>;
  /** For Body/Label/Code: per-emphasis weight values to override `fontWeight`. */
  weights: Record<EmphasisLevel, FontWeightValue>;
}

export interface NativeTypography {
  display: NativeRoleTypography<'L' | 'M' | 'S'>;
  headline: NativeRoleTypography<'L' | 'M' | 'S'>;
  title: NativeRoleTypography<'L' | 'M' | 'S'>;
  body: NativeEmphasisTypography<'L' | 'M' | 'S' | 'XS' | '2XS'>;
  label: NativeEmphasisTypography<
    'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS'
  >;
  code: NativeEmphasisTypography<'M' | 'S' | 'XS' | '2XS' | '3XS'>;
  /** Resolved family names — what to pass to `expo-font` and to `fontFamily`. */
  fontFamilies: {
    primary: string;
    secondary: string;
    script: string;
    code: string;
    scripts: Record<string, { ui: string; reading: string }>;
  };
  /** Script-specific font family + line-height overlays for native Text styles. */
  scriptVariants: Record<
    string,
    Record<
      'ui' | 'reading',
      Partial<Record<TypographyRole, Record<string, Pick<NativeTypeStyle, 'fontFamily' | 'lineHeight'>>>>
    >
  >;
  /** Custom fonts to register with `expo-font` before mounting the tree. */
  customFonts: NativeCustomFontDescriptor[];
  /**
   * Per-slot weight → `fontFamily` for static multi-file fonts. Populated from
   * `staticWeightFamilyPrefix` / `staticWeightFamilies` on the typography config.
   */
  staticWeightFamilies?: StaticWeightFamiliesBySlot;
}

// ============================================================================
// Builder
// ============================================================================

interface BuildOpts {
  config?: NativeTypographyConfig | null;
  customFonts?: NativeCustomFontDescriptor[];
  platform?: BreakpointId;
  density?: DensityId;
}

const ROLE_FSTEP_KEY: Record<TypographyRole, keyof NativeTypographyConfig> = {
  display: 'displayFSteps',
  headline: 'headlineFSteps',
  title: 'titleFSteps',
  body: 'bodyFSteps',
  label: 'labelFSteps',
  code: 'codeFSteps',
};

function resolveFontFamily(
  config: NativeTypographyConfig | null | undefined,
  customFonts: NativeCustomFontDescriptor[],
): NativeTypography['fontFamilies'] {
  const sel = config?.fontSelection;
  const byId = new Map(customFonts.map((f) => [f._id, f.familyName]));
  const resolveId = (id: string | null | undefined): string | undefined => {
    if (!id) return undefined;
    const convexId = getConvexIdFromFontId(id);
    if (convexId) return byId.get(convexId) ?? undefined;
    return getFontById(id)?.name;
  };

  const text = resolveId(resolveTextFontId(sel)) ?? DEFAULT_FONT_FAMILIES.primary;
  const heading =
    resolveId(resolveHeadingFontId(sel)) ?? DEFAULT_FONT_FAMILIES.secondary;
  const code = resolveId(sel?.codeFontId) ?? DEFAULT_FONT_FAMILIES.code;
  const scriptFallback = resolveId(sel?.fallbackFontIds?.[0]) ?? DEFAULT_FONT_FAMILIES.script;
  const scripts: NativeTypography['fontFamilies']['scripts'] = {};
  for (const script of resolveTypographyScriptSupport(config?.scriptSupport)) {
    if (!script.enabled) continue;
    scripts[script.id] = {
      ui: resolveId(script.uiFontId) ?? DEFAULT_FONT_FAMILIES.script,
      reading: resolveId(script.readingFontId) ?? DEFAULT_FONT_FAMILIES.script,
    };
  }

  return {
    primary: text,
    secondary: heading,
    script: scriptFallback,
    code,
    scripts,
  };
}

const HEADING_ROLES = new Set<TypographyRole>(['display', 'headline', 'title']);

function familyForRole(
  role: TypographyRole,
  fams: NativeTypography['fontFamilies'],
): string {
  if (role === 'code') return fams.code;
  // Heading roles route to the secondary/heading slot. Body and Label always
  // use the primary/text slot — `FONT_SLOT_ROLES.secondary` lists them as
  // *eligible* if a brand opts in, but native treats only display/headline/
  // title as headings (matching the web typography editor's slot mapping).
  if (HEADING_ROLES.has(role)) return fams.secondary;
  return fams.primary;
}

function fStepForRoleSize(
  role: TypographyRole,
  size: string,
  config: NativeTypographyConfig | null | undefined,
): FStep {
  const overrideRecord = config?.[ROLE_FSTEP_KEY[role]] as
    | Partial<Record<string, FStep>>
    | undefined;
  return overrideRecord?.[size] ?? DEFAULT_FSTEP_ASSIGNMENTS[role][size];
}

function lineHeightOffsetForRole(
  role: TypographyRole,
  config: NativeTypographyConfig | null | undefined,
): number {
  const override = config?.lineHeightOffsets?.[role];
  return typeof override === 'number' ? override : DEFAULT_LINE_HEIGHT_OFFSETS[role];
}

function weightForFixedRole(
  role: FixedWeightRole,
  size: string,
  config: NativeTypographyConfig | null | undefined,
): FontWeightValue {
  const overrideKey = `${typographyTokenName(role, size)}-FontWeight`;
  const override =
    config?.weightOverrides?.[overrideKey] ??
    config?.weightOverrides?.[`--${overrideKey}`];
  if (typeof override === 'number') return override as FontWeightValue;
  const map = FONT_WEIGHTS[role] as Record<string, number>;
  return (map[size] ?? 400) as FontWeightValue;
}

function emphasisWeights(
  role: EmphasisWeightRole,
  config: NativeTypographyConfig | null | undefined,
): Record<EmphasisLevel, FontWeightValue> {
  const out = {} as Record<EmphasisLevel, FontWeightValue>;
  const defaults = FONT_WEIGHTS[role] as Record<EmphasisLevel, number>;
  for (const lvl of EMPHASIS_LEVELS) {
    const overrideKey = typographyTokenName(
      role,
      `FontWeight-${lvl.charAt(0).toUpperCase() + lvl.slice(1)}`,
    );
    const override =
      config?.weightOverrides?.[overrideKey] ??
      config?.weightOverrides?.[`--${overrideKey}`];
    out[lvl] = (typeof override === 'number' ? override : defaults[lvl]) as FontWeightValue;
  }
  return out;
}

function buildSizeStyle(
  role: TypographyRole,
  size: string,
  weight: FontWeightValue,
  config: NativeTypographyConfig | null | undefined,
  platform: BreakpointId,
  density: DensityId,
  family: string,
  staticFamilies?: StaticWeightFamiliesBySlot,
): NativeTypeStyle {
  const fStep = fStepForRoleSize(role, size, config);
  const lhOffset = lineHeightOffsetForRole(role, config);
  const lhFStep = computeLineHeightFStep(fStep, lhOffset);

  const fontSize = getDimensionValue(platform, density, fStep);
  const lineHeight = getDimensionValue(platform, density, lhFStep);

  const letterSpacingEm = config?.letterSpacing?.[role];
  const letterSpacing =
    typeof letterSpacingEm === 'number' ? letterSpacingEm * fontSize : undefined;

  const staticFamily = resolveStaticWeightFamilyForRole(staticFamilies, role, weight);

  return {
    fontSize,
    lineHeight,
    fontWeight: weight,
    fontFamily: staticFamily ?? family,
    ...(staticFamily ? { weightViaFontFamily: true } : {}),
    ...(typeof letterSpacing === 'number' ? { letterSpacing } : {}),
  };
}

/**
 * Convex typography foundations often nest V2 fields under `typographyV2` while
 * native hosts set `staticWeightFamilyPrefix` on the outer envelope (see
 * `foundationToNativeTheme`). Merge shell-level static font config into the
 * inner object so `mergeStaticWeightFamilyConfig` always sees it.
 */
function unwrapNativeTypographyConfig(
  config: NativeTypographyConfig | null | undefined,
): NativeTypographyConfig | null | undefined {
  if (!config?.typographyV2) return config;
  const { typographyV2, staticWeightFamilyPrefix, staticWeightFamilies, ...rest } = config;
  return {
    ...typographyV2,
    ...rest,
    ...(staticWeightFamilyPrefix
      ? {
          staticWeightFamilyPrefix: {
            ...typographyV2.staticWeightFamilyPrefix,
            ...staticWeightFamilyPrefix,
          },
        }
      : {}),
    ...(staticWeightFamilies
      ? {
          staticWeightFamilies: {
            primary: {
              ...typographyV2.staticWeightFamilies?.primary,
              ...staticWeightFamilies.primary,
            },
            secondary: {
              ...typographyV2.staticWeightFamilies?.secondary,
              ...staticWeightFamilies.secondary,
            },
            // When the host passes `code`, do not inherit typographyV2 code static cuts
            // (e.g. bundled JetBrains variable mono for the code role).
            ...(Object.prototype.hasOwnProperty.call(staticWeightFamilies, 'code')
              ? { code: staticWeightFamilies.code }
              : typographyV2.staticWeightFamilies?.code
                ? { code: typographyV2.staticWeightFamilies.code }
                : {}),
          },
        }
      : {}),
  };
}

function scriptLineHeightForRoleSize(
  role: TypographyRole,
  size: string,
  config: NativeTypographyConfig | null | undefined,
  platform: BreakpointId,
  density: DensityId,
  delta: number,
): number {
  const fStep = fStepForRoleSize(role, size, config);
  const lhOffset = lineHeightOffsetForRole(role, config);
  const lhFStep = computeLineHeightFStep(fStep, lhOffset + delta);
  return getDimensionValue(platform, density, lhFStep);
}

function buildScriptVariants(
  config: NativeTypographyConfig | null | undefined,
  fams: NativeTypography['fontFamilies'],
  platform: BreakpointId,
  density: DensityId,
): NativeTypography['scriptVariants'] {
  const out: NativeTypography['scriptVariants'] = {};
  for (const script of resolveTypographyScriptSupport(config?.scriptSupport)) {
    if (!script.enabled) continue;
    const families = fams.scripts[script.id] ?? {
      ui: DEFAULT_FONT_FAMILIES.script,
      reading: DEFAULT_FONT_FAMILIES.script,
    };
    out[script.id] = { ui: {}, reading: {} };

    for (const mode of ['ui', 'reading'] as const) {
      const deltas =
        mode === 'reading'
          ? script.defaultLineHeightDeltas.reading
          : script.lineHeightDeltas;
      for (const role of Object.keys(TYPOGRAPHY_SIZES) as TypographyRole[]) {
        if (role === 'code') continue;
        const sizeOut: Record<string, Pick<NativeTypeStyle, 'fontFamily' | 'lineHeight'>> = {};
        for (const size of TYPOGRAPHY_SIZES[role]) {
          const delta = deltas[role] ?? 0;
          sizeOut[size] = {
            fontFamily: mode === 'reading' ? families.reading : families.ui,
            lineHeight:
              delta === 0
                ? buildSizeStyle(
                    role,
                    size,
                    400,
                    config,
                    platform,
                    density,
                    mode === 'reading' ? families.reading : families.ui,
                  ).lineHeight
                : scriptLineHeightForRoleSize(role, size, config, platform, density, delta),
          };
        }
        out[script.id][mode][role] = sizeOut;
      }
    }
  }
  return out;
}

/**
 * Build the resolved typography token tree for a brand.
 */
export function buildNativeTypography({
  config,
  customFonts = [],
  platform = 'S',
  density = 'default',
}: BuildOpts): NativeTypography {
  const resolvedConfig = unwrapNativeTypographyConfig(config);
  const fams = resolveFontFamily(resolvedConfig, customFonts);

  const staticWeightFamilies = mergeWithJioBundledStaticDefaults(
    mergeStaticWeightFamilyConfig(
      resolvedConfig?.staticWeightFamilyPrefix,
      resolvedConfig?.staticWeightFamilies,
    ),
  );

  const buildFixed = <S extends string>(role: FixedWeightRole, sizes: readonly S[]) => {
    const family = familyForRole(role, fams);
    const out = {} as Record<S, NativeTypeStyle>;
    for (const size of sizes) {
      const weight = weightForFixedRole(role, size, resolvedConfig);
      out[size] = buildSizeStyle(
        role,
        size,
        weight,
        resolvedConfig,
        platform,
        density,
        family,
        staticWeightFamilies,
      );
    }
    return { sizes: out };
  };

  const buildEmphasis = <S extends string>(
    role: EmphasisWeightRole,
    sizes: readonly S[],
  ): NativeEmphasisTypography<S> => {
    const family = familyForRole(role, fams);
    const weights = emphasisWeights(role, resolvedConfig);
    const out = {} as Record<S, NativeTypeStyle>;
    for (const size of sizes) {
      // Default emphasis = medium (matches button/label conventions on web).
      out[size] = buildSizeStyle(
        role,
        size,
        weights.medium,
        resolvedConfig,
        platform,
        density,
        family,
        staticWeightFamilies,
      );
    }
    return { sizes: out, weights };
  };

  return {
    display: buildFixed('display', TYPOGRAPHY_SIZES.display),
    headline: buildFixed('headline', TYPOGRAPHY_SIZES.headline),
    title: buildFixed('title', TYPOGRAPHY_SIZES.title),
    body: buildEmphasis('body', TYPOGRAPHY_SIZES.body),
    label: buildEmphasis('label', TYPOGRAPHY_SIZES.label),
    code: buildEmphasis('code', TYPOGRAPHY_SIZES.code),
    fontFamilies: fams,
    scriptVariants: buildScriptVariants(resolvedConfig, fams, platform, density),
    customFonts,
    staticWeightFamilies,
  };
}
