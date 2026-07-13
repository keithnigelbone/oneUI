/**
 * spacing-aliases.ts
 *
 * Numeric spacing → dimension f-step mapping.
 * Single source of truth for the Spacing-* → Dimension-f* alias chain.
 *
 * Used to generate scoped CSS rules that re-declare spacing tokens
 * so that inline --Dimension-f* overrides (from platform toolbar) propagate
 * through spacing tokens. Without this, spacing inherits already-resolved
 * values from :root and ignores local dimension overrides.
 *
 * Spacing aliases never shift by density. Density changes the resolved
 * `--Dimension-f*` values through `[data-Breakpoint][data-6-Density]`.
 */

import { NEGATIVE_SPACING_TOKENS } from './dimension-scales';

/**
 * Canonical numeric spacing token names ordered from smallest to largest.
 * Each entry maps to a dimension f-step via its index offset.
 */
export const SPACING_SIZES = [
  '0', '0-5', '1', '1-5', '2', '2-5', '3', '3-5',
  '4', '4-5', '5', '5-5', '6', '7', '8', '9',
  '10', '12', '14', '16', '18', '20', '24', '28', '32', '40',
] as const;

export const NEGATIVE_SPACING_SIZES = NEGATIVE_SPACING_TOKENS.map((token) =>
  token.replace('.', '-')
) as Array<(typeof SPACING_SIZES)[number]>;

const NUMERIC_SPACING_BASE_STEPS: Record<(typeof SPACING_SIZES)[number], number | 'f2-5'> = {
  '0': -8,
  '0-5': -7,
  '1': -6,
  '1-5': -5,
  '2': -4,
  '2-5': -3,
  '3': -2,
  '3-5': -1,
  '4': 0,
  '4-5': 1,
  '5': 2,
  '5-5': 'f2-5',
  '6': 3,
  '7': 4,
  '8': 5,
  '9': 6,
  '10': 7,
  '12': 8,
  '14': 9,
  '16': 10,
  '18': 11,
  '20': 12,
  '24': 13,
  '28': 14,
  '32': 15,
  '40': 16,
};

const MIN_F_STEP = -8;
const MAX_F_STEP = 16;

/**
 * Deprecated compatibility export.
 *
 * Older preview code shifted spacing aliases per density. ColourTool/platform
 * parity keeps spacing aliases stable and changes only the dimension values.
 */
export const DENSITY_SHIFTS: Record<string, number> = {
  compact: 0,
  default: 0,
  open: 0,
};

/**
 * Generate spacing alias CSS declarations for a given density.
 *
 * @param density - 'default' | 'compact' | 'open'
 * @returns Array of CSS declaration strings (without selector/braces)
 */
export function generateSpacingAliases(density: 'default' | 'compact' | 'open' = 'default'): string[] {
  const shift = DENSITY_SHIFTS[density] ?? 0;

  const declarations = SPACING_SIZES.map((size) => {
    const baseStep = NUMERIC_SPACING_BASE_STEPS[size];
    if (baseStep === 'f2-5') {
      return `--Spacing-${size}: var(--Dimension-f2-5);`;
    }
    if (size === '0') {
      return '--Spacing-0: var(--Dimension-f-8);';
    }
    const fStep = baseStep + shift;
    const clampedFStep = Math.max(MIN_F_STEP, Math.min(MAX_F_STEP, fStep));
    return `--Spacing-${size}: var(--Dimension-f${clampedFStep});`;
  });

  return [
    ...declarations,
    ...NEGATIVE_SPACING_SIZES.map((size) =>
      `--Spacing-Negative-${size}: calc(var(--Spacing-${size}) * -1);`
    ),
    '--Spacing-Margin: var(--Grid-Margin);',
    '--Spacing-Gutter: var(--Grid-Gutter);',
  ];
}

/**
 * Generate a complete CSS rule block for a scoped selector with spacing aliases.
 *
 * @param selector - CSS selector (e.g., '.platform-scope')
 * @param density - Density mode
 * @returns Complete CSS rule string
 */
export function generateSpacingAliasBlock(selector: string, density: 'default' | 'compact' | 'open' = 'default'): string {
  const declarations = generateSpacingAliases(density);
  return `${selector} {\n  ${declarations.join('\n  ')}\n}`;
}
