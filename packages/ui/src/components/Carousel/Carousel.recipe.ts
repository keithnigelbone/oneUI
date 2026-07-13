/**
 * Carousel.recipe.ts
 *
 * Recipe definition for the Carousel micropattern. The alpha recipe keeps the
 * choices intentionally narrow: slide shape and content rhythm are brand-level
 * decisions, while layout behaviour remains controlled by component props.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const CAROUSEL_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Carousel',
  decisions: [
    {
      id: 'slideShape',
      label: 'How rounded should carousel slides be?',
      rationale:
        'Carousel slides are large media containers; their shape sets the tone for branded editorial surfaces.',
      category: 'shape',
      options: [
        { value: 'soft', label: 'Soft', description: 'Default Jio card radius.' },
        { value: 'roomy', label: 'Roomy', description: 'Larger rounded media panels.' },
        { value: 'sharp', label: 'Sharp', description: 'No rounding for edge-to-edge editorial layouts.' },
      ],
      defaultOption: 'soft',
    },
    {
      id: 'contentRhythm',
      label: 'How spacious should overlaid content feel?',
      rationale:
        'Controls the padding and grouping rhythm for title, body, badges, and actions over media.',
      category: 'spacing',
      options: [
        { value: 'compact', label: 'Compact', description: 'Tighter content blocks for dense placements.' },
        { value: 'balanced', label: 'Balanced', description: 'Default Jio editorial rhythm.' },
        { value: 'spacious', label: 'Spacious', description: 'More breathing room for hero placements.' },
      ],
      defaultOption: 'balanced',
    },
  ],

  resolutionMap: {
    slideShape: {
      soft: [
        { tokenName: 'slideRadius', value: 'Shape-3' },
      ],
      roomy: [
        { tokenName: 'slideRadius', value: 'Shape-4-5' },
      ],
      sharp: [
        { tokenName: 'slideRadius', value: 'Shape-0' },
      ],
    },
    contentRhythm: {
      compact: [
        { tokenName: 'contentPaddingBlockStart', value: 'Spacing-4' },
        { tokenName: 'contentPaddingBlockEnd', value: 'Spacing-4-5' },
        { tokenName: 'contentPaddingInline', value: 'Spacing-4' },
        { tokenName: 'contentGap', value: 'Spacing-2' },
        { tokenName: 'contentOuterGap', value: 'Spacing-3' },
      ],
      balanced: [
        { tokenName: 'contentPaddingBlockStart', value: 'Spacing-4-5' },
        { tokenName: 'contentPaddingBlockEnd', value: 'Spacing-6' },
        { tokenName: 'contentPaddingInline', value: 'Spacing-4-5' },
        { tokenName: 'contentGap', value: 'Spacing-2-5' },
        { tokenName: 'contentOuterGap', value: 'Spacing-3-5' },
      ],
      spacious: [
        { tokenName: 'contentPaddingBlockStart', value: 'Spacing-6' },
        { tokenName: 'contentPaddingBlockEnd', value: 'Spacing-8' },
        { tokenName: 'contentPaddingInline', value: 'Spacing-6' },
        { tokenName: 'contentGap', value: 'Spacing-3-5' },
        { tokenName: 'contentOuterGap', value: 'Spacing-4-5' },
      ],
    },
  },
};
