/**
 * DecorationContext.tsx
 *
 * Native peer of `packages/ui/src/hooks/useDecorationContext.tsx`. Maps
 * componentName → resolved `DecorationConfig` so multi-accent components
 * (Button, etc.) can render brand-uploaded ornament SVGs at their edges.
 *
 * Data shape and consumer API match web 1:1 — apps build the same
 * `Map<string, DecorationConfig>` from Convex foundation data and mount
 * `<DecorationProvider>` inside the theme provider.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import type { DecorationConfig } from '@oneui/shared';

type DecorationMap = Map<string, DecorationConfig>;

const DecorationContext = createContext<DecorationMap>(new Map());

export interface DecorationProviderProps {
  decorations: DecorationMap;
  children: ReactNode;
}

export function DecorationProvider({
  decorations,
  children,
}: DecorationProviderProps): React.ReactElement {
  return (
    <DecorationContext.Provider value={decorations}>
      {children}
    </DecorationContext.Provider>
  );
}

/**
 * Read the ornament decoration assigned to a given component slug. Returns
 * `null` when the brand has not assigned one — components must render
 * normally in that case.
 */
export function useComponentDecoration(
  componentName: string,
): DecorationConfig | null {
  const decorations = useContext(DecorationContext);
  return decorations.get(componentName) ?? null;
}
