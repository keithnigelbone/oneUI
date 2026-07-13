'use client';

/**
 * Focus mode — top-right toggle that hides left-nav items + secondary nav so
 * the Create canvas gets the full viewport. Session-scoped (sessionStorage)
 * so it never traps a user across tabs/reloads, and auto-exits whenever the
 * user navigates away from the Create section so it lives only there.
 */

import { useCallback, useEffect, useState } from 'react';

interface UseFocusModeArgs {
  /** True when the active route is under `/create` — focus mode lives only here. */
  isCreateSection: boolean;
}

interface UseFocusModeResult {
  focusMode: boolean;
  toggleFocusMode: () => void;
}

const STORAGE_KEY = 'oneui:focusMode';

export function useFocusMode({ isCreateSection }: UseFocusModeArgs): UseFocusModeResult {
  const [focusMode, setFocusMode] = useState(false);

  // Restore from session on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY) === '1') setFocusMode(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, focusMode ? '1' : '0');
  }, [focusMode]);

  // Auto-exit when leaving Create.
  useEffect(() => {
    if (!isCreateSection && focusMode) setFocusMode(false);
  }, [isCreateSection, focusMode]);

  const toggleFocusMode = useCallback(() => setFocusMode((v) => !v), []);

  return { focusMode, toggleFocusMode };
}
