/**
 * ListItem.recipe.ts
 *
 * Recipe definition for ListItem.
 * Two decisions: density (padding intensity) and divider style (Figma default).
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const LIST_ITEM_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'ListItem',
  decisions: [
    {
      id: 'density',
      label: 'Row density',
      rationale: 'Adjusts vertical padding without changing typography.',
      category: 'spacing',
      options: [
        { value: 'compact', label: 'Compact', description: '' },
        { value: 'default', label: 'Default', description: '' },
        { value: 'roomy', label: 'Roomy', description: '' },
      ],
      defaultOption: 'default',
    },
    {
      id: 'divider',
      label: 'Divider',
      rationale: 'Bottom hairline style (inset = starts at content column; full = edge-to-edge).',
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
    density: {
      compact: [
        { tokenName: 'paddingVertical', value: 'Spacing-2-5' },
      ],
      default: [],
      roomy: [
        { tokenName: 'paddingVertical', value: 'Spacing-3-5' },
      ],
    },
    divider: {
      none: [],
      inset: [],
      full: [],
    },
  },
};
