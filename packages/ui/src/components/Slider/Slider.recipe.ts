/**
 * Slider.recipe.ts
 *
 * Recipe definition for the Slider component.
 * One decision: corner radius scale, mapped to track + knob radius tokens.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const SLIDER_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Slider',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale: 'Controls both track and knob corner radius.',
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
      none: [
        { tokenName: 'trackBorderRadius', value: 'Shape-0' },
        { tokenName: 'knobBorderRadius', value: 'Shape-0' },
      ],
      small: [
        { tokenName: 'trackBorderRadius', value: 'Shape-2' },
        { tokenName: 'knobBorderRadius', value: 'Shape-2' },
      ],
      medium: [
        { tokenName: 'trackBorderRadius', value: 'Shape-2-5' },
        { tokenName: 'knobBorderRadius', value: 'Shape-2-5' },
      ],
      large: [
        { tokenName: 'trackBorderRadius', value: 'Shape-3' },
        { tokenName: 'knobBorderRadius', value: 'Shape-3' },
      ],
      pill: [
        { tokenName: 'trackBorderRadius', value: 'Shape-Pill' },
        { tokenName: 'knobBorderRadius', value: 'Shape-Pill' },
      ],
    },
  },
};
