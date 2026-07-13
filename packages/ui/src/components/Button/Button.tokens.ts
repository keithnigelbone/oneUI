/**
 * Button.tokens.ts
 *
 * Token manifest for the Button component.
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
  countTokensByCategory,
} from '@oneui/shared';

/**
 * All tokens used by the Button component, organized by property
 */
export const BUTTON_TOKENS: Record<string, TokenDefinition> = {
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
    states: {
      hover: {
        bold: 'Primary-Bold-Hover',
        subtle: 'Primary-Subtle-Hover',
        ghost: 'Primary-Hover',
      },
      pressed: {
        bold: 'Primary-Bold-Pressed',
        subtle: 'Primary-Subtle-Pressed',
        ghost: 'Primary-Pressed',
      },
    },
    description: 'Button background color, varies by variant and state',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Bold-TintedA11y',
    variants: {
      bold: 'Primary-Bold-TintedA11y',
      subtle: 'Primary-TintedA11y',
      ghost: 'Primary-TintedA11y',
    },
    states: {
      hover: {
        bold: 'Primary-Bold-TintedA11y',
        subtle: 'Primary-TintedA11y',
        ghost: 'Primary-TintedA11y',
      },
      pressed: {
        bold: 'Primary-Bold-TintedA11y',
        subtle: 'Primary-TintedA11y',
        ghost: 'Primary-TintedA11y',
      },
    },
    description: 'Button text color, varies by variant. Subtle/ghost use Accent-A11y for proper contrast.',
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
    states: {
      hover: {
        bold: 'transparent',
        subtle: 'transparent',
        ghost: 'Primary-Stroke-Low',
      },
      pressed: {
        bold: 'transparent',
        subtle: 'transparent',
        ghost: 'Primary-Stroke-Low',
      },
    },
    availableTokens: [
      { token: 'Primary-Stroke-Low', label: 'Low Stroke' },
      { token: 'Primary-Stroke-Medium', label: 'Medium Stroke' },
      { token: 'Neutral-Stroke-Low', label: 'Neutral Low Stroke' },
      { token: 'Neutral-Stroke-Medium', label: 'Neutral Medium Stroke' },
      { token: 'transparent', label: 'Transparent' },
    ],
    description: 'Button border color per variant (from V4 surface on-colour tokens)',
    cssProperty: 'border-color',
  },

  strokeImage: {
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
    description: 'Button image stroke channel for gradient materials. Pair with borderColor as fallback.',
    cssProperty: 'background-image',
  },

  borderWidth: {
    category: 'stroke',
    defaultToken: '0px',
    variants: {
      bold: '0px',
      subtle: '0px',
      ghost: '0px',
    },
    states: {
      hover: {
        bold: '0px',
        subtle: '0px',
        ghost: '0px',
      },
      pressed: {
        bold: '0px',
        subtle: '0px',
        ghost: '0px',
      },
    },
    description: 'Border width per variant. All default to none; brands can opt into ghost border via override.',
    cssProperty: 'border-width',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  paddingVertical: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-1',
    sizes: {
      '6': 'Spacing-0-5',
      '8': 'Spacing-0-5',
      '10': 'Spacing-1',
      '12': 'Spacing-2',
    },
    description: 'Vertical (top/bottom) padding',
    cssProperty: 'padding-block',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-5',
    sizes: {
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Shared horizontal padding (overridden by paddingHorizontalStart/paddingHorizontalEnd)',
    cssProperty: 'padding-inline',
  },

  paddingHorizontalStart: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-5',
    sizes: {
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Left (start) padding. Falls back to paddingHorizontal.',
    cssProperty: 'padding-left',
  },

  paddingHorizontalEnd: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-5',
    sizes: {
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Right (end) padding. Falls back to paddingHorizontal.',
    cssProperty: 'padding-right',
  },

  iconGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1-5',
    sizes: {
      '6': 'Spacing-0-5',
      '8': 'Spacing-1',
      '10': 'Spacing-1-5',
      '12': 'Spacing-1-5',
    },
    description: 'Shared gap between icon slots and label text (overridden by iconGapStart/iconGapEnd)',
    cssProperty: 'margin-inline',
  },

  iconGapStart: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1-5',
    sizes: {
      '6': 'Spacing-0-5',
      '8': 'Spacing-1',
      '10': 'Spacing-1-5',
      '12': 'Spacing-1-5',
    },
    description: 'Gap between start (left) icon slot and label text. Falls back to iconGap.',
    cssProperty: 'margin-right',
  },

  iconGapEnd: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1-5',
    sizes: {
      '6': 'Spacing-0-5',
      '8': 'Spacing-1',
      '10': 'Spacing-1-5',
      '12': 'Spacing-1-5',
    },
    description: 'Gap between end (right) icon slot and label text. Falls back to iconGap.',
    cssProperty: 'margin-left',
  },

  iconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    sizes: {
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Shared icon size for both slots (overridden by iconSizeStart/iconSizeEnd)',
    cssProperty: 'width',
  },

  iconSizeStart: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    sizes: {
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Width and height of start (left) slot icon. Falls back to iconSize.',
    cssProperty: 'width',
  },

  iconSizeEnd: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    sizes: {
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
    },
    description: 'Width and height of end (right) slot icon. Falls back to iconSize.',
    cssProperty: 'width',
  },

  minHeight: {
    category: 'spacing',
    defaultToken: 'Spacing-10',
    sizes: {
      '6': 'Spacing-6',
      '8': 'Spacing-8',
      '10': 'Spacing-10',
      '12': 'Spacing-12',
    },
    description: 'Minimum button height (f-step aligned)',
    cssProperty: 'min-height',
  },

  // ============================================
  // CONDENSED MODE TOKENS
  // ============================================

  /* The condensed* token names below MUST match what Button.module.css
     reads (--Button-condensed{Property}-{size}). Renaming on either side
     without updating the other silently disables brand-level customisation
     of condensed sizing — the platform editor will appear to save edits
     while the rendered button keeps the CSS-literal fallback. */

  condensedMinHeight: {
    category: 'spacing',
    defaultToken: 'Spacing-6',
    sizes: {
      '6': 'Spacing-4-5',
      '8': 'Spacing-5',
      '10': 'Spacing-6',
      '12': 'Spacing-8',
    },
    description: 'Minimum height in condensed mode (reduced from normal)',
    cssProperty: 'min-height',
  },

  condensedPaddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    sizes: {
      '6': 'Spacing-2',
      '8': 'Spacing-2-5',
      '10': 'Spacing-3',
      '12': 'Spacing-3-5',
    },
    description: 'Horizontal padding in condensed mode (reduced from normal)',
    cssProperty: 'padding-inline',
  },

  condensedPaddingVertical: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0-5',
    sizes: {
      '6': 'Spacing-0-5',
      '8': 'Spacing-0-5',
      '10': 'Spacing-0-5',
      '12': 'Spacing-1',
    },
    description: 'Vertical padding in condensed mode (paired with condensedMinHeight to shrink both axes together)',
    cssProperty: 'padding-block',
  },

  condensedPaddingHorizontalStart: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    sizes: {
      '6': 'Spacing-2',
      '8': 'Spacing-2-5',
      '10': 'Spacing-3',
      '12': 'Spacing-3-5',
    },
    description: 'Left (start) padding in condensed mode. Falls back to condensedPaddingHorizontal.',
    cssProperty: 'padding-left',
  },

  condensedPaddingHorizontalEnd: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    sizes: {
      '6': 'Spacing-2',
      '8': 'Spacing-2-5',
      '10': 'Spacing-3',
      '12': 'Spacing-3-5',
    },
    description: 'Right (end) padding in condensed mode. Falls back to condensedPaddingHorizontal.',
    cssProperty: 'padding-right',
  },

  // ============================================
  // SLOT-AWARE PADDING TOKENS
  // ============================================

  slotPaddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-4',
    sizes: {
      '6': 'Spacing-2',
      '8': 'Spacing-3',
      '10': 'Spacing-4',
      '12': 'Spacing-5',
    },
    description: 'Horizontal padding when start/end slots are present (reduced from normal)',
    cssProperty: 'padding-inline',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius for button corners (Jio default: pill/capsule shape)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    sizes: {
      '6': 'Label-XS-FontSize',
      '8': 'Label-S-FontSize',
      '10': 'Label-M-FontSize',
      '12': 'Label-L-FontSize',
    },
    description: 'Button label font size (Label typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-High',
    description: 'Button label font weight (Label emphasis high)',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    sizes: {
      '6': 'Label-XS-LineHeight',
      '8': 'Label-S-LineHeight',
      '10': 'Label-M-LineHeight',
      '12': 'Label-L-LineHeight',
    },
    description: 'Button label line height (from Label role)',
    cssProperty: 'line-height',
  },

  textTransform: {
    category: 'typography',
    defaultToken: 'none',
    availableTokens: [
      { token: 'none', label: 'Sentence case' },
      { token: 'uppercase', label: 'Uppercase' },
    ],
    description: 'Text casing for button labels (none or uppercase)',
    cssProperty: 'text-transform',
  },

  letterSpacing: {
    category: 'typography',
    subcategory: 'letterSpacing',
    defaultToken: 'normal',
    description: 'Letter spacing for button labels (pairs with textTransform)',
    cssProperty: 'letter-spacing',
  },

  // ============================================
  // MOTION TOKENS
  // ============================================

  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-M',
    description: 'Duration for state transitions (hover, press)',
    cssProperty: 'transition-duration',
  },

  transitionEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition-Moderate',
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
    description: 'Opacity when button is disabled',
    cssProperty: 'opacity',
  },

  // ============================================
  // DECORATION TOKENS
  // ============================================

  ornamentHeightScale: {
    category: 'decoration',
    defaultToken: '1',
    availableTokens: [
      { token: '0.5', label: '50%' },
      { token: '0.75', label: '75%' },
      { token: '1', label: '100%' },
    ],
    description: 'Ornament height as scale factor of button height (1 = 100%)',
    cssProperty: 'height',
  },

  cssDecorationClipPath: {
    category: 'decoration',
    defaultToken: 'none',
    description: 'Optional CSS-only clipping for brand-specific action shapes.',
    cssProperty: 'clip-path',
  },

  cssDecorationStrokeWidth: {
    category: 'decoration',
    defaultToken: 'Stroke-L',
    description: 'Stroke width used by CSS-only button decoration details.',
    cssProperty: 'border-width',
  },

  cssDecorationStrokeStyle: {
    category: 'decoration',
    defaultToken: 'solid',
    description: 'Stroke style used by CSS-only button decoration details.',
    cssProperty: 'border-style',
  },

  cssDecorationInsetStrokeWidth: {
    category: 'decoration',
    defaultToken: 'Spacing-0',
    description: 'Inset stroke width used by CSS-only button decoration details.',
    cssProperty: 'border-width',
  },

  cssDecorationCornerSize: {
    category: 'decoration',
    defaultToken: 'Spacing-2',
    description: 'Corner size used by CSS-only cut-corner button decoration.',
    cssProperty: 'clip-path',
  },

  cssDecorationShadow: {
    category: 'decoration',
    defaultToken: 'none',
    description: 'Optional CSS-only inset detail for decorated action buttons.',
    cssProperty: 'box-shadow',
  },

  cssDecorationUnderlineWidth: {
    category: 'decoration',
    defaultToken: 'Spacing-0',
    description: 'Optional CSS-only underline thickness for decorated action buttons.',
    cssProperty: 'border-bottom-width',
  },

  cssDecorationColor: {
    category: 'decoration',
    defaultToken: 'currentColor',
    description: 'Color used by CSS-only button decoration details.',
    cssProperty: 'border-color',
  },

};

/**
 * Slot definitions for the Button component
 */
const BUTTON_SLOTS: Record<string, ComponentSlotDefinition> = {
  start: { name: 'start', types: ['icon', 'avatar', 'badge', 'custom'], tokens: ['iconSizeStart', 'iconGapStart'] },
  end: { name: 'end', types: ['icon', 'chevron', 'badge', 'custom'], tokens: ['iconSizeEnd', 'iconGapEnd'] },
  loading: { name: 'loading', types: ['spinner'], tokens: ['disabledOpacity', 'transitionDuration'] },
};

/**
 * Complete Button token manifest
 */
export const BUTTON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Button',
  version: '4.0.0',
  description:
    'Primary interactive element for triggering actions. Colors are derived from the surface system. Typography uses Label role. Three sizes (S/M/L) aligned with Figma spec. Condensed mode for dense layouts.',
  tokens: BUTTON_TOKENS,
  totalTokens: Object.keys(BUTTON_TOKENS).length,
  categories: {
    color: 3,
    stroke: 1,
    spacing: 14,
    shape: 1,
    typography: 5,
    motion: 2,
    accessibility: 4,
    decoration: 10,
  },
  slots: BUTTON_SLOTS,
};

/**
 * Get all tokens for a specific category
 */
export function getButtonTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(BUTTON_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getButtonTokenDefault(
  tokenName: keyof typeof BUTTON_TOKENS,
  options?: { variant?: string; size?: string; state?: string }
): string {
  const definition = BUTTON_TOKENS[tokenName];
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
export function isButtonTokenLocked(tokenName: keyof typeof BUTTON_TOKENS): boolean {
  return BUTTON_TOKENS[tokenName]?.locked === true;
}

/**
 * Get the lock reason for a token
 */
export function getButtonTokenLockReason(
  tokenName: keyof typeof BUTTON_TOKENS
): string | undefined {
  return BUTTON_TOKENS[tokenName]?.lockReason;
}
