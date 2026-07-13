/**
 * validateBrandCSS.ts
 *
 * Validates generated brand CSS before injection. Performs:
 * 1. Required token presence check
 * 2. CSS value validity (no empty values, valid color/number formats)
 * 3. Duplicate declaration detection
 * 4. Token interdependency validation (paired tokens must co-exist)
 *
 * Framework-agnostic — usable from server-side, CLI, or browser.
 */

import type { BrandCSSValidation, SurfaceContextCSSValidation } from './types';
import { BRAND_ALLOWED_REGEX } from './tokenBoundary';

// ============================================================================
// Required tokens — brand CSS must contain all of these
// ============================================================================

const REQUIRED_TOKENS = [
  '--Surface-Default',
  '--Surface-Bold',
  '--Text-High',
  '--Text-OnBold-High',
];

// ============================================================================
// Interdependency rules — if token A exists, token B must also exist
// ============================================================================

const INTERDEPENDENCY_RULES: Array<{ ifPresent: string; requires: string; reason: string }> = [
  { ifPresent: '--Surface-Bold', requires: '--Text-OnBold-High', reason: 'Bold surfaces need on-bold text for contrast' },
  { ifPresent: '--Primary-Bold', requires: '--Primary-Bold-High', reason: 'Bold surface needs on-bold text token' },
  { ifPresent: '--Secondary-Bold', requires: '--Secondary-Bold-High', reason: 'Bold surface needs on-bold text token' },
  { ifPresent: '--Neutral-Bold', requires: '--Neutral-Bold-High', reason: 'Bold surface needs on-bold text token' },
];

// ============================================================================
// CSS value validation patterns
// ============================================================================

/** Patterns that match valid CSS custom property values */
const VALID_VALUE_PATTERNS = [
  /^#[0-9a-fA-F]{3,8}$/,                          // Hex color
  /^rgb(a)?\(.+\)$/,                               // rgb/rgba
  /^oklch\(.+\)$/,                                 // oklch
  /^hsl(a)?\(.+\)$/,                               // hsl/hsla
  /^var\(--[\w-]+/,                                 // CSS variable reference
  /^calc\(.+\)$/,                                  // calc() expressions (ornament widths, etc.)
  /^url\(.+\)$/,                                   // url() values (ornament SVG data URIs, etc.)
  /^-?\d+(\.\d+)?(px|rem|em|%|vw|vh|ms|s|deg)?$/,  // Numeric with optional unit
  /^[a-zA-Z'"][\w\s,'"-]*/,                          // Font names, keywords, etc.
  /^transparent$/,                                  // Transparent keyword
  /^inherit|initial|unset|revert$/,                 // CSS global keywords
  /^none$/,                                         // None keyword
];

// ============================================================================
// Core validation function
// ============================================================================

/**
 * Parse a CSS declaration string into property name and value.
 * Returns null for non-declaration lines (comments, empty, etc.)
 */
function parseDeclaration(line: string): { property: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) {
    return null;
  }

  const colonIdx = trimmed.indexOf(':');
  if (colonIdx === -1) return null;

  const property = trimmed.substring(0, colonIdx).trim();
  if (!property.startsWith('--')) return null;

  let value = trimmed.substring(colonIdx + 1).trim();
  // Remove trailing semicolon
  if (value.endsWith(';')) value = value.slice(0, -1).trim();

  return { property, value };
}

/**
 * Check if a CSS value is structurally valid.
 */
function isValidCSSValue(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  return VALID_VALUE_PATTERNS.some(pattern => pattern.test(value.trim()));
}

/**
 * Validate that brand CSS is structurally sound before injection.
 *
 * Checks:
 * 1. Required tokens are present
 * 2. No empty or malformed values
 * 3. No duplicate declarations (same property twice)
 * 4. Token interdependencies are satisfied
 */
export function validateBrandCSS(css: string): BrandCSSValidation {
  if (!css || css.trim().length === 0) {
    return {
      valid: false,
      missing: [...REQUIRED_TOKENS],
      tokenCount: 0,
      duplicates: [],
      invalidValues: [],
      interdependencyViolations: [],
      warnings: [],
      cssSize: 0,
    };
  }

  const lines = css.split('\n');
  const seenProperties = new Map<string, number>(); // property → count
  const duplicates: string[] = [];
  const invalidValues: string[] = [];

  // Parse all declarations
  for (const line of lines) {
    const parsed = parseDeclaration(line);
    if (!parsed) continue;

    // Track duplicates
    const count = (seenProperties.get(parsed.property) ?? 0) + 1;
    seenProperties.set(parsed.property, count);
    if (count === 2) {
      duplicates.push(parsed.property);
    }

    // Validate value format
    if (!isValidCSSValue(parsed.value)) {
      invalidValues.push(`${parsed.property}: ${parsed.value}`);
    }
  }

  const tokenCount = seenProperties.size;

  // Check required tokens
  const missing: string[] = [];
  for (const token of REQUIRED_TOKENS) {
    if (!seenProperties.has(token)) {
      missing.push(token);
    }
  }

  // Check interdependencies
  const interdependencyViolations: string[] = [];
  for (const rule of INTERDEPENDENCY_RULES) {
    if (seenProperties.has(rule.ifPresent) && !seenProperties.has(rule.requires)) {
      interdependencyViolations.push(`${rule.ifPresent} present but missing ${rule.requires}: ${rule.reason}`);
    }
  }

  const valid = missing.length === 0
    && tokenCount > 0
    && invalidValues.length === 0
    && interdependencyViolations.length === 0;

  // Soft limits — warnings only, do not affect validity
  const warnings: string[] = [];
  const cssSize = css.length;

  if (cssSize > 50 * 1024) {
    warnings.push(`CSS size (${(cssSize / 1024).toFixed(1)}KB) exceeds recommended limit of 50KB`);
  }

  if (tokenCount > 800) {
    warnings.push(`Token count (${tokenCount}) exceeds recommended limit of 800`);
  }

  return {
    valid,
    missing,
    tokenCount,
    duplicates,
    invalidValues,
    interdependencyViolations,
    warnings,
    cssSize,
  };
}

// ============================================================================
// Lightweight signature validation — hot-path runtime gate
// ============================================================================

/**
 * Fast signature check for runtime use. Trades thoroughness for speed:
 *   - does the string have any content?
 *   - are the four REQUIRED_TOKENS present (indexOf, no parse)?
 *
 * Operates on the RAW CSS produced by the engine — before `wrapCSSForInjection`
 * adds the `:root { ... }` wrapper — so this function must not require any
 * wrapping structure. It only verifies that the token payload is complete.
 *
 * Full structural validation (`validateBrandCSS`) is moved to precompute +
 * CI + dev-mode paths. Production hot path calls this instead to keep
 * `useBrandCSS` under its <5ms p95 envelope. Runs in O(css.length) and
 * allocates no arrays.
 */
export interface BrandCSSSignatureResult {
  valid: boolean;
  /** Populated only when invalid. One of: 'empty' | 'missing-token'. */
  reason?: 'empty' | 'missing-token';
  /** When reason === 'missing-token', names the first missing required token. */
  missingToken?: string;
}

export function validateBrandCSSSignature(css: string): BrandCSSSignatureResult {
  if (!css || css.length === 0) {
    return { valid: false, reason: 'empty' };
  }
  for (const token of REQUIRED_TOKENS) {
    if (css.indexOf(token) === -1) {
      return { valid: false, reason: 'missing-token', missingToken: token };
    }
  }
  return { valid: true };
}

// ============================================================================
// Surface Context CSS Validation
// ============================================================================

/** Soft limits for surface context CSS (separate from root CSS limits) */
const SURFACE_CONTEXT_TOKEN_LIMIT = 1500;
const SURFACE_CONTEXT_SIZE_LIMIT = 80 * 1024; // 80KB

/**
 * Lightweight validation for surface context CSS blocks.
 *
 * Differences from root CSS validation:
 * - No required token checks (surface context is an enhancement)
 * - No duplicate checks (re-declarations across modes are by design)
 * - Separate, lower soft limits (300 tokens, 20KB)
 * - Token boundary allowlist check (same as root)
 */
export function validateSurfaceContextCSS(css: string): SurfaceContextCSSValidation {
  if (!css || css.trim().length === 0) {
    return { valid: true, tokenCount: 0, cssSize: 0, warnings: [], disallowedTokens: [] };
  }

  const warnings: string[] = [];
  const disallowedTokens: string[] = [];
  let tokenCount = 0;

  const lines = css.split('\n');
  for (const line of lines) {
    const parsed = parseDeclaration(line);
    if (!parsed) continue;
    tokenCount++;

    // Token boundary check
    if (!BRAND_ALLOWED_REGEX.test(parsed.property)) {
      disallowedTokens.push(parsed.property);
    }
  }

  const cssSize = css.length;

  if (cssSize > SURFACE_CONTEXT_SIZE_LIMIT) {
    warnings.push(`Surface context CSS size (${(cssSize / 1024).toFixed(1)}KB) exceeds recommended limit of 20KB`);
  }

  if (tokenCount > SURFACE_CONTEXT_TOKEN_LIMIT) {
    warnings.push(`Surface context token count (${tokenCount}) exceeds recommended limit of ${SURFACE_CONTEXT_TOKEN_LIMIT}`);
  }

  const valid = disallowedTokens.length === 0;

  return { valid, tokenCount, cssSize, warnings, disallowedTokens };
}
