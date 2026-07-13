/**
 * useComponentEditorWiring.ts
 *
 * Shared Convex wiring for component showcase/editor pages. Every
 * <Name>PageContent previously duplicated ~80 lines of identical queries,
 * mutations, and handlers around ComponentTokenEditorProvider — this hook is
 * that block, once.
 *
 * Returns exactly the props ComponentTokenEditorProvider expects for
 * persistence (savedOverrides / onSaveOverrides / onClearOverrides /
 * savedRecipeSelections / onSaveRecipeSelections).
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type { RecipeSelections } from '@oneui/shared';
import type { SavedTokenOverride } from '@/design-tools/ComponentTokenEditor';

export interface ComponentEditorWiring {
  savedOverrides: SavedTokenOverride[] | null;
  onSaveOverrides: (overrides: SavedTokenOverride[]) => Promise<void>;
  onClearOverrides: () => Promise<void>;
  savedRecipeSelections: RecipeSelections | null;
  onSaveRecipeSelections: (selections: RecipeSelections) => Promise<void>;
}

/**
 * @param brandId  Active brand (queries are skipped while undefined)
 * @param componentName  The slug/name stored in Convex (matches existing
 *   pages' usage, e.g. 'switch', 'button')
 */
export function useComponentEditorWiring(
  brandId: Id<'brands'> | undefined,
  componentName: string,
): ComponentEditorWiring {
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    brandId ? { brandId, componentName } : 'skip',
  );

  const savedOverrides: SavedTokenOverride[] | null = useMemo(() => {
    if (!savedOverridesData) return null;
    return savedOverridesData.map((override) => ({
      tokenName: override.tokenName,
      mode: override.mode,
      value: override.value,
    }));
  }, [savedOverridesData]);

  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    brandId ? { brandId, componentName } : 'skip',
  );

  const savedRecipeSelections: RecipeSelections | null = useMemo(() => {
    if (!savedRecipeSelectionsData) return null;
    return {
      selections: (savedRecipeSelectionsData.selections || {}) as Record<string, string>,
    };
  }, [savedRecipeSelectionsData]);

  const upsertRecipeSelections = useMutation(api.componentRecipeSelections.upsertRecipeSelections);
  const batchUpsertOverrides = useMutation(api.componentTokenOverrides.batchUpsertOverrides);
  const removeAllForComponent = useMutation(api.componentTokenOverrides.removeAllForComponent);

  const onSaveRecipeSelections = useCallback(
    async (selections: RecipeSelections) => {
      if (!brandId) throw new Error('No brand selected');
      await upsertRecipeSelections({
        brandId,
        componentName,
        selections: selections.selections,
      });
    },
    [upsertRecipeSelections, brandId, componentName],
  );

  const onSaveOverrides = useCallback(
    async (overrides: SavedTokenOverride[]) => {
      if (!brandId) throw new Error('No brand selected');
      await batchUpsertOverrides({
        brandId,
        componentName,
        overrides: overrides.map((o) => ({
          tokenName: o.tokenName,
          value: o.value,
        })),
      });
    },
    [batchUpsertOverrides, brandId, componentName],
  );

  const onClearOverrides = useCallback(async () => {
    if (!brandId) throw new Error('No brand selected');
    await removeAllForComponent({ brandId, componentName });
  }, [removeAllForComponent, brandId, componentName]);

  return {
    savedOverrides,
    onSaveOverrides,
    onClearOverrides,
    savedRecipeSelections,
    onSaveRecipeSelections,
  };
}
