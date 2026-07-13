/**
 * ListItemGroup.recipe.ts
 *
 * Recipe definition for ListItemGroup.
 * Single decision: group-wide divider style injected into children.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const LIST_ITEM_GROUP_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'ListItemGroup',
  decisions: [
    {
      id: 'divider',
      label: 'Divider',
      rationale:
        'Inter-row divider style applied to every child unless the child sets its own `divider` prop.',
      category: 'layout',
      options: [
        { value: 'none', label: 'None', description: '' },
        { value: 'inset', label: 'Inset', description: 'Figma default' },
        { value: 'full', label: 'Full', description: '' },
      ],
      defaultOption: 'inset',
    },
  ],

  resolutionMap: {
    divider: {
      none: [],
      inset: [],
      full: [],
    },
  },
};
