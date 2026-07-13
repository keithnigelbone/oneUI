/**
 * IconButton.tokens.ts
 *
 * Token manifest for the IconButton component.
 * 6 sizes (2XS-XL), condensed mode, shape layouts, all appearance roles.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const ICON_BUTTON_TOKENS: Record<string, TokenDefinition> = {
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
    description: 'IconButton background color, varies by variant and state',
    cssProperty: 'background-color',
  },

  iconColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Bold-High',
    variants: {
      bold: 'Primary-Bold-High',
      subtle: 'Primary-TintedA11y',
      ghost: 'Primary-TintedA11y',
    },
    description: 'Icon color, varies by variant',
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
    description: 'Border color per variant (ghost only by default)',
    cssProperty: 'border-color',
  },

  borderWidth: {
    category: 'stroke',
    defaultToken: '0px',
    variants: {
      bold: '0px',
      subtle: '0px',
      ghost: '0px',
    },
    description: 'Border width per variant. Family themes can opt the bold style into an outline.',
    cssProperty: 'border-width',
  },

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

  uncontainedIconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    sizes: {
      '4': 'Spacing-3',
      '6': 'Spacing-3',
      '8': 'Spacing-4',
      '10': 'Spacing-5',
      '12': 'Spacing-6',
      '14': 'Spacing-8',
    },
    description: 'Icon size when contained=false (container hugs icon per Figma)',
    cssProperty: 'width',
  },

  uncontainedIconColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-TintedA11y',
    variants: {
      high: 'Primary-TintedA11y',
      medium: 'Primary-High',
      low: 'Primary-Low',
    },
    description: 'Icon color when contained=false, by attention level',
    cssProperty: 'color',
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

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius (default: pill/circle shape)',
    cssProperty: 'border-radius',
  },

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

  cssDecorationClipPath: {
    category: 'decoration',
    defaultToken: 'none',
    description: 'Optional CSS-only clipping for brand-specific icon button shapes.',
    cssProperty: 'clip-path',
  },

  cssDecorationStrokeWidth: {
    category: 'decoration',
    defaultToken: 'Stroke-L',
    description: 'Stroke width used by CSS-only icon button decoration details.',
    cssProperty: 'border-width',
  },

  cssDecorationStrokeStyle: {
    category: 'decoration',
    defaultToken: 'solid',
    description: 'Stroke style used by CSS-only icon button decoration details.',
    cssProperty: 'border-style',
  },

  cssDecorationInsetStrokeWidth: {
    category: 'decoration',
    defaultToken: 'Spacing-0',
    description: 'Inset stroke width used by CSS-only icon button decoration details.',
    cssProperty: 'border-width',
  },

  cssDecorationCornerSize: {
    category: 'decoration',
    defaultToken: 'Spacing-2',
    description: 'Corner size used by CSS-only cut-corner icon button decoration.',
    cssProperty: 'clip-path',
  },

  cssDecorationShadow: {
    category: 'decoration',
    defaultToken: 'none',
    description: 'Optional CSS-only inset detail for decorated icon buttons.',
    cssProperty: 'box-shadow',
  },

  cssDecorationUnderlineWidth: {
    category: 'decoration',
    defaultToken: 'Spacing-0',
    description: 'Optional CSS-only underline thickness for decorated icon buttons.',
    cssProperty: 'border-bottom-width',
  },

  cssDecorationColor: {
    category: 'decoration',
    defaultToken: 'currentColor',
    description: 'Color used by CSS-only icon button decoration details.',
    cssProperty: 'border-color',
  },
};

export const ICON_BUTTON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'IconButton',
  version: '4.0.0',
  description:
    'Icon-only interactive element. Contained chip or uncontained icon-only mode. 6 sizes (2XS-XL), condensed mode, 1:1/3:2 shape layouts. Multi-accent appearance roles.',
  tokens: ICON_BUTTON_TOKENS,
  totalTokens: Object.keys(ICON_BUTTON_TOKENS).length,
  categories: {
    color: 4,
    stroke: 1,
    spacing: 4,
    shape: 1,
    motion: 2,
    accessibility: 3,
    decoration: 8,
  },
};

export function getIconButtonTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(ICON_BUTTON_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

export function getIconButtonTokenDefault(
  tokenName: keyof typeof ICON_BUTTON_TOKENS,
  options?: { variant?: string; size?: string; state?: string },
): string {
  const definition = ICON_BUTTON_TOKENS[tokenName];
  if (!definition) return '';

  if (options?.state && definition.states) {
    const stateValues = definition.states[options.state as keyof typeof definition.states];
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
