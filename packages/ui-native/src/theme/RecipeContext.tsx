/**
 * RecipeContext.tsx
 *
 * Runtime channel for component recipe overrides on native — the
 * counterpart to the brand-CSS overrides web injects per
 * `BUTTON_RECIPE_DEFINITION.resolutionMap` etc.
 *
 * Web pipeline:
 *   brand foundation → resolutionMap → CSS custom-property overrides
 *   (e.g. `--Button-borderRadius`, `--Button-textTransform`) → CSS
 *   modules pick them up at render time.
 *
 * Native pipeline:
 *   brand foundation → recipe selections (`Record<componentSlug,
 *   Record<decisionId, optionId>>`) → React context → component
 *   reads its own slot at render time and translates to RN styles.
 *
 * This module is intentionally tiny — it ships the context + provider
 * helper + the read hook. Each component owns the per-decision style
 * mapping (see `applyButtonRecipe` inside Button.native.tsx, or
 * `resolveRecipeBorderRadius` in `recipeCornerRadius.ts` for Badge-family
 * corner overrides).
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * Selections keyed by component slug → decision id → option id.
 * Empty object is the no-overrides default.
 */
export type RecipeSelections = Record<string, Record<string, string>>;

const RecipeContext = createContext<RecipeSelections>({});

export interface RecipeProviderProps {
  /**
   * Recipe selections for every component this provider scopes.
   * Shape: `{ button: { cornerRadius: 'pill', textTransform: 'uppercase' } }`.
   */
  recipeOverrides?: RecipeSelections;
  children: ReactNode;
}

/**
 * Standalone provider — handy when the recipe scope isn't the same as
 * the theme scope (e.g. previewing a recipe override on a sub-tree).
 * Most apps just pass `recipeOverrides` to `OneUINativeThemeProvider`,
 * which mounts this provider internally.
 */
export function RecipeProvider({
  recipeOverrides,
  children,
}: RecipeProviderProps): React.ReactElement {
  const value = useMemo(() => recipeOverrides ?? {}, [recipeOverrides]);
  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

/**
 * Read recipe selections for a given component slug. Returns `{}` when
 * no overrides are set, so callers can spread without null checks.
 */
export function useComponentRecipe(componentSlug: string): Record<string, string> {
  const all = useContext(RecipeContext);
  return all[componentSlug] ?? {};
}

/** Internal — re-exported for the provider barrel only. */
export { RecipeContext as _RecipeContext };
