import React, { createContext, useContext, useState } from 'react';

type Mode = 'light' | 'dark';

interface ThemeCtx {
  mode: Mode;
  cycleMode: () => void;
}

export const ThemeContext = createContext<ThemeCtx>({
  mode: 'light',
  cycleMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  const cycleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));
  return (
    <ThemeContext.Provider value={{ mode, cycleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
