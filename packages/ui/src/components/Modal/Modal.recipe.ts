/**
 * Modal.recipe.ts
 *
 * Recipe definition for the Modal component.
 * Defines 2 design decisions that deterministically resolve to token overrides.
 *
 * Decisions:
 * 1. Shape — corner radius scale (None → XL)
 * 2. Padding — internal spacing density (compact / default / spacious)
 *
 * Note: divider visibility is intentionally NOT a recipe decision. The recipe
 * system only produces token overrides, but divider visibility is controlled
 * by component props (`dividerTopVisibility` / `dividerBottomVisibility`) —
 * not by tokens. Consumers set those props directly on <Modal>.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const MODAL_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Modal',
  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale: 'Controls how rounded the modal corners appear — from sharp corporate to soft friendly.',
      category: 'shape',
      options: [
        { value: 'inherit', label: 'Inherit', description: 'Use the foundation shape setting' },
        { value: 'none', label: 'None', description: 'Square corners' },
        { value: 'small', label: 'Small', description: 'Subtle rounding' },
        { value: 'medium', label: 'Medium', description: 'Figma default — 16px' },
        { value: 'large', label: 'Large', description: 'Pronounced rounding' },
      ],
      defaultOption: 'medium',
    },

    {
      id: 'internalSpacing',
      label: 'Internal padding',
      rationale: 'Controls the breathing room inside the modal — tighter for data-dense UIs, roomier for marketing content.',
      category: 'spacing',
      options: [
        { value: 'compact', label: 'Compact', description: 'Reduced internal padding' },
        { value: 'default', label: 'Default', description: 'Figma default — 16px' },
        { value: 'spacious', label: 'Spacious', description: 'Generous padding' },
      ],
      defaultOption: 'default',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      inherit: [],
      none: [
        { tokenName: 'borderRadius', value: 'Shape-0' },
      ],
      small: [
        { tokenName: 'borderRadius', value: 'Shape-3-5' },
      ],
      medium: [],
      large: [
        { tokenName: 'borderRadius', value: 'Shape-4-5' },
      ],
    },

    internalSpacing: {
      compact: [
        { tokenName: 'padding', value: 'Spacing-3-5' },
      ],
      default: [],
      spacious: [
        { tokenName: 'padding', value: 'Spacing-4-5' },
      ],
    },
  },
};
