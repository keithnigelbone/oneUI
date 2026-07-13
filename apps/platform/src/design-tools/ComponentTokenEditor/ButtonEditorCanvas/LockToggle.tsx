'use client';

import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { IconButton } from '@oneui/ui-internal/components/IconButton';

export interface LockToggleProps {
  locked: boolean;
  onToggle: (nextLocked: boolean) => void;
}

// TODO: swap lucide icons for brand-specific icons once
// useFoundationData().iconLibrary is wired.
export function LockToggle({ locked, onToggle }: LockToggleProps) {
  const Icon = locked ? Lock : Unlock;
  return (
    <IconButton
      icon={<Icon size={14} />}
      appearance={locked ? 'neutral' : 'warning'}
      size="s"
      attention={locked ? 'low' : 'high'}
      onPress={() => onToggle(!locked)}
      aria-label={locked ? 'Unlock canvas to edit tokens' : 'Lock canvas'}
      aria-pressed={!locked}
    />
  );
}
