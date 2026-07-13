/**
 * Grid.recipe.ts
 *
 * Recipe definition for the Grid layout primitive.
 * Grid has no user-facing design decisions today — column count and gutter are
 * platform-driven via the --Grid-* tokens and propagated automatically.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const GRID_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Grid',
  decisions: [],
  resolutionMap: {},
};
