/**
 * WebHeader.tokens.ts
 *
 * Token manifest for the WebHeader component.
 * Defines all design tokens used and their customization options.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const WEBHEADER_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Default',
    variants: {
      default: 'Surface-Default',
      transparent: 'transparent',
      glass: 'Surface-Glass',
    },
    description: 'Header background color, varies by variant',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description: 'Primary text color for nav items',
    cssProperty: 'color',
  },

  activeItemBackground: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Subtle',
    description: 'Active nav item pill background',
    cssProperty: 'background-color',
  },

  activeItemTextColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-TintedA11y',
    description: 'Active nav item text color (accent)',
    cssProperty: 'color',
  },

  indicatorColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-TintedA11y',
    description: 'Sliding indicator bar color',
    cssProperty: 'background-color',
  },

  dividerColor: {
    category: 'color',
    subcategory: 'border',
    defaultToken: 'Border-Subtle',
    description: 'Bottom divider line color',
    cssProperty: 'background-color',
  },

  hoverColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Hover',
    states: {
      hover: 'Primary-Hover',
      pressed: 'Primary-Pressed',
    },
    description: 'Nav item hover background',
    cssProperty: 'background-color',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  rowHeight: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-14',
    description: 'Height of primary/secondary nav rows (56px)',
    cssProperty: 'min-height',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-Margin',
    description: 'Horizontal padding (matches grid margin)',
    cssProperty: 'padding-inline',
  },

  itemPaddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    description: 'Nav item horizontal padding inside pill',
    cssProperty: 'padding-inline',
  },

  itemGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-0-5',
    description: 'Gap between nav items',
    cssProperty: 'gap',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  itemBorderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Nav item pill border radius',
    cssProperty: 'border-radius',
  },

  searchBorderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Search input border radius',
    cssProperty: 'border-radius',
  },

  // ============================================
  // TYPOGRAPHY TOKENS
  // ============================================

  itemFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    description: 'Nav item font size (14px)',
    cssProperty: 'font-size',
  },

  itemFontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Nav item default font weight',
    cssProperty: 'font-weight',
  },

  // ============================================
  // MOTION TOKENS
  // ============================================

  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Discreet-Medium',
    description: 'Standard transition duration for hover/press states',
    cssProperty: 'transition-duration',
    locked: true,
    lockReason: 'Motion tokens are system-level and should not be overridden per-brand',
  },

  slideDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Expressive-Medium',
    description: 'Slide animation duration for indicator and show/hide',
    cssProperty: 'transition-duration',
    locked: true,
    lockReason: 'Motion tokens are system-level',
  },

  // ============================================
  // ACCESSIBILITY TOKENS (locked)
  // ============================================

  focusOutline: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline',
    description: 'Focus ring color',
    cssProperty: 'outline-color',
    locked: true,
    lockReason: 'Accessibility tokens cannot be brand-overridden',
  },
};

export const WEBHEADER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'WebHeader',
  version: '1.0.0',
  tokens: WEBHEADER_TOKENS,
  totalTokens: Object.keys(WEBHEADER_TOKENS).length,
  categories: {
    color: 7,
    spacing: 4,
    shape: 2,
    typography: 2,
    motion: 2,
    accessibility: 1,
  },
};
