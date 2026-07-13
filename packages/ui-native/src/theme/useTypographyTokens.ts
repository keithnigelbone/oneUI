/**
 * useTypographyTokens
 *
 * Native equivalent of the web `--{Role}-{Size}-FontSize / LineHeight /
 * FontWeight / FontFamily` token surface. Reads resolved values out of the
 * `OneUINativeTheme` provided by `<OneUINativeThemeProvider>`.
 *
 * Usage:
 *   const t = useTypographyTokens('label', 'S');
 *   <Text style={{ fontSize: t.fontSize, lineHeight: t.lineHeight, ... }} />
 *
 * By default line height is `Math.ceil(fontSize × 1.25)` so RN `Text` metrics stay
 * stable across platforms. Pass `{ lineHeightMultiplier: 1 }` for tight single-line
 * pills (e.g. CounterBadge); omit for the default `1.25` (e.g. Badge label).
 *
 * For emphasis-weight roles (body / label / code) pass an explicit
 * `emphasis` to override the default medium weight:
 *   useTypographyTokens('body', 'M', { emphasis: 'high' })
 */

import { useMemo } from 'react';
import { useOneUITheme } from './SurfaceContext';
import { useOptionalTypographyLanguage } from './TypographyLanguageContext';
import {
  mergeWithJioBundledStaticDefaults,
  resolveStaticWeightFamilyForRole,
  type NativeTypeStyle,
  type NativeEmphasisTypography,
  type OneUINativeTheme,
} from '@oneui/shared/engine';
import type {
  TypographyRole as SharedTypographyRole,
  TypographyScriptId,
  TypographyScriptLineHeightMode,
} from '@oneui/shared';

export type TypographyRole = SharedTypographyRole;
export type Emphasis = 'high' | 'medium' | 'low';

/** Role-scoped size unions, matching `TYPOGRAPHY_SIZES` in the engine. */
export interface SizeForRole {
  display: 'L' | 'M' | 'S';
  headline: 'L' | 'M' | 'S';
  title: 'L' | 'M' | 'S';
  body: '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS';
  label: '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS';
  code: 'M' | 'S' | 'XS';
}

export interface TypographyTokenOptions {
  /**
   * Line height = `Math.ceil(fontSize × multiplier)`. Defaults to `1.25` when omitted.
   */
  lineHeightMultiplier?: number;
  /** Body / Label / Code only — selects the per-emphasis weight. */
  emphasis?: Emphasis;
  /** Optional script profile, e.g. `devanagari` for Hindi / Marathi text. */
  script?: TypographyScriptId | (string & {});
  /** Uses compact UI fonts by default; `reading` switches to document fonts + roomier line-height. */
  scriptMode?: Extract<TypographyScriptLineHeightMode, 'ui' | 'reading'>;
}

const EMPHASIS_ROLES = new Set<TypographyRole>(['body', 'label', 'code']);

/** Merges per-call typography options with `TypographyLanguageProvider` context. */
export function mergeTypographyLanguageOptions(
  options: Pick<TypographyTokenOptions, 'script' | 'scriptMode'>,
  langCtx: { scriptId: TypographyScriptId | null; scriptMode: 'ui' | 'reading' } | null,
): Pick<TypographyTokenOptions, 'script' | 'scriptMode'> {
  return {
    script: options.script ?? langCtx?.scriptId ?? undefined,
    scriptMode: options.scriptMode ?? langCtx?.scriptMode ?? 'ui',
  };
}

// INTENTIONAL-LITERAL: RN `Text` line-height ratio — integer ceil for stable layout.
const NATIVE_LINE_HEIGHT_RATIO = 1.25;
// const NATIVE_LINE_HEIGHT_RATIO = 1;

/**
 * Per-locale default line-height multiplier for native typography.
 * Local to `@oneui/ui-native` so consuming apps can opt-in/out without
 * pulling it from shared.
 */
const LOCALE_LINE_HEIGHT_MULTIPLIERS: Record<string, number> = {
  en: 1.25,
  hi: 1.4,
  mr: 1.4,
  bn: 1.4,
  as: 1.4,
  gu: 1.4,
  kn: 1.4,
  ml: 1.4,
  or: 1.4,
  pa: 1.4,
  ta: 1.35,
  te: 1.4,
};

function lineHeightMultiplierForLocale(locale: string | undefined | null): number {
  if (!locale) return NATIVE_LINE_HEIGHT_RATIO;
  return LOCALE_LINE_HEIGHT_MULTIPLIERS[locale] ?? NATIVE_LINE_HEIGHT_RATIO;
}

function nativeLineHeightForFontSize(
  fontSize: number,
  ratio: number = NATIVE_LINE_HEIGHT_RATIO
): number {
  return Math.ceil(fontSize * ratio);
}

/** Pure selector — given a theme, role, size, and optional emphasis, return the resolved type style. */
export function selectTypographyTokens(
  theme: OneUINativeTheme,
  role: TypographyRole,
  size: string,
  emphasis?: Emphasis,
  script?: TypographyTokenOptions['script'],
  scriptMode: TypographyTokenOptions['scriptMode'] = 'ui'
): NativeTypeStyle {
  const roleTree = theme.typography[role];
  const sizeTree = roleTree.sizes as Record<string, NativeTypeStyle>;
  const base = sizeTree[size] ?? sizeTree.M ?? sizeTree.L;
  const scriptOverride =
    role !== 'code' && script
      ? theme.typography.scriptVariants?.[script]?.[scriptMode]?.[role]?.[size]
      : undefined;

  const emphasisWeight =
    emphasis && EMPHASIS_ROLES.has(role)
      ? (roleTree as NativeEmphasisTypography).weights[emphasis]
      : null;

  const withScript = scriptOverride ? { ...base, ...scriptOverride } : base;
  const merged: NativeTypeStyle =
    emphasisWeight !== null ? { ...withScript, fontWeight: emphasisWeight } : withScript;

  const staticMaps = mergeWithJioBundledStaticDefaults(theme.typography.staticWeightFamilies);
  const codeStaticMap = staticMaps?.code;
  const hasCodeStaticMap =
    codeStaticMap != null && Object.keys(codeStaticMap).length > 0;

  // Code role: variable mono — never snap to JioType static cuts from primary/brand bleed.
  if (role === 'code' && !hasCodeStaticMap) {
    const codeFamily = theme.typography.fontFamilies.code;
    const fontFamily =
      codeFamily === 'JetBrains Mono'
        ? 'JetBrainsMono'
        : (codeFamily ?? merged.fontFamily);
    if (fontFamily) {
      const { weightViaFontFamily: _omit, ...rest } = merged;
      return { ...rest, fontFamily };
    }
  }

  const staticFamily = resolveStaticWeightFamilyForRole(staticMaps, role, merged.fontWeight);

  // Keep static cuts for Latin unless a script profile replaces the family (Noto, etc.).
  const scriptReplacesFamily =
    scriptOverride?.fontFamily != null &&
    scriptOverride.fontFamily !== base.fontFamily;

  if (staticFamily && !scriptReplacesFamily) {
    return {
      ...merged,
      fontFamily: staticFamily,
      weightViaFontFamily: true,
    };
  }

  return merged;
}

// fallow-ignore-next-line complexity
export function useTypographyTokens<R extends TypographyRole>(
  role: R,
  size: SizeForRole[R],
  options: TypographyTokenOptions = {}
): NativeTypeStyle {
  const theme = useOneUITheme();
  const langCtx = useOptionalTypographyLanguage();
  const { script, scriptMode } = mergeTypographyLanguageOptions(options, langCtx);

  return useMemo(() => {
    const merged = selectTypographyTokens(
      theme,
      role,
      size as string,
      options.emphasis,
      script,
      scriptMode
    );
    const ratio =
      options.lineHeightMultiplier ?? lineHeightMultiplierForLocale(langCtx?.locale);
    return {
      ...merged,
      lineHeight: script
        ? nativeLineHeightForFontSize(merged.fontSize, ratio)
        : nativeLineHeightForFontSize(merged.fontSize, ratio),
    };
  }, [
    theme,
    role,
    size,
    options.emphasis,
    script,
    scriptMode,
    options.lineHeightMultiplier,
    langCtx?.locale,
  ]);
}
