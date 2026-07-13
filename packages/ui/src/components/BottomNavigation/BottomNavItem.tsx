/**
 * BottomNavItem.tsx
 * Single item inside a BottomNavigation — icon + optional label.
 *
 * Renders as `<a>` when `href` is set, otherwise `<button>`. One item
 * at a time is active (tracked via `active` prop or matched against the
 * parent's `value`). When active, an optional `activeIcon` is swapped in
 * (matches the filled/outline convention from Figma).
 */

'use client';

import React, { isValidElement, useContext } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import clsx from 'clsx';
import styles from './BottomNavigation.module.css';
import { Icon } from '../../icons/Icon';
import type { SemanticIconName, ComponentIconInput } from '@oneui/shared';
import {
  BottomNavigationContext,
  resolveBottomNavigationAppearance,
  getBottomNavItemId,
} from './BottomNavigation.shared';
import { useSurfaceAppearance } from '../Surface';
import type {
  BottomNavItemProps,
  BottomNavigationAppearance,
} from './BottomNavigation.shared';

const appearanceClassMap: Record<Exclude<BottomNavigationAppearance, 'auto'>, string | undefined> = {
  primary: undefined,
  neutral: styles.appearanceNeutral,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  'brand-bg': styles.appearanceBrandBg,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

function renderIconContent(
  icon: ComponentIconInput | ReactElement,
  isActive: boolean,
): React.ReactNode {
  if (isValidElement(icon)) return icon;
  return <Icon name={icon as SemanticIconName} aria-hidden={true} />;
  // Note: size/emphasis are driven by the parent CSS (.iconSlot) via
  // currentColor + data-active. The <Icon> primitive already renders
  // inline SVG with `fill="currentColor"`.
  // The `isActive` param is reserved for future subclassing.
  void isActive;
}

export function BottomNavItem({
  icon,
  activeIcon,
  label,
  active,
  value,
  href,
  onClick,
  disabled,
  appearance,
  labelType: labelTypeProp,
  itemIndex = 0,
  'aria-label': ariaLabel,
  className,
  style,
  ref,
}: BottomNavItemProps & { ref?: React.Ref<HTMLElement> }) {
    const ctx = useContext(BottomNavigationContext);

    const labelType = labelTypeProp ?? ctx?.labelType ?? '1line';
    const parentAppearance = useSurfaceAppearance();
    const resolvedAppearance = resolveBottomNavigationAppearance(
      appearance ?? ctx?.appearance,
      parentAppearance,
    );

    const itemId = getBottomNavItemId(value, itemIndex);
    const isRovingTab = itemId === (ctx?.rovingTabId ?? itemId);

    const isActive =
      active !== undefined
        ? active
        : value !== undefined && ctx?.value !== undefined && ctx.value === value;

    const showLabel = labelType !== 'none' && !!label;
    const effectiveIcon = isActive && activeIcon ? activeIcon : icon;

    if (process.env.NODE_ENV !== 'production') {
      if (labelType === 'none' && !ariaLabel) {
        console.warn(
          'BottomNavItem: `aria-label` is required when `labelType` is "none" (no visible label).',
        );
      }
    }

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      if (value !== undefined && !e.defaultPrevented) {
        ctx?.onValueChange(value);
      }
    };

    const handleFocus = () => {
      ctx?.setRovingTabId(itemId);
    };

    const rootClassName = clsx(
      styles.item,
      appearanceClassMap[resolvedAppearance],
      className,
    );

    const commonProps = {
      className: rootClassName,
      style,
      onClick: handleClick,
      onFocus: handleFocus,
      tabIndex: disabled ? -1 : isRovingTab ? 0 : -1,
      'data-nav-item-id': itemId,
      'aria-current': isActive ? ('page' as const) : undefined,
      'aria-label': ariaLabel,
      'data-active': isActive ? '' : undefined,
      'data-label-type': labelType,
      'data-disabled': disabled ? '' : undefined,
      'data-appearance': resolvedAppearance,
    };

    const content = (
      <span className={styles.itemInner}>
        <span className={styles.iconSlot} aria-hidden="true">
          {renderIconContent(effectiveIcon, isActive)}
        </span>
        {showLabel && (
          <span className={styles.label} data-lines={labelType === '2line' ? '2' : '1'}>
            {label}
          </span>
        )}
      </span>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          aria-disabled={disabled ? true : undefined}
          {...commonProps}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        {...commonProps}
      >
        {content}
      </button>
    );
}
