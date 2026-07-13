/**
 * LinearProgressIndicator.meta.ts
 */

import type { ComponentMeta } from '@oneui/shared';
import { LINEAR_PROGRESS_INDICATOR_TOKEN_MANIFEST } from './LinearProgressIndicator.tokens';
import { LINEAR_PROGRESS_INDICATOR_RECIPE_DEFINITION } from './LinearProgressIndicator.recipe';

export const LINEAR_PROGRESS_INDICATOR_META: ComponentMeta = {
  name: 'LinearProgressIndicator',
  slug: 'linear-progress-indicator',
  displayName: 'Linear Progress Indicator',
  description:
    'Horizontal progress bar for determinate (value-driven) or indeterminate loading. Three sizes (S/M/L), pill or flat caps, and multi-accent appearance roles.',
  category: 'feedback',
  tags: ['progress', 'loading', 'linear', 'indicator', 'bar'],

  props: [
    {
      name: 'type',
      type: 'enum',
      description: 'Determinate fill or indeterminate animation.',
      defaultValue: 'determinate',
      options: ['determinate', 'indeterminate'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Track height preset.',
      defaultValue: 'M',
      options: ['S', 'M', 'L'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role (Figma variable mode).',
      defaultValue: 'primary',
      options: [
        'auto',
        'neutral',
        'primary',
        'secondary',
        'sparkle',
        'negative',
        'positive',
        'warning',
        'informative',
      ] as const,
    },
    {
      name: 'roundCaps',
      type: 'boolean',
      description: 'Pill-shaped ends when true; square ends when false.',
      defaultValue: true,
    },
    {
      name: 'value',
      type: 'number',
      description: 'Progress percentage (0–100). Determinate only.',
      defaultValue: 0,
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible name for screen readers.',
    },
    {
      name: 'aria-labelledby',
      type: 'string',
      description: 'ID of labelling element.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional class on the root progress element.',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['determinate', 'indeterminate'],
    variantLabels: {
      determinate: 'Determinate',
      indeterminate: 'Indeterminate',
    },
    sizes: ['S', 'M', 'L'],
    sizeLabels: { S: 'S', M: 'M', L: 'L' },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: LINEAR_PROGRESS_INDICATOR_TOKEN_MANIFEST,
  recipeDefinition: LINEAR_PROGRESS_INDICATOR_RECIPE_DEFINITION,
};
