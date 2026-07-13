/**
 * SegmentedControl.tsx
 *
 * Segmented control built on Base UI ToggleGroup (single-select, required).
 * Compound API: SegmentedControl + SegmentedControl.Item.
 *
 * Item role vars + `.appearance*` classes live on the group root so every
 * item inherits the resolved role (defining vars on .item would pin Primary).
 *
 * Figma: 10455:5802
 */

'use client';

import React, { useCallback, useState } from 'react';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import clsx from 'clsx';
import type { ComponentAppearance } from '@oneui/shared';
import styles from './SegmentedControl.module.css';
import {
  SegmentedControlContext,
  SegmentedControlItemProps,
  SegmentedControlProps,
  counterBadgeSizeForSegment,
  resolveSegmentSlotAttrs,
  shouldShieldSemanticBadge,
  useSegmentedControlGroupState,
  useSegmentedControlItemState,
  type SegmentSlotSurfaceAttrs,
} from './SegmentedControl.shared';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';
import { useBrandFoundation } from '../../contexts/BrandFoundationContext';
import { useDocumentMode } from '../../hooks/useDocumentMode';
import { useSurfaceStep } from '../Surface';

const appearanceClassMap = makeAppearanceClassMap(styles);

const SURFACE_IMMUNE_DISPLAY_NAMES = new Set(['CounterBadge', 'IndicatorBadge']);

function shieldSurfaceImmuneChildren(
  node: React.ReactNode,
  isSelected: boolean,
  slotAttrs: SegmentSlotSurfaceAttrs | undefined,
  parentAppearance: Exclude<ComponentAppearance, 'auto'>,
): React.ReactNode {
  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child;

    const displayName = (child.type as { displayName?: string })?.displayName;
    if (displayName && SURFACE_IMMUNE_DISPLAY_NAMES.has(displayName)) {
      if (
        !shouldShieldSemanticBadge(
          child,
          isSelected,
          slotAttrs?.['data-surface'],
          parentAppearance,
        )
      ) {
        return child;
      }

      return (
        <span className={styles.contextBoundary} data-context-boundary>
          {child}
        </span>
      );
    }

    return child;
  });
}

function mergeEndSlotSize(
  end: React.ReactNode,
  segmentSize: SegmentedControlProps['size'],
): React.ReactNode {
  if (!segmentSize) return end;

  return React.Children.map(end, (child) => {
    if (!React.isValidElement(child)) return child;

    const displayName = (child.type as { displayName?: string })?.displayName;
    if (displayName !== 'CounterBadge') return child;
    if ((child.props as { size?: unknown }).size) return child;

    return React.cloneElement(child, {
      size: counterBadgeSizeForSegment(segmentSize),
    } as { size: ReturnType<typeof counterBadgeSizeForSegment> });
  });
}

function SegmentedControlItem({
  children,
  value,
  disabled,
  start,
  end,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  className,
  style,
  ref,
}: SegmentedControlItemProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { ctx, isIconOnly, showLabel } = useSegmentedControlItemState({
    children,
    start,
    end,
    'aria-label': ariaLabel,
  });

  const slotAppearance =
    ctx.attention === 'low' ? ctx.selectedAppearance : ctx.appearance;

  const resolvedEnd = end ? mergeEndSlotSize(end, ctx.size) : end;

  const isSelected = ctx.selectedValue === value;
  const parentStep = useSurfaceStep();
  const themeConfig = useBrandFoundation();
  const documentMode = useDocumentMode();
  const slotAttrs = resolveSegmentSlotAttrs(
    isSelected,
    ctx.attention,
    slotAppearance,
    parentStep,
    documentMode === 'dark',
    themeConfig,
  );

  const itemClassName = clsx(styles.item, className);

  return (
    <BaseToggle
      ref={ref}
      value={value}
      disabled={disabled}
      className={itemClassName}
      style={style}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      data-size={ctx.size}
      {...(isIconOnly ? { 'data-icon-only': '' } : {})}
    >
      <span className={styles.stateLayer}>
        <span className={styles.contentWrapper}>
          {start && (
            <span className={styles.start} {...slotAttrs}>
              <SlotParentAppearanceProvider value={slotAppearance}>{start}</SlotParentAppearanceProvider>
            </span>
          )}
          {showLabel && <span className={styles.label}>{children}</span>}
          {resolvedEnd && (
            <span className={styles.end} {...slotAttrs}>
              <SlotParentAppearanceProvider value={slotAppearance}>
                {shieldSurfaceImmuneChildren(resolvedEnd, isSelected, slotAttrs, slotAppearance)}
              </SlotParentAppearanceProvider>
            </span>
          )}
        </span>
      </span>
    </BaseToggle>
  );
}

SegmentedControlItem.displayName = 'SegmentedControl.Item';

function SegmentedControlRoot({
  children,
  value,
  defaultValue,
  onValueChange,
  appearance,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'data-testid': dataTestId,
  className,
  style,
  ...rest
}: SegmentedControlProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(() =>
    defaultValue ? [defaultValue] : [],
  );

  const toggleValue = isControlled ? (value ? [value] : []) : internalValue;
  const selectedValue = toggleValue[0];

  const { contextValue, resolvedItemAppearance, dataAttrs } =
    useSegmentedControlGroupState({
      size: rest.size,
      attention: rest.attention,
      shape: rest.shape,
      equalWidth: rest.equalWidth,
      trackEmphasis: rest.trackEmphasis,
      type: rest.type,
      appearance,
      disabled,
      selectedValue,
    });

  const handleValueChange = useCallback(
    (next: string[]) => {
      if (next.length === 0) return;

      const selected = next[next.length - 1];
      if (!isControlled) {
        setInternalValue([selected]);
      }
      onValueChange?.(selected);
    },
    [isControlled, onValueChange],
  );

  const appearanceClassName = appearanceClassMap[resolvedItemAppearance];

  const groupClassName = clsx(styles.group, appearanceClassName, className);

  return (
    <SegmentedControlContext.Provider value={contextValue}>
      <BaseToggleGroup
        value={toggleValue}
        defaultValue={isControlled ? undefined : defaultValue ? [defaultValue] : undefined}
        onValueChange={handleValueChange}
        multiple={false}
        disabled={disabled}
        loopFocus
        className={groupClassName}
        style={style}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-testid={dataTestId}
        {...dataAttrs}
      >
        {children}
      </BaseToggleGroup>
    </SegmentedControlContext.Provider>
  );
}

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
});

export default SegmentedControl;

export type {
  SegmentedControlProps,
  SegmentedControlItemProps,
  SegmentedControlSize,
  SegmentedControlAttention,
  SegmentedControlTrackEmphasis,
  SegmentedControlShape,
  SegmentedControlType,
} from './SegmentedControl.shared';
