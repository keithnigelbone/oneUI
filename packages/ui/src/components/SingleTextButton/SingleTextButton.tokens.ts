/**
 * SingleTextButton.tokens.ts
 *
 * Token manifest for the SingleTextButton component.
 * 3 sizes (S/M/L), always contained, no icon slots, circular by default.
 * Action button — attention drives the full visual.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SINGLE_TEXT_BUTTON_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    variants: {
      high: 'Primary-Bold',
      medium: 'Primary-Subtle',
      low: 'transparent',
    },
    states: {
      hover: {
        high: 'Primary-Bold-Hover',
        medium: 'Primary-Subtle-Hover',
        low: 'Primary-Hover',
      },
      pressed: {
        high: 'Primary-Bold-Pressed',
        medium: 'Primary-Subtle-Pressed',
        low: 'Primary-Pressed',
      },
    },
    description:
      'Background color per attention. high=bold fill, medium=subtle fill, low=transparent.',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Bold-High',
    variants: {
      high: 'Primary-Bold-High',
      medium: 'Primary-TintedA11y',
      low: 'Primary-TintedA11y',
    },
    description:
      'Text color per attention. high=on-bold, medium/low=tinted-a11y accent.',
    cssProperty: 'color',
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
    defaultToken: 'Spacing-1',
    sizes: {
      s: 'Spacing-0-5',
      m: 'Spacing-1',
      l: 'Spacing-2',
    },
    description: 'Padding per size (circular component — uniform on all sides).',
    cssProperty: 'padding',
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

export const SINGLE_TEXT_BUTTON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'SingleTextButton',
  version: '4.0.0',
  description:
    'Circular text-only action button (max 2 characters). Attention drives the full visual: high=bold fill, medium=subtle fill, low=ghost. 3 sizes (S/M/L), always pill-shaped.',
  tokens: SINGLE_TEXT_BUTTON_TOKENS,
  totalTokens: Object.keys(SINGLE_TEXT_BUTTON_TOKENS).length,
  categories: {
    color: 2,
    shape: 1,
    spacing: 2,
    typography: 3,
    motion: 1,
  },
};

export function getSingleTextButtonTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(SINGLE_TEXT_BUTTON_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

export function getSingleTextButtonTokenDefault(
  tokenName: keyof typeof SINGLE_TEXT_BUTTON_TOKENS,
  options?: { variant?: string; size?: string; state?: string },
): string {
  const definition = SINGLE_TEXT_BUTTON_TOKENS[tokenName];
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
