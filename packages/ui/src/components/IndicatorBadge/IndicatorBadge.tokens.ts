/**
 * IndicatorBadge.tokens.ts
 *
 * Token manifest for the IndicatorBadge component.
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
 * All tokens used by the IndicatorBadge component, organized by property
 */
export const INDICATOR_BADGE_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    description: 'Indicator dot background color',
    cssProperty: 'background-color',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius for the indicator dot (default: pill/circle)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING TOKENS (sizes)
  // ============================================

  size: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-2',
    sizes: {
      'xs': 'Spacing-1',
      's': 'Spacing-1-5',
      'm': 'Spacing-2',
      'l': 'Spacing-3',
      'xl': 'Spacing-4',
    },
    description: 'Width and height of the indicator dot per size (Figma dim_1 … dim_4)',
    cssProperty: 'width',
  },
};

/**
 * Complete IndicatorBadge token manifest
 */
export const INDICATOR_BADGE_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'IndicatorBadge',
  version: '4.0.0',
  description:
    'Non-interactive status/presence indicator dot. Colors derived from the surface system. Five sizes (XS/S/M/L/XL) mapped to spacing tokens.',
  tokens: INDICATOR_BADGE_TOKENS,
  totalTokens: Object.keys(INDICATOR_BADGE_TOKENS).length,
  categories: {
    color: 1,
    shape: 1,
    spacing: 1,
  },
  slots: {},
};

/**
 * Get all tokens for a specific category
 */
export function getIndicatorBadgeTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(INDICATOR_BADGE_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getIndicatorBadgeTokenDefault(
  tokenName: keyof typeof INDICATOR_BADGE_TOKENS,
  options?: { size?: string },
): string {
  const definition = INDICATOR_BADGE_TOKENS[tokenName];
  if (!definition) return '';

  // Check size-specific value
  if (options?.size && definition.sizes?.[options.size]) {
    return definition.sizes[options.size];
  }

  // Return default token
  return definition.defaultToken;
}
