/**
 * Chip.tsx
 * React (web) implementation using Base UI Toggle
 *
 * Key features:
 * - Uses @base-ui/react Toggle primitive (never fork)
 * - Token-only styling in CSS Module
 * - 3 sizes (S/M/L) aligned with Figma spec
 * - Multi-accent appearance roles (all 12 V4 roles)
 * - Toggleable selected state (controlled/uncontrolled)
 * - WCAG AA accessible via Base UI Toggle (aria-pressed, keyboard nav)
 * - Generic start/end slots accept any ReactNode (icons, avatars, badges)
 * - Surface-context-aware: bold selected state remaps slot colors
 *
 * @example
 * ```tsx
 * import { Chip } from '@oneui/ui';
 *
 * <Chip>Filter</Chip>
 * <Chip attention="high" selected start={<Icon name="check" />}>Active</Chip>
 * ```
 */

'use client';

import React, { type ReactNode, useCallback, useState } from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import clsx from 'clsx';
import styles from './Chip.module.css';
import { type ChipAppearance, type ChipProps, useChipState } from './Chip.shared';
import { explicitAppearanceClass, makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { useSurfaceAppearance } from '../Surface/Surface';

const SURFACE_IMMUNE_DISPLAY_NAMES = new Set(['CounterBadge', 'IndicatorBadge']);
type ToggleEventDetails = Parameters<NonNullable<React.ComponentProps<typeof BaseToggle>['onPressedChange']>>[1];

function shieldSurfaceImmuneChildren(node: ReactNode): ReactNode {
  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child;

    const displayName = (child.type as { displayName?: string })?.displayName;
    if (displayName && SURFACE_IMMUNE_DISPLAY_NAMES.has(displayName)) {
      return (
        <span className={styles.contextBoundary} data-context-boundary>
          {child}
        </span>
      );
    }

    return child;
  });
}

const appearanceClassMap = makeAppearanceClassMap(styles);
type ResolvedChipAppearance = Exclude<ChipAppearance, 'auto'>;

export function Chip(
  {
    children,
    size,
    attention,
    appearance,
    selected,
    defaultSelected,
    onSelectedChange,
    value,
    disabled,
    start,
    end,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    className: classNameProp,
    style: styleProp,
    ref,
  }: ChipProps & { ref?: React.Ref<HTMLButtonElement> },
) {
  const [uncontrolledSelected, setUncontrolledSelected] = useState(defaultSelected ?? true);
  const surfaceAppearance = useSurfaceAppearance();
  const { isDisabled, resolvedVariant, resolvedAppearance, inheritedFromSurface, dataAttrs } = useChipState({
    size,
    attention,
    appearance,
    disabled,
  });
  const isSelected = selected ?? uncontrolledSelected;
  const unselectedAppearance: ResolvedChipAppearance = surfaceAppearance ?? 'neutral';
  const slotSurface = isSelected
    ? resolvedVariant === 'bold'
      ? 'bold'
      : resolvedVariant === 'subtle'
        ? 'subtle'
        : undefined
    : undefined;

  const handlePressedChange = useCallback(
    (nextSelected: boolean, eventDetails: ToggleEventDetails) => {
      if (selected === undefined) {
        setUncontrolledSelected(nextSelected);
      }
      onSelectedChange?.(nextSelected, eventDetails);
    },
    [onSelectedChange, selected],
  );

  // Dev-mode warning for missing aria-label
  if (process.env.NODE_ENV !== 'production' && !ariaLabel && !children) {
    console.warn('Chip: an `aria-label` prop is recommended when Chip has no visible text content.');
  }

  const appearanceClassName = explicitAppearanceClass(
    appearance,
    resolvedAppearance,
    appearanceClassMap,
    inheritedFromSurface,
    'secondary',
  );

  const className = clsx(
    styles.chip,
    styles[resolvedVariant],
    appearanceClassName,
    classNameProp,
  );
  // Filled selected chips are surfaces for slot children. Avatar adapts to
  // that surface; semantic badges are boundary-wrapped so red/green stays red/green.
  return (
    <BaseToggle
      ref={ref}
      pressed={isSelected}
      onPressedChange={handlePressedChange}
      value={value}
      disabled={isDisabled}
      className={className}
      style={styleProp}
      aria-label={ariaLabel}
      {...dataAttrs}
      data-unselected-appearance={unselectedAppearance}
      {...(dataTestId != null && String(dataTestId).trim() !== ''
        ? { 'data-testid': dataTestId }
        : {})}
    >
      {start && (
        <span className={styles.start} data-surface={slotSurface}>
          {shieldSurfaceImmuneChildren(start)}
        </span>
      )}
      {children && <span className={styles.label}>{children}</span>}
      {end && (
        <span className={styles.end} data-surface={slotSurface}>
          {shieldSurfaceImmuneChildren(end)}
        </span>
      )}
    </BaseToggle>
  );
}
