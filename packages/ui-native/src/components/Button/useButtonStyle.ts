/**
 * useButtonStyle.ts
 *
 * Thin React hook that reads all Button style contexts and calls the pure
 * `resolveButtonStyle` function. Memoized so the resolver only re-runs when
 * its inputs change — same cost as today's scattered useMemo calls combined.
 */

import { useMemo } from 'react';
import {
  useComponentTheme,
  useComponentRecipe,
  useOneUITheme,
  useSurfaceContext,
  useSurfaceTokens,
  useBrandMaterial,
  useTypographyTokens,
} from '../../theme';
import type { ComponentAppearance } from '@oneui/shared';
import { resolveButtonStyle, type ButtonResolvedStyle } from './resolveButtonStyle';
import { SIZE_TO_LABEL } from './Button.styles.native';
import type { ButtonNumericSize } from './buttonLayout';
import type { ButtonVariant } from './interface';

export interface UseButtonStyleProps {
  resolvedVariant: ButtonVariant;
  resolvedAppearance: ComponentAppearance;
  sizeKey: ButtonNumericSize;
}

export function useButtonStyle({
  resolvedVariant,
  resolvedAppearance,
  sizeKey,
}: UseButtonStyleProps): ButtonResolvedStyle {
  const role = useSurfaceTokens(resolvedAppearance);
  const { resolvedRoles } = useSurfaceContext();
  const componentTheme = useComponentTheme('button');
  const recipeDecisions = useComponentRecipe('button');
  const theme = useOneUITheme();
  const brandMaterials = useBrandMaterial();
  const labelTypo = useTypographyTokens('label', SIZE_TO_LABEL[sizeKey], { emphasis: 'high' });

  return useMemo(
    () =>
      resolveButtonStyle({
        componentTheme,
        recipeDecisions,
        labelTypo,
        theme,
        role,
        resolvedVariant,
        resolvedRoles,
        brandMaterials,
        sizeKey,
      }),
    [
      componentTheme,
      recipeDecisions,
      labelTypo,
      theme,
      role,
      resolvedVariant,
      resolvedRoles,
      brandMaterials,
      sizeKey,
    ],
  );
}
