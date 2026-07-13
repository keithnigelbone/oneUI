'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconButton } from '@oneui/ui/components/IconButton';
import { LS_THEME, loadPersistedTheme, type ThemeChoice } from '@/shell/qaPlaygroundToolbarState';

export function QaStorybookThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice>(() => loadPersistedTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', theme);
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(LS_THEME, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <IconButton
      attention="low"
      size={10}
      appearance="neutral"
      icon={theme === 'light' ? 'moon' : 'sun'}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={toggle}
      data-testid="qa-storybook-theme-toggle"
    />
  );
}
