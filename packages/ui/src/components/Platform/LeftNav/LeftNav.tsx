/**
 * LeftNav.tsx
 *
 * Left navigation rail with:
 * - Logo at top
 * - Main navigation icons with labels below
 * - Bottom utilities (settings, theme toggle, profile)
 *
 * Nav items and utility buttons use <IconButton> (neutral appearance):
 * - attention="medium" (subtle) for active/toggled state
 * - attention="low" (ghost) for default state
 */

'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Icon } from '../../../icons/Icon';
import styles from './LeftNav.module.css';
import { LeftNavProps } from './LeftNav.shared';
import { IconButton } from '../../IconButton/IconButton';
import { Divider } from '../../Divider/Divider';
import type { SemanticIconName } from '@oneui/shared';

export const LeftNav = memo(function LeftNav({
  logo,
  items,
  currentPath,
  onNavigate,
  currentTheme = 'light',
  onThemeChange,
  user,
  onSettingsClick,
  onHelpClick,
  onProfileClick,
  renderProfileMenu,
  focusMode = false,
}: LeftNavProps) {
  // Defer theme icon to after mount to prevent SSR/client hydration mismatch.
  // Server always renders sun; client updates to the correct icon after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleThemeToggle = useCallback(() => {
    if (!onThemeChange) {
      return;
    }

    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    onThemeChange(nextTheme);
  }, [currentTheme, onThemeChange]);

  const effectiveTheme = mounted ? currentTheme : 'light';
  const themeIconName = (effectiveTheme === 'dark' ? 'moon' : 'sun') as SemanticIconName;

  return (
    <nav
      className={styles.nav}
      aria-label="Primary navigation"
      data-focus-mode={focusMode ? 'true' : undefined}
    >
      {/* Logo */}
      {logo && <div className={styles.logo}>{logo}</div>}

      {/* Main navigation items */}
      <div className={styles.items}>
        {items.map((item, index) => {
          // Match by top-level section so /foundations/typography is active
          // when the nav item path is /foundations/color.
          //
          // Active-state resolution:
          //   1. Direct match — currentPath is exactly item.path or a sub-route.
          //      Suppressed if any sibling has a MORE specific match (longer
          //      path that also matches), so /agents defers to
          //      /agents/tone-of-voice when the latter matches.
          //   2. Section fallback — item shares a top-level section prefix
          //      with currentPath and no sibling has a direct match. Keeps
          //      /foundations/color highlighted when on /foundations/typography.
          //      Critically: only fires when NO sibling directly matches, so
          //      /agents/design-composition doesn't light up while we're
          //      under /agents/tone-of-voice.
          const itemSection = '/' + item.path.split('/')[1];
          const isExactOrPrefixMatch =
            currentPath === item.path || currentPath.startsWith(item.path + '/');
          const hasSiblingWithMoreSpecificMatch = items.some(
            other =>
              other.id !== item.id &&
              other.path.length > item.path.length &&
              (currentPath === other.path || currentPath.startsWith(other.path + '/'))
          );
          const hasAnySiblingDirectMatch = items.some(
            other =>
              other.id !== item.id &&
              (currentPath === other.path || currentPath.startsWith(other.path + '/'))
          );
          const isActive =
            (isExactOrPrefixMatch && !hasSiblingWithMoreSpecificMatch) ||
            (!hasAnySiblingDirectMatch &&
              itemSection.length > 1 &&
              item.path !== itemSection &&
              currentPath.startsWith(itemSection + '/'));
          const prevSection = index > 0 ? items[index - 1].section : undefined;
          const showDivider = index > 0 && item.section && item.section !== prevSection;

          return (
            <React.Fragment key={item.id}>
              {showDivider && (
                <div className={styles.sectionDivider}>
                  <Divider orientation="horizontal" attention="low" appearance="neutral" size="s" />
                </div>
              )}
              <IconButton
                icon={item.icon}
                attention={isActive ? 'medium' : 'low'}
                appearance={isActive ? 'primary' : 'neutral'}
                size="m"
                aria-label={item.label}
                onPress={() => onNavigate(item.path)}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom utilities */}
      <div className={styles.utilitiesDivider}>
        <Divider orientation="horizontal" attention="low" appearance="neutral" size="s" />
      </div>
      <div className={styles.utilities}>
        {onThemeChange && (
          <IconButton
            icon={<Icon name={themeIconName} />}
            attention={effectiveTheme === 'dark' ? 'medium' : 'low'}
            appearance="neutral"
            size="m"
            condensed
            aria-label="Toggle theme"
            onPress={handleThemeToggle}
          />
        )}
        {onSettingsClick && (
          <IconButton
            icon={<Icon name="settings" />}
            attention="low"
            appearance="neutral"
            size="m"
            condensed
            aria-label="Settings"
            onPress={onSettingsClick}
          />
        )}
        {onHelpClick && (
          <IconButton
            icon={<Icon name="help" />}
            attention="low"
            appearance="neutral"
            size="m"
            condensed
            aria-label="Help"
            onPress={onHelpClick}
          />
        )}
        {user &&
          (() => {
            const avatarButton = (
              <button
                className={styles.avatar}
                onClick={renderProfileMenu ? undefined : onProfileClick}
                title={user.email ?? user.name}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatarImage} />
                ) : (
                  <span className={styles.avatarInitials}>
                    {user.initials || user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            );
            return renderProfileMenu ? (
              <React.Fragment>{renderProfileMenu(avatarButton)}</React.Fragment>
            ) : (
              avatarButton
            );
          })()}
      </div>
    </nav>
  );
});

export * from './LeftNav.shared';
