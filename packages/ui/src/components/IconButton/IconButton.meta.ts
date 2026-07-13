/**
 * IconButton.meta.ts
 * Unified metadata for the IconButton component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { ICON_BUTTON_TOKEN_MANIFEST } from './IconButton.tokens';
import { ICON_BUTTON_RECIPE_DEFINITION } from './IconButton.recipe';

export const ICON_BUTTON_META: ComponentMeta = {
  name: 'IconButton',
  slug: 'icon-button',
  displayName: 'Icon Button',
  description: 'Icon-only button with contained/uncontained modes, bold/subtle/ghost attention, 6 sizes, 1:1 or 3:2 layout, and multi-accent support.',
  category: 'actions',

  props: [
    {
      name: 'attention',
      type: 'enum',
      description: 'Attention level — high (bold), medium (subtle), low (ghost)',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
      brandOverridable: true,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Icon button size (f-step)',
      defaultValue: 10,
      options: [4, 6, 8, 10, 12, 14, '2xs', 'xs', 's', 'm', 'l', 'xl'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'layout',
      type: 'enum',
      description: 'Shape layout — square (1:1) or wide rectangle (3:2). Only when contained=true.',
      defaultValue: '1:1',
      options: ['1:1', '3:2'] as const,
    },
    {
      name: 'contained',
      type: 'boolean',
      description:
        'When true (default), renders a contained icon chip with background and sized container. When false, icon only — no chip. condensed, fullWidth, and 3:2 layout only apply when contained=true.',
      defaultValue: true,
      brandOverridable: true,
    },
    {
      name: 'condensed',
      type: 'boolean',
      description: 'Reduces container while keeping icon size. Only when contained=true.',
      defaultValue: false,
    },
    {
      name: 'icon',
      type: 'string',
      description: 'Semantic icon name (e.g., "star", "add", "close", "settings")',
      defaultValue: 'star',
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'loading',
      type: 'boolean',
      defaultValue: false,
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    sizes: [4, 6, 8, 10, 12, 14],
    sizeLabels: {
      '4': '2XS',
      '6': 'XS',
      '8': 'S',
      '10': 'M',
      '12': 'L',
      '14': 'XL',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: ICON_BUTTON_TOKEN_MANIFEST,
  recipeDefinition: ICON_BUTTON_RECIPE_DEFINITION,
};
