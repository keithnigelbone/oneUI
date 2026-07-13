/**
 * Chip.tokens.ts
 *
 * Token manifest for the Chip component.
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
 * All tokens used by the Chip component, organized by property
 */
export const CHIP_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'transparent',
    variants: {
      bold: 'transparent',
      'bold-selected': 'Secondary-Bold',
      subtle: 'transparent',
      'subtle-selected': 'Secondary-Subtle',
      ghost: 'transparent',
      'ghost-selected': 'transparent',
    },
    description: 'Chip background color, varies by variant and selected state',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    variants: {
      bold: 'Text-High',
      'bold-selected': 'Secondary-Bold-High',
      subtle: 'Text-High',
      'subtle-selected': 'Secondary-High',
      ghost: 'Text-High',
      'ghost-selected': 'Secondary-High',
    },
    description: 'Chip text color. Selected high uses role on-bold high; selected medium/low use role high.',
    cssProperty: 'color',
  },

  borderColor: {
    category: 'color',
    defaultToken: 'Secondary-Stroke-Low',
    variants: {
      bold: 'Secondary-Stroke-Low',
      'bold-selected': 'Secondary-Bold',
      subtle: 'Secondary-Stroke-Low',
      'subtle-selected': 'transparent',
      ghost: 'Secondary-Stroke-Low',
      'ghost-selected': 'Secondary-Bold',
    },
    description: 'Chip border color, varies by variant and selected state',
    cssProperty: 'border-color',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius for Chip (pill by default, brand-overridable)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  height: {
    category: 'spacing',
    defaultToken: 'Spacing-6',
    sizes: {
      's': 'Spacing-5',
      'm': 'Spacing-6',
      'l': 'Spacing-8',
    },
    description: 'Chip height per size (S=20px, M=24px, L=32px)',
    cssProperty: 'height',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-2-5',
    sizes: {
      's': 'Spacing-2-5',
      'm': 'Spacing-2-5',
      'l': 'Spacing-3',
    },
    description: 'Horizontal padding (no slots): S/M=10px, L=12px. Reduces when slots present.',
    cssProperty: 'padding-inline',
  },

  gap: {
    category: 'spacing',
    defaultToken: 'Spacing-1',
    sizes: {
      's': 'Spacing-1',
      'm': 'Spacing-1',
      'l': 'Spacing-1-5',
    },
    description: 'Gap between slots and label: S/M=4px, L=6px',
    cssProperty: 'gap',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    sizes: {
      's': 'Label-XS-FontSize',
      'm': 'Label-S-FontSize',
      'l': 'Label-M-FontSize',
    },
    description: 'Chip font size (Label typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Chip font weight (Label emphasis medium)',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-S-LineHeight',
    sizes: {
      's': 'Label-XS-LineHeight',
      'm': 'Label-S-LineHeight',
      'l': 'Label-M-LineHeight',
    },
    description: 'Chip line height (from Label role)',
    cssProperty: 'line-height',
  },

  // ============================================
  // MOTION TOKENS
  // ============================================

  transitionDuration: {
    category: 'motion',
    defaultToken: 'Motion-Duration-M',
    description: 'Transition duration for state changes',
    cssProperty: 'transition-duration',
  },

  // ============================================
  // DECORATION TOKENS
  // ============================================

  cssDecorationClipPath: {
    category: 'decoration',
    defaultToken: 'none',
    description: 'Optional CSS-only clipping for brand-specific chip shapes.',
    cssProperty: 'clip-path',
  },

  cssDecorationStrokeWidth: {
    category: 'decoration',
    defaultToken: 'Stroke-L',
    description: 'Stroke width used by CSS-only chip decoration details.',
    cssProperty: 'border-width',
  },

  cssDecorationStrokeStyle: {
    category: 'decoration',
    defaultToken: 'solid',
    description: 'Stroke style used by CSS-only chip decoration details.',
    cssProperty: 'border-style',
  },

  cssDecorationInsetStrokeWidth: {
    category: 'decoration',
    defaultToken: 'Spacing-0',
    description: 'Inset stroke width used by CSS-only chip decoration details.',
    cssProperty: 'border-width',
  },

  cssDecorationCornerSize: {
    category: 'decoration',
    defaultToken: 'Spacing-2',
    description: 'Corner size used by CSS-only cut-corner chip decoration.',
    cssProperty: 'clip-path',
  },

  cssDecorationShadow: {
    category: 'decoration',
    defaultToken: 'none',
    description: 'Optional CSS-only inset detail for decorated chips.',
    cssProperty: 'box-shadow',
  },

  cssDecorationUnderlineWidth: {
    category: 'decoration',
    defaultToken: 'Spacing-0',
    description: 'Optional CSS-only underline thickness for decorated chips.',
    cssProperty: 'border-bottom-width',
  },

  cssDecorationColor: {
    category: 'decoration',
    defaultToken: 'currentColor',
    description: 'Color used by CSS-only chip decoration details.',
    cssProperty: 'border-color',
  },
};

/**
 * Complete Chip token manifest
 */
export const CHIP_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Chip',
  version: '4.0.0',
  description:
    'Interactive toggleable pill element for filtering, selection, and categorization. Uses Base UI Toggle for accessibility. Colors from surface system. Typography uses Label role. Three sizes (S/M/L). Start/end slots for icons, avatars, and badges.',
  tokens: CHIP_TOKENS,
  totalTokens: Object.keys(CHIP_TOKENS).length,
  categories: {
    color: 3,
    shape: 1,
    spacing: 3,
    typography: 3,
    motion: 1,
    decoration: 8,
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
export function getChipTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(CHIP_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getChipTokenDefault(
  tokenName: keyof typeof CHIP_TOKENS,
  options?: { variant?: string; size?: string }
): string {
  const definition = CHIP_TOKENS[tokenName];
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
