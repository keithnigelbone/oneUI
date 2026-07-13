/**
 * Checkbox.recipe.ts
 *
 * Recipe definition for the Checkbox component.
 * Defines 1 design decision: corner radius scale.
 * Maps to borderRadius + size-specific borderRadius-s/m/l tokens.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const CHECKBOX_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Checkbox',
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
      none: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
        { tokenName: 'borderRadius-s', value: 'Shape-0' },
        { tokenName: 'borderRadius-m', value: 'Shape-0' },
        { tokenName: 'borderRadius-l', value: 'Shape-0' },
      ],
      small: [
        { tokenName: 'borderRadius', value: 'Shape-1' },
        { tokenName: 'borderRadius-s', value: 'Shape-0-5' },
        { tokenName: 'borderRadius-m', value: 'Shape-1' },
        { tokenName: 'borderRadius-l', value: 'Shape-1-5' },
      ],
      medium: [
        { tokenName: 'borderRadius', value: 'Shape-1-5' },
        { tokenName: 'borderRadius-s', value: 'Shape-1' },
        { tokenName: 'borderRadius-m', value: 'Shape-1-5' },
        { tokenName: 'borderRadius-l', value: 'Shape-2' },
      ],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-2' },
        { tokenName: 'borderRadius-s', value: 'Shape-1-5' },
        { tokenName: 'borderRadius-m', value: 'Shape-2' },
        { tokenName: 'borderRadius-l', value: 'Shape-2-5' },
      ],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
        { tokenName: 'borderRadius-s', value: 'Shape-Pill' },
        { tokenName: 'borderRadius-m', value: 'Shape-Pill' },
        { tokenName: 'borderRadius-l', value: 'Shape-Pill' },
      ],
    },
  },
};
