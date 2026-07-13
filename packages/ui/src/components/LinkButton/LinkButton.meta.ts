/**
 * LinkButton.meta.ts
 * Unified metadata for the LinkButton component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { LINKBUTTON_TOKEN_MANIFEST } from './LinkButton.tokens';
import { LINKBUTTON_RECIPE_DEFINITION } from './LinkButton.recipe';

export const LINKBUTTON_META: ComponentMeta = {
  name: 'LinkButton',
  slug: 'link-button',
  displayName: 'Link Button',
  description: 'Text-style button with underline emphasis, high/medium/low attention levels, and start/end content slots.',
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
      description: 'Size (f-step)',
      defaultValue: 10,
      options: [8, 10, 12, 's', 'm', 'l'] as const,
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
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'loading',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Button label text',
      required: true,
    },
  ],

  slots: [
    {
      name: 'start',
      description: 'Content before the label (icon)',
      acceptedTypes: ['Icon'],
    },
    {
      name: 'end',
      description: 'Content after the label (icon)',
      acceptedTypes: ['Icon'],
    },
  ],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    sizes: [8, 10, 12],
    sizeLabels: {
      '8': 'S',
      '10': 'M',
      '12': 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: LINKBUTTON_TOKEN_MANIFEST,
  recipeDefinition: LINKBUTTON_RECIPE_DEFINITION,
};
