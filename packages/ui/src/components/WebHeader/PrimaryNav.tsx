/**
 * PrimaryNav.tsx
 * Top-level navigation bar — matches Figma .PrimaryNav component
 *
 * Features:
 * - Sliding indicator that animates between active items (Tabs pattern)
 * - Configurable search position (none/middle/end)
 * - Responsive: hamburger on mobile, search on desktop
 * - Uses real library components: IconButton, Divider
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './WebHeader.module.css';
import type { PrimaryNavProps } from './WebHeader.shared';
import { SearchInput } from './SearchInput';
import { IconButton } from '../IconButton/IconButton';
import { Divider } from '../Divider/Divider';

export const PrimaryNav: React.FC<PrimaryNavProps> = ({
  type = 'homeBar',
  middle = 'fluid',
  searchInput = 'none',
  showMenuButton = false,
  primaryNavItems = true,
  divider = true,
  showAvatar = true,
  logo,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchAriaLabel,
  searchAriaLabelledBy,
  end,
  avatar,
  activeValue,
  children,
  onDrawerOpenChange,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [indicatorReady, setIndicatorReady] = useState(false);
  const suppressAnimation = useRef(false);
  const hasMeasuredIndicator = useRef(false);
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const restoreTransitionFrame = useRef<number | undefined>(undefined);

  // Measure active item's label position for the sliding indicator
  const updateIndicator = useCallback(() => {
    const nav = navRef.current;
    if (!nav || !activeValue || !primaryNavItems) {
      setIndicatorReady(false);
      return;
    }

    const activeEl = nav.querySelector<HTMLElement>(
      `[data-value="${activeValue}"][data-active="true"]`
    );
    if (!activeEl) {
      setIndicatorReady(false);
      return;
    }

    // Measure the label span (not the full item) so indicator matches text width
    const labelEl = activeEl.querySelector<HTMLElement>(`.${styles.itemLabel}`) ?? activeEl;
    const navRect = nav.getBoundingClientRect();
    const labelRect = labelEl.getBoundingClientRect();

    const indicator = indicatorRef.current;
    if (!indicator) {
      setIndicatorReady(false);
      return;
    }

    // Suppress the first measurement so the indicator does not animate from
    // its zero-width left default on initial load/remount. Later activeValue
    // changes keep the normal slide animation.
    const shouldSuppressAnimation = suppressAnimation.current || !hasMeasuredIndicator.current;
    if (shouldSuppressAnimation) {
      indicator.style.transitionDuration = '0s';
      clearTimeout(resizeTimer.current);
    }

    // Set transform + width directly on the element so transitions reliably
    // interpolate between keyframes. CSS var-driven transforms sometimes get
    // skipped by the browser's transition engine on rapid consecutive updates.
    indicator.style.transform = `translateX(${labelRect.left - navRect.left}px)`;
    indicator.style.width = `${labelRect.width}px`;
    setIndicatorReady(true);

    if (!hasMeasuredIndicator.current) {
      hasMeasuredIndicator.current = true;
      if (restoreTransitionFrame.current) cancelAnimationFrame(restoreTransitionFrame.current);
      restoreTransitionFrame.current = requestAnimationFrame(() => {
        if (indicatorRef.current) {
          indicatorRef.current.style.transitionDuration = '';
        }
      });
    } else if (suppressAnimation.current) {
      resizeTimer.current = setTimeout(() => {
        if (indicatorRef.current) {
          indicatorRef.current.style.transitionDuration = '';
        }
        suppressAnimation.current = false;
      }, 150);
    }
  }, [activeValue, primaryNavItems, middle]);

  // Keep a ref to the latest updateIndicator so the ResizeObserver (mounted
  // once) always calls the current closure with up-to-date activeValue.
  const updateIndicatorRef = useRef(updateIndicator);
  updateIndicatorRef.current = updateIndicator;

  // Reactive effect: recompute position when active item / layout-affecting props change.
  // Uses animation by default — click-to-change should smoothly slide.
  useEffect(() => {
    updateIndicator();
    const raf = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(raf);
  }, [updateIndicator]);

  // One-time ResizeObserver setup — only fires on actual size changes, not on
  // activeValue/middle changes. Skips the initial synchronous fire so the
  // first click doesn't get animation suppression.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let firstFire = true;
    const observer = new ResizeObserver(() => {
      if (firstFire) {
        firstFire = false;
        return;
      }
      suppressAnimation.current = true;
      updateIndicatorRef.current();
    });
    observer.observe(nav);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer.current);
      if (restoreTransitionFrame.current) cancelAnimationFrame(restoreTransitionFrame.current);
    };
  }, []);

  const handleMenuOpen = useCallback(() => {
    onDrawerOpenChange?.(true);
  }, [onDrawerOpenChange]);

  const rootClassName = [styles.primaryNav, className]
    .filter(Boolean)
    .join(' ');

  const searchElement = searchInput !== 'none' ? (
    <SearchInput
      placeholder={searchPlaceholder}
      value={searchValue}
      onChange={onSearchChange}
      onSubmit={onSearchSubmit}
      showSearchIcon
      aria-label={searchAriaLabel}
      aria-labelledby={searchAriaLabelledBy}
    />
  ) : null;

  return (
    <nav
      ref={navRef}
      className={rootClassName}
      aria-label={ariaLabelledBy ? undefined : ariaLabel ?? 'Primary navigation'}
      aria-labelledby={ariaLabelledBy}
      data-type={type}
      data-middle={middle}
    >
      {/* Bottom divider */}
      {divider && (
        <div className={styles.primaryNavDivider} aria-hidden="true">
          <Divider orientation="horizontal" size="s" appearance="neutral" attention="low" />
        </div>
      )}

      {/* START: Hamburger (IconButton) + Logo */}
      <div className={styles.primaryNavStart}>
        {showMenuButton && (
          <span className={styles.hamburgerButton}>
            <IconButton
              icon="menu"
              aria-label="Open navigation menu"
              attention="low"
              size={8}
              condensed
              appearance="neutral"
              onClick={handleMenuOpen}
            />
          </span>
        )}
        {logo}
      </div>

      {/* MIDDLE: Nav items + optional search (when searchInput="middle") */}
      <div className={styles.primaryNavMiddle}>
        {primaryNavItems && children}
        {searchInput === 'middle' && searchElement}
      </div>

      {/* END: Search (when searchInput="end") + Actions + Avatar */}
      <div className={styles.primaryNavEnd}>
        {searchInput === 'end' && searchElement}
        {end && <div className={styles.primaryNavEndSlot}>{end}</div>}
        {showAvatar && avatar}
      </div>

      {/* Sliding indicator — animates between active items.
          Hidden when primaryNavItems is false or no active item. */}
      {primaryNavItems && (
        <div
          ref={indicatorRef}
          className={`${styles.indicator} ${!indicatorReady ? styles.indicatorHidden : ''}`}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};
