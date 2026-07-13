/**
 * BottomNavigation.tsx
 * Mobile/tablet bottom navigation bar — container.
 *
 * Renders a `<nav>` with 2–5 `<BottomNavItem>` children distributed
 * evenly across the width. Shares `labelType`, controlled active value,
 * and appearance with children via context.
 *
 * @example
 * ```tsx
 * <BottomNavigation aria-label="Primary" defaultValue="home" labelType="1line">
 *   <BottomNavItem value="home" icon="home-line" activeIcon="home-fill" label="Home" />
 *   <BottomNavItem value="search" icon="search-line" label="Search" />
 *   <BottomNavItem value="profile" icon="user-line" label="Profile" />
 * </BottomNavigation>
 * ```
 */

'use client';

import React, {
  Children,
  isValidElement,
  useCallback,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import { Divider } from '../Divider';
import styles from './BottomNavigation.module.css';
import {
  BottomNavigationContext,
  getBottomNavItemId,
  getFocusableBottomNavItems,
  resolveBottomNavigationAppearance,
} from './BottomNavigation.shared';
import { useSurfaceAppearance } from '../Surface';
import type { BottomNavItemProps, BottomNavigationProps } from './BottomNavigation.shared';

const MAX_ITEMS = 5;

export function BottomNavigation({
  children,
  labelType = '1line',
  value,
  defaultValue,
  onValueChange,
  showDivider = true,
  appearance,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  className,
  style,
  ref,
}: BottomNavigationProps & { ref?: React.Ref<HTMLElement> }) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const currentValue = isControlled ? value : internalValue;
  const [focusId, setFocusId] = useState<string | undefined>(undefined);

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance = resolveBottomNavigationAppearance(appearance, parentAppearance);

  const itemMetas = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((child, index) => {
          const props = child.props as BottomNavItemProps;
          return {
            id: getBottomNavItemId(props.value, index),
            disabled: !!props.disabled,
          };
        }),
    [children],
  );

  const firstEnabledId =
    itemMetas.find((item) => !item.disabled)?.id ?? itemMetas[0]?.id ?? '';

  const resolveRovingTabId = useCallback(
    (candidate: string | undefined) => {
      if (!candidate) return firstEnabledId;
      const match = itemMetas.find((item) => item.id === candidate);
      if (match && !match.disabled) return candidate;
      return firstEnabledId;
    },
    [itemMetas, firstEnabledId],
  );

  const rovingTabId = resolveRovingTabId(focusId ?? currentValue ?? firstEnabledId);

  const contextValue = useMemo(
    () => ({
      labelType,
      value: currentValue,
      onValueChange: handleValueChange,
      appearance: resolvedAppearance,
      rovingTabId,
      setRovingTabId: setFocusId,
    }),
    [
      labelType,
      currentValue,
      handleValueChange,
      resolvedAppearance,
      rovingTabId,
    ],
  );

  const handleToolbarKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = getFocusableBottomNavItems(event.currentTarget);
      if (items.length === 0) return;

      const activeEl = document.activeElement as HTMLElement | null;
      const currentIdx = activeEl ? items.indexOf(activeEl) : -1;
      if (currentIdx === -1) return;

      const moveTo = (nextIdx: number) => {
        if (nextIdx === currentIdx) return;
        items[nextIdx]?.focus();
      };

      const step = (direction: 1 | -1) =>
        (currentIdx + direction + items.length) % items.length;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          moveTo(step(1));
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          moveTo(step(-1));
          break;
        case 'Home':
          event.preventDefault();
          moveTo(0);
          break;
        case 'End':
          event.preventDefault();
          moveTo(items.length - 1);
          break;
        default:
          break;
      }
    },
    [],
  );

  const indexedChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    return React.cloneElement(child as React.ReactElement<BottomNavItemProps>, {
      itemIndex: index,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const count = Children.count(children);
    if (count > MAX_ITEMS) {
      console.warn(
        `BottomNavigation: received ${count} items — the design system supports up to ${MAX_ITEMS}.`,
      );
    }
    if (!ariaLabel) {
      console.warn('BottomNavigation: `aria-label` is required for the <nav> landmark.');
    }
  }

  return (
    <BottomNavigationContext.Provider value={contextValue}>
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={clsx(styles.root, className)}
        style={style}
        data-label-type={labelType}
        data-appearance={resolvedAppearance}
        data-testid={dataTestId}
      >
        {showDivider && (
          <Divider orientation="horizontal" size="s" className={styles.topDivider} />
        )}
        <div
          className={styles.itemList}
          role="toolbar"
          aria-orientation="horizontal"
          onKeyDown={handleToolbarKeyDown}
        >
          {indexedChildren}
        </div>
      </nav>
    </BottomNavigationContext.Provider>
  );
}
