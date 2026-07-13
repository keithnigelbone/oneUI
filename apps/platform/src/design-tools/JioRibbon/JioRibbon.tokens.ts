/**
 * JioRibbon.tokens.ts
 *
 * Token manifest for the JioRibbon component.
 * Defines design tokens used for brand-level customisation of the ribbon.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const JIO_RIBBON_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS
  // ============================================

  color1: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    description:
      'Primary dot color and Jio symbol fill. Defaults to Jio orange (#FA7D19), will be sourced from Supabase in Phase 2.',
    cssProperty: 'fill',
  },

  color2: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Secondary-Bold',
    description:
      'Secondary dot color. Defaults to Jio blue (#0078AD), will be sourced from Supabase in Phase 2.',
    cssProperty: 'fill',
  },

  color3: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Sparkle-Bold',
    description:
      'Sparkle dot color. Defaults to Jio purple (#6D17CE), will be sourced from Supabase in Phase 2.',
    cssProperty: 'fill',
  },

  // ============================================
  // LAYOUT TOKENS
  // ============================================

  zIndex: {
    category: 'spacing',
    defaultToken: '4',
    description: 'Z-index layer of the ribbon within the canvas stack.',
    cssProperty: 'z-index',
  },

  // ============================================
  // GEOMETRY CONSTANTS (exposed for brand tuning)
  // ============================================

  thicknessRatio: {
    category: 'spacing',
    defaultToken: '0.18',
    description:
      'Ribbon thickness as fraction of geometric mean (landscape). Jio default: 18%.',
    cssProperty: 'width',
  },

  thicknessMin: {
    category: 'spacing',
    defaultToken: '0.18',
    description: 'Minimum thickness ratio (landscape).',
    cssProperty: 'width',
  },

  thicknessMax: {
    category: 'spacing',
    defaultToken: '0.22',
    description: 'Maximum thickness ratio (landscape).',
    cssProperty: 'width',
  },

  thicknessRatioPortrait: {
    category: 'spacing',
    defaultToken: '0.22',
    description: 'Ribbon thickness as fraction of geometric mean (portrait).',
    cssProperty: 'width',
  },

  thicknessMinPortrait: {
    category: 'spacing',
    defaultToken: '0.22',
    description: 'Minimum thickness ratio (portrait).',
    cssProperty: 'width',
  },

  thicknessMaxPortrait: {
    category: 'spacing',
    defaultToken: '0.24',
    description: 'Maximum thickness ratio (portrait).',
    cssProperty: 'width',
  },

  marginRatio: {
    category: 'spacing',
    defaultToken: '0.333',
    description:
      'Margin from canvas edge as fraction of ribbon width. Jio default: 1/3.',
    cssProperty: 'margin',
  },
};

export const JIO_RIBBON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'JioRibbon',
  version: '1.0.0',
  description:
    'Jio brand dot-pattern ribbon with optional Jio symbol. Three-color procedural SVG grid with constraint-based coloring, dynamic geometric-mean scaling.',
  tokens: JIO_RIBBON_TOKENS,
  totalTokens: Object.keys(JIO_RIBBON_TOKENS).length,
  categories: {
    color: 3,
    spacing: 7,
  },
  slots: {},
};
