/**
 * ModeNav.tsx
 *
 * Top-center mode tabs — the Claude-desktop-style high-level switcher
 * ("Home | Build | System | Agents"). Controlled component; the caller
 * derives the active mode from the current pathname and decides where
 * `onModeChange` routes to.
 *
 * Intentionally dumb — no internal state, no routing, no context.
 */

'use client';

import React, { memo } from 'react';
import styles from './ModeNav.module.css';
import { Button } from '../../Button/Button';
import type { ModeNavProps } from './ModeNav.shared';

export const ModeNav = memo(function ModeNav({
  items,
  activeMode,
  onModeChange,
  className,
}: ModeNavProps) {
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <nav className={rootClassName} aria-label="Platform mode">
      {items.map((item) => {
        const isActive = item.id === activeMode;
        return (
          <Button
            key={item.id}
            attention={isActive ? 'medium' : 'low'}
            appearance={isActive ? 'primary' : 'neutral'}
            size="s"
            start={item.icon}
            decoration={null}
            onPress={() => onModeChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
});

export type { ModeNavProps, ModeNavItem, PlatformModeId } from './ModeNav.shared';
