/**
 * Switch.tokens.ts
 *
 * Token manifest for the Switch component.
 * Sizes verified against Switch.module.css [data-size] selectors.
 *
 * Size system (from CSS):
 *   S: track f4 (28) wide, knob f-2 (12), padding f-7 (2), travel f-2 (12)
 *   M: track f6 (36) wide, knob f0 (16), padding f-7 (2), travel f0 (16)
 *   L: track f7 (40) wide, knob f2 (20), padding f-7 (2), travel f0 (16)
 *   Height = auto (2 × padding + knob)
 *
 * Dual intermediate variable system:
 *   appearance controls ALL tokens (border + fill)
 *   accent optionally OVERRIDES fill only
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Switch component, organized by property
 */
export const SWITCH_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Track border radius (pill by default)',
    cssProperty: 'border-radius',
  },

  thumbBorderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Thumb/knob border radius (pill by default)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // TRACK SIZE TOKENS
  // ============================================

  'trackWidth-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-7',
    description: 'Track width at size S (f4=28)',
    cssProperty: 'width',
  },

  'trackWidth-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-9',
    description: 'Track width at size M (f6=36)',
    cssProperty: 'width',
  },

  'trackWidth-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-10',
    description: 'Track width at size L (f7=40)',
    cssProperty: 'width',
  },

  // ============================================
  // KNOB SIZE TOKENS
  // ============================================

  'knobSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Knob diameter at size S (f-2=12)',
    cssProperty: 'width',
  },

  'knobSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Knob diameter at size M (f0=16)',
    cssProperty: 'width',
  },

  'knobSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Knob diameter at size L (f2=20)',
    cssProperty: 'width',
  },

  // ============================================
  // ELEVATION TOKEN (knob shadow — configurable per brand)
  // ============================================

  knobElevation: {
    category: 'shape',
    defaultToken: 'none',
    description: 'Knob shadow (default: none, brands can set e.g. Elevation-1)',
    cssProperty: 'box-shadow',
  },

  // ============================================
  // PADDING TOKEN
  // ============================================

  padding: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0-5',
    description: 'Track padding around knob (f-7=2)',
    cssProperty: 'padding',
  },

  // ============================================
  // TRAVEL TOKENS (checked translateX distance)
  // ============================================

  'travel-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Checked knob travel at S (f-2=12)',
    cssProperty: 'transform',
  },

  'travel-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Checked knob travel at M (f0=16)',
    cssProperty: 'transform',
  },

  'travel-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Checked knob travel at L (f0=16)',
    cssProperty: 'transform',
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
    description: 'Label line height at S',
    cssProperty: 'line-height',
  },

  'labelLineHeight-m': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    description: 'Label line height at M',
    cssProperty: 'line-height',
  },

  'labelLineHeight-l': {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-L-LineHeight',
    description: 'Label line height at L',
    cssProperty: 'line-height',
  },
};

/**
 * Complete Switch token manifest
 */
export const SWITCH_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Switch',
  version: '1.0.0',
  description:
    'Toggle switch with dual system: appearance controls border+fill, accent optionally overrides fill. Default (unset/auto) uses secondary role for checked fill. 3 sizes (S/M/L), 10 appearance roles, 3 accent overrides, readonly state.',
  tokens: SWITCH_TOKENS,
  totalTokens: Object.keys(SWITCH_TOKENS).length,
  categories: {
    shape: 3,
    spacing: 7,
    typography: 6,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getSwitchTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(SWITCH_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}
