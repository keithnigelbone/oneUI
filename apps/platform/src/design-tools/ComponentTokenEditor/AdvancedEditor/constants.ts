/**
 * constants.ts
 *
 * Shared constants for the EditorPropertyPanel and its sub-components.
 */

import type { TokenCategory } from '@oneui/shared';

/** Category display order */
export const CATEGORY_ORDER: TokenCategory[] = [
  'color',
  'spacing',
  'shape',
  'stroke',
  'typography',
  'elevation',
  'motion',
  'accessibility',
  'decoration',
];

/** Category display labels */
export const CATEGORY_LABELS: Record<TokenCategory, string> = {
  color: 'Color',
  spacing: 'Spacing',
  shape: 'Shape',
  stroke: 'Stroke',
  typography: 'Typography',
  elevation: 'Elevation',
  motion: 'Motion',
  accessibility: 'Accessibility',
  decoration: 'Decoration',
  other: 'Other',
};

/** Variant labels for display (internal variant names) */
export const VARIANT_LABELS: Record<string, string> = {
  bold: 'Bold',
  subtle: 'Subtle',
  ghost: 'Ghost',
};

/** Attention labels — Figma API terminology (maps to internal variants) */
export const ATTENTION_LABELS: Record<string, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

/** Reverse mapping: attention label → variant */
export const ATTENTION_TO_VARIANT: Record<string, string> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

// deriveSizeLabels moved to @oneui/shared/meta so library Preview components
// can share a single implementation with the studio token editor.
export { deriveSizeLabels } from '@oneui/shared/meta';

/**
 * @deprecated Use `deriveSizeLabels(manifest.tokens)` instead for single source of truth.
 * Kept as fallback for components that don't yet receive the manifest.
 */
export const SIZE_LABELS: Record<string, string> = {
  '8': 'S',
  '10': 'M',
  '12': 'L',
};

/**
 * Determine if a category should use two-column layout.
 * Color, shape, stroke, elevation, and accessibility use single-column.
 */
export function isTwoColumn(category: TokenCategory): boolean {
  return (
    category !== 'color' &&
    category !== 'shape' &&
    category !== 'stroke' &&
    category !== 'accessibility' &&
    category !== 'elevation'
  );
}

/** Default collapsed state: all open except accessibility */
export function defaultCollapsedState(category: TokenCategory): boolean {
  return category !== 'accessibility';
}

/** Helper to capitalize first letter */
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Determine what scope a token requires before it can be edited.
 * Tokens with `sizes` need a specific size selected; tokens with `variants` need a variant.
 */
export function getTokenScopeRequirement(
  definition: { sizes?: Record<string, string>; variants?: Record<string, string> }
): 'size' | 'variant' | 'both' | 'none' {
  const needsSize = !!definition.sizes && Object.keys(definition.sizes).length > 0;
  const needsVariant = !!definition.variants && Object.keys(definition.variants).length > 0;
  if (needsSize && needsVariant) return 'both';
  if (needsSize) return 'size';
  if (needsVariant) return 'variant';
  return 'none';
}

/**
 * Check if a token is editable given the current canvas selection.
 * Returns true if the required scope (variant/size) is selected.
 *
 * The editor is built around the design-system sizing cascade: tokens with
 * `sizes` (S/M/L) or `variants` (attention high/medium/low) are edited in
 * the context of a specific selection so the override lands on the right
 * bucket instead of flattening every size to one value. Keeping the gate
 * protects the cascade — users pick a scope, then edit.
 */
export function isTokenEditableForSelection(
  definition: { sizes?: Record<string, string>; variants?: Record<string, string> },
  selectedVariant?: string,
  selectedSize?: string
): boolean {
  const scope = getTokenScopeRequirement(definition);
  if (scope === 'none') return true;

  const hasVariant = !!selectedVariant && selectedVariant !== 'all';
  const hasSize = !!selectedSize && selectedSize !== 'all';

  if (scope === 'both') return hasVariant && hasSize;
  if (scope === 'variant') return hasVariant;
  if (scope === 'size') return hasSize;
  return true;
}

/**
 * Get the lock message explaining why a token can't be edited,
 * or null if the token is editable.
 */
export function getScopeLockMessage(
  definition: { sizes?: Record<string, string>; variants?: Record<string, string> },
  selectedVariant?: string,
  selectedSize?: string
): string | null {
  if (isTokenEditableForSelection(definition, selectedVariant, selectedSize)) return null;

  const scope = getTokenScopeRequirement(definition);
  const hasVariant = !!selectedVariant && selectedVariant !== 'all';
  const hasSize = !!selectedSize && selectedSize !== 'all';

  if (scope === 'both') {
    if (!hasVariant && !hasSize) return 'Select an attention level and size on the canvas';
    if (!hasVariant) return 'Select an attention level on the canvas';
    return 'Select a size on the canvas';
  }
  if (scope === 'variant') return 'Select an attention level on the canvas';
  if (scope === 'size') return 'Select a size on the canvas';
  return null;
}
