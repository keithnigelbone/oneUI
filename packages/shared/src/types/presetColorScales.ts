/**
 * Preset Color Scale Types
 *
 * Types for system-wide preset color scale collections that are uploaded via JSON.
 * These scales are read-only and fixed - brands can select from them but not modify.
 */

/**
 * Valid step values for the 25-step color scale (100-2500)
 */
export const PRESET_SCALE_STEPS = [
  '100', '200', '300', '400', '500', '600', '700', '800', '900', '1000',
  '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000',
  '2100', '2200', '2300', '2400', '2500',
] as const;

export type PresetScaleStepKey = (typeof PRESET_SCALE_STEPS)[number];

/**
 * A single step value in the preset scale
 */
export interface PresetScaleStep {
  /** Step identifier (100-2500) */
  step: PresetScaleStepKey;
  /** OkLCH color value, e.g., "oklch(50% 0.18 340)" */
  oklch: string;
}

/**
 * Individual scale entry in a JSON file
 * Contains "base" key plus 25 step keys (100-2500)
 */
export interface PresetScaleJsonEntry {
  /** The base step where the primary color sits */
  base: PresetScaleStepKey;
  /** Step values (100-2500) in OkLCH format */
  [step: string]: string;
}

/**
 * Full JSON file structure for preset color scales
 * Keys are scale names (e.g., "sand", "yellow", "gold")
 */
export interface PresetScaleJsonFile {
  [scaleName: string]: PresetScaleJsonEntry;
}

/**
 * Parsed preset scale (after JSON validation)
 */
export interface PresetColorScale {
  /** Scale name, e.g., "sand", "yellow", "red" */
  name: string;
  /** The base step identifier */
  baseStep: PresetScaleStepKey;
  /** All 25 steps with their OkLCH values */
  steps: PresetScaleStep[];
}

/**
 * Preset color scale collection metadata
 */
export interface PresetColorScaleCollection {
  /** Collection name, e.g., "Jio Default", "Material Design" */
  name: string;
  /** Optional description */
  description?: string;
  /** Version string, e.g., "v1010" */
  version: string;
  /** Whether this is the default collection */
  isDefault: boolean;
  /** All scales in this collection */
  scales: PresetColorScale[];
}

/**
 * Brand's selection of preset scales
 */
export interface BrandPresetScaleSelection {
  /** The selected collection ID */
  collectionId: string;
  /** Names of selected scales from the collection */
  selectedScaleNames: string[];
}

/**
 * Validation result for JSON upload
 */
export interface PresetScaleValidationResult {
  /** Whether the JSON is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** Preview data if valid */
  preview?: Array<{
    name: string;
    baseStep: string;
    stepCount: number;
    baseColor: string;
  }>;
}

/**
 * Parse an OkLCH string to extract lightness, chroma, and hue
 */
export function parseOklchString(oklch: string): {
  lightness: number;
  chroma: number;
  hue: number;
} | null {
  // Match patterns like "oklch(50% 0.18 340)" or "oklch(50.5% 0.1234 340.5)"
  const match = oklch.match(
    /oklch\((\d+(?:\.\d+)?)[%\s]+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/
  );

  if (!match) return null;

  return {
    lightness: parseFloat(match[1]),
    chroma: parseFloat(match[2]),
    hue: parseFloat(match[3]),
  };
}

/**
 * Validate a single OkLCH value string
 */
export function isValidOklchString(value: string): boolean {
  return /^oklch\(\d+(?:\.\d+)?%?\s+\d+(?:\.\d+)?\s+\d+(?:\.\d+)?\)$/.test(value);
}

/**
 * Validate a preset scale JSON structure (client-side validation)
 */
export function validatePresetScaleJson(json: unknown): PresetScaleValidationResult {
  const errors: string[] = [];

  if (typeof json !== 'object' || json === null) {
    return { valid: false, errors: ['Invalid JSON: expected an object'] };
  }

  const data = json as Record<string, unknown>;
  const preview: Array<{
    name: string;
    baseStep: string;
    stepCount: number;
    baseColor: string;
  }> = [];

  for (const [scaleName, scaleData] of Object.entries(data)) {
    if (typeof scaleData !== 'object' || scaleData === null) {
      errors.push(`Scale "${scaleName}": expected an object`);
      continue;
    }

    const scale = scaleData as Record<string, unknown>;

    // Check for base property
    if (!('base' in scale)) {
      errors.push(`Scale "${scaleName}": missing "base" property`);
    } else if (typeof scale.base !== 'string') {
      errors.push(`Scale "${scaleName}": "base" must be a string`);
    } else if (!PRESET_SCALE_STEPS.includes(scale.base as PresetScaleStepKey)) {
      errors.push(
        `Scale "${scaleName}": invalid base step "${scale.base}". Must be one of: ${PRESET_SCALE_STEPS.join(', ')}`
      );
    }

    // Check for all 25 steps
    let stepCount = 0;
    for (const step of PRESET_SCALE_STEPS) {
      if (!(step in scale)) {
        errors.push(`Scale "${scaleName}": missing step "${step}"`);
      } else if (typeof scale[step] !== 'string') {
        errors.push(`Scale "${scaleName}": step "${step}" must be a string`);
      } else {
        // Validate oklch format
        const oklchValue = scale[step] as string;
        if (!oklchValue.startsWith('oklch(') || !oklchValue.endsWith(')')) {
          errors.push(
            `Scale "${scaleName}": step "${step}" must be in oklch() format, got "${oklchValue}"`
          );
        } else {
          stepCount++;
        }
      }
    }

    // Add to preview if valid so far
    if (errors.filter(e => e.startsWith(`Scale "${scaleName}"`)).length === 0) {
      const baseStep = scale.base as string;
      const baseColor = scale[baseStep] as string;
      preview.push({
        name: scaleName,
        baseStep,
        stepCount,
        baseColor,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    preview: errors.length === 0 ? preview : undefined,
  };
}

/**
 * Convert a preset scale to the GeneratedColorScale format used in the app
 */
export function presetScaleToAppFormat(preset: PresetColorScale) {
  const parsed = parseOklchString(preset.steps.find(s => s.step === preset.baseStep)?.oklch || '');

  return {
    name: preset.name,
    baseStep: parseInt(preset.baseStep, 10),
    steps: preset.steps.map(s => ({
      step: parseInt(s.step, 10),
      oklch: s.oklch,
      ...(parseOklchString(s.oklch) || { lightness: 0, chroma: 0, hue: 0 }),
    })),
    baseChroma: parsed?.chroma ?? 0,
    baseHue: parsed?.hue ?? 0,
    baseLightness: parsed?.lightness ?? 50,
  };
}
