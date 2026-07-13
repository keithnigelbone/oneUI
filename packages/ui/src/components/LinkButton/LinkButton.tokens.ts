/**
 * LinkButton.tokens.ts
 *
 * Token manifest for the LinkButton component.
 * Defines all design tokens used and their customization options.
 *
 * Used by the Component Token Editor to:
 * - Display available tokens for customization
 * - Show which tokens are locked (cannot be changed)
 * - Generate CSS overrides for brand customization
 */

import type {
  ComponentTokenManifest,
  ComponentSlotDefinition,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the LinkButton component, organized by property
 */
export const LINKBUTTON_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-TintedA11y',
    variants: {
      bold: 'Primary-TintedA11y',
      subtle: 'Primary-TintedA11y',
      ghost: 'Primary-High',
    },
    states: {
      hover: {
        bold: 'Primary-TintedA11y',
        subtle: 'Primary-TintedA11y',
        ghost: 'Primary-High',
      },
      pressed: {
        bold: 'Primary-TintedA11y',
        subtle: 'Primary-TintedA11y',
        ghost: 'Primary-High',
      },
    },
    description: 'LinkButton text color. Bold/subtle use accent; ghost uses default high text.',
    cssProperty: 'color',
  },

  underlineColor: {
    category: 'color',
    subcategory: 'border',
    defaultToken: 'Primary-TintedA11y',
    variants: {
      bold: 'Primary-TintedA11y',
      subtle: 'transparent',
      ghost: 'transparent',
    },
    states: {
      hover: {
        bold: 'Primary-TintedA11y',
        subtle: 'Primary-TintedA11y',
        ghost: 'Primary-High',
      },
      pressed: {
        bold: 'Primary-TintedA11y',
        subtle: 'Primary-TintedA11y',
        ghost: 'Primary-High',
      },
    },
    description: 'Underline color. Bold shows accent underline; subtle/ghost hide it by default.',
    cssProperty: 'text-decoration-color',
  },

  underlineImage: {
    category: 'decoration',
    subcategory: 'stroke',
    defaultToken: 'none',
    variants: {
      bold: 'none',
      subtle: 'none',
      ghost: 'none',
    },
    states: {
      hover: {
        bold: 'none',
        subtle: 'none',
        ghost: 'none',
      },
      pressed: {
        bold: 'none',
        subtle: 'none',
        ghost: 'none',
      },
    },
    availableTokens: [
      { token: 'none', label: 'None' },
    ],
    description: 'Image underline channel for gradient materials. Underline color remains the solid fallback.',
    cssProperty: 'background-image',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0-5',
    description: 'Minimal horizontal padding (link-like, not button-like)',
    cssProperty: 'padding-inline',
  },

  iconGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1',
    description: 'Gap between icon slots and label text',
    cssProperty: 'margin-inline',
  },

  iconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    sizes: {
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Width and height of start/end slot icons',
    cssProperty: 'width',
  },

  minHeight: {
    category: 'spacing',
    defaultToken: 'Spacing-5',
    sizes: {
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Minimum height per size (smaller than Button)',
    cssProperty: 'min-height',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-2',
    description: 'Border radius for link button (small, not pill)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // UNDERLINE TOKENS
  // ============================================

  underlineOffset: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-0-5',
    description: 'Vertical offset of the text underline from the baseline',
    cssProperty: 'text-underline-offset',
  },

  underlineThickness: {
    category: 'stroke',
    defaultToken: 'Stroke-M',
    description: 'Thickness of the underline decoration',
    cssProperty: 'text-decoration-thickness',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    sizes: {
      '8': 'Label-S-FontSize',
      '10': 'Label-M-FontSize',
      '12': 'Label-L-FontSize',
    },
    description: 'LinkButton label font size (Label typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-High',
    description: 'LinkButton label font weight (Label emphasis high)',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    sizes: {
      '8': 'Label-S-LineHeight',
      '10': 'Label-M-LineHeight',
      '12': 'Label-L-LineHeight',
    },
    description: 'LinkButton label line height (from Label role)',
    cssProperty: 'line-height',
  },

  // ============================================
  // MOTION TOKENS
  // ============================================

  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Discreet-Medium',
    description: 'Duration for state transitions (hover, press)',
    cssProperty: 'transition-duration',
  },

  transitionEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Standard',
    description: 'Easing curve for state transitions',
    cssProperty: 'transition-timing-function',
  },

  // ============================================
  // ACCESSIBILITY TOKENS
  // ============================================

  focusOutlineColor: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline',
    description: 'Color of focus ring for keyboard navigation',
    cssProperty: 'outline-color',
  },

  focusOutlineWidth: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline-Width',
    description: 'Width of focus ring',
    cssProperty: 'outline-width',
  },

  minTouchTarget: {
    category: 'accessibility',
    defaultToken: 'Touch-Target-Min',
    locked: true,
    lockReason: 'WCAG AA requires minimum 44x44px touch target',
    description: 'Minimum touch target size for accessibility',
    cssProperty: 'min-width',
  },

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    states: {
      disabled: 'Disabled-Opacity',
    },
    description: 'Opacity when link button is disabled',
    cssProperty: 'opacity',
  },
};

/**
 * Slot definitions for the LinkButton component
 */
const LINKBUTTON_SLOTS: Record<string, ComponentSlotDefinition> = {
  start: { name: 'start', types: ['icon', 'custom'], tokens: ['iconSize', 'iconGap'] },
  end: { name: 'end', types: ['icon', 'custom'], tokens: ['iconSize', 'iconGap'] },
  loading: { name: 'loading', types: ['spinner'], tokens: ['disabledOpacity', 'transitionDuration'] },
};

/**
 * Complete LinkButton token manifest
 */
export const LINKBUTTON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'LinkButton',
  version: '1.0.0',
  description:
    'Button with link-like styling — transparent background, underline-based attention levels. Uses Label role typography. Three sizes (S/M/L). NOT a navigation element (use Link for <a> tags).',
  tokens: LINKBUTTON_TOKENS,
  totalTokens: Object.keys(LINKBUTTON_TOKENS).length,
  categories: {
    color: 2,
    spacing: 5,
    shape: 1,
    stroke: 1,
    decoration: 1,
    typography: 3,
    motion: 2,
    accessibility: 4,
  },
  slots: LINKBUTTON_SLOTS,
};

/**
 * Get all tokens for a specific category
 */
export function getLinkButtonTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(LINKBUTTON_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getLinkButtonTokenDefault(
  tokenName: keyof typeof LINKBUTTON_TOKENS,
  options?: { variant?: string; size?: string; state?: string }
): string {
  const definition = LINKBUTTON_TOKENS[tokenName];
  if (!definition) return '';

  // Check state-specific value first
  if (options?.state && definition.states) {
    const stateValues = definition.states[options.state as keyof typeof definition.states];
    if (stateValues) {
      if (typeof stateValues === 'string') return stateValues;
      if (options?.variant && stateValues[options.variant]) {
        return stateValues[options.variant];
      }
    }
  }

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

/**
 * Check if a token is locked (cannot be customized)
 */
export function isLinkButtonTokenLocked(tokenName: keyof typeof LINKBUTTON_TOKENS): boolean {
  return LINKBUTTON_TOKENS[tokenName]?.locked === true;
}

/**
 * Get the lock reason for a token
 */
export function getLinkButtonTokenLockReason(
  tokenName: keyof typeof LINKBUTTON_TOKENS
): string | undefined {
  return LINKBUTTON_TOKENS[tokenName]?.lockReason;
}
