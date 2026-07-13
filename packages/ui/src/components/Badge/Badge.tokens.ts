/**
 * Badge.tokens.ts
 *
 * Token manifest for the Badge component.
 * Defines all design tokens used and their customization options.
 *
 * Used by the Component Token Editor to:
 * - Display available tokens for customization
 * - Show which tokens are locked (cannot be changed)
 * - Generate CSS overrides for brand customization
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Badge component, organized by property
 */
export const BADGE_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Sparkle-Bold',
    variants: {
      bold: 'Sparkle-Bold',
      subtle: 'Sparkle-Subtle',
      ghost: 'transparent',
    },
    description: 'Badge background color, varies by variant',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Sparkle-Bold-High',
    variants: {
      bold: 'Sparkle-Bold-High',
      subtle: 'Sparkle-Subtle-High',
      ghost: 'Sparkle-High',
    },
    description: 'Badge text color, varies by variant',
    cssProperty: 'color',
  },

  borderColor: {
    category: 'color',
    defaultToken: 'Sparkle-Stroke-Low',
    variants: {
      bold: 'transparent',
      subtle: 'transparent',
      ghost: 'Sparkle-Stroke-Low',
    },
    availableTokens: [
      { token: 'Sparkle-Stroke-Low', label: 'Low Stroke' },
      { token: 'Sparkle-Stroke-Medium', label: 'Medium Stroke' },
      { token: 'Neutral-Stroke-Low', label: 'Neutral Low Stroke' },
      { token: 'transparent', label: 'Transparent' },
    ],
    description: 'Badge border color (ghost variant only)',
    cssProperty: 'border-color',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-1-5',
    sizes: {
      'xs': 'Shape-1',  /* 4 — Figma node 417:11175 */
      's':  'Shape-1',  /* 4 — Figma node 417:11127 */
      'm':  'Shape-1-5',  /* 6 — Figma node 414:11037 */
      'l':  'Shape-2',  /* 8 — Figma node 409:10262 */
      'xl': 'Shape-2-5',  /* 10 — Figma node 409:10070 */
    },
    description: 'Border radius for Badge (scales with size, brand-overridable)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  height: {
    category: 'spacing',
    defaultToken: 'Spacing-5',
    sizes: {
      'xs': 'Spacing-3',
      's': 'Spacing-4',
      'm': 'Spacing-5',
      'l': 'Spacing-6',
      'xl': 'Spacing-8',
    },
    description: 'Badge height per size (xs=f-2, s=f0, m=f2, l=f3, xl=f5)',
    cssProperty: 'height',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-1-5',
    sizes: {
      'xs': 'Spacing-1',  /* 4 */
      's':  'Spacing-1',  /* 4 */
      'm':  'Spacing-1-5',  /* 6 */
      'l':  'Spacing-2',  /* 8 */
      'xl': 'Spacing-1-5',  /* 6 — Figma XL uses symmetric 6 padding */
    },
    description: 'Horizontal padding per size (Figma-verified per docs/badge-figma-parity.md)',
    cssProperty: 'padding-inline',
  },

  gap: {
    category: 'spacing',
    defaultToken: 'Spacing-1',
    sizes: {
      'xs': 'Spacing-0-5',  /* 2 */
      's':  'Spacing-0-5',  /* 2 */
      'm':  'Spacing-1',  /* 4 */
      'l':  'Spacing-1',  /* 4 */
      'xl': 'Spacing-1-5',  /* 6 — Figma XL gap widens to 6 */
    },
    description: 'Gap between start/end slots and label',
    cssProperty: 'gap',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-XS-FontSize',
    sizes: {
      'xs': 'Label-3XS-FontSize',
      's': 'Label-2XS-FontSize',
      'm': 'Label-XS-FontSize',
      'l': 'Label-S-FontSize',
      'xl': 'Label-M-FontSize',
    },
    description: 'Badge font size (Label typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Badge font weight (Label emphasis medium)',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-XS-LineHeight',
    sizes: {
      'xs': 'Label-3XS-LineHeight',
      's': 'Label-2XS-LineHeight',
      'm': 'Label-XS-LineHeight',
      'l': 'Label-S-LineHeight',
      'xl': 'Label-M-LineHeight',
    },
    description: 'Badge line height (from Label role)',
    cssProperty: 'line-height',
  },

  textTransform: {
    category: 'typography',
    defaultToken: 'none',
    description: 'Text casing for Badge labels (none or uppercase)',
    cssProperty: 'text-transform',
  },

  letterSpacing: {
    category: 'typography',
    subcategory: 'letterSpacing',
    defaultToken: 'normal',
    description: 'Letter spacing for Badge labels (pairs with textTransform)',
    cssProperty: 'letter-spacing',
  },
};

/**
 * Complete Badge token manifest
 */
export const BADGE_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Badge',
  version: '4.0.0',
  description:
    'Non-interactive display component for status, notifications, or categorization. Colors from surface system. Typography uses Label role. Five sizes (XS/S/M/L/XL). Start/end slots for icons, avatars, and sub-badges.',
  tokens: BADGE_TOKENS,
  totalTokens: Object.keys(BADGE_TOKENS).length,
  categories: {
    color: 3,
    shape: 1,
    spacing: 3,
    typography: 5,
  },
  slots: {
    start: {
      name: 'start',
      types: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
      tokens: [],
    },
    end: {
      name: 'end',
      types: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
      tokens: [],
    },
  },
};

/**
 * Get all tokens for a specific category
 */
export function getBadgeTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(BADGE_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getBadgeTokenDefault(
  tokenName: keyof typeof BADGE_TOKENS,
  options?: { variant?: string; size?: string }
): string {
  const definition = BADGE_TOKENS[tokenName];
  if (!definition) return '';

  // Check size-specific value
  if (options?.size && definition.sizes?.[options.size]) {
    return definition.sizes[options.size];
  }

  // Check variant-specific value
  if (options?.variant && definition.variants?.[options.variant]) {
    return definition.variants[options.variant];
  }

  // Return default token
  return definition.defaultToken;
}
