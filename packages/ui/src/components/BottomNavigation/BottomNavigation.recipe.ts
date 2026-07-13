/**
 * BottomNavigation.recipe.ts
 *
 * Recipe definition for BottomNavigation.
 * Two decisions: label layout (the primary Figma variant) and item corner radius.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const BOTTOM_NAVIGATION_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'BottomNavigation',
  decisions: [
    {
      id: 'labelLayout',
      label: 'Label layout',
      rationale: 'Matches the Figma `label` variant: 1Line, 2Line, or none (icon only).',
      category: 'layout',
      options: [
        { value: '1line', label: '1 Line', description: '' },
        { value: '2line', label: '2 Lines', description: '' },
        { value: 'none', label: 'None', description: 'Icons only' },
      ],
      defaultOption: '1line',
    },
    {
      id: 'itemCornerRadius',
      label: 'Item shape',
      rationale: 'Corner radius of the selected-state pill for each item.',
      category: 'shape',
      options: [
        { value: 'sharp', label: 'Sharp', description: '' },
        { value: 'default', label: 'Default', description: '' },
        { value: 'pill', label: 'Pill', description: '' },
      ],
      defaultOption: 'default',
    },
  ],

  resolutionMap: {
    labelLayout: {
      '1line': [],
      '2line': [],
      none: [],
    },
    itemCornerRadius: {
      sharp: [
        { tokenName: 'itemBorderRadius', value: 'Shape-0' },
      ],
      default: [],
      pill: [
        { tokenName: 'itemBorderRadius', value: 'Shape-Pill' },
      ],
    },
  },
};
