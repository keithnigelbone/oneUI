/**
 * Stepper.tokens.ts
 *
 * Token manifest for the Stepper component.
 * Sizes verified against Stepper.module.css [data-size] selectors.
 *
 * Size system (from CSS, f-step tokens):
 *   S: non-condensed Spacing-7 (f4), condensed Spacing-5 (f2), icon Spacing-4 (f0)
 *   M: non-condensed Spacing-8 (f5), condensed Spacing-7 (f4), icon Spacing-5 (f2)
 *   L: non-condensed Spacing-10 (f7), condensed Spacing-8 (f5), icon Spacing-6 (f3)
 *
 * Dual intermediate variable system:
 *   appearance controls ALL tokens (context + fill)
 *   accent optionally OVERRIDES fill only
 *   attention selects high/medium/low visual weight
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Stepper component, organized by property
 */
export const STEPPER_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Container border radius (pill by default)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // HEIGHT TOKENS (non-condensed)
  // ============================================

  'height-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-7',
    description: 'Container height at size S (f4)',
    cssProperty: 'height',
  },

  'height-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'Container height at size M (f5)',
    cssProperty: 'height',
  },

  'height-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-10',
    description: 'Container height at size L (f7)',
    cssProperty: 'height',
  },

  // ============================================
  // HEIGHT TOKENS (condensed)
  // ============================================

  'height-s-condensed': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Condensed container height at size S (f2)',
    cssProperty: 'height',
  },

  'height-m-condensed': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-7',
    description: 'Condensed container height at size M (f4)',
    cssProperty: 'height',
  },

  'height-l-condensed': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'Condensed container height at size L (f5)',
    cssProperty: 'height',
  },

  // ============================================
  // ICON SIZE TOKENS
  // ============================================

  'iconSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Icon size at S (16px)',
    cssProperty: 'width',
  },

  'iconSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Icon size at M (20px)',
    cssProperty: 'width',
  },

  'iconSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'Icon size at L (24px)',
    cssProperty: 'width',
  },

  // ============================================
  // BUTTON SIZE TOKENS
  // ============================================

  'buttonSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-7',
    description: 'Button tap area width at S (= height, square)',
    cssProperty: 'width',
  },

  'buttonSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'Button tap area width at M (= height, square)',
    cssProperty: 'width',
  },

  'buttonSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-10',
    description: 'Button tap area width at L (= height, square)',
    cssProperty: 'width',
  },

  // ============================================
  // TYPOGRAPHY TOKENS
  // ============================================

  'fontSize-s': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    description: 'Value font size at S',
    cssProperty: 'font-size',
  },

  'fontSize-m': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    description: 'Value font size at M',
    cssProperty: 'font-size',
  },

  'fontSize-l': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-L-FontSize',
    description: 'Value font size at L',
    cssProperty: 'font-size',
  },

  'lineHeight-s': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-S-LineHeight',
    description: 'Value line height at S',
    cssProperty: 'line-height',
  },

  'lineHeight-m': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    description: 'Value line height at M',
    cssProperty: 'line-height',
  },

  'lineHeight-l': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-L-LineHeight',
    description: 'Value line height at L',
    cssProperty: 'line-height',
  },

  fontFamily: {
    category: 'typography',
    defaultToken: 'Typography-Font-Primary',
    description: 'Value font family',
    cssProperty: 'font-family',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-High',
    description: 'Value font weight',
    cssProperty: 'font-weight',
  },
};

/**
 * Complete Stepper token manifest
 */
export const STEPPER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Stepper',
  version: '1.0.0',
  description:
    'Numeric stepper with dual system: appearance controls all tokens, accent overrides fill at high attention. 3 sizes (S/M/L), 3 attention levels (high/medium/low), 10 appearance roles, 3 accent overrides, condensed mode.',
  tokens: STEPPER_TOKENS,
  totalTokens: Object.keys(STEPPER_TOKENS).length,
  categories: {
    shape: 1,
    spacing: 12,
    typography: 8,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getStepperTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(STEPPER_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

/**
 * Get a specific token's default value
 */
export function getStepperTokenDefault(tokenName: string): string | undefined {
  return STEPPER_TOKENS[tokenName]?.defaultToken;
}
