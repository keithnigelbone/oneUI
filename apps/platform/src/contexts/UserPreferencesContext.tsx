/**
 * UserPreferencesContext.tsx
 *
 * Thin provider that holds a single `useUserPreferences()` instance so
 * downstream consumers (PlatformProvider, SettingsModal, BrandPicker
 * handler) share one Convex subscription and one debounced write queue.
 */

'use client';

import React, { createContext, useContext } from 'react';
import { useUserPreferences, type UseUserPreferencesResult } from '../hooks/useUserPreferences';

const UserPreferencesContext = createContext<UseUserPreferencesResult | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useUserPreferences();
  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
};

export function useUserPreferencesContext(): UseUserPreferencesResult {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) {
    throw new Error(
      'useUserPreferencesContext must be used within a UserPreferencesProvider'
    );
  }
  return ctx;
}
