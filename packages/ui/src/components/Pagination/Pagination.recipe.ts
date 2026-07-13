/**
 * Pagination.recipe.ts
 *
 * Brand-customisable design decisions for the Pagination family. Two
 * decisions only — keep the recipe small per the OneUI tier rules
 * (max 3 decisions per component, max 3 options per decision).
 *
 *   1. cornerRadius : pill | rounded | square (default pill — Shape-Pill)
 *   2. defaultAttention : high | medium | low — brand default for how the
 *      **selected** page chip renders (SingleTextButton attention). Nav icons
 *      stay ghost + low attention. Inactive page numerals use high-emphasis
 *      colour + ghost fill (see `PaginationItemPage.module.css`).
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const PAGINATION_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Pagination',

  decisions: [
    {
      id: 'cornerRadius',
      label: 'Shape',
      rationale:
        'Page chips default to fully-round (Shape-Pill) to match Jio Figma. Brands that want a softer corner can opt into rounded or square.',
      category: 'shape',
      options: [
        { value: 'pill', label: 'Pill', description: 'Fully round (default — Shape-Pill).' },
        { value: 'rounded', label: 'Rounded', description: 'Subtle radius (Shape-3XS).' },
        { value: 'square', label: 'Square', description: 'No corner radius.' },
      ],
      defaultOption: 'pill',
    },
    {
      id: 'defaultAttention',
      label: 'Default attention (selected page)',
      rationale:
        'Brand default for the **current page** chip only (`SingleTextButton` attention: high=bold fill, medium=subtle fill, low=ghost). Icons and other page numbers always render at low attention.',
      category: 'color',
      options: [
        { value: 'high', label: 'High (bold)', description: 'Filled on-bold treatment.' },
        { value: 'medium', label: 'Medium (subtle)', description: 'Tinted fill.' },
        { value: 'low', label: 'Low (ghost)', description: 'Transparent fill, accent text.' },
      ],
      defaultOption: 'medium',
    },
  ],

  resolutionMap: {
    cornerRadius: {
      rounded: [{ tokenName: 'borderRadius', value: 'Shape-3XS' }],
      pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
      square: [{ tokenName: 'borderRadius', value: 'Shape-None' }],
    },
    defaultAttention: {
      high: [],
      medium: [],
      low: [],
    },
  },
};
