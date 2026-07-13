/**
 * Spinner.tokens.ts
 *
 * Token manifest — 3 role-based arc colors + motion duration/easing.
 * Each arc defaults to a DIFFERENT accent role:
 *   arc1 = Sparkle
 *   arc2 = Secondary
 *   arc3 = Primary
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SPINNER_TOKENS: Record<string, TokenDefinition> = {
  arcColor1: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Sparkle-Bold',
    description: 'Leading arc color — sparkle role by default.',
    cssProperty: 'stroke',
  },
  arcColor2: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Secondary-Bold',
    description: 'Middle arc color — secondary role by default.',
    cssProperty: 'stroke',
  },
  arcColor3: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    description: 'Trailing arc color — primary role by default.',
    cssProperty: 'stroke',
  },
  rotateDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-3XL',
    description:
      'Draw→erase cycle duration for each circle. Defaults to 2× Motion-Duration-3XL (~2s) so the sweep feels deliberate.',
    cssProperty: 'animation-duration',
  },
  easing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition-Moderate',
    description: 'Foundation easing curve used for every arc\'s draw→erase cycle.',
    cssProperty: 'animation-timing-function',
  },
};

export const SPINNER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Spinner',
  version: '1.0.0',
  description:
    'Indeterminate three-arc loading indicator. Three arcs render in three distinct accent roles.',
  tokens: SPINNER_TOKENS,
  totalTokens: Object.keys(SPINNER_TOKENS).length,
  categories: {
    color: 3,
    motion: 2,
  },
};
