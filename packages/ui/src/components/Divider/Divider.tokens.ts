/**
 * Divider.tokens.ts
 *
 * Token manifest for the Divider component.
 * Covers stroke color (3 attention tiers), content color (3 text tiers),
 * stroke width, content gap, icon size, and typography tokens.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const DIVIDER_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // STROKE COLOR — per attention level
  // ============================================

  color: {
    category: 'color',
    subcategory: 'stroke',
    defaultToken: 'Neutral-Stroke-Low',
    variants: {
      high: 'Neutral-High',
      medium: 'Neutral-Stroke-Medium',
      low: 'Neutral-Stroke-Low',
    },
    description: 'Divider stroke color, varies by attention level',
    cssProperty: 'background-color',
  },

  contentColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Neutral-Low',
    variants: {
      high: 'Neutral-High',
      medium: 'Neutral-Medium-Text',
      low: 'Neutral-Low',
    },
    description: 'Label/icon content color, uses text tokens for readability',
    cssProperty: 'color',
  },

  // ============================================
  // STROKE WIDTH — per size
  // ============================================

  strokeWidth: {
    category: 'spacing',
    subcategory: 'stroke',
    defaultToken: 'Stroke-M',
    variants: {
      s: 'Stroke-S',
      m: 'Stroke-M',
      l: 'Stroke-L',
    },
    description: 'Stroke thickness: S (0.5px), M (1px), L (1.5px)',
    cssProperty: 'height',
  },

  // ============================================
  // SPACING — gap and offset
  // ============================================

  contentGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3-5',
    description: 'Gap between line segments and content slot',
    cssProperty: 'gap',
  },

  iconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Width and height of the icon in the content slot',
    cssProperty: 'width',
  },

  // ============================================
  // TYPOGRAPHY — label content
  // ============================================

  contentFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-XS-FontSize',
    description: 'Font size for label content (Figma Label XS)',
    cssProperty: 'font-size',
  },

  contentLineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-XS-LineHeight',
    description: 'Line height for label content (Figma Label XS)',
    cssProperty: 'line-height',
  },

  contentFontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Font weight for label content (500)',
    cssProperty: 'font-weight',
  },
};

export const DIVIDER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Divider',
  version: '1.0.0',
  description:
    'Visual separator with 3 stroke sizes, 3 attention levels, content slots (icon/label), multi-accent roles, and surface context adaptation.',
  tokens: DIVIDER_TOKENS,
  totalTokens: Object.keys(DIVIDER_TOKENS).length,
  categories: {
    color: 2,
    spacing: 3,
    typography: 3,
  },
};
