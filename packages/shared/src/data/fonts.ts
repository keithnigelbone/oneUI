/**
 * fonts.ts
 * Font metadata and curated font collection for typography foundation
 */

// Font category types
export type FontCategory = 'variable' | 'sans-serif' | 'serif' | 'mono' | 'script';

// Font source types
export type FontSource = 'google' | 'custom' | 'uploaded';

// Font scope for primary/secondary assignment
export type FontScope = 'single' | 'dual';

/**
 * Font metadata interface
 */
export interface FontMetadata {
  /** Unique identifier (e.g., "inter", "roboto-flex") */
  id: string;
  /** Display name (e.g., "Inter", "Roboto Flex") */
  name: string;
  /** Font category for tab filtering */
  category: FontCategory;
  /** Where to load the font from */
  source: FontSource;
  /** Google Fonts ID for loading (e.g., "Inter", "Roboto+Flex") */
  googleFontId?: string;
  /** Path for custom fonts (e.g., "/fonts/JioTypeVar.ttf"). Primary weight file. */
  customFontPath?: string;
  /**
   * One entry per uploaded weight file for custom/uploaded fonts. Static
   * families can have several (Regular + Bold + …); a variable family has a
   * single entry covering its range. Empty/absent for built-in and Google
   * fonts. Drives one `@font-face` rule per weight so every uploaded weight
   * actually renders.
   */
  weightFiles?: Array<{ weight: number; url: string; format?: string }>;
  /** Available font weights */
  weights: number[];
  /** Whether this is a variable font */
  isVariable: boolean;
  /** Fallback font stack */
  fallback: string;
  /** Optional OpenType features supported */
  features?: string[];
}

/**
 * Font selection configuration.
 *
 * `textFontId` / `headingFontId` are canonical (function-named slots that
 * don't collide with typography role names). The other pairs are
 * deprecation aliases retained for existing brand documents until cleanup.
 * Readers should prefer the canonical names with a fallback chain through
 * the legacy ones; writers should populate every alias alongside the
 * canonical fields.
 */
export interface FontSelection {
  /** Selection mode: single font for all, or text/heading split */
  scope: FontScope;
  /** Workhorse font for body / labels / default UI text. */
  textFontId?: string | null;
  /** Editorial font for hero / headline copy when distinct from text. */
  headingFontId?: string | null;
  /** @deprecated alias of textFontId */
  bodyFontId?: string | null;
  /** @deprecated alias of headingFontId */
  displayFontId?: string | null;
  /** @deprecated alias of textFontId */
  primaryFontId: string | null;
  /** @deprecated alias of headingFontId */
  secondaryFontId: string | null;
  /** Fallback font IDs for script language support (e.g., Devanagari, Arabic) */
  fallbackFontIds?: string[];
}

/**
 * Loose subset of FontSelection that captures every alias of the two
 * brand-customisable slots. Read sites in the engine and Convex layer
 * receive raw `Record<string, unknown>` config objects, so the helpers
 * below accept this Partial shape rather than the full `FontSelection`.
 */
export type FontSelectionSlotsLike = Partial<{
  textFontId: string | null;
  headingFontId: string | null;
  bodyFontId: string | null;
  displayFontId: string | null;
  primaryFontId: string | null;
  secondaryFontId: string | null;
}>;

/**
 * Resolve the workhorse (Text) slot font ID through the canonical →
 * legacy fallback chain. Single source of truth for the ordering;
 * call this from any read site that needs the brand's text font.
 */
export function resolveTextFontId(sel: FontSelectionSlotsLike | null | undefined): string | null {
  return sel?.textFontId ?? sel?.bodyFontId ?? sel?.primaryFontId ?? null;
}

/**
 * Resolve the editorial (Heading) slot font ID through the canonical →
 * legacy fallback chain.
 */
export function resolveHeadingFontId(sel: FontSelectionSlotsLike | null | undefined): string | null {
  return sel?.headingFontId ?? sel?.displayFontId ?? sel?.secondaryFontId ?? null;
}

/**
 * Build the field triple that a writer must persist for the Text slot
 * to keep canonical + transient + legacy readers all resolving. Spread
 * into a fontSelection object literal.
 */
export function textSlotWrite(fontId: string): { textFontId: string; bodyFontId: string; primaryFontId: string } {
  return { textFontId: fontId, bodyFontId: fontId, primaryFontId: fontId };
}

/**
 * Build the field triple for the Heading slot.
 */
export function headingSlotWrite(fontId: string): { headingFontId: string; displayFontId: string; secondaryFontId: string } {
  return { headingFontId: fontId, displayFontId: fontId, secondaryFontId: fontId };
}

/**
 * Category labels for display
 */
export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  variable: 'Variable',
  'sans-serif': 'Sans-Serif',
  serif: 'Serif',
  mono: 'Mono',
  script: 'Script Languages',
};

/**
 * Style categories and their font assignment
 *
 * @deprecated Prefer {@link STYLE_FONT_MAPPING_V2} in new code. The legacy
 * `primary` / `secondary` keys are kept in lock-step with the
 * `primaryFontId` / `secondaryFontId` fields on `FontSelection` (and the
 * matching Convex schema columns) until the schema-rename phase lands.
 * Renaming this constant in isolation would desynchronise the slot keys from
 * the persisted schema, so it stays as-is for backwards compatibility.
 */
export const STYLE_FONT_MAPPING = {
  primary: ['Display', 'Headline', 'Title'],
  secondary: ['Body', 'Label'],
} as const;

/**
 * Forward-looking style category mapping with role-aligned slot names.
 *
 * `display` corresponds to the slot historically called `primary`
 * (Display / Headline / Title — large, expressive type).
 * `body` corresponds to the slot historically called `secondary`
 * (Body / Label — running text and UI labels).
 *
 * New code should reach for this constant. Once the Convex schema rename
 * (`primaryFontId` → `bodyFontId`, `secondaryFontId` → `displayFontId`) ships,
 * {@link STYLE_FONT_MAPPING} will be removed and call sites migrated here.
 */
export const STYLE_FONT_MAPPING_V2 = {
  display: ['Display', 'Headline', 'Title'],
  body: ['Body', 'Label'],
} as const;

/**
 * Default font selection configuration
 */
export const DEFAULT_FONT_SELECTION: FontSelection = {
  scope: 'single',
  primaryFontId: 'inter',
  secondaryFontId: null,
  fallbackFontIds: [],
};

/**
 * Curated font collection
 * Organized by category with metadata for loading and display
 */
export const FONT_COLLECTION: FontMetadata[] = [
  // ═══════════════════════════════════════════════════════════════
  // VARIABLE FONTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'inter',
    name: 'Inter',
    category: 'variable',
    source: 'google',
    googleFontId: 'Inter',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: true,
    fallback: 'system-ui, sans-serif',
    features: ['cv01', 'cv02', 'cv03', 'cv04', 'ss01', 'ss02'],
  },
  {
    id: 'roboto-flex',
    name: 'Roboto Flex',
    category: 'variable',
    source: 'google',
    googleFontId: 'Roboto+Flex',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: true,
    fallback: 'system-ui, sans-serif',
  },
  {
    id: 'jiotype-var',
    name: 'JioType Variable',
    category: 'variable',
    source: 'custom',
    customFontPath: '/fonts/JioTypeVar.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: true,
    fallback: 'system-ui, sans-serif',
  },

  // ═══════════════════════════════════════════════════════════════
  // SANS-SERIF FONTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'sans-serif',
    source: 'google',
    googleFontId: 'Roboto',
    weights: [100, 300, 400, 500, 700, 900],
    isVariable: false,
    fallback: 'system-ui, sans-serif',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'sans-serif',
    source: 'google',
    googleFontId: 'Open+Sans',
    weights: [300, 400, 500, 600, 700, 800],
    isVariable: false,
    fallback: 'system-ui, sans-serif',
  },
  {
    id: 'lato',
    name: 'Lato',
    category: 'sans-serif',
    source: 'google',
    googleFontId: 'Lato',
    weights: [100, 300, 400, 700, 900],
    isVariable: false,
    fallback: 'system-ui, sans-serif',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'sans-serif',
    source: 'google',
    googleFontId: 'Poppins',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'system-ui, sans-serif',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'sans-serif',
    source: 'google',
    googleFontId: 'Montserrat',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'system-ui, sans-serif',
  },

  // ═══════════════════════════════════════════════════════════════
  // SERIF FONTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'serif',
    source: 'google',
    googleFontId: 'Playfair+Display',
    weights: [400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Georgia, serif',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    source: 'google',
    googleFontId: 'Merriweather',
    weights: [300, 400, 700, 900],
    isVariable: false,
    fallback: 'Georgia, serif',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'serif',
    source: 'google',
    googleFontId: 'Lora',
    weights: [400, 500, 600, 700],
    isVariable: false,
    fallback: 'Georgia, serif',
  },
  {
    id: 'source-serif',
    name: 'Source Serif 4',
    category: 'serif',
    source: 'google',
    googleFontId: 'Source+Serif+4',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Georgia, serif',
  },

  // ═══════════════════════════════════════════════════════════════
  // MONOSPACE FONTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    category: 'mono',
    source: 'google',
    googleFontId: 'JetBrains+Mono',
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    isVariable: false,
    fallback: 'monospace',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    category: 'mono',
    source: 'google',
    googleFontId: 'Fira+Code',
    weights: [300, 400, 500, 600, 700],
    isVariable: false,
    fallback: 'monospace',
    features: ['calt', 'liga'],
  },
  {
    id: 'source-code-pro',
    name: 'Source Code Pro',
    category: 'mono',
    source: 'google',
    googleFontId: 'Source+Code+Pro',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'monospace',
  },

  // ═══════════════════════════════════════════════════════════════
  // SCRIPT LANGUAGE FONTS
  // Multi-script fonts supporting Indian languages, Arabic, etc.
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'noto-sans',
    name: 'Noto Sans',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'system-ui, sans-serif',
  },
  // Noto does not use a generic "Noto Sans UI" for Latin/Cyrillic/Greek.
  // The UI suffix belongs to vertically compact complex-script families.
  {
    id: 'noto-sans-devanagari',
    name: 'Noto Sans Devanagari',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Devanagari',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-devanagari-ui',
    name: 'Noto Sans Devanagari UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Devanagari+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Devanagari, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-tamil',
    name: 'Noto Sans Tamil',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Tamil',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-tamil-ui',
    name: 'Noto Sans Tamil UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Tamil+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Tamil, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-telugu',
    name: 'Noto Sans Telugu',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Telugu',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-telugu-ui',
    name: 'Noto Sans Telugu UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Telugu+UI',
    weights: [400, 700],
    isVariable: false,
    fallback: 'Noto Sans Telugu, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-bengali',
    name: 'Noto Sans Bengali',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Bengali',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-bengali-ui',
    name: 'Noto Sans Bengali UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Bengali+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Bengali, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-gujarati',
    name: 'Noto Sans Gujarati',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Gujarati',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-gujarati-ui',
    name: 'Noto Sans Gujarati UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Gujarati+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Gujarati, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-gurmukhi',
    name: 'Noto Sans Gurmukhi',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Gurmukhi',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-gurmukhi-ui',
    name: 'Noto Sans Gurmukhi UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Gurmukhi+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Gurmukhi, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-kannada',
    name: 'Noto Sans Kannada',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Kannada',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-kannada-ui',
    name: 'Noto Sans Kannada UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Kannada+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Kannada, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-malayalam',
    name: 'Noto Sans Malayalam',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Malayalam',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-malayalam-ui',
    name: 'Noto Sans Malayalam UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Malayalam+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Malayalam, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-oriya',
    name: 'Noto Sans Oriya',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Oriya',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-oriya-ui',
    name: 'Noto Sans Oriya UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Oriya+UI',
    weights: [400, 700],
    isVariable: false,
    fallback: 'Noto Sans Oriya, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-arabic',
    name: 'Noto Sans Arabic',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Arabic',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-arabic-ui',
    name: 'Noto Sans Arabic UI',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Arabic+UI',
    weights: [400, 500, 700],
    isVariable: false,
    fallback: 'Noto Sans Arabic, Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-hebrew',
    name: 'Noto Sans Hebrew',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Hebrew',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
  {
    id: 'noto-sans-thai',
    name: 'Noto Sans Thai',
    category: 'script',
    source: 'google',
    googleFontId: 'Noto+Sans+Thai',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: false,
    fallback: 'Noto Sans, system-ui, sans-serif',
  },
];

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get font by ID
 */
export function getFontById(id: string): FontMetadata | undefined {
  return FONT_COLLECTION.find((font) => font.id === id);
}

/**
 * Get font by display name (case-insensitive, partial match).
 * Used when Convex stores a fontFamily string instead of a font ID.
 */
export function getFontByName(name: string): FontMetadata | undefined {
  const lower = name.toLowerCase().trim();
  // Exact name match first
  const exact = FONT_COLLECTION.find((f) => f.name.toLowerCase() === lower);
  if (exact) return exact;
  // Partial match (e.g., "JioType Variable" matching a font named "JioType")
  return FONT_COLLECTION.find((f) => lower.includes(f.name.toLowerCase()));
}

/**
 * Minimal shape of an uploaded-font row from `getBrandOverviewData.customFonts`.
 * Loosely typed because this helper sits at the boundary between Convex data
 * and the exporter — keeping the surface flexible avoids forcing every caller
 * through the full `customFonts` Convex schema type.
 */
export interface BrandUploadedFontEntry {
  _id?: string;
  name?: string;
  familyName?: string;
}

/**
 * Resolve a brand `fontSelection.{primaryFontId,codeFontId}` value to its
 * human-readable family name. Handles three sources:
 *
 *   1. Built-in Google Fonts entries (`getFontById`).
 *   2. Uploaded fonts (id prefix `uploaded-`), looked up against the
 *      `customFonts` array surfaced by `getBrandOverviewData`.
 *   3. Bare family-name strings (Convex stores `fontFamily` directly in some
 *      legacy configs).
 *
 * Returns `undefined` when nothing matches so callers can apply their own
 * default family.
 */
export function resolveBrandFontName(
  fontId: string | undefined | null,
  customFonts: readonly BrandUploadedFontEntry[] | undefined,
): string | undefined {
  if (!fontId) return undefined;
  if (fontId.startsWith('uploaded-')) {
    const convexId = fontId.slice('uploaded-'.length);
    const match = customFonts?.find((f) => f._id === convexId);
    return match?.familyName ?? match?.name ?? undefined;
  }
  const builtIn = getFontById(fontId);
  if (builtIn) return builtIn.name;
  // Treat the value as an already-resolved family name (legacy path).
  return fontId;
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: FontCategory): FontMetadata[] {
  return FONT_COLLECTION.filter((font) => font.category === category);
}

/**
 * Get all font categories with counts
 */
export function getFontCategoryCounts(): Record<FontCategory, number> {
  return {
    variable: getFontsByCategory('variable').length,
    'sans-serif': getFontsByCategory('sans-serif').length,
    serif: getFontsByCategory('serif').length,
    mono: getFontsByCategory('mono').length,
    script: getFontsByCategory('script').length,
  };
}

/**
 * Build font-family CSS string from font metadata
 */
export function buildFontFamilyString(font: FontMetadata | undefined): string {
  if (!font) return 'system-ui, sans-serif';
  const fontName = font.name.includes(' ') ? `'${font.name}'` : font.name;
  return `${fontName}, ${font.fallback}`;
}

/**
 * Build font-family CSS string from font ID
 */
export function buildFontFamilyById(id: string): string {
  const font = getFontById(id);
  if (!font) return 'system-ui, sans-serif';
  return buildFontFamilyString(font);
}

/**
 * Get Google Fonts URL for a font
 */
export function getGoogleFontsUrl(font: FontMetadata): string | null {
  if (font.source !== 'google' || !font.googleFontId) return null;

  const weights = font.isVariable
    ? '100..900'
    : font.weights.join(';');

  return `https://fonts.googleapis.com/css2?family=${font.googleFontId}:wght@${weights}&display=optional`;
}

/**
 * Get the font assignment for a style category
 */
export function getFontForStyleCategory(
  categoryName: string,
  fontSelection: FontSelection
): string | null {
  const isPrimaryCategory = STYLE_FONT_MAPPING.primary.includes(
    categoryName as (typeof STYLE_FONT_MAPPING.primary)[number]
  );

  if (fontSelection.scope === 'single') {
    return fontSelection.primaryFontId;
  }

  return isPrimaryCategory
    ? fontSelection.primaryFontId
    : fontSelection.secondaryFontId;
}

// ═══════════════════════════════════════════════════════════════
// UPLOADED FONT UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Custom font data from Convex storage
 */
export interface CustomFontData {
  _id: string;
  name: string;
  familyName: string;
  fileUrl: string;
  category: FontCategory;
  weights: number[];
  isVariable: boolean;
  fallback: string;
  /** Per-weight files (multi-file families). Absent on legacy single-file records. */
  files?: Array<{ fileUrl: string; weight: number; fileFormat?: string }>;
}

/**
 * Convert a custom font from Convex to FontMetadata format.
 *
 * `weightFiles` is populated from the record's `files` array when present,
 * and otherwise synthesised from the legacy single-file fields so every
 * uploaded weight can be emitted as its own `@font-face` rule.
 */
export function convertCustomFontToMetadata(customFont: CustomFontData): FontMetadata {
  const weightFiles =
    customFont.files && customFont.files.length > 0
      ? customFont.files
          .map((f) => ({ weight: f.weight, url: f.fileUrl, format: f.fileFormat }))
          .sort((a, b) => a.weight - b.weight)
      : [{ weight: customFont.weights[0] ?? 400, url: customFont.fileUrl }];
  return {
    id: `uploaded-${customFont._id}`,
    name: customFont.name,
    category: customFont.category,
    source: 'uploaded',
    customFontPath: customFont.fileUrl,
    weightFiles,
    weights: customFont.weights,
    isVariable: customFont.isVariable,
    fallback: customFont.fallback,
  };
}

/**
 * Generate a unique font ID for uploaded fonts
 */
export function getUploadedFontId(convexId: string): string {
  return `uploaded-${convexId}`;
}

/**
 * Extract Convex ID from uploaded font ID
 */
export function getConvexIdFromFontId(fontId: string): string | null {
  if (fontId.startsWith('uploaded-')) {
    return fontId.replace('uploaded-', '');
  }
  return null;
}
