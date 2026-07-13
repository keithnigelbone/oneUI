/**
 * LinkButton.recipe.ts
 *
 * Recipe definition for the LinkButton component.
 * Defines 2 design decisions that deterministically resolve to token overrides.
 *
 * Decisions:
 * 1. Shape — corner radius scale (None → Pill)
 * 2. Text case — uppercase vs sentence case
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const LINKBUTTON_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'LinkButton',
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

    // 2. Text transform
    {
      id: 'textTransform',
      label: 'Text case',
      rationale: '',
      category: 'typography',
      options: [
        { value: 'none', label: 'Aa', description: '' },
        { value: 'uppercase', label: 'AA', description: '' },
      ],
      defaultOption: 'none',
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
        { tokenName: 'borderRadius', value: 'Shape-1' },
      ],
      medium: [
        { tokenName: 'borderRadius', value: 'Shape-2' },
      ],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-3-5' },
      ],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
      ],
    },

    // Decision 2: Text transform
    textTransform: {
      none: [],
      uppercase: [
        { tokenName: 'textTransform', value: 'uppercase' },
        { tokenName: 'letterSpacing', value: '0.05em' },
      ],
    },
  },
};
