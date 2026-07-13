/**
 * BottomNavigation.tokens.ts
 *
 * Token manifest for the BottomNavigation + BottomNavItem components.
 * Colors are driven by the active appearance role; label layout (none/1line/2line)
 * toggles the item height token via the `labelType` prop.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const BOTTOM_NAVIGATION_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Main',
    description: 'Background fill of the nav bar.',
    cssProperty: 'background-color',
  },

  itemTextColorActive: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-TintedA11y',
    description:
      'Label/icon colour for the active item. Resolves against the active `appearance` role (primary by default).',
    cssProperty: 'color',
  },

  itemTextColorInactive: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-Low',
    description: 'Label/icon colour for inactive items.',
    cssProperty: 'color',
  },

  itemHoverColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Hover',
    description: 'Background tint on hover for nav items.',
    cssProperty: 'background-color',
  },

  itemPressedColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Pressed',
    description: 'Background tint on press for nav items.',
    cssProperty: 'background-color',
  },

  // ============================================
  // SPACING
  // ============================================

  paddingVertical: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-2-5',
    description: 'Vertical padding of the nav bar container.',
    cssProperty: 'padding-block',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    description: 'Horizontal padding of the nav bar container.',
    cssProperty: 'padding-inline',
  },

  itemGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-0',
    description: 'Gap between nav items.',
    cssProperty: 'gap',
  },

  itemIconGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1-5',
    description: 'Gap between the icon and label inside each item.',
    cssProperty: 'gap',
  },

  itemIconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4-5',
    description: 'Icon size per item.',
    cssProperty: 'width',
  },

  // ============================================
  // LAYOUT — per labelType
  // ============================================

  itemHeight: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-10',
    variants: {
      '1line': 'Spacing-10',
      '2line': 'Spacing-12',
      none: 'Spacing-9',
    },
    description: 'Item height per label layout.',
    cssProperty: 'min-height',
  },

  // ============================================
  // SHAPE
  // ============================================

  itemBorderRadius: {
    category: 'shape',
    defaultToken: 'Shape-4',
    description: 'Border radius of each nav item background.',
    cssProperty: 'border-radius',
  },

  // ============================================
  // TYPOGRAPHY — label
  // ============================================

  labelFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-XS-FontSize',
    description: 'Font size of the nav item label.',
    cssProperty: 'font-size',
  },

  labelLineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-XS-LineHeight',
    description: 'Line height of the nav item label.',
    cssProperty: 'line-height',
  },

  labelFontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Font weight of the nav item label.',
    cssProperty: 'font-weight',
  },

  // ============================================
  // BORDER — top divider
  // ============================================

  dividerColor: {
    category: 'color',
    subcategory: 'border',
    defaultToken: 'Border-Subtle',
    description: 'Top hairline divider colour.',
    cssProperty: 'border-color',
  },

  dividerWidth: {
    category: 'spacing',
    subcategory: 'stroke',
    defaultToken: 'Border-Thin-Width',
    description: 'Top hairline divider thickness.',
    cssProperty: 'border-top-width',
  },
};

export const BOTTOM_NAVIGATION_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'BottomNavigation',
  version: '1.0.0',
  description:
    'App-level bottom navigation bar with 2–5 items, 3 label layouts (none/1line/2line), multi-accent roles, and optional top divider.',
  tokens: BOTTOM_NAVIGATION_TOKENS,
  totalTokens: Object.keys(BOTTOM_NAVIGATION_TOKENS).length,
  categories: {
    color: 6,
    spacing: 6,
    shape: 1,
    typography: 3,
  },
};
