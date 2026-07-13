/**
 * SingleTextButton.recipe.ts
 *
 * Recipe definition for the SingleTextButton component.
 * Defines 1 design decision: corner radius (shape).
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const SINGLE_TEXT_BUTTON_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'SingleTextButton',
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
      defaultOption: 'pill',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      inherit: [],
      none: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
      small: [{ tokenName: 'borderRadius', value: 'Shape-3' }],
      medium: [{ tokenName: 'borderRadius', value: 'Shape-3-5' }],
      large: [{ tokenName: 'borderRadius', value: 'Shape-4' }],
      pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
    },
  },
};
