/**
 * LeftNav.shared.ts
 *
 * Shared types for left navigation component
 * Includes logo, main navigation, and bottom utilities (settings, theme, profile)
 */

import React from 'react';
import type { ComponentIconInput } from '@oneui/shared';

export interface NavigationItem {
  id: string;
  label: string;
  icon: ComponentIconInput | React.ReactElement;
  path: string;
  badge?: string | number;
  children?: NavigationItem[];
  /** Section label for grouping items in the nav (e.g. "Design System", "Experience Builder") */
  section?: string;
}

export interface UserInfo {
  name: string;
  email?: string;
  avatar?: string;
  initials?: string;
}

export interface LeftNavProps {
  /** Logo element to display at top */
  logo?: React.ReactNode;
  /** Main navigation items */
  items: NavigationItem[];
  /** Current active path */
  currentPath: string;
  /** Navigation handler */
  onNavigate: (path: string) => void;
  /** Current theme */
  currentTheme?: 'light' | 'dark';
  /** Theme change handler */
  onThemeChange?: (theme: 'light' | 'dark') => void;
  /** User information for avatar */
  user?: UserInfo;
  /** Settings click handler */
  onSettingsClick?: () => void;
  /** Help click handler */
  onHelpClick?: () => void;
  /** Profile click handler. Ignored when `renderProfileMenu` is provided. */
  onProfileClick?: () => void;
  /**
   * Wraps the avatar button in a menu (e.g. DS Menu with the avatar as
   * `Menu.Trigger render={trigger}`). Receives the avatar button element;
   * when set, the avatar no longer fires `onProfileClick` directly.
   */
  renderProfileMenu?: (trigger: React.ReactElement) => React.ReactNode;
  /** Focus mode: hides items and utilities, keeps logo visible */
  focusMode?: boolean;
}
