'use client';

import React from 'react';
import { IconButton } from '@oneui/ui/components/IconButton';

interface FocusModeToggleProps {
  focusMode: boolean;
  onToggle: () => void;
}

/**
 * Top-right button that hides the left-nav items + secondary nav so the
 * Create canvas gets the full viewport. Logo stays anchored.
 */
export function FocusModeToggle({ focusMode, onToggle }: FocusModeToggleProps): React.ReactElement {
  const icon = focusMode ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3v4a1 1 0 0 1-1 1H3" />
      <path d="M21 8h-4a1 1 0 0 1-1-1V3" />
      <path d="M3 16h4a1 1 0 0 1 1 1v4" />
      <path d="M16 21v-4a1 1 0 0 1 1-1h4" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
  return (
    <IconButton
      icon={icon}
      attention="low"
      appearance="neutral"
      size="m"
      condensed
      aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
      onPress={onToggle}
    />
  );
}
