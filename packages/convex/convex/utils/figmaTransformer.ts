/**
 * figmaTransformer.ts
 *
 * Transform Figma Variables to OneUI Studio token format
 * Handles color conversion (RGBA to OkLCH), mode mapping, and category inference
 */

import type {
  FigmaVariable,
  FigmaVariableCollection,
  FigmaVariablesResponse,
  FigmaColor,
  TransformedToken,
  TransformResult,
  ModeMapping,
  FigmaVariableValue,
} from '@oneui/shared';
import { isFigmaColor, isFigmaVariableAlias } from '@oneui/shared';

// ============================================================================
// Main Transform Function
// ============================================================================

export interface TransformConfig {
  modeMappings: ModeMapping[];
  collectionFilter?: string[]; // Collection IDs to include (all if empty/undefined)
  variableFilter?: (variable: FigmaVariable) => boolean;
}

/**
 * Transform Figma variables response to OneUI Studio tokens
 */
export function transformFigmaVariables(
  response: FigmaVariablesResponse,
  config: TransformConfig
): TransformResult {
  const tokens: TransformedToken[] = [];
  const unmapped: TransformResult['unmapped'] = [];
  const warnings: string[] = [];

  const { variables, variableCollections } = response.meta;

  // Filter collections if needed
  const collectionsToProcess = Object.values(variableCollections).filter(
    (collection) => {
      if (collection.hiddenFromPublishing) {
        return false;
      }
      if (
        config.collectionFilter &&
        config.collectionFilter.length > 0 &&
        !config.collectionFilter.includes(collection.id)
      ) {
        return false;
      }
      return true;
    }
  );

  // Create mode ID to platform mode mapping
  const modeIdToPlatformMode = new Map<string, string>();
  for (const mapping of config.modeMappings) {
    modeIdToPlatformMode.set(mapping.figmaModeId, mapping.platformMode);
  }

  // Process each variable
  for (const variable of Object.values(variables)) {
    // Skip hidden variables
    if (variable.hiddenFromPublishing) {
      continue;
    }

    // Apply custom filter if provided
    if (config.variableFilter && !config.variableFilter(variable)) {
      continue;
    }

    const collection = variableCollections[variable.variableCollectionId];
    if (!collection || !collectionsToProcess.includes(collection)) {
      continue;
    }

    // Infer category from variable name/collection
    const category = inferCategory(variable, collection);
    if (!category) {
      unmapped.push({
        variable,
        reason: `Could not infer category for variable: ${variable.name}`,
      });
      continue;
    }

    // Transform value for each mode
    for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
      // Skip if no mapping for this mode
      const platformMode = modeIdToPlatformMode.get(modeId);
      if (!platformMode) {
        // Try to auto-detect mode from collection mode name
        const mode = collection.modes.find((m) => m.modeId === modeId);
        if (mode) {
          const detected = inferModeFromName(mode.name);
          if (!detected) {
            warnings.push(
              `No mode mapping for "${mode.name}" (${modeId}) in variable ${variable.name}`
            );
            continue;
          }
          // Use detected mode
          const transformedValue = transformValue(
            value,
            variable,
            category,
            variables
          );
          if (transformedValue !== null) {
            tokens.push({
              name: normalizeTokenName(variable.name),
              category,
              value: transformedValue,
              mode: detected,
              description: variable.description,
              figmaId: variable.id,
              figmaKey: variable.key,
              figmaCollectionId: collection.id,
              figmaCollectionName: collection.name,
            });
          }
        }
        continue;
      }

      // Transform the value
      const transformedValue = transformValue(
        value,
        variable,
        category,
        variables
      );
      if (transformedValue === null) {
        unmapped.push({
          variable,
          reason: `Could not transform value for mode ${modeId}`,
        });
        continue;
      }

      tokens.push({
        name: normalizeTokenName(variable.name),
        category,
        value: transformedValue,
        mode: platformMode as 'light' | 'dark',
        description: variable.description,
        figmaId: variable.id,
        figmaKey: variable.key,
        figmaCollectionId: collection.id,
        figmaCollectionName: collection.name,
      });
    }
  }

  return { tokens, unmapped, warnings };
}

// ============================================================================
// Category Inference
// ============================================================================

/**
 * Infer token category from variable name and collection
 */
function inferCategory(
  variable: FigmaVariable,
  collection: FigmaVariableCollection
): string | null {
  const name = variable.name.toLowerCase();
  const collectionName = collection.name.toLowerCase();

  // Check variable type first
  if (variable.resolvedType === 'COLOR') {
    // Determine subcategory from name
    if (name.includes('surface') || name.includes('background')) {
      return 'color/surface';
    }
    if (name.includes('text') || name.includes('foreground')) {
      return 'color/text';
    }
    if (name.includes('border') || name.includes('stroke')) {
      return 'color/border';
    }
    if (name.includes('status') || name.includes('semantic')) {
      return 'color/status';
    }
    if (name.includes('brand') || name.includes('primary') || name.includes('secondary')) {
      return 'color/brand';
    }
    return 'color';
  }

  if (variable.resolvedType === 'FLOAT') {
    // Check scopes for more context
    const scopes = variable.scopes || [];

    if (
      scopes.includes('CORNER_RADIUS') ||
      name.includes('radius') ||
      name.includes('shape')
    ) {
      return 'shape';
    }

    if (
      scopes.includes('GAP') ||
      scopes.includes('WIDTH_HEIGHT') ||
      name.includes('spacing') ||
      name.includes('gap') ||
      name.includes('padding') ||
      name.includes('margin')
    ) {
      return 'spacing';
    }

    if (
      name.includes('elevation') ||
      name.includes('shadow') ||
      scopes.includes('EFFECT_FLOAT')
    ) {
      return 'elevation';
    }

    if (
      name.includes('duration') ||
      name.includes('motion') ||
      name.includes('animation')
    ) {
      return 'motion';
    }

    if (
      scopes.includes('FONT_SIZE') ||
      scopes.includes('LINE_HEIGHT') ||
      scopes.includes('LETTER_SPACING') ||
      scopes.includes('FONT_WEIGHT') ||
      name.includes('font') ||
      name.includes('typography') ||
      name.includes('text-size') ||
      name.includes('line-height')
    ) {
      return 'typography';
    }
  }

  if (variable.resolvedType === 'STRING') {
    if (
      name.includes('font-family') ||
      name.includes('font-style') ||
      variable.scopes?.includes('FONT_FAMILY')
    ) {
      return 'typography';
    }
  }

  // Fall back to collection name
  if (collectionName.includes('color')) return 'color';
  if (collectionName.includes('spacing')) return 'spacing';
  if (collectionName.includes('typography')) return 'typography';
  if (collectionName.includes('shape') || collectionName.includes('radius'))
    return 'shape';
  if (collectionName.includes('elevation') || collectionName.includes('shadow'))
    return 'elevation';
  if (collectionName.includes('motion') || collectionName.includes('animation'))
    return 'motion';

  return null;
}

// ============================================================================
// Mode Inference
// ============================================================================

/**
 * Infer platform mode from Figma mode name
 */
export function inferModeFromName(
  modeName: string
): 'light' | 'dark' | null {
  const normalized = modeName.toLowerCase().trim();

  // Light mode patterns
  if (
    normalized === 'light' ||
    normalized === 'day' ||
    normalized === 'default' ||
    normalized.includes('light mode') ||
    normalized.includes('light theme')
  ) {
    return 'light';
  }

  // Dark mode patterns
  if (
    normalized === 'dark' ||
    normalized === 'night' ||
    normalized.includes('dark mode') ||
    normalized.includes('dark theme') ||
    normalized === 'dim' ||
    normalized.includes('dim mode') ||
    normalized.includes('branded dark') ||
    normalized.includes('dimmed')
  ) {
    return 'dark';
  }

  return null;
}

/**
 * Auto-detect mode mappings from Figma collections
 */
export function autoDetectModeMappings(
  collections: Record<string, FigmaVariableCollection>
): ModeMapping[] {
  const mappings: ModeMapping[] = [];
  const seenModeIds = new Set<string>();

  for (const collection of Object.values(collections)) {
    for (const mode of collection.modes) {
      if (seenModeIds.has(mode.modeId)) continue;

      const platformMode = inferModeFromName(mode.name);
      if (platformMode) {
        mappings.push({
          figmaModeId: mode.modeId,
          figmaModeName: mode.name,
          platformMode,
        });
        seenModeIds.add(mode.modeId);
      }
    }
  }

  return mappings;
}

// ============================================================================
// Value Transformation
// ============================================================================

/**
 * Transform a Figma variable value to a CSS-compatible string
 */
function transformValue(
  value: FigmaVariableValue,
  variable: FigmaVariable,
  category: string,
  allVariables: Record<string, FigmaVariable>
): string | null {
  // Handle variable aliases by resolving them
  if (isFigmaVariableAlias(value)) {
    const aliasedVariable = allVariables[value.id];
    if (!aliasedVariable) {
      return null;
    }
    // For aliases, return reference to the aliased token
    return `var(--${normalizeTokenName(aliasedVariable.name)})`;
  }

  // Handle colors - convert to OkLCH
  if (isFigmaColor(value)) {
    return figmaColorToOkLCH(value);
  }

  // Handle numbers based on category
  if (typeof value === 'number') {
    return formatNumber(value, variable, category);
  }

  // Handle strings
  if (typeof value === 'string') {
    return value;
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  return null;
}

/**
 * Convert Figma RGBA color (0-1 range) to OkLCH CSS format
 */
export function figmaColorToOkLCH(color: FigmaColor): string {
  const { r, g, b, a } = color;

  // Convert sRGB to linear RGB
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);

  // Convert linear RGB to XYZ
  const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
  const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB;
  const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB;

  // Convert XYZ to OkLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert OkLab to OkLCH
  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Format as CSS oklch()
  const lightness = Math.round(L * 100);
  const chroma = C.toFixed(3);
  const hue = Math.round(H);

  if (a < 1) {
    return `oklch(${lightness}% ${chroma} ${hue} / ${a.toFixed(2)})`;
  }
  return `oklch(${lightness}% ${chroma} ${hue})`;
}

/**
 * Convert sRGB value (0-1) to linear RGB
 */
function srgbToLinear(value: number): number {
  if (value <= 0.04045) {
    return value / 12.92;
  }
  return Math.pow((value + 0.055) / 1.055, 2.4);
}

/**
 * Format a number value based on category
 */
function formatNumber(
  value: number,
  variable: FigmaVariable,
  category: string
): string {
  const name = variable.name.toLowerCase();

  // Shape/radius values - use px
  if (category === 'shape') {
    // Check if it's the pill value (999 or very high)
    if (value >= 900) {
      return '999px';
    }
    return `${Math.round(value)}px`;
  }

  // Spacing values - use px
  if (category === 'spacing') {
    return `${Math.round(value)}px`;
  }

  // Typography
  if (category === 'typography') {
    // Font size in px
    if (name.includes('size') || variable.scopes?.includes('FONT_SIZE')) {
      return `${Math.round(value)}px`;
    }
    // Line height - could be ratio or px
    if (name.includes('line-height') || variable.scopes?.includes('LINE_HEIGHT')) {
      // If > 3, assume px; otherwise ratio
      return value > 3 ? `${Math.round(value)}px` : `${value}`;
    }
    // Letter spacing in em
    if (name.includes('letter') || variable.scopes?.includes('LETTER_SPACING')) {
      return `${value.toFixed(3)}em`;
    }
    // Font weight
    if (name.includes('weight') || variable.scopes?.includes('FONT_WEIGHT')) {
      return `${Math.round(value)}`;
    }
  }

  // Motion duration in ms
  if (category === 'motion') {
    return `${Math.round(value)}ms`;
  }

  // Elevation - just the number
  if (category === 'elevation') {
    return `${value}`;
  }

  // Default - return as is
  return `${value}`;
}

// ============================================================================
// Name Normalization
// ============================================================================

/**
 * Normalize Figma variable name to token name format
 * Converts "color/surface/Surface-Bold" to "Surface-Bold"
 */
function normalizeTokenName(figmaName: string): string {
  // Split by / and take the last segment
  const segments = figmaName.split('/');
  let name = segments[segments.length - 1];

  // Replace spaces with hyphens
  name = name.replace(/\s+/g, '-');

  // Capitalize first letter of each segment
  name = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-');

  return name;
}
