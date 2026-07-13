/**
 * ChipGroup.recipe.ts
 *
 * Recipe definition for ChipGroup.
 * Two decisions: gap density and wrap behaviour.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const CHIP_GROUP_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'ChipGroup',
  decisions: [
    {
      id: 'density',
      label: 'Gap density',
      rationale: 'Inter-chip gap intensity.',
      category: 'spacing',
      options: [
        { value: 'tight', label: 'Tight', description: '' },
        { value: 'default', label: 'Default', description: '' },
        { value: 'roomy', label: 'Roomy', description: '' },
      ],
      defaultOption: 'default',
    },
    {
      id: 'wrapBehavior',
      label: 'Wrap behaviour',
      rationale: 'Whether chips wrap to the next line when they overflow.',
      category: 'layout',
      options: [
        { value: 'wrap', label: 'Wrap', description: 'Default' },
        { value: 'nowrap', label: 'No wrap', description: 'Horizontal scroll / overflow' },
      ],
      defaultOption: 'wrap',
    },
  ],

  resolutionMap: {
    density: {
      tight: [
        { tokenName: 'gap', value: 'Spacing-1' },
      ],
      default: [],
      roomy: [
        { tokenName: 'gap', value: 'Spacing-3' },
      ],
    },
    wrapBehavior: {
      wrap: [],
      nowrap: [],
    },
  },
};
