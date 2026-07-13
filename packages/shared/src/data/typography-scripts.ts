import type { TypographyRole } from './typography-roles';

export type TypographyScriptPreset = 'india-core-v1' | 'custom';
export type TypographyScriptLineHeightMode = 'ui' | 'reading' | 'custom';

export type TypographyScriptId =
  | 'devanagari'
  | 'bengali'
  | 'gujarati'
  | 'gurmukhi'
  | 'kannada'
  | 'malayalam'
  | 'oriya'
  | 'tamil'
  | 'telugu'
  | 'arabic';

export type TypographyScriptKey = TypographyScriptId | (string & {});

export interface TypographyScriptDefinition {
  id: TypographyScriptKey;
  label: string;
  cssName: string;
  uiFontId: string;
  readingFontId: string;
  langTags: readonly string[];
  sample: string;
  defaultLineHeightDeltas: {
    ui: Partial<Record<Exclude<TypographyRole, 'code'>, number>>;
    reading: Partial<Record<Exclude<TypographyRole, 'code'>, number>>;
  };
}

export interface TypographyScriptConfig {
  label?: string;
  cssName?: string;
  enabled?: boolean;
  uiFontId?: string;
  readingFontId?: string;
  lineHeightMode?: TypographyScriptLineHeightMode;
  lineHeightDeltas?: Partial<Record<Exclude<TypographyRole, 'code'>, number>>;
  langTags?: string[];
  sampleText?: string;
}

export interface TypographyScriptSupportConfig {
  preset?: TypographyScriptPreset;
  scripts?: Partial<Record<TypographyScriptKey, TypographyScriptConfig>>;
}

export interface ResolvedTypographyScriptConfig extends TypographyScriptDefinition {
  enabled: boolean;
  uiFontId: string;
  readingFontId: string;
  lineHeightMode: TypographyScriptLineHeightMode;
  lineHeightDeltas: Partial<Record<Exclude<TypographyRole, 'code'>, number>>;
  langTags: readonly string[];
  sample: string;
}

const DEFAULT_UI_DELTAS: Partial<Record<Exclude<TypographyRole, 'code'>, number>> = {};

const DEFAULT_READING_DELTAS: Partial<Record<Exclude<TypographyRole, 'code'>, number>> = {
  display: 1,
  headline: 1,
  title: 1,
  body: 1,
};

export const INDIA_CORE_SCRIPT_DEFINITIONS: readonly TypographyScriptDefinition[] = [
  {
    id: 'devanagari',
    label: 'Devanagari',
    cssName: 'Devanagari',
    uiFontId: 'noto-sans-devanagari-ui',
    readingFontId: 'noto-sans-devanagari-ui',
    langTags: ['hi', 'mr', 'ne', 'sa', 'mai', 'kok', 'doi', 'bho'],
    sample: 'नमस्ते भारत',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'bengali',
    label: 'Bengali',
    cssName: 'Bengali',
    uiFontId: 'noto-sans-bengali-ui',
    readingFontId: 'noto-sans-bengali-ui',
    langTags: ['bn', 'as'],
    sample: 'নমস্কার ভারত',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'gujarati',
    label: 'Gujarati',
    cssName: 'Gujarati',
    uiFontId: 'noto-sans-gujarati-ui',
    readingFontId: 'noto-sans-gujarati-ui',
    langTags: ['gu'],
    sample: 'નમસ્તે ભારત',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'gurmukhi',
    label: 'Gurmukhi',
    cssName: 'Gurmukhi',
    uiFontId: 'noto-sans-gurmukhi-ui',
    readingFontId: 'noto-sans-gurmukhi-ui',
    langTags: ['pa'],
    sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਭਾਰਤ',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'kannada',
    label: 'Kannada',
    cssName: 'Kannada',
    uiFontId: 'noto-sans-kannada-ui',
    readingFontId: 'noto-sans-kannada-ui',
    langTags: ['kn'],
    sample: 'ನಮಸ್ಕಾರ ಭಾರತ',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'malayalam',
    label: 'Malayalam',
    cssName: 'Malayalam',
    uiFontId: 'noto-sans-malayalam-ui',
    readingFontId: 'noto-sans-malayalam-ui',
    langTags: ['ml'],
    sample: 'നമസ്കാരം ഇന്ത്യ',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'oriya',
    label: 'Odia / Oriya',
    cssName: 'Oriya',
    uiFontId: 'noto-sans-oriya-ui',
    readingFontId: 'noto-sans-oriya-ui',
    langTags: ['or'],
    sample: 'ନମସ୍କାର ଭାରତ',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'tamil',
    label: 'Tamil',
    cssName: 'Tamil',
    uiFontId: 'noto-sans-tamil-ui',
    readingFontId: 'noto-sans-tamil-ui',
    langTags: ['ta'],
    sample: 'வணக்கம் இந்தியா',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'telugu',
    label: 'Telugu',
    cssName: 'Telugu',
    uiFontId: 'noto-sans-telugu-ui',
    readingFontId: 'noto-sans-telugu-ui',
    langTags: ['te'],
    sample: 'నమస్కారం భారత్',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
  {
    id: 'arabic',
    label: 'Arabic / Urdu',
    cssName: 'Arabic',
    uiFontId: 'noto-sans-arabic-ui',
    readingFontId: 'noto-sans-arabic-ui',
    langTags: ['ar', 'ur', 'fa', 'ks'],
    sample: 'السلام علیکم',
    defaultLineHeightDeltas: { ui: DEFAULT_UI_DELTAS, reading: DEFAULT_READING_DELTAS },
  },
] as const;

export const DEFAULT_TYPOGRAPHY_SCRIPT_SUPPORT: TypographyScriptSupportConfig = {
  preset: 'india-core-v1',
  scripts: Object.fromEntries(
    INDIA_CORE_SCRIPT_DEFINITIONS.map((script) => [
      script.id,
      {
        enabled: true,
        uiFontId: script.uiFontId,
        readingFontId: script.readingFontId,
        lineHeightMode: 'ui',
      } satisfies TypographyScriptConfig,
    ]),
  ),
};

export const TYPOGRAPHY_SCRIPT_BY_ID = new Map<TypographyScriptId, TypographyScriptDefinition>(
  INDIA_CORE_SCRIPT_DEFINITIONS.map((script) => [script.id as TypographyScriptId, script] as const),
);

export function sanitizeTypographyScriptCssName(value: string): string {
  const cleaned = value
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return cleaned || 'CustomScript';
}

function humanizeScriptId(scriptId: string): string {
  const words = scriptId.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/);
  if (words.length === 0) return 'Custom Script';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function getTypographyScriptDefinition(
  scriptId: string,
): TypographyScriptDefinition | undefined {
  return TYPOGRAPHY_SCRIPT_BY_ID.get(scriptId as TypographyScriptId);
}

export function scriptFontTokenName(
  script: TypographyScriptDefinition | Pick<TypographyScriptDefinition, 'cssName'>,
  mode: 'UI' | 'Reading',
): string {
  return `Typography-Font-Script-${script.cssName}-${mode}`;
}

export function resolveTypographyScriptSupport(
  config: TypographyScriptSupportConfig | undefined | null,
): ResolvedTypographyScriptConfig[] {
  const scripts = config?.scripts ?? DEFAULT_TYPOGRAPHY_SCRIPT_SUPPORT.scripts ?? {};
  const core = INDIA_CORE_SCRIPT_DEFINITIONS.map((definition) => {
    const override = scripts[definition.id] ?? {};
    const lineHeightMode = override.lineHeightMode ?? 'ui';
    const defaultDeltas =
      lineHeightMode === 'reading'
        ? definition.defaultLineHeightDeltas.reading
        : definition.defaultLineHeightDeltas.ui;

    return {
      ...definition,
      enabled: override.enabled ?? true,
      uiFontId: override.uiFontId ?? definition.uiFontId,
      readingFontId: override.readingFontId ?? override.uiFontId ?? definition.readingFontId,
      lineHeightMode,
      lineHeightDeltas:
        lineHeightMode === 'custom'
          ? override.lineHeightDeltas ?? defaultDeltas
          : { ...defaultDeltas, ...(override.lineHeightDeltas ?? {}) },
      langTags: override.langTags ?? definition.langTags,
      sample: override.sampleText ?? definition.sample,
    };
  });

  const custom = Object.entries(scripts)
    .filter(([scriptId]) => !TYPOGRAPHY_SCRIPT_BY_ID.has(scriptId as TypographyScriptId))
    .map(([scriptId, override = {}]) => {
      const label = override.label ?? humanizeScriptId(scriptId);
      const cssName = sanitizeTypographyScriptCssName(override.cssName ?? label);
      const uiFontId = override.uiFontId ?? 'noto-sans';
      const readingFontId = override.readingFontId ?? uiFontId;
      const lineHeightMode = override.lineHeightMode ?? 'ui';
      const definition: TypographyScriptDefinition = {
        id: scriptId,
        label,
        cssName,
        uiFontId,
        readingFontId,
        langTags: override.langTags ?? [],
        sample: override.sampleText ?? label,
        defaultLineHeightDeltas: {
          ui: DEFAULT_UI_DELTAS,
          reading: DEFAULT_READING_DELTAS,
        },
      };
      const defaultDeltas =
        lineHeightMode === 'reading'
          ? definition.defaultLineHeightDeltas.reading
          : definition.defaultLineHeightDeltas.ui;

      return {
        ...definition,
        enabled: override.enabled ?? true,
        uiFontId,
        readingFontId,
        lineHeightMode,
        lineHeightDeltas:
          lineHeightMode === 'custom'
            ? override.lineHeightDeltas ?? defaultDeltas
            : { ...defaultDeltas, ...(override.lineHeightDeltas ?? {}) },
        langTags: override.langTags ?? [],
        sample: override.sampleText ?? label,
      };
    });

  return [...core, ...custom];
}

export function getScriptIdsFromLang(lang: string | undefined | null): TypographyScriptId | null {
  if (!lang) return null;
  const primary = lang.toLowerCase().split('-')[0];
  for (const definition of INDIA_CORE_SCRIPT_DEFINITIONS) {
    if (definition.langTags.includes(primary)) return definition.id as TypographyScriptId;
  }
  return null;
}
