/**
 * CircularProgressIndicator.recipe.ts
 *
 * Recipe definition for the CircularProgressIndicator component.
 * Single decision: center content preset.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const CIRCULAR_PROGRESS_INDICATOR_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'CircularProgressIndicator',
  decisions: [
    {
      id: 'centerContent',
      label: 'Center content',
      rationale: 'What (if anything) renders inside the ring.',
      category: 'content',
      options: [
        { value: 'none', label: 'None', description: 'Empty center' },
        { value: 'icon', label: 'Icon', description: 'Render children as icon' },
        { value: 'text', label: 'Text', description: 'Auto percentage label' },
      ],
      defaultOption: 'none',
    },
  ],

  resolutionMap: {
    centerContent: {
      none: [],
      icon: [],
      text: [],
    },
  },
};
