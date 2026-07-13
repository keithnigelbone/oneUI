/**
 * TouchSlider.recipe.ts
 * One decision: corner radius default. The `progressStyle` prop always wins
 * at runtime — the recipe only sets the brand-wide default.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const TOUCH_SLIDER_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'TouchSlider',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale: 'Controls the track corner radius. The progressStyle prop can still override the trailing edge at runtime.',
      category: 'shape',
      options: [
        { value: 'inherit', label: 'Inherit', description: '' },
        { value: 'none', label: 'None', description: 'Square corners' },
        { value: 'small', label: 'Small', description: '' },
        { value: 'medium', label: 'Medium', description: '' },
        { value: 'large', label: 'Large', description: '' },
        { value: 'pill', label: 'Pill', description: 'Fully rounded (default)' },
      ],
      defaultOption: 'pill',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      inherit: [],
      none: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
      small: [{ tokenName: 'borderRadius', value: 'Shape-2' }],
      medium: [{ tokenName: 'borderRadius', value: 'Shape-2-5' }],
      large: [{ tokenName: 'borderRadius', value: 'Shape-3' }],
      pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
    },
  },
};
