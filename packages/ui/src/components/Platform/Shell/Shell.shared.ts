/**
 * Shell.shared.ts
 *
 * Shared types for the main layout shell component
 * Layout: TopBar (optional) + LeftNav (icon rail) + SecondaryNav (sidebar) + Content
 */

import React from 'react';

export interface ShellProps {
  children: React.ReactNode;
  /** Top bar for brand selection and global controls */
  topBar?: React.ReactNode;
  /** Left navigation rail (icons with labels) */
  leftNav: React.ReactNode;
  /** Secondary navigation sidebar (contextual) */
  secondaryNav?: React.ReactNode;
  /** Focus mode: hides nav items/utilities/secondaryNav, keeps logo anchored */
  focusMode?: boolean;
}
