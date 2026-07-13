/**
 * SelectableIconButton.recipe.ts
 *
 * Recipe definition for the SelectableIconButton component.
 * Defines 1 design decision: corner radius (shape).
 * Default: 'inherit' — icon buttons inherit shape, not pill by default,
 * following the IconButton pattern.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'SelectableIconButton',
  decisions: [
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
    cornerRadius: {
      inherit: [],
      none: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
      small: [{ tokenName: 'borderRadius', value: 'Shape-3' }],
      medium: [{ tokenName: 'borderRadius', value: 'Shape-3-5' }],
      large: [{ tokenName: 'borderRadius', value: 'Shape-4' }],
      pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
    },
  },
};
