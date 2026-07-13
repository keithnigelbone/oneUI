/**
 * WebHeader.recipe.ts
 *
 * Recipe definition for the WebHeader component.
 * Defines 2 design decisions that resolve to token overrides.
 *
 * Decisions:
 * 1. Item Shape — corner radius of nav item pill (None → Pill)
 * 2. Active Indicator — how active state is shown (underline, pill, both)
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const WEBHEADER_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'WebHeader',
  decisions: [
    {
      id: 'itemShape',
      label: 'Item Shape',
      rationale: 'Controls the corner radius of navigation item pills',
      category: 'shape',
      options: [
        { value: 'inherit', label: 'Inherit', description: 'Use global shape setting' },
        { value: 'none', label: 'None', description: 'Square corners' },
        { value: 'small', label: 'Small', description: 'Subtle rounding' },
        { value: 'medium', label: 'Medium', description: 'Moderate rounding' },
        { value: 'pill', label: 'Pill', description: 'Fully rounded (default)' },
      ],
      defaultOption: 'pill',
    },
    {
      id: 'indicatorStyle',
      label: 'Active Indicator',
      rationale: 'Controls how the active navigation item is visually indicated',
      category: 'shape',
      options: [
        { value: 'underline', label: 'Underline', description: 'Bottom bar only' },
        { value: 'pill', label: 'Pill', description: 'Background pill only' },
        { value: 'both', label: 'Both', description: 'Underline + pill background (default)' },
      ],
      defaultOption: 'both',
    },
  ],
  resolutionMap: {
    itemShape: {
      inherit: [],
      none: [{ tokenName: 'itemBorderRadius', value: 'Shape-0' }],
      small: [{ tokenName: 'itemBorderRadius', value: 'Shape-2' }],
      medium: [{ tokenName: 'itemBorderRadius', value: 'Shape-4' }],
      pill: [{ tokenName: 'itemBorderRadius', value: 'Shape-Pill' }],
    },
    indicatorStyle: {
      underline: [],
      pill: [],
      both: [],
    },
  },
};
