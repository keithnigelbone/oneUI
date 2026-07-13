import React from 'react';
import { OneUINativeThemeProvider, defaultNativeTheme } from '@ui-native/theme';

type RecipeOverrides = Record<string, Record<string, string>>;

/**
 * Wraps a component in OneUINativeThemeProvider so hooks like useSurfaceTokens
 * resolve. Pass recipeOverrides to test recipe-driven style changes.
 */
export function wrap(
  ui: React.ReactElement,
  recipeOverrides?: RecipeOverrides,
): React.ReactElement {
  return React.createElement(
    OneUINativeThemeProvider,
    { theme: defaultNativeTheme(), recipeOverrides },
    ui,
  );
}
