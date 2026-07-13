/**
 * ThemeModeContext — minimal app-level state for the `light` / `dark`
 * toggle that feeds `OneUIBrandProvider`'s `themeMode` prop and the
 * header toggle button.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({
  initialMode = 'light',
  children,
}: {
  initialMode?: ThemeMode;
  children: React.ReactNode;
}): React.ReactElement {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const toggle = useCallback(() => {
    setMode((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);
  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, setMode, toggle }),
    [mode, toggle],
  );
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used inside <ThemeModeProvider>');
  }
  return ctx;
}
