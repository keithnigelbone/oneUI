/**
 * ComponentControlsContext.tsx
 *
 * Shares component-preview state between TopBar controls and component page content.
 * Only active on /components/* routes.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { PlatformsFoundationConfig } from '@oneui/shared';
import { buildDefaultPlatformsConfig } from '@oneui/shared';
import type { DensityMode } from '@oneui/ui/components/Platform';

export interface ComponentControlsContextType {
  /** Component-scoped density preview */
  previewDensity: DensityMode;
  setPreviewDensity: (density: DensityMode) => void;

  /** Component-scoped platform + breakpoint selection */
  selectedPlatformId: string | null;
  selectedBreakpointId: string | null;
  setSelection: (platformId: string | null, breakpointId: string | null) => void;

  /** Platform config from foundation data */
  platformsConfig: PlatformsFoundationConfig;
  setPlatformsConfig: (config: PlatformsFoundationConfig) => void;

  /** Current component name (slug) for storybook link */
  currentComponentName: string | null;
  setCurrentComponentName: (name: string | null) => void;
}

const ComponentControlsContext = createContext<ComponentControlsContextType | undefined>(undefined);

export interface ComponentControlsProviderProps {
  children: React.ReactNode;
  /** Component name derived from URL (e.g. 'button', 'dialog') */
  componentName?: string | null;
}

export const ComponentControlsProvider: React.FC<ComponentControlsProviderProps> = ({ children, componentName: componentNameProp }) => {
  const [previewDensity, setPreviewDensityState] = useState<DensityMode>('default');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [selectedBreakpointId, setSelectedBreakpointId] = useState<string | null>(null);
  const [platformsConfig, setPlatformsConfigState] = useState<PlatformsFoundationConfig>(buildDefaultPlatformsConfig);
  const [currentComponentNameState, setCurrentComponentNameState] = useState<string | null>(null);
  // Use prop if provided, otherwise fall back to state (for pages that set it manually)
  const currentComponentName = componentNameProp ?? currentComponentNameState;

  const setPreviewDensity = useCallback((d: DensityMode) => setPreviewDensityState(d), []);
  const setSelection = useCallback((pId: string | null, bId: string | null) => {
    setSelectedPlatformId(pId);
    setSelectedBreakpointId(bId);
  }, []);
  const setPlatformsConfig = useCallback((c: PlatformsFoundationConfig) => setPlatformsConfigState(c), []);
  const setCurrentComponentName = useCallback((n: string | null) => setCurrentComponentNameState(n), []);

  const value = useMemo<ComponentControlsContextType>(() => ({
    previewDensity,
    setPreviewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setSelection,
    platformsConfig,
    setPlatformsConfig,
    currentComponentName,
    setCurrentComponentName,
  }), [
    previewDensity,
    setPreviewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setSelection,
    platformsConfig,
    setPlatformsConfig,
    currentComponentName,
    setCurrentComponentName,
  ]);

  return (
    <ComponentControlsContext.Provider value={value}>
      {children}
    </ComponentControlsContext.Provider>
  );
};

export function useComponentControls(): ComponentControlsContextType {
  const context = useContext(ComponentControlsContext);
  if (!context) {
    throw new Error('useComponentControls must be used within a ComponentControlsProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not inside provider (safe for non-component pages)
 */
export function useComponentControlsOptional(): ComponentControlsContextType | null {
  return useContext(ComponentControlsContext) ?? null;
}
