/**
 * BottomNavigation.meta.ts
 *
 * Unified metadata for the BottomNavigation component. Documents the parent
 * BottomNavigationProps only; BottomNavItem's props are covered by the shared
 * family interface for drift-checking but are not enumerated separately here.
 */

import type { ComponentMeta } from '@oneui/shared';
import { BOTTOM_NAVIGATION_TOKEN_MANIFEST } from './BottomNavigation.tokens';
import { BOTTOM_NAVIGATION_RECIPE_DEFINITION } from './BottomNavigation.recipe';

export const BOTTOM_NAVIGATION_META: ComponentMeta = {
  name: 'BottomNavigation',
  slug: 'bottom-navigation',
  displayName: 'Bottom Navigation',
  description:
    'App-level bottom navigation bar. Accepts 2–5 <BottomNavItem> children with a shared `labelType` (none / 1line / 2line). Supports controlled or uncontrolled active value, multi-accent appearance roles, and an optional top hairline divider.',
  category: 'navigation',
  tags: ['navigation', 'nav', 'bottom-nav', 'tab-bar', 'mobile'],

  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '2–5 <BottomNavItem> children.',
      required: true,
    },
    {
      name: 'labelType',
      type: 'enum',
      description: 'Label layout for all items.',
      defaultValue: '1line',
      options: ['none', '1line', '2line'] as const,
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Controlled active item value. Match `value` on a child <BottomNavItem>.',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description: 'Uncontrolled initial active item value.',
    },
    {
      name: 'onValueChange',
      type: 'function',
      description: 'Called when an item is pressed and its `value` becomes active.',
    },
    {
      name: 'showDivider',
      type: 'boolean',
      description: 'Show the top edge-to-edge hairline divider.',
      defaultValue: true,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent role applied to all child items.',
      defaultValue: 'primary',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible name for the <nav> landmark.',
      required: true,
    },
  ],

  slots: [
    {
      name: 'children',
      description: '2–5 <BottomNavItem> children.',
      acceptedTypes: ['BottomNavItem'],
      cardinality: 'multiple',
      required: true,
    },
  ],

  previewMatrix: {
    variants: ['1line', '2line', 'none'],
    variantLabels: {
      '1line': '1 Line',
      '2line': '2 Lines',
      none: 'None',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: BOTTOM_NAVIGATION_TOKEN_MANIFEST,
  recipeDefinition: BOTTOM_NAVIGATION_RECIPE_DEFINITION,
};
