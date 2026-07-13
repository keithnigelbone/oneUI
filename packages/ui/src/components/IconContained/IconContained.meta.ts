/**
 * IconContained.meta.ts
 * Unified metadata for the IconContained component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { ICON_CONTAINED_TOKEN_MANIFEST } from './IconContained.tokens';
import { ICON_CONTAINED_RECIPE_DEFINITION } from './IconContained.recipe';

export const ICON_CONTAINED_META: ComponentMeta = {
  name: 'IconContained',
  slug: 'icon-contained',
  displayName: 'Icon Contained',
  description: 'Icon with a filled background container, high/medium attention levels, and multi-accent support.',
  category: 'display',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Container size',
      defaultValue: 'm',
      options: ['xs', 's', 'm', 'l', 'xl'] as const,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Visual emphasis (high=solid bold, medium=subtle tinted)',
      defaultValue: 'high',
      options: ['high', 'medium'] as const,
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
      name: 'icon',
      type: 'string',
      description: 'Semantic icon name (e.g., "star", "add", "settings")',
      defaultValue: 'star',
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['high', 'medium'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
    },
    sizes: ['xs', 's', 'm', 'l', 'xl'],
    sizeLabels: {
      xs: 'XS',
      s: 'S',
      m: 'M',
      l: 'L',
      xl: 'XL',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: ICON_CONTAINED_TOKEN_MANIFEST,
  recipeDefinition: ICON_CONTAINED_RECIPE_DEFINITION,
};
