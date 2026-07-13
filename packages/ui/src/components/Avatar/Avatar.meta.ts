/**
 * Avatar.meta.ts
 * Unified metadata for the Avatar component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { AVATAR_TOKEN_MANIFEST } from './Avatar.tokens';
import { AVATAR_RECIPE_DEFINITION } from './Avatar.recipe';

export const AVATAR_META: ComponentMeta = {
  name: 'Avatar',
  slug: 'avatar',
  displayName: 'Avatar',
  description: 'User representation with image, icon, or initials text content, t-shirt sizing, and attention levels.',
  category: 'display',

  props: [
    {
      name: 'content',
      type: 'enum',
      description: 'Display type',
      defaultValue: 'image',
      options: ['image', 'icon', 'text'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Avatar size (t-shirt scale)',
      defaultValue: 'm',
      options: ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', 'custom'] as const,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Visual emphasis (high=filled, medium=tinted, low=transparent)',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
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
      name: 'src',
      type: 'string',
      description: 'Image source URL',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text for accessibility',
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'onClick',
      type: 'function',
      description: 'Click handler — renders the avatar as an interactive Base UI button when set.',
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
    sizes: ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'],
    sizeLabels: {
      '2xs': '2XS',
      'xs': 'XS',
      's': 'S',
      'm': 'M',
      'l': 'L',
      'xl': 'XL',
      '2xl': '2XL',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: AVATAR_TOKEN_MANIFEST,
  recipeDefinition: AVATAR_RECIPE_DEFINITION,
};
