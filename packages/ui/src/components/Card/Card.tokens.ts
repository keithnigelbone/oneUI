import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const CARD_TOKENS: Record<string, TokenDefinition> = {
  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-0',
    availableTokens: [
      { token: 'Shape-0', label: 'Sharp' },
      { token: 'Shape-3-5', label: 'Soft' },
      { token: 'Shape-4-5', label: 'Rounded' },
      { token: 'Shape-7', label: 'Expressive' },
      { token: 'Shape-10', label: 'Large expressive' },
    ],
    description: 'Shared card corner radius.',
    cssProperty: 'border-radius',
  },

  boxShadow: {
    category: 'elevation',
    defaultToken: 'Elevation-0',
    availableTokens: [
      { token: 'Elevation-0', label: 'Flat' },
      { token: 'Elevation-1', label: 'Raised' },
      { token: 'Elevation-2', label: 'Floating' },
      { token: 'Elevation-3', label: 'Overlay' },
    ],
    description: 'Shared card shadow elevation.',
    cssProperty: 'box-shadow',
  },

  borderWidth: {
    category: 'stroke',
    defaultToken: 'Stroke-M',
    availableTokens: [
      { token: 'Stroke-None', label: 'None' },
      { token: 'Stroke-S', label: 'Subtle' },
      { token: 'Stroke-M', label: 'Default' },
      { token: 'Stroke-L', label: 'Emphasized' },
    ],
    description: 'Shared card stroke width.',
    cssProperty: 'border-width',
  },

  borderColor: {
    category: 'color',
    subcategory: 'border',
    defaultToken: 'Neutral-Stroke-Low',
    description: 'Shared card stroke color.',
    cssProperty: 'border-color',
  },

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Main',
    description: 'Shared card fill color.',
    cssProperty: 'background-color',
  },

  padding: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-4-5',
    availableTokens: [
      { token: 'Spacing-4', label: 'Compact' },
      { token: 'Spacing-4-5', label: 'Default' },
      { token: 'Spacing-5', label: 'Roomy' },
    ],
    description: 'Shared card internal padding.',
    cssProperty: 'padding',
  },

  gap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3-5',
    availableTokens: [
      { token: 'Spacing-3', label: 'Compact' },
      { token: 'Spacing-3-5', label: 'Default' },
      { token: 'Spacing-4', label: 'Roomy' },
    ],
    description: 'Shared card internal stack gap.',
    cssProperty: 'gap',
  },
};

export const CARD_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Card',
  version: '1.0.0',
  description: 'Shared card design tokens for platform cards and reusable panels.',
  tokens: CARD_TOKENS,
  totalTokens: Object.keys(CARD_TOKENS).length,
  categories: {
    spacing: 2,
    shape: 1,
    elevation: 1,
    stroke: 1,
    color: 2,
  },
};
