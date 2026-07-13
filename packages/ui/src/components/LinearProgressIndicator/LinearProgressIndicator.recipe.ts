/**
 * LinearProgressIndicator.recipe.ts
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const LINEAR_PROGRESS_INDICATOR_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'LinearProgressIndicator',
  decisions: [
    {
      id: 'type',
      label: 'Type',
      rationale: 'Determinate shows known progress; indeterminate shows ongoing activity.',
      category: 'behavior',
      options: [
        { value: 'determinate', label: 'Determinate', description: 'Value-driven fill' },
        { value: 'indeterminate', label: 'Indeterminate', description: 'Animated segment' },
      ],
      defaultOption: 'determinate',
    },
    {
      id: 'roundCaps',
      label: 'Round caps',
      rationale: 'Pill vs square track ends.',
      category: 'shape',
      options: [
        { value: 'true', label: 'Round', description: 'Pill-shaped ends' },
        { value: 'false', label: 'Flat', description: 'Square ends' },
      ],
      defaultOption: 'true',
    },
  ],
  resolutionMap: {
    type: {
      determinate: [],
      indeterminate: [],
    },
    roundCaps: {
      true: [],
      false: [],
    },
  },
};
