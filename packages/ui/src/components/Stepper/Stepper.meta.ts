/**
 * Stepper.meta.ts
 * Unified metadata for the Stepper component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { STEPPER_TOKEN_MANIFEST } from './Stepper.tokens';
import { STEPPER_RECIPE_DEFINITION } from './Stepper.recipe';

export const STEPPER_META: ComponentMeta = {
  name: 'Stepper',
  slug: 'stepper',
  displayName: 'Stepper',
  description: 'Numeric stepper for increasing/decreasing values in small increments, with pill shape and multi-accent support.',
  category: 'inputs',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Stepper size',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Attention level (visual weight)',
      defaultValue: 'medium',
      options: ['high', 'medium', 'low'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description:
        'Multi-accent appearance role. auto or omit: inherit nearest Surface effective role, else secondary at page root.',
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
      description: 'Controlled value',
    },
    {
      name: 'condensed',
      type: 'boolean',
      description: 'Use condensed height',
      defaultValue: false,
    },
    {
      name: 'direction',
      type: 'enum',
      description:
        'Visual layout direction. ltr keeps decrement on the left and increment on the right; rtl mirrors the visual order.',
      defaultValue: 'ltr',
      options: ['ltr', 'rtl'] as const,
      group: 'layout',
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'start',
      type: 'ReactNode',
      description:
        'Decrement control. Single IconButton element — receives NumberField props/ref via Base UI render.',
      group: 'content',
    },
    {
      name: 'end',
      type: 'ReactNode',
      description:
        'Increment control. Single IconButton element — receives NumberField props/ref via Base UI render.',
      group: 'content',
    },
  ],

  slots: [
    {
      name: 'start',
      description: 'Decrement control; icon-only slots typically `<IconButton variant="ghost" />`.',
      acceptedTypes: ['IconButton'],
      cardinality: 'single',
    },
    {
      name: 'end',
      description: 'Increment control; icon-only slots typically `<IconButton variant="ghost" />`.',
      acceptedTypes: ['IconButton'],
      cardinality: 'single',
    },
  ],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
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

  tokenManifest: STEPPER_TOKEN_MANIFEST,
  recipeDefinition: STEPPER_RECIPE_DEFINITION,
};
