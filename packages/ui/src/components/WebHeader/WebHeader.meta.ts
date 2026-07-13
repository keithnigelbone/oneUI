/**
 * WebHeader.meta.ts
 *
 * Unified metadata for the WebHeader component.
 * Used by the component registry, editor, and documentation.
 */

import type { ComponentMeta } from '@oneui/shared';
import { WEBHEADER_TOKEN_MANIFEST } from './WebHeader.tokens';
import { WEBHEADER_RECIPE_DEFINITION } from './WebHeader.recipe';

export const WEBHEADER_META: ComponentMeta = {
  name: 'WebHeader',
  slug: 'web-header',
  displayName: 'Web Header',
  description:
    'Responsive web navigation header with primary nav bar, secondary nav tabs, mobile drawer, search, and scroll-based show/hide.',
  category: 'navigation',
  tags: [
    'header',
    'navigation',
    'nav',
    'topbar',
    'menu',
    'responsive',
    'drawer',
    'search',
  ],

  props: [
    {
      name: 'variant',
      type: 'enum',
      description: 'Visual style — default (sticky), transparent (fixed overlay), glass (frosted), hidden, stickyHidden',
      defaultValue: 'default',
      options: ['default', 'transparent', 'glass', 'hidden', 'stickyHidden'] as const,
    },
    {
      name: 'type',
      type: 'enum',
      description: 'Bar purpose — homeBar (nav items), contextBar (simpler), searchBar (search-focused)',
      defaultValue: 'homeBar',
      options: ['homeBar', 'contextBar', 'searchBar'] as const,
    },
    {
      name: 'middle',
      type: 'enum',
      description: 'Middle section layout — fluid (fills space) or centred (absolute center)',
      defaultValue: 'fluid',
      options: ['fluid', 'centred', 'none'] as const,
    },
    {
      name: 'searchInput',
      type: 'enum',
      description: 'Search input position — none (hidden), middle (with nav items), end (in actions area)',
      defaultValue: 'none',
      options: ['none', 'middle', 'end'] as const,
    },
    {
      name: 'showMenuButton',
      type: 'boolean',
      description: 'Show hamburger menu icon button',
      defaultValue: false,
    },
    {
      name: 'primaryNavItems',
      type: 'boolean',
      description: 'Show/hide nav items in middle section',
      defaultValue: true,
    },
    {
      name: 'divider',
      type: 'boolean',
      description: 'Show/hide bottom divider',
      defaultValue: true,
    },
    {
      name: 'breakpoint',
      type: 'enum',
      description: 'Responsive breakpoint (auto-detected by default)',
      options: ['S', 'M', 'L'] as const,
    },
  ],

  slots: [
    {
      name: 'logo',
      description: 'Product logo in the start section (use Logo component)',
      acceptedTypes: ['Logo'],
      cardinality: 'single',
    },
    {
      name: 'avatar',
      description: 'User avatar in the end section (use Avatar component)',
      acceptedTypes: ['Avatar'],
      cardinality: 'single',
    },
    {
      name: 'end',
      description: 'End action buttons (use IconButton components)',
      acceptedTypes: ['IconButton'],
      cardinality: 'multiple',
    },
    {
      name: 'children',
      description: 'Navigation items (use WebHeader.Item)',
      acceptedTypes: ['HeaderItem'],
      cardinality: 'multiple',
    },
    {
      name: 'start',
      description: 'Start content on WebHeader.Item (Icon, Avatar, CounterBadge, IndicatorBadge)',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
      cardinality: 'single',
    },
    {
      name: 'end',
      description: 'End content on WebHeader.Item (Icon, Avatar, CounterBadge, IndicatorBadge)',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
      cardinality: 'single',
    },
  ],

  previewMatrix: {
    variants: ['default', 'transparent', 'glass'],
    variantLabels: {
      default: 'Default',
      transparent: 'Transparent',
      glass: 'Glass',
    },
    sizes: [],
    sizeLabels: {},
  },

  surfaceAware: false,
  multiAccent: false,

  tokenManifest: WEBHEADER_TOKEN_MANIFEST,
  recipeDefinition: WEBHEADER_RECIPE_DEFINITION,
};
