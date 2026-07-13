/**
 * PaginationDots.recipe.ts
 *
 * Recipe definition for PaginationDots.
 * Single design decision: dot shape (pill by default).
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const PAGINATION_DOTS_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'PaginationDots',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale: 'Dots default to pill (fully round). Brands can opt into square or rounded variants.',
      category: 'shape',
      options: [
        { value: 'pill', label: 'Pill', description: 'Fully round (default).' },
        { value: 'rounded', label: 'Rounded', description: 'Small corner radius.' },
        { value: 'square', label: 'Square', description: 'No corner radius.' },
      ],
      defaultOption: 'pill',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
      ],
      rounded: [
        { tokenName: 'borderRadius', value: 'Shape-3' },
      ],
      square: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
      ],
    },
  },
};
