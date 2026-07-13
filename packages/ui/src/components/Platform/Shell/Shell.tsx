/**
 * Shell.tsx
 *
 * Main layout wrapper for the platform
 * Fixed sidebar (LeftNav only) + optional TopBar + content area with optional secondary nav
 */

'use client';

import React, { memo } from 'react';
import styles from './Shell.module.css';
import { ShellProps } from './Shell.shared';

export const Shell = memo(function Shell({
  children,
  topBar,
  leftNav,
  secondaryNav,
  focusMode = false,
}: ShellProps) {
  return (
    <div
      className={styles.shell}
      data-has-topbar={!!topBar}
      data-focus-mode={focusMode ? 'true' : undefined}
      role="application"
    >
      {/* Sidebar - only LeftNav */}
      <div className={styles.sidebar}>
        <aside
          className={styles.leftNav}
          role="navigation"
          aria-label="Primary navigation"
        >
          {leftNav}
        </aside>
      </div>
      <div className={styles.verticalDivider} aria-hidden="true" />

      {/* TopBar - optional, positioned above content area */}
      {topBar && (
        <div className={styles.topBarContainer}>
          {topBar}
          <div className={styles.divider} data-orientation="horizontal" aria-hidden="true" />
        </div>
      )}

      {/* Main content area (white) with optional secondary nav inside */}
      <main
        className={styles.content}
        data-has-secondary-nav={secondaryNav && !focusMode ? 'true' : undefined}
      >
        {secondaryNav && !focusMode && (
          <>
            <aside
              className={styles.secondaryNav}
              role="navigation"
              aria-label="Secondary navigation"
            >
              {secondaryNav}
            </aside>
            <div
              className={styles.secondaryNavDivider}
              aria-hidden="true"
            />
          </>
        )}
        <div className={styles.contentInner} data-foundation-scope="preview">
          {children}
        </div>
      </main>
    </div>
  );
});

export * from './Shell.shared';
