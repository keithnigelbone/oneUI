/**
 * Switch.recipe.ts
 *
 * Recipe definition for the Switch component.
 * Defines 1 design decision: corner radius scale.
 * Maps to track + thumb borderRadius tokens.
 * Default is Pill (9999px) — the standard for Switch components.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const SWITCH_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Switch',
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
        { tokenName: 'thumbBorderRadius', value: 'Shape-0' },
      ],
      small: [
        { tokenName: 'borderRadius', value: 'Shape-2' },
        { tokenName: 'thumbBorderRadius', value: 'Shape-2' },
      ],
      medium: [
        { tokenName: 'borderRadius', value: 'Shape-2-5' },
        { tokenName: 'thumbBorderRadius', value: 'Shape-2-5' },
      ],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-3' },
        { tokenName: 'thumbBorderRadius', value: 'Shape-3' },
      ],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
        { tokenName: 'thumbBorderRadius', value: 'Shape-Pill' },
      ],
    },
  },
};
