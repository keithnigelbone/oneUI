/**
 * Container.recipe.ts
 *
 * **Recipes** (`ComponentRecipeDefinition`) are a small set of **brand-level design
 * decisions** that resolve to **component token overrides** (`RecipeTokenOverride[]`)
 * — see `packages/shared/src/types/componentRecipes.ts`.
 *
 * `Container` layout (flex/grid, gap, padding keys, `flex` / `alignSelf`, etc.) is
 * expressed as **normal React props** and maps to global spacing / grid tokens at
 * runtime, not to entries in `Container.tokens.ts`. Those props belong in
 * **`Container.meta.ts`** (`PropDescriptor[]`) for registry / AI / inspector docs.
 *
 * This file intentionally exposes only **width shell** behaviour (`variant` ↔ fluid /
 * fixed / full-bleed) as a recipe decision. Each option currently yields **no**
 * per-component token overrides (`[]`) because horizontal margin and max-width are
 * driven by **Grid** foundation tokens (`Container.tokens.ts` → `--Grid-Margin`,
 * `--Grid-MaxWidth`) rather than per-brand Container CSS variables.
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const CONTAINER_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Container',
  decisions: [
    {
      id: 'widthBehavior',
      label: 'Width behavior',
      rationale: 'Controls how the container scales with viewport width.',
      category: 'layout',
      options: [
        { value: 'fluid', label: 'Fluid', description: 'Grows with viewport; always applies margin.' },
        { value: 'fixed', label: 'Fixed', description: 'Capped at Grid-MaxWidth per breakpoint; centered.' },
        { value: 'full-bleed', label: 'Full bleed', description: 'Edge-to-edge; no margin or cap.' },
      ],
      defaultOption: 'fluid',
    },
  ],

  resolutionMap: {
    widthBehavior: {
      fluid: [],
      fixed: [],
      'full-bleed': [],
    },
  },
};
