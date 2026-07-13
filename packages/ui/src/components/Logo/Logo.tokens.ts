/**
 * Logo.tokens.ts
 *
 * Token manifest for the Logo component.
 * Logo is a transparent size container — the SVG content controls
 * its own shape, colors, and background. Only size tokens are needed.
 *
 * Container size mapping (same as IconContained):
 *   XS: Spacing-3  (12px, f-2)
 *   S:  Spacing-4   (16px, f0)
 *   M:  Spacing-5  (20px, f2)
 *   L:  Spacing-6 (24px, f3)
 *   XL: Spacing-8 (32px, f5)
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Logo component, organized by property
 */
export const LOGO_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS
  // ============================================

  color: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Bold',
    description: 'Logo currentColor — sets the fill for SVGs using currentColor. Defaults to the brand primary.',
    cssProperty: 'color',
  },

  // ============================================
  // SIZE TOKENS (container dimensions)
  // ============================================

  'size-xs': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Logo container at XS (12px, f-2)',
    cssProperty: 'width',
  },

  'size-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Logo container at S (16px, f0)',
    cssProperty: 'width',
  },

  'size-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Logo container at M (20px, f2)',
    cssProperty: 'width',
  },

  'size-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'Logo container at L (24px, f3)',
    cssProperty: 'width',
  },

  'size-xl': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'Logo container at XL (32px, f5)',
    cssProperty: 'width',
  },
};

/**
 * Complete Logo token manifest
 */
export const LOGO_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Logo',
  version: '1.0.0',
  description:
    'Brand identity mark — color defaults to Primary-Bold so SVGs using currentColor automatically reflect the active brand. Brands with explicit SVG fills are unaffected.',
  tokens: LOGO_TOKENS,
  totalTokens: Object.keys(LOGO_TOKENS).length,
  categories: {
    color: 1,
    spacing: 5,
  },
};
