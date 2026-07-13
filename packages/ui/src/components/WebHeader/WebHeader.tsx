'use client';

/**
 * WebHeader.tsx
 * Root compound component for responsive web navigation header
 *
 * Follows the Tabs compound component pattern:
 * - WebHeader.PrimaryNav
 * - WebHeader.SecondaryNav
 * - WebHeader.Item
 *
 * Features:
 * - 5 position/style variants (default, transparent, glass, hidden, stickyHidden)
 * - Auto-detected responsive breakpoints (or controlled override)
 * - Mobile hamburger drawer with 3-level drill-down
 * - Token-only CSS Modules styling
 * - WCAG 2.1 AA accessible
 */

'use client';

import React, { useState, useCallback } from 'react';
import styles from './WebHeader.module.css';
import { WebHeaderProps, useWebHeaderState } from './WebHeader.shared';
import { PrimaryNav } from './PrimaryNav';
import { SecondaryNav } from './SecondaryNav';
import { HeaderItem } from './HeaderItem';
import { MobileDrawer } from './MobileDrawer';
import { useBreakpoint } from './useScrollDirection';

// Internal context to share breakpoint with sub-components
const WebHeaderContext = React.createContext<{
  breakpoint: string;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}>({
  breakpoint: 'S',
  drawerOpen: false,
  onDrawerOpenChange: () => {},
});

export const useWebHeaderContext = () => React.useContext(WebHeaderContext);

const WebHeaderRoot: React.FC<WebHeaderProps> = ({
  variant,
  breakpoint: breakpointOverride,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const { dataAttrs } = useWebHeaderState({
    variant,
    breakpoint: breakpointOverride,
    children,
  });

  const breakpoint = useBreakpoint(breakpointOverride);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
  }, []);

  const rootClassName = [styles.webHeader, className]
    .filter(Boolean)
    .join(' ');

  return (
    <WebHeaderContext.Provider
      value={{
        breakpoint,
        drawerOpen,
        onDrawerOpenChange: handleDrawerOpenChange,
      }}
    >
      <header
        className={rootClassName}
        style={style}
        data-breakpoint={breakpoint}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        {...dataAttrs}
      >
        {children}
      </header>
    </WebHeaderContext.Provider>
  );
};

/**
 * WebHeader compound component with static sub-component properties.
 *
 * Usage:
 * ```tsx
 * <WebHeader variant="default">
 *   <WebHeader.PrimaryNav logo={<Logo />} avatar={<Avatar />}>
 *     <WebHeader.Item value="home" active>Home</WebHeader.Item>
 *     <WebHeader.Item value="about">About</WebHeader.Item>
 *   </WebHeader.PrimaryNav>
 *   <WebHeader.SecondaryNav type="navStart">
 *     <WebHeader.Item value="overview" active>Overview</WebHeader.Item>
 *   </WebHeader.SecondaryNav>
 * </WebHeader>
 * ```
 */
export const WebHeader: typeof WebHeaderRoot & {
  PrimaryNav: typeof PrimaryNav;
  SecondaryNav: typeof SecondaryNav;
  Item: typeof HeaderItem;
  Drawer: typeof MobileDrawer;
} = Object.assign(WebHeaderRoot, {
  PrimaryNav,
  SecondaryNav,
  Item: HeaderItem,
  Drawer: MobileDrawer,
});