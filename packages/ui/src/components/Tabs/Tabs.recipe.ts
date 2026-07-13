/**
 * Tabs.recipe.ts
 *
 * Recipe definition for the Tabs component.
 *
 * Decisions:
 * 1. Shape — TabItem corner radius (None → Pill)
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const TABS_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Tabs',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale: '',
      category: 'shape',
      options: [
        { value: 'inherit', label: 'Inherit', description: '' },
        { value: 'none', label: 'None', description: '' },
        { value: 'small', label: 'Small', description: '' },
        { value: 'medium', label: 'Medium', description: '' },
        { value: 'large', label: 'Large', description: '' },
        { value: 'pill', label: 'Pill', description: '' },
      ],
      defaultOption: 'inherit',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      inherit: [],
      none: [{ tokenName: 'itemRadius', value: 'Shape-0' }],
      small: [{ tokenName: 'itemRadius', value: 'Shape-1-5' }],
      medium: [{ tokenName: 'itemRadius', value: 'Shape-2' }],
      large: [{ tokenName: 'itemRadius', value: 'Shape-2-5' }],
      pill: [{ tokenName: 'itemRadius', value: 'Shape-Pill' }],
    },
  },
};
