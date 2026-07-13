/**
 * SelectableIconButton.tokens.ts
 *
 * Token manifest for the SelectableIconButton component.
 * 6 sizes (2XS-XL), condensed mode, 1:1/2:3 shape proportions.
 * Toggle behaviour: unselected = muted ghost, selected = attention-driven.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SELECTABLE_ICON_BUTTON_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'transparent',
    variants: {
      unselected: 'transparent',
      'selected-high': 'Primary-Bold',
      'selected-medium': 'Primary-Subtle',
      'selected-low': 'transparent',
    },
    states: {
      hover: {
        unselected: 'Primary-Hover',
        'selected-high': 'Primary-Bold-Hover',
        'selected-medium': 'Primary-Subtle-Hover',
        'selected-low': 'Primary-Hover',
      },
    },
    description: 'Background color — transparent when unselected; filled/tinted/transparent when selected based on attention level',
    cssProperty: 'background-color',
  },

  iconColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Medium-Text',
    variants: {
      unselected: 'Primary-Medium-Text',
      'selected-high': 'Primary-Bold-High',
      'selected-medium': 'Primary-TintedA11y',
      'selected-low': 'Primary-TintedA11y',
    },
    description: 'Icon color — muted when unselected; on-bold/accent when selected',
    cssProperty: 'color',
  },

  borderColor: {
    category: 'color',
    defaultToken: 'Primary-Stroke-Low',
    variants: {
      unselected: 'Primary-Stroke-Low',
      'selected-high': 'transparent',
      'selected-medium': 'transparent',
      'selected-low': 'Primary-Bold',
    },
    description: 'Border color — low stroke when unselected; transparent for high/medium selected; bold accent for low selected',
    cssProperty: 'border-color',
  },

  // ============================================
  // SPACING TOKENS — Container + Icon sizes
  // ============================================

  containerSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-10',
    sizes: {
      '4': 'Spacing-5',
      '6': 'Spacing-6',
      '8': 'Spacing-8',
      '10': 'Spacing-10',
      '12': 'Spacing-12',
      '14': 'Spacing-14',
    },
    description: 'Container width/height (square). F-step aligned.',
    cssProperty: 'width',
  },

  iconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    sizes: {
      '4': 'Spacing-2-5',
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
      '14': 'Spacing-7',
    },
    description: 'Icon width/height within the container (exactly half the container size)',
    cssProperty: 'width',
  },

  condensedContainerSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    sizes: {
      '4': 'Spacing-4',
      '6': 'Spacing-4-5',
      '8': 'Spacing-6',
      '10': 'Spacing-8',
      '12': 'Spacing-10',
      '14': 'Spacing-12',
    },
    description: 'Container size in condensed mode (reduced from normal)',
    cssProperty: 'width',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius (default: pill/circle shape)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // MOTION TOKENS
  // ============================================

  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-M',
    description: 'Duration for state transitions',
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
    description: 'Color of focus ring',
    cssProperty: 'outline-color',
  },

  focusOutlineWidth: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline-Width',
    description: 'Width of focus ring',
    cssProperty: 'outline-width',
  },

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    description: 'Opacity when disabled',
    cssProperty: 'opacity',
  },
};

export const SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'SelectableIconButton',
  version: '4.0.0',
  description:
    'Icon-only toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by attention level: high=bold fill, medium=subtle fill, low=ghost+accent border. 6 sizes (2XS-XL), condensed mode, 1:1/2:3 shape proportions. Multi-accent appearance roles.',
  tokens: SELECTABLE_ICON_BUTTON_TOKENS,
  totalTokens: Object.keys(SELECTABLE_ICON_BUTTON_TOKENS).length,
  categories: {
    color: 3,
    spacing: 3,
    shape: 1,
    motion: 2,
    accessibility: 3,
  },
};

export function getSelectableIconButtonTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(SELECTABLE_ICON_BUTTON_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

export function getSelectableIconButtonTokenDefault(
  tokenName: keyof typeof SELECTABLE_ICON_BUTTON_TOKENS,
  options?: { variant?: string; size?: string; state?: string },
): string {
  const definition = SELECTABLE_ICON_BUTTON_TOKENS[tokenName];
  if (!definition) return '';

  if (options?.state && definition.states) {
    const stateValues = definition.states[options.state as keyof typeof definition.states];
    if (stateValues) {
      if (typeof stateValues === 'string') return stateValues;
      if (options?.variant && (stateValues as Record<string, string>)[options.variant]) {
        return (stateValues as Record<string, string>)[options.variant];
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
