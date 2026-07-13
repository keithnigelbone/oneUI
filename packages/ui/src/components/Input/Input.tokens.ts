/**
 * Input.tokens.ts
 *
 * Token manifest for the Input component.
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
 * All tokens used by the Input component, organized by property
 */
export const INPUT_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Ghost',
    variants: {
      outlined: 'Surface-Ghost',
      underlined: 'Surface-Ghost',
    },
    description: 'Input container background color',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Neutral-High',
    description: 'Input text color — Neutral-High in default context; remapped by [data-surface] on colored surfaces',
    cssProperty: 'color',
  },

  placeholderColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Neutral-Low',
    description: 'Placeholder text color — Neutral-Low in default context; remapped by [data-surface] on colored surfaces',
    cssProperty: 'color',
  },

  borderColor: {
    category: 'color',
    defaultToken: 'Neutral-Stroke-Medium',
    description: 'Border color — Neutral-Stroke-Medium in default context; role-specific stroke on colored surfaces',
    cssProperty: 'border-color',
  },

  focusRingColor: {
    category: 'color',
    defaultToken: 'Primary-Tinted',
    description: 'Focus border color (from role Tinted token via --_inp-default-tinted)',
    cssProperty: 'border-color',
  },

  labelColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description: 'Label text color — Text-High (neutral, not role-specific)',
    cssProperty: 'color',
  },

  errorColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Negative-TintedA11y',
    description: 'Error message text color (always Negative role)',
    cssProperty: 'color',
  },

  // ============================================
  // STROKE TOKENS
  // ============================================

  borderWidth: {
    category: 'stroke',
    defaultToken: 'Stroke-M',
    variants: {
      outlined: 'Stroke-M',
      underlined: 'Stroke-2XL',
    },
    description: 'Border width at rest — Stroke-M (medium attention). High attention forces 0 in CSS. Focus/invalid use Stroke-XL in Input.module.css',
    cssProperty: 'border-width',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  paddingVertical: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-1-5',
    sizes: {
      '6': 'Spacing-0',
      '8': 'Spacing-1-5',
      '10': 'Spacing-1-5',
      '12': 'Spacing-2',
    },
    description: 'Vertical (top/bottom) padding',
    cssProperty: 'padding-block',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    sizes: {
      '6': 'Spacing-1-5',
      '8': 'Spacing-3',
      '10': 'Spacing-3',
      '12': 'Spacing-3-5',
    },
    description: 'Horizontal (left/right) padding',
    cssProperty: 'padding-inline',
  },

  slotGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1-5',
    description: 'Gap between slots inside the input container',
    cssProperty: 'gap',
  },

  height: {
    category: 'spacing',
    defaultToken: 'Spacing-10',
    sizes: {
      '6': 'Spacing-6',
      '8': 'Spacing-8',
      '10': 'Spacing-10',
      '12': 'Spacing-12',
    },
    description: 'Minimum height per size (f-step aligned)',
    cssProperty: 'min-height',
  },

  iconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    sizes: {
      '6': 'Spacing-3',
      '8': 'Spacing-4-5',
      '10': 'Spacing-5',
      '12': 'Spacing-5',
    },
    description: 'Width and height of icon slots (start/end)',
    cssProperty: 'width',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-2',
    sizes: {
      '6': 'Shape-1-5',
      '8': 'Shape-2',
      '10': 'Shape-2',
      '12': 'Shape-3',
    },
    description:
      'Border radius per size — matches Figma DNA container radius (XS=Shape/1.5, S=Shape/2, M=Shape/2, L=Shape/3). Overridden by shape="pill".',
    cssProperty: 'border-radius',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Body role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-M-FontSize',
    sizes: {
      '6': 'Body-XS-FontSize',
      '8': 'Body-S-FontSize',
      '10': 'Body-M-FontSize',
      '12': 'Body-L-FontSize',
    },
    description: 'Input text font size (Body typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Body-FontWeight-Medium',
    description: 'Input text font weight (Body emphasis medium)',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Body-M-LineHeight',
    sizes: {
      '8': 'Body-S-LineHeight',
      '10': 'Body-M-LineHeight',
      '12': 'Body-L-LineHeight',
    },
    description: 'Input text line height (from Body role)',
    cssProperty: 'line-height',
  },

  labelFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    description: 'Label font size (Label role, small)',
    cssProperty: 'font-size',
  },

  labelFontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Label font weight (Label emphasis medium)',
    cssProperty: 'font-weight',
  },

  // ============================================
  // MOTION TOKENS
  // ============================================

  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-M',
    description: 'Duration for state transitions (hover, focus)',
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

  focusRingWidth: {
    category: 'accessibility',
    defaultToken: 'Stroke-2XL',
    description: 'Width of focus ring around input',
    cssProperty: 'box-shadow',
  },

  focusRingOffset: {
    category: 'accessibility',
    defaultToken: 'Stroke-XL',
    description: 'Offset between input and focus ring',
    cssProperty: 'box-shadow',
  },

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    states: {
      disabled: 'Disabled-Opacity',
    },
    description: 'Opacity when input is disabled',
    cssProperty: 'opacity',
  },
};

/**
 * Slot definitions for the Input component
 */
const INPUT_SLOTS: Record<string, ComponentSlotDefinition> = {
  start: {
    name: 'start',
    types: ['icon', 'iconButton', 'avatar', 'image', 'chipGroup', 'text', 'custom'],
    tokens: ['iconSize'],
  },
  start2: {
    name: 'start2',
    types: ['text'],
    tokens: [],
  },
  end: {
    name: 'end',
    types: ['iconButton', 'icon', 'button', 'text', 'custom'],
    tokens: ['iconSize'],
  },
  end2: {
    name: 'end2',
    types: ['text', 'icon', 'iconButton'],
    tokens: [],
  },
};

/**
 * Complete Input token manifest
 */
export const INPUT_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Input',
  version: '4.0.0',
  description:
    'Text input field with 4-slot system, attention levels, and multi-accent support. Colors from V4 surface system. Typography uses Body role. Four sizes (XS/S/M/L) aligned with Figma spec.',
  tokens: INPUT_TOKENS,
  totalTokens: Object.keys(INPUT_TOKENS).length,
  categories: {
    color: 7,
    stroke: 1,
    spacing: 5,
    shape: 1,
    typography: 5,
    motion: 2,
    accessibility: 3,
  },
  slots: INPUT_SLOTS,
};

/**
 * Get all tokens for a specific category
 */
export function getInputTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(INPUT_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getInputTokenDefault(
  tokenName: keyof typeof INPUT_TOKENS,
  options?: { variant?: string; size?: string; state?: string }
): string {
  const definition = INPUT_TOKENS[tokenName];
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

  // Check variant-specific value
  if (options?.variant && definition.variants) {
    const variantValue = definition.variants[options.variant];
    if (variantValue) return variantValue;
  }

  // Check size-specific value
  if (options?.size && definition.sizes) {
    const sizeValue = definition.sizes[options.size];
    if (sizeValue) return sizeValue;
  }

  return definition.defaultToken;
}
