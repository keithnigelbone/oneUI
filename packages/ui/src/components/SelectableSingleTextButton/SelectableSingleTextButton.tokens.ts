/**
 * SelectableSingleTextButton.tokens.ts
 *
 * Token manifest for the SelectableSingleTextButton component.
 * 3 sizes (S/M/L), always contained, no icon slots.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SELECTABLE_SINGLE_TEXT_BUTTON_TOKENS: Record<string, TokenDefinition> = {
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
    description:
      'Background color — always transparent when unselected; filled/tinted/transparent when selected based on attention level',
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
    description:
      'Border color — low stroke when unselected; transparent for high/medium selected; bold accent for low selected',
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
  // SPACING TOKENS (S/M/L only)
  // ============================================

  height: {
    category: 'spacing',
    defaultToken: 'Spacing-10',
    sizes: {
      s: 'Spacing-8',
      m: 'Spacing-10',
      l: 'Spacing-12',
    },
    description: 'Button height per size (S=32px, M=40px, L=48px)',
    cssProperty: 'min-height',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-5',
    sizes: {
      s: 'Spacing-4',
      m: 'Spacing-5',
      l: 'Spacing-6',
    },
    description: 'Horizontal padding per size.',
    cssProperty: 'padding-inline',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role)
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    sizes: {
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

export const SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'SelectableSingleTextButton',
  version: '4.0.0',
  description:
    'Text-only toggle button. Unselected state is always muted ghost. Selected appearance is driven by attention level: high=bold fill, medium=subtle fill, low=ghost+accent border. 3 sizes (S/M/L), always pill-shaped.',
  tokens: SELECTABLE_SINGLE_TEXT_BUTTON_TOKENS,
  totalTokens: Object.keys(SELECTABLE_SINGLE_TEXT_BUTTON_TOKENS).length,
  categories: {
    color: 3,
    shape: 1,
    spacing: 2,
    typography: 3,
    motion: 1,
  },
};

export function getSelectableSingleTextButtonTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(SELECTABLE_SINGLE_TEXT_BUTTON_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

export function getSelectableSingleTextButtonTokenDefault(
  tokenName: keyof typeof SELECTABLE_SINGLE_TEXT_BUTTON_TOKENS,
  options?: { variant?: string; size?: string; state?: string },
): string {
  const definition = SELECTABLE_SINGLE_TEXT_BUTTON_TOKENS[tokenName];
  if (!definition) return '';

  if (options?.state && definition.states) {
    const stateValues =
      definition.states[options.state as keyof typeof definition.states];
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
