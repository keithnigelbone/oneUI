/**
 * FAB.recipe.ts
 *
 * Recipe definition for the FAB component.
 * Two decisions: corner shape and elevation level.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const FAB_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'FAB',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale: 'Default is soft rounded corners; brands can opt for fully circular/pill or hard corners.',
      category: 'shape',
      options: [
        { value: 'square', label: 'Square', description: 'No rounding' },
        { value: 'default', label: 'Default', description: 'Soft rounding' },
        { value: 'pill', label: 'Pill', description: 'Full pill shape' },
      ],
      defaultOption: 'default',
    },
    {
      id: 'elevation',
      label: 'Elevation',
      rationale: 'FAB lifts above the page. Brands can pick a lighter or heavier shadow.',
      category: 'elevation',
      options: [
        { value: 'low', label: 'Low', description: '' },
        { value: 'default', label: 'Default', description: '' },
        { value: 'high', label: 'High', description: '' },
      ],
      defaultOption: 'default',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      square: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
      ],
      default: [],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
      ],
    },
    elevation: {
      low: [
        { tokenName: 'elevation', value: 'Elevation-2' },
      ],
      default: [],
      high: [
        { tokenName: 'elevation', value: 'Elevation-4' },
      ],
    },
  },
};
