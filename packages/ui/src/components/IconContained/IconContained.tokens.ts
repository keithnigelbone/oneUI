/**
 * IconContained.tokens.ts
 *
 * Token manifest for the IconContained component.
 * Sizes verified against Figma IconContained node (17:241).
 *
 * Container/Icon size mapping (2 f-steps smaller than Avatar at each position):
 *   XS: container=Spacing-3(12px), icon=Spacing-2(8px)
 *   S:  container=Spacing-4(16px),  icon=Spacing-2-5(10px)
 *   M:  container=Spacing-5(20px), icon=Spacing-3(12px)
 *   L:  container=Spacing-6(24px),icon=Spacing-4(16px)
 *   XL: container=Spacing-8(32px),icon=Spacing-5(20px)
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the IconContained component, organized by property
 */
export const ICON_CONTAINED_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    variants: {
      high: 'Primary-Bold',
      medium: 'Primary-Subtle',
    },
    description: 'IconContained background color, varies by attention level',
    cssProperty: 'background-color',
  },

  iconColor: {
    category: 'color',
    subcategory: 'icon',
    defaultToken: 'Primary-Bold-High',
    variants: {
      high: 'Primary-Bold-High',
      medium: 'Primary-Tinted',
    },
    description: 'Icon color within container, varies by attention level',
    cssProperty: 'color',
  },

  // ============================================
  // SIZE TOKENS (container dimensions)
  // ============================================

  'size-xs': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'IconContained container at XS (12px, f-2)',
    cssProperty: 'width',
  },

  'size-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'IconContained container at S (16px, f0)',
    cssProperty: 'width',
  },

  'size-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'IconContained container at M (20px, f2)',
    cssProperty: 'width',
  },

  'size-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'IconContained container at L (24px, f3)',
    cssProperty: 'width',
  },

  'size-xl': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'IconContained container at XL (32px, f5)',
    cssProperty: 'width',
  },

  // ============================================
  // ICON SIZE TOKENS (inner icon dimensions)
  // ============================================

  'iconSize-xs': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-2',
    description: 'Icon size within XS container (8px, f-4)',
    cssProperty: 'width',
  },

  'iconSize-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-2-5',
    description: 'Icon size within S container (10px, f-3)',
    cssProperty: 'width',
  },

  'iconSize-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Icon size within M container (12px, f-2)',
    cssProperty: 'width',
  },

  'iconSize-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Icon size within L container (16px, f0)',
    cssProperty: 'width',
  },

  'iconSize-xl': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Icon size within XL container (20px, f2)',
    cssProperty: 'width',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius (circular pill shape = 9999px)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // ACCESSIBILITY TOKENS
  // ============================================

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    states: {
      disabled: 'Disabled-Opacity',
    },
    description: 'Opacity when disabled',
    cssProperty: 'opacity',
  },
};

/**
 * Complete IconContained token manifest
 */
export const ICON_CONTAINED_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'IconContained',
  version: '1.0.0',
  description:
    'Icon rendered inside a circular pill-shaped container. 2 attention levels (high=solid bold, medium=subtle tinted). Colors derived from V4 surface system. Sizes verified against Figma.',
  tokens: ICON_CONTAINED_TOKENS,
  totalTokens: Object.keys(ICON_CONTAINED_TOKENS).length,
  categories: {
    color: 2,
    spacing: 10,
    shape: 1,
    accessibility: 1,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getIconContainedTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(ICON_CONTAINED_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getIconContainedTokenDefault(
  tokenName: keyof typeof ICON_CONTAINED_TOKENS,
  options?: { variant?: string; size?: string; state?: string },
): string {
  const definition = ICON_CONTAINED_TOKENS[tokenName];
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
