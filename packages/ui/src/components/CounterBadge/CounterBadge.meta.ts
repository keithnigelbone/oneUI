/**
 * CounterBadge.meta.ts
 *
 * Unified metadata for the CounterBadge component.
 * References existing token manifest and recipe definition
 * rather than duplicating their data.
 */

import type { ComponentMeta } from '@oneui/shared';
import { COUNTER_BADGE_TOKEN_MANIFEST } from './CounterBadge.tokens';
import { COUNTER_BADGE_RECIPE_DEFINITION } from './CounterBadge.recipe';

export const COUNTER_BADGE_META: ComponentMeta = {
  name: 'CounterBadge',
  slug: 'counter-badge',
  displayName: 'Counter Badge',
  description: 'Non-interactive display component showing a numeric count with bold/subtle/ghost variants and multi-accent support.',
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
      description: 'CounterBadge size. Default: m.',
      defaultValue: 'm',
      options: ['xs', 's', 'm', 'l'] as const,
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
      name: 'value',
      type: 'number',
      description: 'Numeric value to display',
      defaultValue: 5,
      required: true,
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value before showing overflow (e.g., "99+")',
      defaultValue: 99,
    },
    {
      name: 'showZero',
      type: 'boolean',
      description: 'Whether to show the badge when value is 0',
      defaultValue: false,
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['bold', 'subtle', 'ghost'],
    variantLabels: {
      bold: 'High',
      subtle: 'Medium',
      ghost: 'Low',
    },
    sizes: ['xs', 's', 'm', 'l'],
    sizeLabels: {
      'xs': 'XS',
      's': 'S',
      'm': 'M',
      'l': 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: COUNTER_BADGE_TOKEN_MANIFEST,
  recipeDefinition: COUNTER_BADGE_RECIPE_DEFINITION,
};
