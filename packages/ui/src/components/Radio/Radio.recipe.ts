/**
 * Radio.recipe.ts
 *
 * Recipe definition for the Radio component.
 * Defines 2 design decisions:
 *   1. cornerRadius — outer shape of the radio box (per-size: s/m/l)
 *   2. dotShape — inner dot indicator shape (per-size: s/m/l, independent from outer)
 *
 * Default is Pill (circular) for both. Brands can override independently.
 * Outer maps to borderRadius + size-specific borderRadius-s/m/l tokens.
 * Dot maps to dotBorderRadius + size-specific dotBorderRadius-s/m/l tokens.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const RADIO_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Radio',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Outer Shape',
      rationale: 'Controls the shape of the radio box container',
      category: 'shape',
      options: [
        { value: 'inherit', label: 'Inherit', description: '' },
        { value: 'pill', label: 'Pill', description: 'Circular (default)' },
        { value: 'large', label: 'Large', description: '' },
        { value: 'medium', label: 'Medium', description: '' },
        { value: 'small', label: 'Small', description: '' },
        { value: 'none', label: 'None', description: 'Square' },
      ],
      defaultOption: 'inherit',
    },
    {
      id: 'dotShape',
      label: 'Dot Shape',
      rationale: 'Controls the shape of the inner dot indicator independently from the outer box',
      category: 'shape',
      options: [
        { value: 'inherit', label: 'Inherit', description: '' },
        { value: 'pill', label: 'Pill', description: 'Circular (default)' },
        { value: 'large', label: 'Large', description: '' },
        { value: 'medium', label: 'Medium', description: '' },
        { value: 'small', label: 'Small', description: '' },
        { value: 'none', label: 'None', description: 'Square' },
      ],
      defaultOption: 'inherit',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      inherit: [],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
        { tokenName: 'borderRadius-s', value: 'Shape-Pill' },
        { tokenName: 'borderRadius-m', value: 'Shape-Pill' },
        { tokenName: 'borderRadius-l', value: 'Shape-Pill' },
      ],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-2' },
        { tokenName: 'borderRadius-s', value: 'Shape-1-5' },
        { tokenName: 'borderRadius-m', value: 'Shape-2' },
        { tokenName: 'borderRadius-l', value: 'Shape-2-5' },
      ],
      medium: [
        { tokenName: 'borderRadius', value: 'Shape-1-5' },
        { tokenName: 'borderRadius-s', value: 'Shape-1' },
        { tokenName: 'borderRadius-m', value: 'Shape-1-5' },
        { tokenName: 'borderRadius-l', value: 'Shape-2' },
      ],
      small: [
        { tokenName: 'borderRadius', value: 'Shape-1' },
        { tokenName: 'borderRadius-s', value: 'Shape-0-5' },
        { tokenName: 'borderRadius-m', value: 'Shape-1' },
        { tokenName: 'borderRadius-l', value: 'Shape-1-5' },
      ],
      none: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
        { tokenName: 'borderRadius-s', value: 'Shape-0' },
        { tokenName: 'borderRadius-m', value: 'Shape-0' },
        { tokenName: 'borderRadius-l', value: 'Shape-0' },
      ],
    },
    dotShape: {
      inherit: [],
      pill: [
        { tokenName: 'dotBorderRadius', value: 'Shape-Pill' },
        { tokenName: 'dotBorderRadius-s', value: 'Shape-Pill' },
        { tokenName: 'dotBorderRadius-m', value: 'Shape-Pill' },
        { tokenName: 'dotBorderRadius-l', value: 'Shape-Pill' },
      ],
      large: [
        { tokenName: 'dotBorderRadius', value: 'Shape-2' },
        { tokenName: 'dotBorderRadius-s', value: 'Shape-1-5' },
        { tokenName: 'dotBorderRadius-m', value: 'Shape-2' },
        { tokenName: 'dotBorderRadius-l', value: 'Shape-2-5' },
      ],
      medium: [
        { tokenName: 'dotBorderRadius', value: 'Shape-1-5' },
        { tokenName: 'dotBorderRadius-s', value: 'Shape-1' },
        { tokenName: 'dotBorderRadius-m', value: 'Shape-1-5' },
        { tokenName: 'dotBorderRadius-l', value: 'Shape-2' },
      ],
      small: [
        { tokenName: 'dotBorderRadius', value: 'Shape-1' },
        { tokenName: 'dotBorderRadius-s', value: 'Shape-0-5' },
        { tokenName: 'dotBorderRadius-m', value: 'Shape-1' },
        { tokenName: 'dotBorderRadius-l', value: 'Shape-1-5' },
      ],
      none: [
        { tokenName: 'dotBorderRadius', value: 'Shape-0' },
        { tokenName: 'dotBorderRadius-s', value: 'Shape-0' },
        { tokenName: 'dotBorderRadius-m', value: 'Shape-0' },
        { tokenName: 'dotBorderRadius-l', value: 'Shape-0' },
      ],
    },
  },
};
