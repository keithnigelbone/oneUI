/**
 * Validation Utilities
 */

/**
 * Check if a value is a valid CSS custom property reference
 * @example
 * isTokenReference('var(--Surface-Bold)') // true
 * isTokenReference('#ffffff') // false
 */
export function isTokenReference(value: string): boolean {
  return /^var\(--[a-zA-Z0-9\-]+\)$/.test(value);
}

/**
 * Check if a value is a hex color (forbidden literal)
 */
export function isHexColor(value: string): boolean {
  return /#[0-9a-fA-F]{3,8}\b/.test(value);
}

/**
 * Check if a value is an RGB/RGBA color (forbidden literal)
 */
export function isRgbColor(value: string): boolean {
  return /rgba?\s*\([^)]+\)/.test(value);
}

/**
 * Check if a value is an OkLCH color in raw form (forbidden literal in CSS)
 */
export function isOkLchColor(value: string): boolean {
  return /oklch\s*\([^)]+\)/.test(value);
}

/**
 * Check if a value is a hard-coded pixel value (forbidden except 0, 999px)
 */
export function isHardCodedPixels(value: string): boolean {
  // Allow 0, 999px (pill shape), 100%
  if (/^(0|0px|100%|999px|transparent|inherit|initial|unset|currentColor)$/.test(value)) {
    return false;
  }
  return /(?<![0-9])(?!999|0)[1-9][0-9]*px\b/.test(value);
}

/**
 * Get all literals in a CSS value
 */
export function detectLiterals(value: string): string[] {
  const literals: string[] = [];

  if (isHexColor(value)) literals.push(`hex color: ${value}`);
  if (isRgbColor(value)) literals.push(`rgb color: ${value}`);
  if (isOkLchColor(value)) literals.push(`oklch color: ${value}`);
  if (isHardCodedPixels(value)) literals.push(`hard-coded pixels: ${value}`);

  return literals;
}
