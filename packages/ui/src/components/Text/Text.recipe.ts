/**
 * Text.recipe.ts
 *
 * Tier-2 recipe for Text. Two brand-facing decisions:
 *  1. Heading font slot — which font slot drives display/headline.
 *     Brands that ship a separate editorial typeface point Heading
 *     roles at the Heading slot; pure-Text brands keep them on Text.
 *  2. Body weight emphasis — caps the highest body weight a brand
 *     considers acceptable. Useful for accessibility-first brands that
 *     want medium as the maximum body weight.
 *
 * Stays well under the ≤6 decisions / ≤4 options recipe budget defined
 * in CLAUDE.md.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const TEXT_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Text',
  decisions: [
    {
      id: 'headingFontSlot',
      label: 'Heading font slot',
      rationale:
        'Display + Headline variants follow the brand heading slot by default. Brands without a distinct heading face can route them through the body Text slot instead.',
      category: 'typography',
      options: [
        { value: 'heading', label: 'Heading slot', description: 'Editorial / hero face' },
        { value: 'text', label: 'Text slot', description: 'Same as body face' },
      ],
      defaultOption: 'heading',
    },
    {
      id: 'bodyMaxEmphasis',
      label: 'Body max emphasis',
      rationale:
        'Caps the highest weight body text uses. Helps a11y-first brands keep body copy below the typical 700-weight threshold.',
      category: 'typography',
      options: [
        { value: 'high', label: 'High (700)', description: 'Default OneUI body emphasis' },
        { value: 'medium', label: 'Medium (500)', description: 'Cap body at medium weight' },
        { value: 'low', label: 'Low (400)', description: 'Body is always regular' },
      ],
      defaultOption: 'high',
    },
  ],

  resolutionMap: {
    headingFontSlot: {
      heading: [],
      text: [
        // Override the role-specific font-family slot back to the Text
        // slot for both Display and Headline. Brand CSS engine will
        // honour these declarations under @layer brand.
        { tokenName: 'Display-FontFamily', value: 'Typography-Font-Text' },
        { tokenName: 'Headline-FontFamily', value: 'Typography-Font-Text' },
      ],
    },
    bodyMaxEmphasis: {
      high: [],
      medium: [
        // Re-point the high emphasis weight to the medium token. Body
        // copy authored at `weight="high"` reads the medium weight.
        { tokenName: 'Body-FontWeight-High', value: 'Body-FontWeight-Medium' },
      ],
      low: [
        { tokenName: 'Body-FontWeight-High', value: 'Body-FontWeight-Low' },
        { tokenName: 'Body-FontWeight-Medium', value: 'Body-FontWeight-Low' },
      ],
    },
  },
};
