/**
 * typography-roles.ts
 *
 * Relational typography system — role definitions, default f-step assignments,
 * line height offsets, and font weight mappings.
 *
 * Typography sizes are CSS aliases to dimension f-step variables:
 *   --Display-L-FontSize: var(--Dimension-f7)
 *
 * When platform/density/dimension values change, typography automatically cascades.
 *
 * Source of truth for all typography role→f-step mappings.
 */

import type { FStep, BreakpointGroup } from './dimension-scales';

// ============================================================================
// Role & Size Definitions
// ============================================================================

export const TYPOGRAPHY_ROLES = ['display', 'headline', 'title', 'body', 'label', 'code'] as const;
export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];

export const TYPOGRAPHY_SIZES = {
  display: ['L', 'M', 'S'] as const,
  headline: ['L', 'M', 'S'] as const,
  title: ['L', 'M', 'S'] as const,
  body: ['L', 'M', 'S', 'XS', '2XS'] as const,
  label: ['L', 'M', 'S', 'XS', '2XS', '3XS'] as const,
  code: ['M', 'S', 'XS', '2XS', '3XS'] as const,
} as const;

export type TypographySizeMap = typeof TYPOGRAPHY_SIZES;
export type DisplaySize = TypographySizeMap['display'][number];
export type HeadlineSize = TypographySizeMap['headline'][number];
export type TitleSize = TypographySizeMap['title'][number];
export type BodySize = TypographySizeMap['body'][number];
export type LabelSize = TypographySizeMap['label'][number];
export type CodeSize = TypographySizeMap['code'][number];

/** Total: 25 typography size tokens (display 3 + headline 3 + title 3 + body 5 + label 6 + code 5) */
export const TYPOGRAPHY_SIZE_COUNT = Object.values(TYPOGRAPHY_SIZES).reduce(
  (sum, sizes) => sum + sizes.length, 0
);

// ============================================================================
// Default F-Step Assignments (Jio brand)
// ============================================================================

/**
 * Default role→f-step mapping. Each size maps to a dimension f-step.
 * Display and Headline are brand-customizable (any 3 f-steps each).
 * Title, Body, Label, Code are fixed system assignments.
 */
/**
 * Base (S / M breakpoint-group) f-step per role/size. Display and Headline step
 * UP at the L group via {@link L_GROUP_FSTEP_DELTA}; the other roles are flat
 * across all breakpoint groups. Values mirror the Figma text styles
 * (canonical OneUIColourTool `SIZES` map, S/M column).
 */
export const DEFAULT_FSTEP_ASSIGNMENTS: Record<TypographyRole, Record<string, FStep>> = {
  display: { L: 'f7', M: 'f6', S: 'f5' },
  // Headline base (S/M): L=#7/f4, M=#5/f2, S=#4/f0 — matches Figma text styles.
  headline: { L: 'f4', M: 'f2', S: 'f0' },
  title: { L: 'f2', M: 'f0', S: 'f-2' },
  body: { L: 'f1', M: 'f0', S: 'f-1', XS: 'f-2', '2XS': 'f-3' },
  label: { L: 'f1', M: 'f0', S: 'f-1', XS: 'f-2', '2XS': 'f-3', '3XS': 'f-4' },
  code: { M: 'f0', S: 'f-1', XS: 'f-2', '2XS': 'f-3', '3XS': 'f-4' },
};

// ============================================================================
// Breakpoint-Group Bump (Display & Headline grow on large screens)
// ============================================================================

/**
 * Per-size f-step delta applied at the **L breakpoint group** (viewport ≥ 991px).
 * Only Display and Headline step up; Title/Body/Label/Code are flat across groups.
 * Mirrors the Figma text styles: L-size +2 steps, M-size +1 step, S-size flat.
 *
 *   Display-L #10→#14 (f7→f9) · Display-M #9→#10 (f6→f7)
 *   Headline-L #7→#9 (f4→f6) · Headline-M #5→#6 (f2→f3)
 */
export const L_GROUP_FSTEP_DELTA: Partial<Record<TypographyRole, Record<string, number>>> = {
  display: { L: 2, M: 1, S: 0 },
  headline: { L: 2, M: 1, S: 0 },
};

/** Roles whose sizes step up at the L breakpoint group. */
export const BREAKPOINT_BUMP_ROLES = ['display', 'headline'] as const;

/**
 * Shift an f-step by `delta` integer steps (e.g. `f7` + 2 → `f9`). Operates on
 * the integer f-step ladder and never lands on the half-step `f2-5`; clamps to
 * the valid range.
 */
export function shiftFStep(fStep: FStep, delta: number): FStep {
  if (!delta) return fStep;
  const n = Math.round(parseFStepNumber(fStep)) + delta;
  const clamped = Math.max(-8, Math.min(16, n));
  return `f${clamped}` as FStep;
}

/**
 * Resolve the effective f-step for a role/size at a given breakpoint group,
 * applying the L-group bump for Display/Headline. `baseFStep` is the S/M-group
 * assignment (default or brand-customized).
 */
export function applyBreakpointGroupBump(
  role: TypographyRole,
  size: string,
  baseFStep: FStep,
  group: BreakpointGroup,
): FStep {
  if (group !== 'L') return baseFStep;
  const delta = L_GROUP_FSTEP_DELTA[role]?.[size] ?? 0;
  return shiftFStep(baseFStep, delta);
}

// ============================================================================
// Line Height Offsets
// ============================================================================

/**
 * Default line height offsets per role (Jio brand).
 * Line height = var(--Dimension-f{fontSize_fStep + offset}).
 *
 * Brand-customizable: brands can override these offsets to tune vertical rhythm.
 */
export const DEFAULT_LINE_HEIGHT_OFFSETS: Record<TypographyRole, number> = {
  display: 0,
  headline: 0,
  title: 1,
  body: 3,
  label: 0,
  code: 2,
};

// ============================================================================
// Font Weights
// ============================================================================

/**
 * Per-role font weights.
 *
 * Display/Headline/Title have fixed weights per size.
 * Body/Label/Code use an emphasis system: high=700, medium=500, low=400.
 */
export const FONT_WEIGHTS = {
  display: { L: 900, M: 900, S: 900 },
  headline: { L: 900, M: 900, S: 850 },
  title: { L: 800, M: 800, S: 750 },
  body: { high: 700, medium: 500, low: 400 },
  label: { high: 700, medium: 500, low: 400 },
  code: { high: 700, medium: 500, low: 400 },
} as const;

/** Roles that have per-size fixed weights (not emphasis-based) */
export const FIXED_WEIGHT_ROLES = ['display', 'headline', 'title'] as const;
export type FixedWeightRole = (typeof FIXED_WEIGHT_ROLES)[number];

/** Roles that use emphasis-based weights */
export const EMPHASIS_WEIGHT_ROLES = ['body', 'label', 'code'] as const;
export type EmphasisWeightRole = (typeof EMPHASIS_WEIGHT_ROLES)[number];

export const EMPHASIS_LEVELS = ['high', 'medium', 'low'] as const;
export type EmphasisLevel = (typeof EMPHASIS_LEVELS)[number];

// ============================================================================
// Optical Sizing
// ============================================================================

/**
 * Role/size combinations that previously used font-optical-sizing: auto.
 * @deprecated The token system supersedes this list. All 25 sizes now read
 * `var(--{Role}-FontOpticalSizing, auto)` — optical sizing is active by default
 * everywhere and configurable per-brand via the typography foundations editor.
 * This export is kept for external callers; do not add new entries here.
 */
export const OPTICAL_SIZING_ENTRIES: Array<{ role: TypographyRole; size: string }> = [
  { role: 'headline', size: 'S' },
  { role: 'title', size: 'S' },
];

// ============================================================================
// Font Slots
// ============================================================================

export const FONT_SLOTS = ['primary', 'secondary', 'script', 'code'] as const;
export type FontSlot = (typeof FONT_SLOTS)[number];

/** Default font families per slot */
export const DEFAULT_FONT_FAMILIES: Record<FontSlot, string> = {
  primary: 'JioType Var',
  secondary: 'Noto Sans',
  script: 'Noto Sans',
  code: 'JetBrains Mono',
};

/** Font slot → typography role mapping */
export const FONT_SLOT_ROLES: Record<FontSlot, TypographyRole[]> = {
  primary: ['display', 'headline', 'title', 'label', 'body'],
  secondary: ['display', 'headline', 'title', 'label', 'body'],
  script: ['display', 'headline', 'title', 'label', 'body'],
  code: ['code'],
};

// ============================================================================
// Brand-Customizable Roles
// ============================================================================

/**
 * Roles whose f-step assignments are brand-customizable (freeform any 3 f-steps).
 * All roles are brand-customizable — display and headline historically were first,
 * but title, body, label, and code f-step assignments are now fully overridable
 * so that components (Button, body text, section headings) respond to the type
 * scale pipeline.
 */
export const BRAND_CUSTOMIZABLE_ROLES = ['display', 'headline', 'title', 'body', 'label', 'code'] as const;
export type BrandCustomizableRole = (typeof BRAND_CUSTOMIZABLE_ROLES)[number];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse an f-step string to its numeric value.
 * e.g., 'f7' → 7, 'f-2' → -2, 'f2-5' → 2.5 (the appended half-step rung).
 */
export function parseFStepNumber(fStep: FStep): number {
  if (fStep === 'f2-5') return 2.5;
  return parseInt(fStep.replace('f', ''), 10);
}

/**
 * Compute the line height f-step given a font size f-step and an offset.
 * Clamps to the valid f-step range (f-8 to f16).
 *
 * The only non-integer rung is `f2-5` (2.5). A `2.5` result maps straight back
 * to `f2-5`; any other fractional result (an `f2-5` font size combined with an
 * integer offset, e.g. body offset 3 → 5.5) is rounded half-up to the nearest
 * integer f-step, since no other half-steps exist. Integer inputs (every
 * default assignment) are unaffected.
 */
export function computeLineHeightFStep(fontSizeFStep: FStep, offset: number): FStep {
  const n = parseFStepNumber(fontSizeFStep) + offset;
  const clamped = Math.max(-8, Math.min(16, n));
  if (clamped === 2.5) return 'f2-5';
  return `f${Math.round(clamped)}` as FStep;
}

/**
 * Get the CSS variable name for a dimension f-step.
 */
export function fStepToDimensionVar(fStep: FStep): string {
  return `var(--Dimension-${fStep})`;
}

/**
 * Get the font weight for a fixed-weight role and size.
 */
export function getFixedWeight(role: FixedWeightRole, size: string): number {
  const weights = FONT_WEIGHTS[role] as Record<string, number>;
  return weights[size] ?? 400;
}

/**
 * Get the font weight for an emphasis-based role and emphasis level.
 */
export function getEmphasisWeight(role: EmphasisWeightRole, emphasis: EmphasisLevel): number {
  return FONT_WEIGHTS[role][emphasis];
}

/** Precomputed set for O(1) optical sizing lookup. */
const OPTICAL_SIZING_SET = new Set(
  OPTICAL_SIZING_ENTRIES.map(e => `${e.role}:${e.size}`)
);

/**
 * Check if a role/size combination uses optical sizing.
 */
export function usesOpticalSizing(role: TypographyRole, size: string): boolean {
  return OPTICAL_SIZING_SET.has(`${role}:${size}`);
}

/**
 * Generate the CSS token name for a typography size.
 * e.g., ('display', 'L') → 'Display-L'
 */
export function typographyTokenName(role: TypographyRole, size: string): string {
  return `${role.charAt(0).toUpperCase() + role.slice(1)}-${size}`;
}

/**
 * Get all typography token entries as flat array.
 * Useful for iterating over all 25 sizes.
 */
export function getAllTypographyEntries(): Array<{
  role: TypographyRole;
  size: string;
  tokenName: string;
  fStep: FStep;
  lineHeightFStep: FStep;
}> {
  const entries: Array<{
    role: TypographyRole;
    size: string;
    tokenName: string;
    fStep: FStep;
    lineHeightFStep: FStep;
  }> = [];

  for (const role of TYPOGRAPHY_ROLES) {
    const sizes = TYPOGRAPHY_SIZES[role];
    const assignments = DEFAULT_FSTEP_ASSIGNMENTS[role];
    const lhOffset = DEFAULT_LINE_HEIGHT_OFFSETS[role];

    for (const size of sizes) {
      const fStep = assignments[size];
      entries.push({
        role,
        size,
        tokenName: typographyTokenName(role, size),
        fStep,
        lineHeightFStep: computeLineHeightFStep(fStep, lhOffset),
      });
    }
  }

  return entries;
}
