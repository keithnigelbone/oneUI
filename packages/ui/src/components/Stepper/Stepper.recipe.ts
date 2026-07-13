/**
 * Stepper.recipe.ts
 *
 * Recipe definition for the Stepper component.
 * Defines 1 design decision: corner radius scale.
 * Default is Pill (9999px) — the standard for Stepper components (per Figma spec).
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const STEPPER_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Stepper',
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
      none: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
      ],
      small: [
        { tokenName: 'borderRadius', value: 'Shape-2' },
      ],
      medium: [
        { tokenName: 'borderRadius', value: 'Shape-2-5' },
      ],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-3' },
      ],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
      ],
    },
  },
};
