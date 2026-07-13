/**
 * Tooltip.recipe.ts
 *
 * Recipe definition for the Tooltip component.
 * Two decisions:
 *  1. Shape — corner radius scale
 *  2. Density — vertical / horizontal padding intensity
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const TOOLTIP_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Tooltip',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale: 'Default is small rounding (Shape-1-5); brands can pick tighter or fuller radii.',
      category: 'shape',
      options: [
        { value: 'sharp', label: 'Sharp', description: 'No rounding' },
        { value: 'default', label: 'Default', description: 'Small rounding' },
        { value: 'soft', label: 'Soft', description: 'Medium rounding' },
        { value: 'pill', label: 'Pill', description: 'Full pill shape' },
      ],
      defaultOption: 'default',
    },
    {
      id: 'density',
      label: 'Padding density',
      rationale: 'Adjusts internal padding without changing typography.',
      category: 'spacing',
      options: [
        { value: 'tight', label: 'Tight', description: '' },
        { value: 'default', label: 'Default', description: '' },
        { value: 'roomy', label: 'Roomy', description: '' },
      ],
      defaultOption: 'default',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      sharp: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
      ],
      default: [],
      soft: [
        { tokenName: 'borderRadius', value: 'Shape-2' },
      ],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
      ],
    },
    density: {
      tight: [
        { tokenName: 'paddingVertical', value: 'Spacing-1' },
        { tokenName: 'paddingHorizontal', value: 'Spacing-2' },
      ],
      default: [],
      roomy: [
        { tokenName: 'paddingVertical', value: 'Spacing-2' },
        { tokenName: 'paddingHorizontal', value: 'Spacing-3-5' },
      ],
    },
  },
};
