/**
 * useNativeTheme.ts
 *
 * Builds a `OneUINativeTheme` from live Convex foundation data — the same
 * pipeline Storybook uses on web (`BrandStyleDecorator.tsx` →
 * `useBrandCSS`) and `apps/mobile` uses on native (`foundationToNativeTheme`).
 *
 * Inputs:
 *   - `brandId`: Convex brand document id (null while bootstrapping)
 *   - `theme`: 'light' | 'dark' (selected via TopBar)
 *
 * The hook subscribes to `api.foundations.getBrandOverviewData` and runs
 * the resulting payload through `foundationToNativeTheme`, which calls
 * the shared `buildNativeTheme` engine to produce the role-resolved
 * surface, content, and state tokens that `<OneUINativeThemeProvider>`
 * provides to every component.
 *
 * Returns `null` while loading; `ThemedShell` renders a loading fallback
 * in that state.
 */

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type { OneUINativeTheme } from '@oneui/ui-native';
import { foundationToNativeTheme } from './utils/foundationToNativeTheme';
import type { ThemeMode } from './tokens';

export function useNativeTheme(
  brandId: string | null,
  theme: ThemeMode,
): OneUINativeTheme | null {
  const foundationData = useQuery(
    api.foundations.getBrandOverviewData,
    brandId ? { brandId: brandId as Id<'brands'> } : 'skip',
  );

  return useMemo(() => {
    if (!foundationData) return null;
    return foundationToNativeTheme(
      foundationData,
      theme === 'dim' ? 'dark' : theme,
    );
  }, [foundationData, theme]);
}
