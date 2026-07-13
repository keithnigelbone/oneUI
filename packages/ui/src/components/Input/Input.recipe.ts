/**
 * Input.recipe.ts
 *
 * Recipe definition for the Input component.
 * Defines design decisions that deterministically resolve to token overrides.
 *
 * Decisions:
 * 1. Shape — corner radius scale (None → Pill)
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const INPUT_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Input',
  decisions: [
    // 1. Corner radius — named scale from none to pill
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
    // Decision 1: Corner radius — named scale
    cornerRadius: {
      inherit: [],
      none: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
      ],
      small: [
        { tokenName: 'borderRadius', value: 'Shape-3' },
      ],
      medium: [
        { tokenName: 'borderRadius', value: 'Shape-3-5' },
      ],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-4' },
      ],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
      ],
    },
  },
};
