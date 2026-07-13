/**
 * Button.recipe.ts
 *
 * Recipe definition for the Button component.
 * Defines 3 design decisions that deterministically resolve to token overrides.
 *
 * Decisions:
 * 1. Shape — corner radius scale (None → Pill)
 * 2. Text case — uppercase vs sentence case
 * 3. Horizontal padding — padding-inline scaling (tight/default/roomy)
 *
 * Note: Ghost border removed as a decision — ghost has no border by default
 * (matching Figma). Brands can opt in via --Button-borderWidth-ghost override.
 * Height decision removed — use f-step size directly for precise control.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const BUTTON_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Button',
  decisions: [
    // 1. Corner radius — named scale from none to pill
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

    // 2. Text transform
    {
      id: 'textTransform',
      label: 'Text case',
      rationale: '',
      category: 'typography',
      options: [
        { value: 'none', label: 'Aa', description: '' },
        { value: 'uppercase', label: 'AA', description: '' },
      ],
      defaultOption: 'none',
    },

    // 3. Horizontal padding — padding-inline scaling
    {
      id: 'horizontalDensity',
      label: 'Horizontal padding',
      rationale: '',
      category: 'spacing',
      options: [
        { value: 'tight', label: 'Tight', description: '' },
        { value: 'default', label: 'Default', description: '' },
        { value: 'roomy', label: 'Roomy', description: '' },
      ],
      defaultOption: 'default',
    },
  ],

  resolutionMap: {
    // Decision 1: Corner radius — named scale
    cornerRadius: {
      inherit: [],
      none: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
      ],
      small: [
        { tokenName: 'borderRadius', value: 'Shape-3' },
      ],
      medium: [
        { tokenName: 'borderRadius', value: 'Shape-3-5' },
      ],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-4' },
      ],
      pill: [
        { tokenName: 'borderRadius', value: 'Shape-Pill' },
      ],
    },

    // Decision 2: Text transform
    textTransform: {
      none: [],
      uppercase: [
        { tokenName: 'textTransform', value: 'uppercase' },
        { tokenName: 'letterSpacing', value: '0.05em' },
      ],
    },

    // Decision 3: Horizontal padding (~1 f-step shift per preset)
    // Uses f-step size keys for the size-specific overrides
    horizontalDensity: {
      tight: [
        { tokenName: 'paddingHorizontal.8', value: 'Spacing-3' },
        { tokenName: 'paddingHorizontal.10', value: 'Spacing-3-5' },
        { tokenName: 'paddingHorizontal.12', value: 'Spacing-4' },
      ],
      default: [],
      roomy: [
        { tokenName: 'paddingHorizontal.8', value: 'Spacing-4' },
        { tokenName: 'paddingHorizontal.10', value: 'Spacing-4-5' },
        { tokenName: 'paddingHorizontal.12', value: 'Spacing-5' },
      ],
    },
  },
};
