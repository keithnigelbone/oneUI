/**
 * ListItem.tsx
 * Row primitive: leading slot + title/support + trailing slot.
 *
 * Polymorphic:
 *  - `href`     → <a>
 *  - `onClick`  → <button type="button">
 *  - neither    → <div> (non-interactive)
 *
 * Selected states:
 *  - 'medium' → tinted fill (`--{Role}-Subtle`)
 *  - 'high'   → bold fill + `data-surface="bold"` on self → children tokens remap to on-bold
 *               colours automatically via the V4 surface-context cascade.
 *
 * @example
 * ```tsx
 * <ListItem
 *   start={<Icon name="heart" />}
 *   title="Favourites"
 *   supportText="Your saved items"
 *   end={<Icon name="chevron-right" />}
 *   onClick={() => navigate('/favourites')}
 * />
 * ```
 */

'use client';

import React from 'react';
import type { MouseEvent } from 'react';
import clsx from 'clsx';
import styles from './ListItem.module.css';
import {
  resolveListItemAppearance,
  type ListItemAppearance,
  type ListItemProps,
} from './ListItem.shared';
import { useSurfaceAppearance } from '../Surface';

const appearanceClassMap: Record<Exclude<ListItemAppearance, 'auto'>, string | undefined> = {
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

/** Lowercase attribute value for slot size ('S' → 's'). */
function sizeToAttr(size: string): string {
  return size.toLowerCase();
}

export function ListItem({
  title,
  supportText,
  supportStart,
  start,
  startSize = 'M',
  end,
  endSize = 'M',
  slotAlignment = 'centre',
  container = 'fullWidth',
  selected = false,
  divider = 'none',
  appearance,
  disabled = false,
  href,
  onClick,
  'aria-label': ariaLabel,
  className,
  style,
  ref,
}: ListItemProps & { ref?: React.Ref<HTMLElement> }) {
  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance = resolveListItemAppearance(appearance, parentAppearance);
  const isInteractive = href !== undefined || onClick !== undefined;
  // When no supportText, single-line row regardless of requested alignment.
  const effectiveAlign = supportText ? slotAlignment : 'none';
  // Data-start-size on the ROOT lets the divider::after compute its inset offset.
  // Only applied when the start slot is actually rendered.
  const hasStartSlot = start !== undefined && start !== null;

  const rootClassName = clsx(
    styles.root,
    appearanceClassMap[resolvedAppearance],
    className,
  );

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const commonProps = {
    className: rootClassName,
    style,
    'aria-label': ariaLabel,
    'aria-current': selected ? ('true' as const) : undefined,
    'data-container': container,
    'data-selected': selected === false ? undefined : selected,
    'data-align': effectiveAlign,
    'data-disabled': disabled ? '' : undefined,
    'data-appearance': resolvedAppearance,
    'data-interactive': isInteractive ? undefined : 'false',
    'data-divider': divider === 'none' ? undefined : divider,
    'data-start-size': hasStartSlot ? sizeToAttr(startSize) : undefined,
  };

  const body = (
    <>
      {start !== undefined && start !== null && (
        <span
          className={styles.slot}
          data-role="start"
          data-size={sizeToAttr(startSize)}
          aria-hidden="true"
        >
          {start}
        </span>
      )}

      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {supportText && (
          <span className={styles.support}>
            {supportStart !== undefined && supportStart !== null && (
              <span className={styles.supportSlot} aria-hidden="true">
                {supportStart}
              </span>
            )}
            <span className={styles.supportText}>{supportText}</span>
          </span>
        )}
      </span>

      {end !== undefined && end !== null && (
        <span
          className={styles.slot}
          data-role="end"
          data-size={sizeToAttr(endSize)}
          aria-hidden="true"
        >
          {end}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        aria-disabled={disabled ? true : undefined}
        onClick={handleClick}
        {...commonProps}
      >
        {body}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        onClick={handleClick}
        {...commonProps}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      aria-disabled={disabled ? true : undefined}
      {...commonProps}
    >
      {body}
    </div>
  );
}
