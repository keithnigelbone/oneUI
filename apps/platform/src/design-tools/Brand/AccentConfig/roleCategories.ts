/**
 * roleCategories.ts
 *
 * Categorizes appearance roles into brand accents, neutral, and semantic colors.
 * Provides split/merge helpers to translate between the flat accents array
 * (used by the engine and Convex) and the segmented editor UI.
 */

import type { AccentConfigAccent } from './AccentConfigEditor';

// ============================================================================
// Constants
// ============================================================================

/** Brand accent roles — configurable via 1-4 toggle */
export const BRAND_ACCENT_ROLES = ['primary', 'secondary', 'sparkle', 'brand-bg'] as const;
export type BrandAccentRoleId = (typeof BRAND_ACCENT_ROLES)[number];

/** Neutral role — optional override of engine auto-injection */
export const NEUTRAL_ROLE = 'neutral' as const;

/** Semantic color roles — independently toggleable */
export const SEMANTIC_ROLES = ['positive', 'negative', 'warning', 'informative'] as const;
export type SemanticRoleId = (typeof SEMANTIC_ROLES)[number];

/** Maximum total roles allowed (4 brand + 1 neutral + 4 semantic) */
export const MAX_ROLE_COUNT = 9;

/** Default base step for newly enabled roles */
export const DEFAULT_BASE_STEP = 1300;

/** Display labels for extra roles (neutral + semantic) */
export const EXTRA_ROLE_LABELS: Record<string, string> = {
  neutral: 'Neutral',
  positive: 'Positive',
  negative: 'Negative',
  warning: 'Warning',
  informative: 'Informative',
};

// ============================================================================
// Split / Merge
// ============================================================================

export interface SplitAccentsResult {
  brandAccents: AccentConfigAccent[];
  neutralAccent: AccentConfigAccent | null;
  semanticAccents: AccentConfigAccent[];
}

const BRAND_ACCENT_SET = new Set<string>(BRAND_ACCENT_ROLES);
const SEMANTIC_SET = new Set<string>(SEMANTIC_ROLES);

/**
 * Split a flat accents array into 3 categories for the editor UI.
 */
export function splitAccents(accents: AccentConfigAccent[]): SplitAccentsResult {
  const brandAccents: AccentConfigAccent[] = [];
  let neutralAccent: AccentConfigAccent | null = null;
  const semanticAccents: AccentConfigAccent[] = [];

  for (const accent of accents) {
    if (BRAND_ACCENT_SET.has(accent.role)) {
      brandAccents.push(accent);
    } else if (accent.role === NEUTRAL_ROLE) {
      neutralAccent = accent;
    } else if (SEMANTIC_SET.has(accent.role)) {
      semanticAccents.push(accent);
    }
  }

  return { brandAccents, neutralAccent, semanticAccents };
}

/**
 * Merge 3 categories back into a flat accents array.
 * Ordering: brand accents first, then neutral, then semantics (stable order).
 */
export function mergeAccents(
  brandAccents: AccentConfigAccent[],
  neutralAccent: AccentConfigAccent | null,
  semanticAccents: AccentConfigAccent[],
): AccentConfigAccent[] {
  const result: AccentConfigAccent[] = [...brandAccents];
  if (neutralAccent) result.push(neutralAccent);

  // Ensure semantic roles follow a consistent order
  for (const role of SEMANTIC_ROLES) {
    const found = semanticAccents.find(a => a.role === role);
    if (found) result.push(found);
  }

  return result;
}
