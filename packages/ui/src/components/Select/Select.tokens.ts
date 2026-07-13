/**
 * Select.tokens.ts
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SELECT_TOKENS: Record<string, TokenDefinition> = {
  borderColor: {
    category: 'color',
    subcategory: 'stroke',
    defaultToken: 'Border-Subtle',
    description: 'Input trigger border colour',
    cssProperty: 'border-color',
  },
  borderRadius: {
    category: 'shape',
    defaultToken: 'Input-borderRadius',
    description: 'Trigger corner radius (inherits Input DNA)',
    cssProperty: 'border-radius',
  },
  popupBackgroundColor: {
    category: 'color',
    subcategory: 'fill',
    defaultToken: 'Surface-Elevated',
    description: 'Menu popup background',
    cssProperty: 'background-color',
  },
  itemHoverBackgroundColor: {
    category: 'color',
    subcategory: 'fill',
    defaultToken: 'Primary-Hover',
    description: 'Menu row hover / keyboard highlight fill (ListItem StateLayer)',
    cssProperty: 'background-color',
  },
  menuSizeM: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-40',
    description: 'Default menu min-width (menuSize=m)',
    cssProperty: 'min-width',
  },
};

export const SELECT_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Select',
  version: '1.0.0',
  tokens: SELECT_TOKENS,
  totalTokens: Object.keys(SELECT_TOKENS).length,
  categories: { color: 3, shape: 1, spacing: 1 },
};
