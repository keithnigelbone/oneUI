/**
 * SelectableButton.tokens.ts
 *
 * Token manifest for the SelectableButton component.
 * Defines all design tokens used and their customization options.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SELECTABLE_BUTTON_TOKENS: Record<string, TokenDefinition> = {
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
    description: 'Background color — always transparent when unselected; filled/tinted/transparent when selected based on attention level',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Medium-Text',
    variants: {
      unselected: 'Primary-Medium-Text',
      'selected-high': 'Primary-Bold-High',
      'selected-medium': 'Primary-TintedA11y',
      'selected-low': 'Primary-TintedA11y',
    },
    description: 'Text color — muted when unselected; on-bold/accent when selected',
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
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius (pill by default, brand-overridable)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  height: {
    category: 'spacing',
    defaultToken: 'Spacing-10',
    sizes: {
      xs: 'Spacing-4-5',
      s: 'Spacing-8',
      m: 'Spacing-10',
      l: 'Spacing-12',
    },
    description: 'Selectable button height per size (XS=24px, S=32px, M=40px, L=48px)',
    cssProperty: 'min-height',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-5',
    sizes: {
      xs: 'Spacing-4',
      s: 'Spacing-4',
      m: 'Spacing-5',
      l: 'Spacing-6',
    },
    description: 'Horizontal padding per size. Reduces when slots present.',
    cssProperty: 'padding-inline',
  },

  gap: {
    category: 'spacing',
    defaultToken: 'Spacing-1-5',
    sizes: {
      xs: 'Spacing-1',
      s: 'Spacing-1',
      m: 'Spacing-1-5',
      l: 'Spacing-1-5',
    },
    description: 'Gap between slots and label',
    cssProperty: 'gap',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    sizes: {
      xs: 'Label-XS-FontSize',
      s: 'Label-S-FontSize',
      m: 'Label-M-FontSize',
      l: 'Label-L-FontSize',
    },
    description: 'Font size (Label typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-High',
    description: 'Font weight (Label emphasis high)',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    sizes: {
      xs: 'Label-XS-LineHeight',
      s: 'Label-S-LineHeight',
      m: 'Label-M-LineHeight',
      l: 'Label-L-LineHeight',
    },
    description: 'Line height (from Label role)',
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
};

export const SELECTABLE_BUTTON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'SelectableButton',
  version: '4.0.0',
  description:
    'Toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by attention level: high=bold fill, medium=subtle fill, low=ghost+accent border. Supports contained (pill) and uncontained (inline text) modes.',
  tokens: SELECTABLE_BUTTON_TOKENS,
  totalTokens: Object.keys(SELECTABLE_BUTTON_TOKENS).length,
  categories: {
    color: 3,
    shape: 1,
    spacing: 3,
    typography: 3,
    motion: 1,
  },
  slots: {
    start: {
      name: 'start',
      types: ['Icon'],
      tokens: [],
    },
    end: {
      name: 'end',
      types: ['Icon'],
      tokens: [],
    },
  },
};

export function getSelectableButtonTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(SELECTABLE_BUTTON_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

export function getSelectableButtonTokenDefault(
  tokenName: keyof typeof SELECTABLE_BUTTON_TOKENS,
  options?: { variant?: string; size?: string }
): string {
  const definition = SELECTABLE_BUTTON_TOKENS[tokenName];
  if (!definition) return '';

  if (options?.size && definition.sizes?.[options.size]) {
    return definition.sizes[options.size];
  }
  if (options?.variant && definition.variants?.[options.variant]) {
    return definition.variants[options.variant];
  }
  return definition.defaultToken;
}
