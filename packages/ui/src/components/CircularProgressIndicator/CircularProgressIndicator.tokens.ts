/**
 * CircularProgressIndicator.tokens.ts
 *
 * Token manifest for the CircularProgressIndicator component.
 * Ten t-shirt sizes map to component-specific --CircularProgressIndicator-size-*
 * dimension tokens; colors resolve against the active appearance role.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const CIRCULAR_PROGRESS_INDICATOR_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR
  // ============================================

  indicatorColor: {
    category: 'color',
    subcategory: 'stroke',
    defaultToken: 'Primary-Bold',
    description:
      'Colour of the progress arc. Resolves against the active appearance role; defaults to Primary-Bold.',
    cssProperty: 'stroke',
  },

  trackColor: {
    category: 'color',
    subcategory: 'stroke',
    defaultToken: 'Primary-Subtle',
    description:
      'Colour of the unfilled track behind the arc.',
    cssProperty: 'stroke',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description:
      'Colour of the optional center label (percentage).',
    cssProperty: 'color',
  },

  // ============================================
  // SPACING — per size
  // ============================================

  size: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'CircularProgressIndicator-size-M',
    variants: {
      '2XS': 'CircularProgressIndicator-size-2XS',
      XS: 'CircularProgressIndicator-size-XS',
      S: 'CircularProgressIndicator-size-S',
      M: 'CircularProgressIndicator-size-M',
      L: 'CircularProgressIndicator-size-L',
      XL: 'CircularProgressIndicator-size-XL',
      '2XL': 'CircularProgressIndicator-size-2XL',
      '3XL': 'CircularProgressIndicator-size-3XL',
      '4XL': 'CircularProgressIndicator-size-4XL',
      '5XL': 'CircularProgressIndicator-size-5XL',
    },
    description:
      'Rendered width and height (square). Mapped from the t-shirt `size` prop.',
    cssProperty: 'width',
  },

  // ============================================
  // TYPOGRAPHY — center label
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'CircularProgressIndicator-fontSize-M',
    description:
      'Center label font size, mapped per t-shirt size.',
    cssProperty: 'font-size',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'CircularProgressIndicator-lineHeight-M',
    description:
      'Center label line height, mapped per t-shirt size.',
    cssProperty: 'line-height',
  },

  fontFamily: {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Typography-Font-Primary',
    description: 'Center label font family.',
    cssProperty: 'font-family',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Body-FontWeight-Medium',
    description: 'Center label font weight.',
    cssProperty: 'font-weight',
  },
};

export const CIRCULAR_PROGRESS_INDICATOR_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'CircularProgressIndicator',
  version: '1.0.0',
  description:
    'Circular progress arc with determinate + indeterminate variants, 10 t-shirt sizes, optional center content (icon or auto percentage), and multi-accent appearance roles.',
  tokens: CIRCULAR_PROGRESS_INDICATOR_TOKENS,
  totalTokens: Object.keys(CIRCULAR_PROGRESS_INDICATOR_TOKENS).length,
  categories: {
    color: 3,
    spacing: 1,
    typography: 4,
  },
};
