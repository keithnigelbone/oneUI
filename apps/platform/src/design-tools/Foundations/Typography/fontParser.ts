/**
 * fontParser.ts
 *
 * Utility for parsing font files and extracting metadata
 * Uses opentype.js to read font tables and detect variable fonts
 */

/**
 * Font format types
 */
export type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2';

/**
 * Font category types
 */
export type FontCategory = 'variable' | 'sans-serif' | 'serif' | 'mono' | 'script';

/**
 * Variable font axis information
 */
export interface VariableAxis {
  tag: string;
  minValue: number;
  maxValue: number;
  defaultValue: number;
}

/**
 * Parsed font metadata
 */
export interface FontMetadata {
  familyName: string;
  weights: number[];
  isVariable: boolean;
  variableAxes?: VariableAxis[];
  suggestedCategory: FontCategory;
}

/**
 * Font parsing result
 */
export interface FontParseResult {
  valid: boolean;
  errors: string[];
  metadata?: FontMetadata;
}

/**
 * Detect font format from file
 */
export function detectFontFormat(file: File): FontFormat | null {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'ttf':
      return 'ttf';
    case 'otf':
      return 'otf';
    case 'woff':
      return 'woff';
    case 'woff2':
      return 'woff2';
    default:
      return null;
  }
}

/**
 * Validate that a file is a supported font format
 */
export function isValidFontFile(file: File): boolean {
  return detectFontFormat(file) !== null;
}

/**
 * Get MIME type for font format
 */
export function getFontMimeType(format: FontFormat): string {
  switch (format) {
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
  }
}

/**
 * Suggest a category based on font family name
 */
function suggestCategory(familyName: string): FontCategory {
  const lowerName = familyName.toLowerCase();

  // Check for mono/code fonts
  if (
    lowerName.includes('mono') ||
    lowerName.includes('code') ||
    lowerName.includes('consol') ||
    lowerName.includes('courier')
  ) {
    return 'mono';
  }

  // Check for script/handwriting fonts
  if (
    lowerName.includes('script') ||
    lowerName.includes('hand') ||
    lowerName.includes('brush') ||
    lowerName.includes('cursive')
  ) {
    return 'script';
  }

  // Check for serif fonts
  if (
    lowerName.includes('serif') ||
    lowerName.includes('times') ||
    lowerName.includes('garamond') ||
    lowerName.includes('georgia')
  ) {
    // Could be sans-serif or serif, check more carefully
    if (lowerName.includes('sans')) {
      return 'sans-serif';
    }
    return 'serif';
  }

  // Default to sans-serif
  return 'sans-serif';
}

/**
 * Extract weight from OS/2 table weight class
 */
function weightClassToWeight(weightClass: number): number {
  // OpenType weight classes map to CSS weights
  // 100 = Thin, 200 = ExtraLight, 300 = Light, 400 = Regular,
  // 500 = Medium, 600 = SemiBold, 700 = Bold, 800 = ExtraBold, 900 = Black
  return Math.max(100, Math.min(900, Math.round(weightClass / 100) * 100));
}

/**
 * Parse a font file and extract metadata
 */
export async function parseFontFile(file: File): Promise<FontParseResult> {
  const errors: string[] = [];

  // Validate format
  const format = detectFontFormat(file);
  if (!format) {
    return {
      valid: false,
      errors: ['Unsupported file format. Please use TTF, OTF, WOFF, or WOFF2.'],
    };
  }

  try {
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Dynamically import opentype.js to avoid loading it until needed
    const opentypeModule = await import('opentype.js');
    const opentypeLib = (opentypeModule.default ?? opentypeModule) as unknown as {
      parse: (buffer: ArrayBuffer) => {
        names: unknown;
        tables: Record<string, unknown>;
      };
    };

    // Parse font with opentype.js
    const font = opentypeLib.parse(buffer);

    // Extract family name from name table.
    // Prefer the *typographic* family (name ID 16, `preferredFamily`) over the
    // basic family (name ID 1, `fontFamily`): for weights outside the RIBBI set
    // (e.g. Light, SemiBold, Black) the basic family embeds the weight
    // ("MyFont SemiBold") while the typographic family stays constant
    // ("MyFont"). Preferring it lets separate weight files group into one family
    // so they merge into a single multi-weight upload instead of overwriting.
    // Note: Using type assertion for names that may exist but aren't in TS types
    const names = font.names as unknown as Record<string, { en?: string } | undefined>;
    const familyName =
      names.preferredFamily?.en ||
      names.fontFamily?.en ||
      names.fullName?.en ||
      file.name.replace(/\.[^/.]+$/, '');

    // Check for variable font (fvar table)
    const isVariable = 'fvar' in font.tables;
    let variableAxes: VariableAxis[] | undefined;
    let weights: number[] = [];

    if (isVariable && font.tables.fvar) {
      // Extract variable font axes
      // Using unknown first to safely cast the fvar table
      const fvar = font.tables.fvar as unknown as {
        axes: Array<{
          tag: string;
          minValue: number;
          maxValue: number;
          defaultValue: number;
        }>;
      };

      variableAxes = fvar.axes.map((axis) => ({
        tag: axis.tag,
        minValue: axis.minValue,
        maxValue: axis.maxValue,
        defaultValue: axis.defaultValue,
      }));

      // Find weight axis
      const weightAxis = variableAxes.find((axis) => axis.tag === 'wght');
      if (weightAxis) {
        // Generate weight array from min to max in increments of 100
        const minWeight = Math.ceil(weightAxis.minValue / 100) * 100;
        const maxWeight = Math.floor(weightAxis.maxValue / 100) * 100;
        for (let w = minWeight; w <= maxWeight; w += 100) {
          weights.push(w);
        }
      } else {
        // No weight axis, use default
        weights = [400];
      }
    } else {
      // Static font - try to get weight from OS/2 table
      const os2 = font.tables.os2 as { usWeightClass?: number } | undefined;
      if (os2?.usWeightClass) {
        weights = [weightClassToWeight(os2.usWeightClass)];
      } else {
        weights = [400]; // Default to regular
      }
    }

    // Suggest category
    const suggestedCategory = isVariable
      ? 'variable'
      : suggestCategory(familyName);

    return {
      valid: true,
      errors: [],
      metadata: {
        familyName,
        weights,
        isVariable,
        variableAxes,
        suggestedCategory,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error parsing font';
    return {
      valid: false,
      errors: [`Failed to parse font file: ${message}`],
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get CSS fallback value for font category
 */
export function getCssFallback(category: FontCategory): string {
  switch (category) {
    case 'variable':
    case 'sans-serif':
      return 'sans-serif';
    case 'serif':
      return 'serif';
    case 'mono':
      return 'monospace';
    case 'script':
      return 'cursive';
  }
}
