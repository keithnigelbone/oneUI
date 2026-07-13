/**
 * Surface.recipe.ts
 *
 * Recipe definition for the Surface component.
 * Surface has minimal user-facing decisions — the real design choice is the
 * `mode` prop. Expose only a simple padding density preset so a whole page
 * can share a common internal rhythm without overriding the cascade.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const SURFACE_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Surface',
  decisions: [
    {
      id: 'padding',
      label: 'Interior padding',
      rationale:
        'Surface has no built-in padding; apply a preset via utility class when the Surface is used as a card container.',
      category: 'spacing',
      options: [
        { value: 'none', label: 'None', description: 'No padding (default)' },
        { value: 'compact', label: 'Compact', description: 'Small interior padding' },
        { value: 'default', label: 'Default', description: 'Medium interior padding' },
        { value: 'roomy', label: 'Roomy', description: 'Large interior padding' },
      ],
      defaultOption: 'none',
    },
  ],

  resolutionMap: {
    padding: {
      none: [],
      compact: [
        { tokenName: 'padding', value: 'Spacing-3-5' },
      ],
      default: [
        { tokenName: 'padding', value: 'Spacing-4-5' },
      ],
      roomy: [
        { tokenName: 'padding', value: 'Spacing-6' },
      ],
    },
  },
};
