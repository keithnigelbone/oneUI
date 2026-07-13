/**
 * SegmentedControl.recipe.ts
 * Brand-customizable decisions for SegmentedControl.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const SEGMENTED_CONTROL_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'SegmentedControl',
  decisions: [
    {
      id: 'shape',
      label: 'Shape',
      rationale: 'Pill vs rectangular track and segment corners.',
      category: 'shape',
      options: [
        { value: 'pill', label: 'Pill', description: 'Fully rounded track and segments' },
        { value: 'rectangular', label: 'Rectangular', description: 'Subtle corner radius' },
      ],
      defaultOption: 'pill',
    },
    {
      id: 'trackEmphasis',
      label: 'Track emphasis',
      rationale: 'Background prominence of the outer track.',
      category: 'color',
      options: [
        { value: 'high', label: 'High', description: 'Tinted minimal track' },
        { value: 'medium', label: 'Medium', description: 'Ghost track' },
        { value: 'low', label: 'Low', description: 'Transparent track' },
      ],
      defaultOption: 'high',
    },
    {
      id: 'attention',
      label: 'Selected attention',
      rationale: 'Visual prominence of the active segment.',
      category: 'color',
      options: [
        { value: 'high', label: 'High', description: 'Bold fill + elevation' },
        { value: 'medium', label: 'Medium', description: 'Subtle tinted fill' },
        { value: 'low', label: 'Low', description: 'Ghost with accent border' },
      ],
      defaultOption: 'high',
    },
  ],

  resolutionMap: {
    shape: {
      pill: [
        { tokenName: 'trackRadiusPill', value: 'Shape-Pill' },
        { tokenName: 'itemRadiusPill', value: 'Shape-Pill' },
      ],
      rectangular: [
        { tokenName: 'trackRadiusRectangular', value: 'Shape-2' },
        { tokenName: 'itemRadiusRectangular', value: 'Shape-2' },
      ],
    },
    trackEmphasis: {
      high: [{ tokenName: 'trackBackgroundHigh', value: 'Neutral-Minimal' }],
      medium: [{ tokenName: 'trackBackgroundMedium', value: 'Neutral-Ghost' }],
      low: [],
    },
    attention: {
      high: [{ tokenName: 'itemElevationSelectedHigh', value: 'Elevation-1' }],
      medium: [],
      low: [],
    },
  },
};
