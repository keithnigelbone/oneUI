/**
 * foundationCSS.ts
 *
 * Pure functions that transform foundation configs into CSS custom property
 * declarations. These are injected into the DOM via <style> tag to override
 * static token defaults when foundation settings change.
 *
 * Shared between platform app and Storybook.
 */

import {
  buildFontFamilyById,
  generateTypographyCSSV2 as sharedGenerateTypographyCSSV2,
  generateTypographyScriptContextCSS as sharedGenerateTypographyScriptContextCSS,
  getFontById,
  getGoogleFontsUrl,
  resolveTextFontId,
  resolveHeadingFontId,
  resolveTypographyScriptSupport,
  scriptFontTokenName,
  type FontSelectionSlotsLike,
  type TypographyConfigV2,
} from '@oneui/shared';

// CSS generation re-exported from @oneui/shared/engine
export { roleLabel } from '@oneui/shared/engine';
import { dedupeDeclarationsKeepLast } from '@oneui/shared/engine';

// ============================================================================
// Types
// ============================================================================

/** Individual typography style */
interface TypographyStyleConfig {
  name: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number; // percentage (100, 120, 150)
  letterSpacing: number; // percentage
}

/** Typography foundation config shape (from Convex) */
interface TypographyConfig {
  baseSize?: number;
  scaleFactor?: number;
  fontFamily?: string;
  fontSelection?: {
    scope: 'single' | 'dual';
    textFontId?: string | null;
    headingFontId?: string | null;
    bodyFontId?: string | null;
    displayFontId?: string | null;
    primaryFontId?: string | null;
    secondaryFontId?: string | null;
    fallbackFontIds?: string[];
  };
  weightMapping?: Record<string, number>;
  styles?: TypographyStyleConfig[];
}

/** Resolved custom font data (from getBrandOverviewData) */
interface CustomFontEntry {
  _id: string;
  name: string;
  familyName: string;
  fallback: string;
}

/**
 * Build a CSS font-family string for a font ID.
 * Checks uploaded custom fonts first, then falls back to the static collection.
 */
function buildFontFamily(fontId: string, customFonts?: CustomFontEntry[]): string {
  // Check custom (uploaded) fonts
  if (fontId.startsWith('uploaded-') && customFonts) {
    const convexId = fontId.replace('uploaded-', '');
    const cf = customFonts.find(f => f._id === convexId);
    if (cf) {
      const name = cf.name.includes(' ') ? `'${cf.name}'` : cf.name;
      return `${name}, ${cf.fallback}`;
    }
  }
  return buildFontFamilyById(fontId);
}

// ============================================================================
// Typography CSS Generation
// ============================================================================

/**
 * Size token names in ascending order, mapped to modular scale steps.
 * The base size maps to XL (1rem = 16px at default).
 * Steps below base go negative, steps above go positive.
 */
const SIZE_TOKEN_STEPS: Array<{ token: string; step: number }> = [
  { token: '--Typography-Size-3XS', step: -4 },
  { token: '--Typography-Size-2XS', step: -3 },
  { token: '--Typography-Size-XS', step: -2 },
  { token: '--Typography-Size-S', step: -1.5 },
  { token: '--Typography-Size-M', step: -1 },
  { token: '--Typography-Size-L', step: -0.5 },
  { token: '--Typography-Size-XL', step: 0 },    // base
  { token: '--Typography-Size-2XL', step: 1 },
  { token: '--Typography-Size-3XL', step: 2 },
  { token: '--Typography-Size-4XL', step: 3 },
  { token: '--Typography-Size-5XL', step: 4 },
];

/**
 * Build font-family CSS declarations from fontSelection config (shared by V1 and V2).
 *
 * V2 fontSelection wins when both are present — the platform's typography
 * editor writes to `typographyV2.fontSelection`, while older brands may only
 * have the V1 `fontSelection`. Without the V2 lookup, V2-only brands (e.g.
 * Reliance with Playfair Display) emit no `--Typography-Font-Primary` at all
 * and fall back to the static default (Inter).
 */
function buildFontFamilyDeclarations(
  config: Pick<TypographyConfig, 'fontSelection' | 'fontFamily'> & { typographyV2?: TypographyConfigV2 },
  customFonts?: CustomFontEntry[],
): string[] {
  const v2sel = config.typographyV2?.fontSelection;
  const v1sel = config.fontSelection as FontSelectionSlotsLike & {
    fallbackFontIds?: string[];
  } | undefined;

  // V2 wins; V1 is the fallback. Each is resolved via the canonical →
  // legacy alias chain in resolveTextFontId / resolveHeadingFontId.
  const primaryId = resolveTextFontId(v2sel) ?? resolveTextFontId(v1sel);
  const secondaryId = resolveHeadingFontId(v2sel) ?? resolveHeadingFontId(v1sel);
  const fallbackId = v2sel?.fallbackFontIds?.[0] ?? v1sel?.fallbackFontIds?.[0];

  const decls: string[] = [];
  const hasPrimary = Boolean(primaryId || config.fontFamily);
  if (primaryId) {
    const family = buildFontFamily(primaryId, customFonts);
    decls.push(`--Typography-Font-Text: ${family};`);
    decls.push(`--Typography-Font-Body: ${family};`);    // deprecated alias
    decls.push(`--Typography-Font-Primary: ${family};`); // deprecated alias
  } else if (config.fontFamily) {
    decls.push(`--Typography-Font-Text: ${config.fontFamily};`);
    decls.push(`--Typography-Font-Body: ${config.fontFamily};`);    // deprecated alias
    decls.push(`--Typography-Font-Primary: ${config.fontFamily};`); // deprecated alias
  }
  if (secondaryId) {
    const family = buildFontFamily(secondaryId, customFonts);
    decls.push(`--Typography-Font-Heading: ${family};`);
    decls.push(`--Typography-Font-Display: ${family};`);   // deprecated alias
    decls.push(`--Typography-Font-Secondary: ${family};`); // deprecated alias
  }
  if (fallbackId) {
    decls.push(`--Typography-Font-Script: ${buildFontFamily(fallbackId, customFonts)};`);
  }
  // Re-declare per-role FontFamily tokens at brand scope so they pick up the
  // brand's --Typography-Font-Text override. Base layer declares these at :root
  // referencing --Typography-Font-Text; in scoped injection mode the brand
  // override lives on [data-brand=…] not :root, so the root's substituted
  // computed value (Inter) inherits down to descendants. Re-emitting them here
  // forces re-substitution at the brand scope = brand font. V2 roleFontSlots
  // mapping a role to 'secondary' will override these (later declarations win
  // within the same selector). Code role is excluded — it resolves through
  // --Typography-Font-Code which has its own brand override.
  if (hasPrimary) {
    decls.push(`--Display-FontFamily: var(--Typography-Font-Text);`);
    decls.push(`--Headline-FontFamily: var(--Typography-Font-Text);`);
    decls.push(`--Title-FontFamily: var(--Typography-Font-Text);`);
    decls.push(`--Body-FontFamily: var(--Typography-Font-Text);`);
    decls.push(`--Label-FontFamily: var(--Typography-Font-Text);`);
  }
  return decls;
}

/** Legacy weight mapping — maps semantic keys to CSS weight tokens. */
const LEGACY_WEIGHT_MAP: Record<string, string> = {
  low: '--Typography-Weight-Regular',
  medium: '--Typography-Weight-Medium',
  high: '--Typography-Weight-Bold',
  black: '--Typography-Weight-Extrabold',
};

/** Build legacy weight CSS declarations from weightMapping config. */
function buildWeightDeclarations(
  weightMapping: Record<string, number> | undefined,
): string[] {
  if (!weightMapping) return [];
  const decls: string[] = [];
  for (const [key, tokenName] of Object.entries(LEGACY_WEIGHT_MAP)) {
    const value = weightMapping[key];
    if (value !== undefined) {
      decls.push(`${tokenName}: ${value};`);
    }
  }
  return decls;
}

function buildScriptFontDeclarations(
  v2: TypographyConfigV2 | undefined,
  customFonts?: CustomFontEntry[],
): string[] {
  if (!v2) return [];
  const decls: string[] = [];
  for (const script of resolveTypographyScriptSupport(v2.scriptSupport)) {
    if (!script.enabled) continue;
    const uiToken = scriptFontTokenName(script, 'UI');
    const readingToken = scriptFontTokenName(script, 'Reading');
    decls.push(`--${uiToken}: ${buildFontFamily(script.uiFontId, customFonts)};`);
    decls.push(`--${readingToken}: ${buildFontFamily(script.readingFontId, customFonts)};`);
  }
  return decls;
}

/**
 * Generate CSS declarations for typography font family and weights only.
 * Safe to apply globally — does not include size scale which can produce
 * extreme values and break the app UI.
 */
export function generateTypographyFontCSS(
  config: TypographyConfig | undefined | null,
  customFonts?: CustomFontEntry[],
): string {
  if (!config) return '';

  const declarations = [
    ...buildFontFamilyDeclarations(config, customFonts),
    ...buildWeightDeclarations(config.weightMapping),
  ];

  return declarations.join('\n  ');
}

/**
 * Generate full CSS declarations for typography foundation.
 * Includes font family, size scale (modular), weight mappings, and named styles.
 */
export function generateTypographyCSS(
  config: TypographyConfig | undefined | null,
  customFonts?: CustomFontEntry[],
): string {
  if (!config) return '';

  const declarations: string[] = [];

  // Font family — fontSelection takes precedence over legacy fontFamily.
  // Emits canonical Text/Heading + deprecated Body/Display/Primary/Secondary aliases.
  const hasPrimaryFamily = Boolean(config.fontSelection?.primaryFontId || config.fontFamily);
  if (config.fontSelection?.primaryFontId) {
    const fontFamily = buildFontFamily(config.fontSelection.primaryFontId, customFonts);
    declarations.push(`--Typography-Font-Text: ${fontFamily};`);
    declarations.push(`--Typography-Font-Body: ${fontFamily};`);    // deprecated alias
    declarations.push(`--Typography-Font-Primary: ${fontFamily};`); // deprecated alias
  } else if (config.fontFamily) {
    declarations.push(`--Typography-Font-Text: ${config.fontFamily};`);
    declarations.push(`--Typography-Font-Body: ${config.fontFamily};`);    // deprecated alias
    declarations.push(`--Typography-Font-Primary: ${config.fontFamily};`); // deprecated alias
  }

  // Secondary font family
  if (config.fontSelection?.secondaryFontId) {
    const secondaryFamily = buildFontFamily(config.fontSelection.secondaryFontId, customFonts);
    declarations.push(`--Typography-Font-Heading: ${secondaryFamily};`);
    declarations.push(`--Typography-Font-Display: ${secondaryFamily};`);   // deprecated alias
    declarations.push(`--Typography-Font-Secondary: ${secondaryFamily};`); // deprecated alias
  }

  // Script/fallback font family
  if (config.fontSelection?.fallbackFontIds?.length) {
    const scriptFamily = buildFontFamily(config.fontSelection.fallbackFontIds[0], customFonts);
    declarations.push(`--Typography-Font-Script: ${scriptFamily};`);
  }

  // Re-declare per-role FontFamily tokens at brand scope. See buildFontFamilyDeclarations
  // above for the full rationale — required for scoped injection mode where the brand
  // override on --Typography-Font-Text does not propagate to the per-role tokens via
  // inheritance (those tokens' var() references are substituted at :root, not lazily).
  if (hasPrimaryFamily) {
    declarations.push(`--Display-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Headline-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Title-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Body-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Label-FontFamily: var(--Typography-Font-Text);`);
  }

  // Size scale (modular scale from baseSize + scaleFactor)
  if (config.baseSize && config.scaleFactor) {
    const base = config.baseSize;
    const ratio = config.scaleFactor;

    for (const { token, step } of SIZE_TOKEN_STEPS) {
      const sizePx = base * Math.pow(ratio, step);
      const sizeRem = sizePx / 16;
      // Round to 4 decimal places for clean output
      const rounded = Math.round(sizeRem * 10000) / 10000;
      declarations.push(`${token}: ${rounded}rem;`);
    }
  }

  // Weight mapping
  if (config.weightMapping) {
    const weightMap: Record<string, string> = {
      low: '--Typography-Weight-Regular',
      medium: '--Typography-Weight-Medium',
      high: '--Typography-Weight-Bold',
      black: '--Typography-Weight-Extrabold',
    };

    for (const [key, tokenName] of Object.entries(weightMap)) {
      const value = config.weightMapping[key];
      if (value !== undefined) {
        declarations.push(`${tokenName}: ${value};`);
      }
    }
  }

  // Individual typography styles (Display-L, Headline-M, Body-S, etc.)
  // Generate BOTH legacy per-style tokens AND the --Typography-Size-* tokens
  // that AI-generated assets use (e.g., --Typography-Size-Display-L).
  if (config.styles?.length) {
    for (const style of config.styles) {
      const tokenPrefix = style.name.replace(/\s+/g, '-');
      // Legacy per-style tokens
      declarations.push(`--${tokenPrefix}-FontSize: ${style.fontSize}px;`);
      declarations.push(`--${tokenPrefix}-FontWeight: ${style.fontWeight};`);
      declarations.push(`--${tokenPrefix}-LineHeight: ${style.lineHeight}%;`);
      declarations.push(`--${tokenPrefix}-LetterSpacing: ${style.letterSpacing / 100}em;`);
      // Role-based token (the name AI assets use)
      declarations.push(`--Typography-Size-${tokenPrefix}: ${style.fontSize}px;`);
    }
  }

  return declarations.join('\n  ');
}

// ============================================================================
// V2 Typography CSS Generation
// ============================================================================

/**
 * Generate V2 typography font CSS declarations.
 * Handles 4 font slots (primary, secondary, script, code)
 * plus brand override f-step/line-height/weight declarations.
 */
export function generateTypographyFontCSSV2(
  config: (TypographyConfig & { typographyV2?: TypographyConfigV2 }) | undefined | null,
  customFonts?: CustomFontEntry[],
): string {
  if (!config) return '';

  const v2 = config.typographyV2;
  const declarations = [
    ...buildFontFamilyDeclarations(config, customFonts),
  ];

  // Code font (NEW 4th slot from V2 config)
  const codeFontId = v2?.fontSelection?.codeFontId ?? config.fontSelection?.fallbackFontIds?.[1];
  if (codeFontId) {
    declarations.push(`--Typography-Font-Code: ${buildFontFamily(codeFontId, customFonts)};`);
  }

  // Legacy weight mapping (still supported)
  declarations.push(...buildWeightDeclarations(config.weightMapping));

  // V2 typography overrides (f-step assignments, line height offsets, weights)
  if (v2) {
    const v2Declarations = sharedGenerateTypographyCSSV2(v2);
    if (v2Declarations) {
      declarations.push(v2Declarations);
    }
    declarations.push(...buildScriptFontDeclarations(v2, customFonts));
  }

  // Collapse intentional default→override duplicates within this :root body:
  // buildFontFamilyDeclarations emits `--{Role}-FontFamily` defaults that the V2
  // role-slot block overrides for heading-slot roles, and the shared generator's
  // script-font `var()` fallbacks precede the resolved families emitted above.
  // Keeping the last (winning) declaration yields canonical CSS.
  return dedupeDeclarationsKeepLast(declarations.join('\n  ').split('\n')).join('\n  ');
}

export function generateTypographyScriptContextCSS(
  config: TypographyConfigV2 | undefined | null,
): string {
  return config ? sharedGenerateTypographyScriptContextCSS(config) : '';
}

// ============================================================================
// Google Font Import Generation
// ============================================================================

/**
 * Generate @import statements for Google Fonts referenced in the typography
 * config. These MUST be prepended before any @layer declarations in the
 * injected stylesheet so the browser starts fetching them at CSS-injection
 * time (useInsertionEffect) rather than font-loading time (useEffect).
 * This gives font-display:optional its best chance to swap within the ~100ms
 * window, fixing Google Fonts that never appeared (e.g. Playfair Display for
 * Reliance brand).
 */
export function generateGoogleFontImports(
  config: (TypographyConfig & { typographyV2?: TypographyConfigV2 }) | undefined | null,
): string {
  if (!config) return '';

  // Resolve both slots via the canonical → legacy chain (text/heading wins,
  // then body/display transient, then primary/secondary legacy). V1 and V2
  // sources both contribute so brand documents on either side of the rename
  // migration get their fonts fetched.
  const sel = config.fontSelection as FontSelectionSlotsLike & {
    fallbackFontIds?: string[];
  } | undefined;
  const v2sel = config.typographyV2?.fontSelection;
  const enabledScriptFonts = config.typographyV2
    ? resolveTypographyScriptSupport(config.typographyV2.scriptSupport)
        .filter((script) => script.enabled)
        .flatMap((script) => [script.uiFontId, script.readingFontId])
    : [];
  const candidateIds: Array<string | null | undefined> = [
    resolveTextFontId(sel),
    resolveHeadingFontId(sel),
    ...(sel?.fallbackFontIds ?? []),
    resolveTextFontId(v2sel),
    resolveHeadingFontId(v2sel),
    ...(v2sel?.fallbackFontIds ?? []),
    v2sel?.codeFontId,
    ...enabledScriptFonts,
  ];

  const seen = new Set<string>();
  const imports: string[] = [];
  for (const id of candidateIds) {
    if (!id || id.startsWith('uploaded-') || seen.has(id)) continue;
    seen.add(id);
    const font = getFontById(id);
    if (!font) continue;
    const url = getGoogleFontsUrl(font);
    if (url) imports.push(`@import url('${url}');`);
  }

  return imports.join('\n');
}
