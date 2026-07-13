/**
 * Badge.meta.ts
 *
 * Unified metadata for the Badge component.
 * References existing token manifest and recipe definition
 * rather than duplicating their data.
 */

import type { ComponentMeta } from '@oneui/shared';
import { BADGE_TOKEN_MANIFEST } from './Badge.tokens';
import { BADGE_RECIPE_DEFINITION } from './Badge.recipe';

export const BADGE_META: ComponentMeta = {
  name: 'Badge',
  slug: 'badge',
  displayName: 'Badge',
  description: 'Non-interactive display component used to highlight status, provide notifications, or categorize content. Supports start/end slots for icons and sub-badges.',
  category: 'display',

  props: [
    {
      name: 'attention',
      type: 'enum',
      description: 'Emphasis level — high (bold fill), medium (tinted fill), low (transparent).',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
      brandOverridable: true,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Badge size. Default: m.',
      defaultValue: 'm',
      options: ['xs', 's', 'm', 'l', 'xl'] as const,
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
      name: 'children',
      type: 'string',
      description: 'Text content displayed inside the badge',
    },
  ],

  slots: [
    {
      name: 'start',
      description: 'Content before the label (icon, avatar, counter badge, indicator badge)',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
    },
    {
      name: 'end',
      description: 'Content after the label (icon, avatar, counter badge, indicator badge)',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
    },
  ],

  previewMatrix: {
    variants: ['bold', 'subtle', 'ghost'],
    variantLabels: {
      bold: 'High',
      subtle: 'Medium',
      ghost: 'Low',
    },
    sizes: ['xs', 's', 'm', 'l', 'xl'],
    sizeLabels: {
      'xs': 'XS',
      's': 'S',
      'm': 'M',
      'l': 'L',
      'xl': 'XL',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: BADGE_TOKEN_MANIFEST,
  recipeDefinition: BADGE_RECIPE_DEFINITION,
};
