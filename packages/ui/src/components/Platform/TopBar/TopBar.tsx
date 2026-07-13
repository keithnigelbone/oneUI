/**
 * TopBar.tsx
 *
 * Global control bar. Brand selection has moved to the LeftNav logo
 * (via BrandPicker). TopBar now holds only center + trailing slots.
 */

'use client';

import React from 'react';
import styles from './TopBar.module.css';
import { TopBarProps, useTopBarState } from './TopBar.shared';

export const TopBar: React.FC<TopBarProps> = ({
  center,
  trailing,
}) => {
  const { ariaProps } = useTopBarState();

  return (
    <header className={styles.topBar} {...ariaProps}>
      {/* Center - Page-level controls (e.g. Docs/Edit toggle) */}
      {center && (
        <div className={styles.centerControls}>{center}</div>
      )}

      {/* Trailing - Component controls (only shown when trailing is provided) */}
      {trailing && (
        <div className={styles.trailingControls}>
          <div className={styles.trailingSlot}>{trailing}</div>
        </div>
      )}
    </header>
  );
};

export * from './TopBar.shared';
export { PlatformSelector } from './PlatformSelector';
export { DensitySelector } from './DensitySelector';
export type { PlatformOption, PlatformSelectorProps } from './PlatformSelector';
export type { DensityMode, DensitySelectorProps } from './DensitySelector';
