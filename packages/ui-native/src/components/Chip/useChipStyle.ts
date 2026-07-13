/**
 * useChipStyle.ts
 *
 * Thin React hook that reads all Chip style contexts and calls the pure
 * `resolveChipStyle` function. Memoized over all inputs.
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
import { resolveChipStyle, type ChipResolvedStyle } from './resolveChipStyle';
import { SIZE_TO_LABEL } from './Chip.styles.native';
import type { ChipSize } from './interface';
import type { ChipVariant } from './interface';

export interface UseChipStyleProps {
  resolvedVariant: ChipVariant;
  roleAppearanceForTokens: ComponentAppearance;
  size: ChipSize;
  isSelected: boolean;
}

export function useChipStyle({
  resolvedVariant,
  roleAppearanceForTokens,
  size,
  isSelected,
}: UseChipStyleProps): ChipResolvedStyle {
  const role = useSurfaceTokens(roleAppearanceForTokens);
  const neutral = useSurfaceTokens('neutral');
  const { resolvedRoles } = useSurfaceContext();
  const componentTheme = useComponentTheme('chip');
  const recipeDecisions = useComponentRecipe('chip');
  const theme = useOneUITheme();
  const brandMaterials = useBrandMaterial();
  const labelTypo = useTypographyTokens('label', SIZE_TO_LABEL[size], { emphasis: 'medium' });

  return useMemo(
    () =>
      resolveChipStyle({
        componentTheme,
        recipeDecisions,
        labelTypo,
        theme,
        role,
        neutral,
        resolvedVariant,
        resolvedRoles,
        brandMaterials,
        isSelected,
      }),
    [
      componentTheme,
      recipeDecisions,
      labelTypo,
      theme,
      role,
      neutral,
      resolvedVariant,
      resolvedRoles,
      brandMaterials,
      isSelected,
    ],
  );
}
