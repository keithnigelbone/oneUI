/**
 * Tabs.meta.ts
 *
 * Unified metadata for the Tabs / TabGroup / TabItem components.
 * References existing token manifest and recipe definition.
 */

import type { ComponentMeta } from '@oneui/shared';
import { TABS_TOKEN_MANIFEST } from './Tabs.tokens';
import { TABS_RECIPE_DEFINITION } from './Tabs.recipe';

export const TABS_META: ComponentMeta = {
  name: 'Tabs',
  slug: 'tabs',
  displayName: 'Tabs',
  description:
    'Accessible tabbed navigation. Uses Base UI Tabs primitive for keyboard navigation, arrow/Home/End keys, and automatic focus management. Three sizes (S/M/L), two orientations (horizontal/vertical). Matching Figma spec: selected tab gets an animated tinted indicator, tinted-accessible label color, and a surface-aware double-ring focus halo. Supports start + end content slots; icon + badge are legacy aliases.',
  category: 'navigation',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'TabGroup / TabItem size',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'orientation',
      type: 'enum',
      description: 'Layout orientation — horizontal (bottom indicator) or vertical (left-edge indicator)',
      defaultValue: 'horizontal',
      options: ['horizontal', 'vertical'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role',
      defaultValue: 'primary',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'activateOnFocus',
      type: 'boolean',
      description: 'Change the active tab when a tab receives focus (Base UI). Default false = activate on Enter/Space.',
      defaultValue: false,
    },
    {
      name: 'loopFocus',
      type: 'boolean',
      description: 'Arrow-key focus loops from last to first tab (Base UI)',
      defaultValue: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable a TabItem',
      defaultValue: false,
    },
  ],

  slots: [
    {
      name: 'start',
      description: 'Leading content on a TabItem (Icon, Avatar, CounterBadge, IndicatorBadge). Alias: `icon`.',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
    },
    {
      name: 'end',
      description: 'Trailing content on a TabItem (Icon, Avatar, CounterBadge, IndicatorBadge). Alias: `badge`.',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
    },
  ],

  previewMatrix: {
    variants: ['horizontal', 'vertical'],
    variantLabels: {
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
    sizes: ['s', 'm', 'l'],
    sizeLabels: {
      s: 'S',
      m: 'M',
      l: 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: TABS_TOKEN_MANIFEST,
  recipeDefinition: TABS_RECIPE_DEFINITION,
};
