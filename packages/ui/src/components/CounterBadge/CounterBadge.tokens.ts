/**
 * CounterBadge.tokens.ts
 *
 * Token manifest for the CounterBadge component.
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
 * All tokens used by the CounterBadge component, organized by property
 */
export const COUNTER_BADGE_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    variants: {
      bold: 'Primary-Bold',
      subtle: 'Primary-Subtle',
      ghost: 'transparent',
    },
    description: 'CounterBadge background color, varies by variant',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Bold-High',
    variants: {
      bold: 'Primary-Bold-High',
      subtle: 'Primary-TintedA11y',
      ghost: 'Primary-TintedA11y',
    },
    description: 'CounterBadge text color, varies by variant',
    cssProperty: 'color',
  },

  borderColor: {
    category: 'color',
    defaultToken: 'Primary-Stroke-Low',
    variants: {
      bold: 'transparent',
      subtle: 'transparent',
      ghost: 'Primary-Stroke-Low',
    },
    availableTokens: [
      { token: 'Primary-Stroke-Low', label: 'Low Stroke' },
      { token: 'Primary-Stroke-Medium', label: 'Medium Stroke' },
      { token: 'Neutral-Stroke-Low', label: 'Neutral Low Stroke' },
      { token: 'transparent', label: 'Transparent' },
    ],
    description: 'CounterBadge border color (ghost variant only)',
    cssProperty: 'border-color',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius for CounterBadge (default: pill/capsule shape)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  height: {
    category: 'spacing',
    defaultToken: 'Spacing-4',
    sizes: {
      'xs': 'Spacing-3',
      's': 'Spacing-3-5',
      'm': 'Spacing-4',
      'l': 'Spacing-5',
    },
    description: 'CounterBadge height per size (equal to width for circular shape)',
    cssProperty: 'height',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0-5',
    sizes: {
      'xs': 'Spacing-0-5',
      's': 'Spacing-0-5',
      'm': 'Spacing-0-5',
      'l': 'Spacing-0-5',
    },
    description: 'Horizontal padding — minimal to preserve circular shape for single digits',
    cssProperty: 'padding-inline',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-2XS-FontSize',
    sizes: {
      'xs': 'Label-3XS-FontSize',
      's': 'Label-3XS-FontSize',
      'm': 'Label-2XS-FontSize',
      'l': 'Label-XS-FontSize',
    },
    description: 'CounterBadge font size (Label typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'CounterBadge font weight (Label emphasis medium)',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-2XS-LineHeight',
    sizes: {
      'xs': 'Label-3XS-LineHeight',
      's': 'Label-3XS-LineHeight',
      'm': 'Label-2XS-LineHeight',
      'l': 'Label-XS-LineHeight',
    },
    description: 'CounterBadge line height (from Label role)',
    cssProperty: 'line-height',
  },

  textTransform: {
    category: 'typography',
    defaultToken: 'none',
    description: 'Text casing for CounterBadge digits (none or uppercase)',
    cssProperty: 'text-transform',
  },

  letterSpacing: {
    category: 'typography',
    subcategory: 'letterSpacing',
    defaultToken: 'normal',
    description: 'Letter spacing for CounterBadge digits (pairs with textTransform)',
    cssProperty: 'letter-spacing',
  },
};

/**
 * Complete CounterBadge token manifest
 */
export const COUNTER_BADGE_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'CounterBadge',
  version: '4.0.0',
  description:
    'Non-interactive display component showing a numeric count (e.g., unread notifications). Colors are derived from the surface system. Typography uses Label role. Four sizes (XS/S/M/L).',
  tokens: COUNTER_BADGE_TOKENS,
  totalTokens: Object.keys(COUNTER_BADGE_TOKENS).length,
  categories: {
    color: 3,
    shape: 1,
    spacing: 2,
    typography: 5,
  },
  slots: {},
};

/**
 * Get all tokens for a specific category
 */
export function getCounterBadgeTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(COUNTER_BADGE_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getCounterBadgeTokenDefault(
  tokenName: keyof typeof COUNTER_BADGE_TOKENS,
  options?: { variant?: string; size?: string }
): string {
  const definition = COUNTER_BADGE_TOKENS[tokenName];
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
