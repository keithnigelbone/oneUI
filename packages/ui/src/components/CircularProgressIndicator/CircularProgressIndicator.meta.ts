/**
 * CircularProgressIndicator.meta.ts
 *
 * Unified metadata for the CircularProgressIndicator component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CIRCULAR_PROGRESS_INDICATOR_TOKEN_MANIFEST } from './CircularProgressIndicator.tokens';
import { CIRCULAR_PROGRESS_INDICATOR_RECIPE_DEFINITION } from './CircularProgressIndicator.recipe';

export const CIRCULAR_PROGRESS_INDICATOR_META: ComponentMeta = {
  name: 'CircularProgressIndicator',
  slug: 'circular-progress-indicator',
  displayName: 'Circular Progress Indicator',
  description:
    'Circular progress arc. Determinate variant renders an arc proportional to `value`; indeterminate renders a spinning animation. Optional center content (icon or auto percentage). 10 t-shirt sizes. Multi-accent appearance roles.',
  category: 'feedback',
  tags: ['progress', 'loading', 'spinner', 'circular', 'indicator'],

  props: [
    {
      name: 'variant',
      type: 'enum',
      description: 'Determinate arc or indeterminate animation.',
      defaultValue: 'determinate',
      options: ['determinate', 'indeterminate'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Size preset (t-shirt).',
      defaultValue: 'M',
      options: [
        '2XS', 'XS', 'S', 'M', 'L', 'XL',
        '2XL', '3XL', '4XL', '5XL',
      ] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role.',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary',
        'sparkle', 'neutral',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'content',
      type: 'enum',
      description:
        'Center content mode. `text` renders the percentage at L–5XL only (Label 3XS→M per Figma).',
      defaultValue: 'none',
      options: ['none', 'icon', 'text'] as const,
    },
    {
      name: 'value',
      type: 'number',
      description: 'Current progress value (determinate only).',
    },
    {
      name: 'min',
      type: 'number',
      description: 'Minimum value.',
      defaultValue: 0,
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value.',
      defaultValue: 100,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Centre `<Icon />` when `content="icon"`. Omitted `size`/`appearance` merge from CPI maps (Figma spacing 2–6; XS/S use 6px via CSS).',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible label for screen readers.',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['determinate', 'indeterminate'],
    variantLabels: {
      determinate: 'Determinate',
      indeterminate: 'Indeterminate',
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    sizeLabels: {
      XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL', '2XL': '2XL',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: CIRCULAR_PROGRESS_INDICATOR_TOKEN_MANIFEST,
  recipeDefinition: CIRCULAR_PROGRESS_INDICATOR_RECIPE_DEFINITION,
};
