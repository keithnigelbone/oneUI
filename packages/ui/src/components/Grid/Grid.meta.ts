/**
 * Grid.meta.ts
 *
 * Unified metadata for the Grid layout primitive.
 */

import type { ComponentMeta } from '@oneui/shared';
import { GRID_TOKEN_MANIFEST } from './Grid.tokens';
import { GRID_RECIPE_DEFINITION } from './Grid.recipe';

export const GRID_META: ComponentMeta = {
  name: 'Grid',
  slug: 'grid',
  displayName: 'Grid',
  description:
    'Responsive CSS Grid primitive. Column count and gap resolve per-platform via --Grid-Columns and --Grid-Gutter. Children use <Column> with responsive span/start props.',
  category: 'layout',
  tags: ['grid', 'layout', 'columns', 'responsive'],

  props: [
    {
      name: 'columns',
      type: 'object',
      description:
        'Column count override. Accepts a number or a ResponsiveValue<number> keyed by breakpoint. Defaults to --Grid-Columns (per-platform: 4/8/8/12/12).',
    },
    {
      name: 'gap',
      type: 'string',
      description:
        'Gap override (CSS length). Defaults to --Grid-Gutter.',
    },
    {
      name: 'as',
      type: 'string',
      description: 'Polymorphic element type (default: "div").',
      defaultValue: 'div',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['default'],
    variantLabels: { default: 'Default' },
  },

  surfaceAware: false,
  multiAccent: false,

  tokenManifest: GRID_TOKEN_MANIFEST,
  recipeDefinition: GRID_RECIPE_DEFINITION,
};
