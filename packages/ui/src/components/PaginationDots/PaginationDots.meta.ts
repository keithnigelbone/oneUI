/**
 * PaginationDots.meta.ts
 *
 * Unified metadata for the PaginationDots component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { PAGINATION_DOTS_TOKEN_MANIFEST } from './PaginationDots.tokens';
import { PAGINATION_DOTS_RECIPE_DEFINITION } from './PaginationDots.recipe';

export const PAGINATION_DOTS_META: ComponentMeta = {
  name: 'PaginationDots',
  slug: 'pagination-dots',
  displayName: 'Pagination Dots',
  description:
    'Windowed pagination indicator for carousels and multi-page content. Shows a fixed window of dots that scroll with the active index. Edge dots shrink to signal more content on either side. Supports loop (infinite) and non-loop (end-grow) modes. Fully accessible: roving tabindex, keyboard nav, aria-selected.',
  category: 'navigation',

  props: [
    {
      name: 'pageCount',
      type: 'number',
      description: 'Total number of pages / items to represent.',
      required: true,
    },
    {
      name: 'activeIndex',
      type: 'number',
      description: 'Controlled active index.',
    },
    {
      name: 'defaultActiveIndex',
      type: 'number',
      description: 'Default active index (uncontrolled).',
      defaultValue: 0,
    },
    {
      name: 'loop',
      type: 'boolean',
      description:
        'Loop mode. `true` = infinite windowed scroll; `false` = finite sequence with end-grow on the last dot.',
      defaultValue: false,
      group: 'behavior',
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role. `auto` resolves to `primary`.',
      defaultValue: 'primary',
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ] as const,
      group: 'appearance',
    },
    {
      name: 'readOnly',
      type: 'boolean',
      description:
        'When true, dots are non-interactive and the root uses `role="status" aria-live="polite"` to mirror a parent carousel.',
      defaultValue: false,
      group: 'behavior',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['non-loop', 'loop'],
    variantLabels: {
      'non-loop': 'Non-loop',
      loop: 'Loop',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tags: ['pagination', 'carousel', 'indicator', 'navigation', 'dots'],

  tokenManifest: PAGINATION_DOTS_TOKEN_MANIFEST,
  recipeDefinition: PAGINATION_DOTS_RECIPE_DEFINITION,
};
