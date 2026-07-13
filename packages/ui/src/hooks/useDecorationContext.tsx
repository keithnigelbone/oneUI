'use client';

/**
 * useDecorationContext.tsx
 *
 * Context for brand ornament/decoration assignments.
 * Populated by FoundationStyleProvider (platform) or BrandStyleDecorator (Storybook)
 * from Convex decoration data. Components read their assignments via useComponentDecoration().
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import type { DecorationConfig } from '@oneui/shared';

/**
 * Map of componentName → resolved DecorationConfig (contains actual SVG data)
 */
type DecorationMap = Map<string, DecorationConfig>;

const DecorationContext = createContext<DecorationMap>(new Map());

export interface DecorationProviderProps {
  decorations: DecorationMap;
  children: ReactNode;
}

export function DecorationProvider({ decorations, children }: DecorationProviderProps) {
  return (
    <DecorationContext.Provider value={decorations}>
      {children}
    </DecorationContext.Provider>
  );
}

/**
 * Hook for components to check if they have an ornament decoration.
 * Returns the DecorationConfig if one is assigned for this component, or null.
 */
export function useComponentDecoration(componentName: string): DecorationConfig | null {
  const decorations = useContext(DecorationContext);
  return decorations.get(componentName) ?? null;
}
