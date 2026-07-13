/**
 * ListItem.tokens.ts
 *
 * Token manifest for the ListItem component. ListItem colours resolve against
 * the active `appearance` role; the `selected` levels swap fill tokens and,
 * for `high`, re-anchor the row onto a bold surface (children read on-bold
 * content tokens automatically via [data-surface]).
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const LIST_ITEM_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR — title, support, icon
  // ============================================

  titleColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description: 'Primary line colour (Label-M).',
    cssProperty: 'color',
  },

  supportTextColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-Low',
    description: 'Secondary line colour (Body-S).',
    cssProperty: 'color',
  },

  endSlotColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-Medium',
    description: 'End-slot icon/chevron colour.',
    cssProperty: 'color',
  },

  // ============================================
  // COLOR — selected states
  // ============================================

  selectedMediumFill: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Subtle',
    description:
      'Background fill for `selected="medium"`. Tinted card; contents read surface context.',
    cssProperty: 'background-color',
  },

  selectedHighFill: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    description:
      'Background fill for `selected="high"`. Row switches to [data-surface="bold"] so children pick up on-bold content tokens.',
    cssProperty: 'background-color',
  },

  hoverColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Hover',
    description: 'Background tint on hover.',
    cssProperty: 'background-color',
  },

  pressedColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Pressed',
    description: 'Background tint on press.',
    cssProperty: 'background-color',
  },

  // ============================================
  // SPACING
  // ============================================

  paddingVertical: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    description: 'Vertical padding of the row.',
    cssProperty: 'padding-block',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-4',
    description: 'Horizontal padding of the row.',
    cssProperty: 'padding-inline',
  },

  slotGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3-5',
    description: 'Gap between start slot, text block, and end slot.',
    cssProperty: 'gap',
  },

  // ============================================
  // TYPOGRAPHY — title + support
  // ============================================

  titleFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    description: 'Title font size (Label role, Medium).',
    cssProperty: 'font-size',
  },

  titleFontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-High',
    description: 'Title font weight (Label role, High emphasis).',
    cssProperty: 'font-weight',
  },

  titleLineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    description: 'Title line height (Label role, Medium).',
    cssProperty: 'line-height',
  },

  supportFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-S-FontSize',
    description: 'Support text font size (Body role, Small).',
    cssProperty: 'font-size',
  },

  supportFontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Body-FontWeight-Low',
    description: 'Support text font weight (Body role, Low emphasis).',
    cssProperty: 'font-weight',
  },

  supportLineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Body-S-LineHeight',
    description: 'Support text line height (Body role, Small).',
    cssProperty: 'line-height',
  },

  // ============================================
  // BORDER — dividers
  // ============================================

  dividerColor: {
    category: 'color',
    subcategory: 'border',
    defaultToken: 'Border-Subtle',
    description: 'Colour of the inter-row divider.',
    cssProperty: 'border-color',
  },

  dividerWidth: {
    category: 'spacing',
    subcategory: 'stroke',
    defaultToken: 'Border-Thin-Width',
    description: 'Thickness of the inter-row divider.',
    cssProperty: 'border-bottom-width',
  },

  // ============================================
  // ACCESSIBILITY
  // ============================================

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    description: 'Opacity when disabled.',
    cssProperty: 'opacity',
  },
};

export const LIST_ITEM_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'ListItem',
  version: '1.0.0',
  description:
    'Single row in a list. Supports title + optional supportText, start/end slots (4 start sizes, 2 end sizes), three selected levels, multi-accent roles, optional bottom divider, and inset container variant.',
  tokens: LIST_ITEM_TOKENS,
  totalTokens: Object.keys(LIST_ITEM_TOKENS).length,
  categories: {
    color: 8,
    spacing: 4,
    typography: 6,
    accessibility: 1,
  },
};
