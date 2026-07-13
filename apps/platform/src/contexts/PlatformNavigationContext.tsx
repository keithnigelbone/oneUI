'use client';

/**
 * PlatformNavigationContext.tsx
 *
 * Shared context for platform shell navigation.
 * Wraps useShellNavigation() to provide a single, synchronized navigation state
 * (optimistic path, transition status, and navigate handlers) across the entire platform.
 */

import React, { createContext, useContext } from 'react';
import { useShellNavigation } from '@/app/(platform)/_layout/useShellNavigation';

type UseShellNavigationResult = ReturnType<typeof useShellNavigation>;

const PlatformNavigationContext = createContext<UseShellNavigationResult | undefined>(undefined);

interface PlatformNavigationProviderProps {
  children: React.ReactNode;
}

export const PlatformNavigationProvider: React.FC<PlatformNavigationProviderProps> = ({ children }) => {
  const navigation = useShellNavigation();

  return (
    <PlatformNavigationContext.Provider value={navigation}>
      {children}
    </PlatformNavigationContext.Provider>
  );
};

export function usePlatformNavigation(): UseShellNavigationResult {
  const context = useContext(PlatformNavigationContext);
  if (!context) {
    throw new Error(
      'usePlatformNavigation must be used within a PlatformNavigationProvider'
    );
  }
  return context;
}
