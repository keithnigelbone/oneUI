/**
 * tokenBoundary.ts
 *
 * Programmatic allowlist for brand CSS token injection. Prevents primitive
 * tokens (Shape, Spacing, Dimension, etc.) from being overridden by brand CSS,
 * which could break layout and spacing integrity.
 *
 * The allowlist is derived from the canonical token manifest — not hardcoded.
 * Adding a new token family to the manifest auto-updates this filter.
 *
 * Framework-agnostic — usable from server-side, CLI, or browser.
 */

import { getAllowedPrefixes } from './tokenManifest';

/**
 * Allowed CSS custom property prefixes for brand injection.
 * Derived from the canonical token manifest.
 */
export const BRAND_ALLOWED_PREFIXES: readonly string[] = getAllowedPrefixes();

/**
 * Pre-compiled RegExp for matching allowed brand token prefixes.
 * Single regex test replaces O(n) `.some()` + `.startsWith()` loop.
 * Shared across tokenBoundary and validateBrandCSS.
 */
export const BRAND_ALLOWED_REGEX = new RegExp(
  `^(${BRAND_ALLOWED_PREFIXES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`
);

/**
 * Filter CSS declarations to only those matching the brand token allowlist.
 * Drops any declaration not matching an allowed prefix and warns in dev.
 *
 * @param declarations Array of CSS declaration strings (e.g. `--Surface-Bold: #333;`)
 * @returns Filtered array with only allowed declarations
 */
export function filterBrandDeclarations(declarations: string[]): string[] {
  const filtered: string[] = [];
  const dropped: string[] = [];

  for (const decl of declarations) {
    const trimmed = decl.trim();

    // Pass through comments
    if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.endsWith('*/')) {
      filtered.push(decl);
      continue;
    }

    // Check if declaration matches an allowed prefix
    const isAllowed = BRAND_ALLOWED_REGEX.test(trimmed);

    if (isAllowed) {
      filtered.push(decl);
    } else if (trimmed.startsWith('--')) {
      dropped.push(trimmed);
    } else {
      // Non-declaration lines (empty, etc.) pass through
      filtered.push(decl);
    }
  }

  if (dropped.length > 0 && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(`[tokenBoundary] Dropped ${dropped.length} declarations not in brand allowlist:`, dropped);
  }

  return filtered;
}
