/**
 * ListItemGroup.tokens.ts
 *
 * Token manifest for the ListItemGroup layout primitive.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const LIST_ITEM_GROUP_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // BORDER — dividers
  // ============================================

  dividerColor: {
    category: 'color',
    subcategory: 'border',
    defaultToken: 'Border-Subtle',
    description:
      'Colour of the inter-row and section dividers.',
    cssProperty: 'border-color',
  },

  dividerThickness: {
    category: 'spacing',
    subcategory: 'stroke',
    defaultToken: 'Border-Thin-Width',
    description:
      'Thickness of the section and inter-row dividers.',
    cssProperty: 'border-width',
  },

  // ============================================
  // SHAPE — inset card
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-2',
    description:
      'Corner radius of the inset container framing. Applied only when container="inset".',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING — inset margin
  // ============================================

  insetMargin: {
    category: 'spacing',
    subcategory: 'margin',
    defaultToken: 'Spacing-3',
    description:
      'Horizontal margin applied when container="inset".',
    cssProperty: 'margin-inline',
  },
};

export const LIST_ITEM_GROUP_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'ListItemGroup',
  version: '1.0.0',
  description:
    'Thin shell that stacks <ListItem> children vertically. Optional top hairline (sectionDivider), inset rounded-card framing, and a uniform inter-row divider style that children can override per-row.',
  tokens: LIST_ITEM_GROUP_TOKENS,
  totalTokens: Object.keys(LIST_ITEM_GROUP_TOKENS).length,
  categories: {
    color: 1,
    spacing: 2,
    shape: 1,
  },
};
