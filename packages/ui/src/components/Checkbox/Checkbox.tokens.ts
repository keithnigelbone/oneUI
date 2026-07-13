/**
 * Checkbox.tokens.ts
 *
 * Token manifest for the Checkbox component.
 * Sizes verified against Checkbox.module.css [data-size] selectors.
 *
 * Size system (from CSS):
 *   S: box=Spacing-4(16px), icon=Spacing-3(12px), shape=Shape-1(4px)
 *   M: box=Spacing-5(20px), icon=Spacing-4(16px), shape=Shape-1-5(6px)
 *   L: box=Spacing-6(24px), icon=Spacing-4-5(18px), shape=Shape-2(8px)
 *
 * `appearance` maps to role tokens for border, hover, and fill (including checked state).
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Checkbox component, organized by property
 */
export const CHECKBOX_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-1-5',
    description: 'Default border radius for the checkbox box',
    cssProperty: 'border-radius',
  },

  'borderRadius-s': {
    category: 'shape',
    defaultToken: 'Shape-1',
    description: 'Border radius at size S (4px, f-6)',
    cssProperty: 'border-radius',
  },

  'borderRadius-m': {
    category: 'shape',
    defaultToken: 'Shape-1-5',
    description: 'Border radius at size M (6px, f-5)',
    cssProperty: 'border-radius',
  },

  'borderRadius-l': {
    category: 'shape',
    defaultToken: 'Shape-2',
    description: 'Border radius at size L (8px, f-4)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // BOX SIZE TOKENS (checkbox container)
  // ============================================

  'boxSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Checkbox box at S (16px, f0)',
    cssProperty: 'width',
  },

  'boxSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Checkbox box at M (20px, f2)',
    cssProperty: 'width',
  },

  'boxSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'Checkbox box at L (24px, f3)',
    cssProperty: 'width',
  },

  // ============================================
  // ICON SIZE TOKENS (checkmark indicator)
  // ============================================

  'iconSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Icon size within S checkbox (12px, f-2)',
    cssProperty: 'width',
  },

  'iconSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Icon size within M checkbox (16px, f0)',
    cssProperty: 'width',
  },

  'iconSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4-5',
    description: 'Icon size within L checkbox (18px, f1)',
    cssProperty: 'width',
  },

  // ============================================
  // LABEL TYPOGRAPHY TOKENS
  // ============================================

  'labelFontSize-s': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-S-FontSize',
    description: 'Label font size at S',
    cssProperty: 'font-size',
  },

  'labelFontSize-m': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-M-FontSize',
    description: 'Label font size at M',
    cssProperty: 'font-size',
  },

  'labelFontSize-l': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-L-FontSize',
    description: 'Label font size at L',
    cssProperty: 'font-size',
  },

  'labelLineHeight-s': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-S-LineHeight',
    description: 'Label line height at S (compact alignment)',
    cssProperty: 'line-height',
  },

  'labelLineHeight-m': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    description: 'Label line height at M (compact alignment)',
    cssProperty: 'line-height',
  },

  'labelLineHeight-l': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-L-LineHeight',
    description: 'Label line height at L (compact alignment)',
    cssProperty: 'line-height',
  },
};

/**
 * Complete Checkbox token manifest
 */
export const CHECKBOX_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Checkbox',
  version: '1.0.0',
  description:
    'Binary selection with indeterminate support. `appearance` drives border, hover, and fill tokens. Three sizes (S/M/L) and appearance roles.',
  tokens: CHECKBOX_TOKENS,
  totalTokens: Object.keys(CHECKBOX_TOKENS).length,
  categories: {
    shape: 4,
    spacing: 6,
    typography: 6,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getCheckboxTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(CHECKBOX_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getCheckboxTokenDefault(
  tokenName: keyof typeof CHECKBOX_TOKENS,
  options?: { variant?: string; size?: string; state?: string },
): string {
  const definition = CHECKBOX_TOKENS[tokenName];
  if (!definition) return '';

  if (options?.state && definition.states) {
    const stateValues = definition.states[options.state as keyof typeof definition.states];
    if (stateValues) {
      if (typeof stateValues === 'string') return stateValues;
      if (options?.variant && stateValues[options.variant]) {
        return stateValues[options.variant];
      }
    }
  }

  if (options?.size && definition.sizes?.[options.size]) {
    return definition.sizes[options.size];
  }

  if (options?.variant && definition.variants?.[options.variant]) {
    return definition.variants[options.variant];
  }

  return definition.defaultToken;
}
