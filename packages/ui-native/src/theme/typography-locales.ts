import { getScriptIdsFromLang } from '@oneui/shared';
import type {
  TypographyScriptId,
  TypographyScriptLineHeightMode,
} from '@oneui/shared';

/** Layers / catalog canonical 12 locale codes. */
export const SUPPORTED_TYPOGRAPHY_LOCALES = [
  'en',
  'hi',
  'mr',
  'bn',
  'as',
  'gu',
  'kn',
  'ml',
  'or',
  'pa',
  'ta',
  'te',
] as const;

export type TypographyLocale = (typeof SUPPORTED_TYPOGRAPHY_LOCALES)[number];

const SUPPORTED_SET = new Set<string>(SUPPORTED_TYPOGRAPHY_LOCALES);

export const TYPOGRAPHY_LOCALE_LABELS: Record<TypographyLocale, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  bn: 'Bengali',
  as: 'Assamese',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  or: 'Odia',
  pa: 'Punjabi',
  ta: 'Tamil',
  te: 'Telugu',
};

/** Primary BCP-47 subtag (e.g. `hi-IN` → `hi`). */
export function normalizeTypographyLocaleTag(
  language: string | undefined | null,
): string {
  if (!language) return 'en';
  return language.toLowerCase().split('-')[0] ?? 'en';
}

export function isTypographyLocale(code: string): code is TypographyLocale {
  return SUPPORTED_SET.has(normalizeTypographyLocaleTag(code));
}

export interface ResolvedTypographyLanguage {
  /** Normalized primary language tag (`en`, `hi`, …). */
  locale: string;
  /** Script profile when locale maps to an enabled script; `null` for English / disabled. */
  scriptId: TypographyScriptId | null;
  scriptMode: Extract<TypographyScriptLineHeightMode, 'ui' | 'reading'>;
}

export interface ResolveTypographyLanguageOptions {
  scriptMode?: Extract<TypographyScriptLineHeightMode, 'ui' | 'reading'>;
  /**
   * When set, only return `scriptId` if it appears in this collection (brand-enabled
   * scripts). Derive from `theme.typography.scriptVariants` keys after build.
   */
  enabledScriptIds?: ReadonlySet<string> | readonly string[];
}

/**
 * Resolve app language to typography script context (Layers RN parity).
 * Unknown codes fall back to `en` with `scriptId: null`.
 */
export function resolveTypographyLanguage(
  language: string | undefined | null,
  options?: ResolveTypographyLanguageOptions,
): ResolvedTypographyLanguage {
  const scriptMode = options?.scriptMode ?? 'ui';
  const primary = normalizeTypographyLocaleTag(language);
  const locale = isTypographyLocale(primary) ? primary : 'en';

  let scriptId: TypographyScriptId | null =
    locale === 'en' ? null : getScriptIdsFromLang(locale);

  if (scriptId && options?.enabledScriptIds) {
    const enabled = options.enabledScriptIds;
    const isEnabled =
      typeof enabled === 'object' &&
      'has' in enabled &&
      typeof (enabled as ReadonlySet<string>).has === 'function'
        ? (enabled as ReadonlySet<string>).has(scriptId)
        : (enabled as readonly string[]).includes(scriptId);
    if (!isEnabled) scriptId = null;
  }

  return { locale, scriptId, scriptMode };
}

/** Enabled script ids from a built native theme's `scriptVariants` map. */
export function enabledScriptIdsFromTheme(
  scriptVariants: Record<string, unknown> | undefined | null,
): Set<string> {
  if (!scriptVariants) return new Set();
  return new Set(Object.keys(scriptVariants));
}

