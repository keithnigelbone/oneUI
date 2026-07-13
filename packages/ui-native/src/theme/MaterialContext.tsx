import React, { createContext, useContext, type ReactNode } from 'react';
import type {
  ResolvedMaterials,
  ResolvedMetallicGradient,
  MaterialAssignmentTarget,
} from '@oneui/shared/engine';

export type { MaterialAssignmentTarget };

const MaterialContext = createContext<ResolvedMaterials | null>(null);

interface MaterialContextProviderProps {
  value: ResolvedMaterials | null;
  children: ReactNode;
}

export function MaterialContextProvider({ value, children }: MaterialContextProviderProps): React.ReactElement {
  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>;
}

/** Full resolved materials for the active brand (metallic presets + role assignments). */
export function useBrandMaterial(): ResolvedMaterials | null {
  return useContext(MaterialContext);
}

/**
 * Resolved metallic gradient for a specific appearance role, or `null` when
 * the current brand has no material assignment for that role.
 *
 * Used by `Button` and `Surface` to auto-swap bold fills to metallic when the
 * brand defines a role → preset mapping (e.g. primary → 'gold').
 */
export function useRoleMaterial(role: MaterialAssignmentTarget): ResolvedMetallicGradient | null {
  const materials = useContext(MaterialContext);
  if (!materials) return null;
  const preset = materials.assignments[role];
  if (!preset) return null;
  return materials.metallic[preset] ?? null;
}
