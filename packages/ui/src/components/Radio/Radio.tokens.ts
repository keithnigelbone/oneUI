/**
 * Radio.tokens.ts
 *
 * Token manifest for the Radio component.
 * Sizes verified against Radio.module.css [data-size] selectors.
 *
 * Size system (from CSS) — dot is always 50% of box:
 *   S: box=Spacings/4=Spacing-4(f0=16px),  dot=Spacings/2=Spacing-2(f-4=8px)
 *   M: box=Spacings/5=Spacing-5(f2=20px), dot=Spacings/2.5=Spacing-2-5(f-3=10px)
 *   L: box=Spacings/6=Spacing-6(f3=24px), dot=Spacings/3=Spacing-3(f-2=12px)
 *
 * Radio is always circular (Shape-Pill) — no shape tokens needed.
 *
 * `appearance` maps to role tokens for border, hover, and fill (including the checked dot).
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Radio component, organized by property
 */
export const RADIO_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Default border radius for the radio (circular by default)',
    cssProperty: 'border-radius',
  },

  'borderRadius-s': {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius at size S',
    cssProperty: 'border-radius',
  },

  'borderRadius-m': {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius at size M',
    cssProperty: 'border-radius',
  },

  'borderRadius-l': {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius at size L',
    cssProperty: 'border-radius',
  },

  dotBorderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Default border radius of the inner dot indicator (matches outer by default)',
    cssProperty: 'border-radius',
  },

  'dotBorderRadius-s': {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Dot border radius at size S',
    cssProperty: 'border-radius',
  },

  'dotBorderRadius-m': {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Dot border radius at size M',
    cssProperty: 'border-radius',
  },

  'dotBorderRadius-l': {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Dot border radius at size L',
    cssProperty: 'border-radius',
  },

  // ============================================
  // BOX SIZE TOKENS (radio container)
  // ============================================

  'boxSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Radio box at S (16px, f0)',
    cssProperty: 'width',
  },

  'boxSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Radio box at M (20px, f2)',
    cssProperty: 'width',
  },

  'boxSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'Radio box at L (24px, f3)',
    cssProperty: 'width',
  },

  // ============================================
  // DOT SIZE TOKENS (inner dot indicator)
  // ============================================

  'dotSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-2',
    description: 'Dot size within S radio (8px, f-4) — 50% of box',
    cssProperty: 'width',
  },

  'dotSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-2-5',
    description: 'Dot size within M radio (10px, f-3) — 50% of box',
    cssProperty: 'width',
  },

  'dotSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Dot size within L radio (12px, f-2) — 50% of box',
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
 * Complete Radio token manifest
 */
export const RADIO_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Radio',
  version: '1.0.0',
  description:
    'Single selection within a group. `appearance` drives border, hover, and fill tokens. Three sizes (S/M/L), appearance roles, readonly state. Always circular (Shape-Pill).',
  tokens: RADIO_TOKENS,
  totalTokens: Object.keys(RADIO_TOKENS).length,
  categories: {
    shape: 8,
    spacing: 6,
    typography: 6,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getRadioTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(RADIO_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getRadioTokenDefault(
  tokenName: keyof typeof RADIO_TOKENS,
  options?: { variant?: string; size?: string; state?: string },
): string {
  const definition = RADIO_TOKENS[tokenName];
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
