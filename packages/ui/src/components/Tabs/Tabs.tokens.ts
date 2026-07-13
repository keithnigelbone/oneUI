/**
 * Tabs.tokens.ts
 *
 * Token manifest for the Tabs / TabGroup / TabItem components.
 * Used by the Component Token Editor to display customization options
 * and generate CSS overrides for brand customization.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const TABS_TOKENS: Record<string, TokenDefinition> = {
  // ========================================
  // COLOR TOKENS
  // ========================================
  indicatorColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Tinted',
    description: 'Selected-tab indicator bar color',
    cssProperty: 'background-color',
  },

  // ========================================
  // SHAPE
  // ========================================
  itemRadius: {
    category: 'shape',
    defaultToken: 'Shape-1-5',
    sizes: {
      s: 'Shape-2',
      m: 'Shape-1-5',
      l: 'Shape-2',
    },
    description: 'TabItem border-radius per size (horizontal: 8/6/8, vertical: 8)',
    cssProperty: 'border-radius',
  },

  indicatorRadius: {
    category: 'shape',
    defaultToken: 'Shape-0-5',
    description: 'Indicator bar corner radius (2px)',
    cssProperty: 'border-radius',
  },

  // ========================================
  // SPACING
  // ========================================
  itemHeight: {
    category: 'spacing',
    defaultToken: 'Spacing-10',
    sizes: {
      s: 'Spacing-8',
      m: 'Spacing-10',
      l: 'Spacing-12',
    },
    description: 'TabItem height per size (S=32, M=40, L=48)',
    cssProperty: 'height',
  },

  itemPaddingX: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-2-5',
    sizes: {
      s: 'Spacing-2',
      m: 'Spacing-2-5',
      l: 'Spacing-3',
    },
    description: 'Horizontal padding on horizontal TabItem (S=8, M=10, L=12)',
    cssProperty: 'padding-inline',
  },

  slotGap: {
    category: 'spacing',
    defaultToken: 'Spacing-1',
    description: 'Gap between start/label/end slots (4px)',
    cssProperty: 'gap',
  },

  indicatorThickness: {
    category: 'spacing',
    defaultToken: 'Stroke-XL',
    description: 'Thickness of the selected-tab indicator (2px)',
    cssProperty: 'height',
  },

  panelPadding: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-4',
    description: 'Panel body padding',
    cssProperty: 'padding',
  },

  // ========================================
  // TYPOGRAPHY
  // ========================================
  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    sizes: {
      s: 'Label-XS-FontSize',
      m: 'Label-S-FontSize',
      l: 'Label-M-FontSize',
    },
    description: 'TabItem label font size (Label role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'TabItem label font weight',
    cssProperty: 'font-weight',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-S-LineHeight',
    sizes: {
      s: 'Label-XS-LineHeight',
      m: 'Label-S-LineHeight',
      l: 'Label-M-LineHeight',
    },
    description: 'TabItem label line-height',
    cssProperty: 'line-height',
  },

  fontFamily: {
    category: 'typography',
    defaultToken: 'Typography-Font-Primary',
    description: 'TabItem label font family',
    cssProperty: 'font-family',
  },
};

export const TABS_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Tabs',
  version: '4.0.0',
  description:
    'Accessible tabbed navigation built on Base UI Tabs. Three sizes (S/M/L), two orientations (horizontal/vertical). Selected tab gets an animated indicator bar (bottom for horizontal, left edge for vertical). Multi-accent appearance, surface-context-aware focus halo.',
  tokens: TABS_TOKENS,
  totalTokens: Object.keys(TABS_TOKENS).length,
  categories: {
    color: 1,
    shape: 2,
    spacing: 5,
    typography: 4,
  },
  slots: {
    start: {
      name: 'start',
      types: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
      tokens: [],
    },
    end: {
      name: 'end',
      types: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
      tokens: [],
    },
  },
};

export function getTabsTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(TABS_TOKENS).filter(([, def]) => def.category === category);
}
