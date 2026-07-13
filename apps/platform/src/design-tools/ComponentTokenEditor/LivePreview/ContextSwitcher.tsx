/**
 * ContextSwitcher.tsx
 *
 * Controls for switching preview context (theme mode, component state).
 */

'use client';

import React from 'react';
import type { ContextSwitcherProps } from '../types';
import type { TokenState } from '@oneui/shared';
import styles from '../PropertyPanel/PropertyPanel.module.css';

const MODES = ['light', 'dark'] as const;
const STATES: TokenState[] = ['default', 'hover', 'pressed', 'focus', 'disabled'];

/**
 * ContextSwitcher Component
 *
 * Toggle buttons for switching between theme modes and component states.
 */
export function ContextSwitcher({
  mode,
  previewState,
  onModeChange,
  onStateChange,
  className,
}: ContextSwitcherProps) {
  return (
    <div className={`${className || ''}`}>
      {/* Theme Mode Switcher */}
      <div className={styles.contextSwitcher}>
        {MODES.map((m) => (
          <button
            key={m}
            className={styles.contextButton}
            data-active={mode === m}
            onClick={() => onModeChange(m)}
            aria-pressed={mode === m}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* State Switcher */}
      <div className={styles.contextSwitcher} style={{ marginTop: 'var(--Spacing-3)' }}>
        {STATES.map((s) => (
          <button
            key={s}
            className={styles.contextButton}
            data-active={previewState === s}
            onClick={() => onStateChange(s)}
            aria-pressed={previewState === s}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
