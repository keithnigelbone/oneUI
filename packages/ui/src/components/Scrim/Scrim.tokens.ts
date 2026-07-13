/**
 * Scrim.tokens.ts
 * Token manifest for brand customization via Component Token Editor.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SCRIM_TOKENS: Record<string, TokenDefinition> = {
  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Material-Translucent-Dark-Moderate',
    variants: {
      high: 'Material-Translucent-Dark-Moderate',
      medium: 'Material-Translucent-Dark-Moderate',
      low: 'Material-Translucent-Dark-Moderate',
    },
    description:
      'Overlay fill — Figma values: high=50% (Moderate), medium=33% (66% of Moderate), low=17% (34% of Moderate)',
    cssProperty: 'background-color',
  },

  fromColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Bold',
    description:
      'Gradient peak colour — always rendered at full opacity; curve is 100→30→15→8→4→2→0%',
    cssProperty: 'background-image',
  },

  toColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'transparent',
    description: 'Gradient end colour',
    cssProperty: 'background-image',
  },

  opacityHigh: {
    category: 'other',
    subcategory: 'opacity',
    defaultToken: '0.95',
    description:
      'Element opacity for high-attention gradient scrim — Figma layer opacity 95%',
    cssProperty: 'opacity',
  },

  opacityMedium: {
    category: 'other',
    subcategory: 'opacity',
    defaultToken: '0.5',
    description:
      'Element opacity for medium-attention gradient scrim — Figma layer opacity 50%',
    cssProperty: 'opacity',
  },

  opacityLow: {
    category: 'other',
    subcategory: 'opacity',
    defaultToken: '0.25',
    description:
      'Element opacity for low-attention gradient scrim — Figma layer opacity 25%',
    cssProperty: 'opacity',
  },

  // Size tokens represent the band extent as a percentage of the container.
  // Derived from Figma SVG linearGradient endpoint coords (x2/y2 values):
  //   xs=20%  s=40%  m=60%  l=80%  xl=100%
  // CSS fallbacks in Scrim.module.css use these percentages directly.
  // Brand overrides can supply a CSS length (e.g. Spacing-14) to pin to absolute px.

  sizeHeightXS: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'bottom/top band height at XS — default 20% of container height',
    cssProperty: 'mask-size',
  },

  sizeHeightS: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'bottom/top band height at S — default 40% of container height',
    cssProperty: 'mask-size',
  },

  sizeHeightM: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-14',
    description: 'bottom/top band height at M — default 60% of container height',
    cssProperty: 'mask-size',
  },

  sizeHeightL: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-18',
    description: 'bottom/top band height at L — default 80% of container height',
    cssProperty: 'mask-size',
  },

  sizeHeightXL: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-24',
    description: 'bottom/top band height at XL — default 100% of container height',
    cssProperty: 'mask-size',
  },

  sizeWidthXS: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'left/right band width at XS — default 20% of container width',
    cssProperty: 'mask-size',
  },

  sizeWidthS: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'left/right band width at S — default 40% of container width',
    cssProperty: 'mask-size',
  },

  sizeWidthM: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-14',
    description: 'left/right band width at M — default 60% of container width',
    cssProperty: 'mask-size',
  },

  sizeWidthL: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-18',
    description: 'left/right band width at L — default 80% of container width',
    cssProperty: 'mask-size',
  },

  sizeWidthXL: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-24',
    description: 'left/right band width at XL — default 100% of container width',
    cssProperty: 'mask-size',
  },
};

export const SCRIM_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Scrim',
  version: '1.0.0',
  description:
    'Overlay scrim with gradient and uniform variants, 5 edge sizes plus full, and 3 attention tiers.',
  tokens: SCRIM_TOKENS,
  totalTokens: Object.keys(SCRIM_TOKENS).length,
  categories: {
    color: 3,
    spacing: 10,
    other: 3,
  },
};
