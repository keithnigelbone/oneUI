/**
 * ChipGroup.tsx
 * React (web) implementation using Base UI ToggleGroup
 *
 * Key features:
 * - Uses @base-ui/react ToggleGroup primitive (never fork)
 * - Token-only layout in CSS Module
 * - Single-select (default) or multi-select via `multiple`
 * - Context-propagates size/attention/appearance to child Chips
 * - Optional maxSelections cap and required (no-deselect) constraint
 * - WCAG AA accessible: arrow-key navigation, role="group", aria attributes
 *
 * @example
 * ```tsx
 * <ChipGroup value={selected} onValueChange={setSelected}>
 *   <Chip value="react">React</Chip>
 *   <Chip value="vue">Vue</Chip>
 * </ChipGroup>
 *
 * <ChipGroup multiple maxSelections={3} size="m" attention="medium">
 *   <Chip value="news">News</Chip>
 *   <Chip value="sport">Sport</Chip>
 * </ChipGroup>
 * ```
 */

'use client';

import React, { useCallback, useState } from 'react';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import clsx from 'clsx';
import styles from './ChipGroup.module.css';
import type { ChipGroupProps } from './ChipGroup.shared';
import { ChipGroupContext } from '../Chip/ChipContext';

export function ChipGroup({
  children,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  orientation = 'horizontal',
  wrap = true,
  size,
  attention,
  appearance,
  maxSelections,
  required,
  disabled,
  loopFocus = true,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  style,
}: ChipGroupProps) {
  const hasConstraints = required === true || maxSelections !== undefined;
  const isControlled = value !== undefined;

  // Internal state: only used when constraints are active without a controlled value.
  // This lets us enforce required/maxSelections in uncontrolled mode.
  const [internalValue, setInternalValue] = useState<string[]>(() => defaultValue ?? []);

  const handleValueChange = useCallback(
    (next: string[]) => {
      if (required && next.length === 0) return;
      if (maxSelections !== undefined && next.length > maxSelections) return;

      if (hasConstraints && !isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [required, maxSelections, hasConstraints, isControlled, onValueChange],
  );

  // Determine the value to pass to BaseToggleGroup:
  // - Constrained + controlled: caller's value (parent enforces it)
  // - Constrained + uncontrolled: our internal state
  // - Unconstrained: pass value/defaultValue through normally
  const effectiveValue = hasConstraints
    ? (isControlled ? value : internalValue)
    : value;

  const effectiveDefaultValue = hasConstraints ? undefined : defaultValue;

  return (
    <ChipGroupContext.Provider value={{ size, attention, appearance }}>
      <BaseToggleGroup
        value={effectiveValue}
        defaultValue={effectiveDefaultValue}
        onValueChange={handleValueChange}
        multiple={multiple}
        disabled={disabled}
        loopFocus={loopFocus}
        className={clsx(styles.chipGroup, className)}
        style={style}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-orientation={orientation}
        data-wrap={wrap ? undefined : 'false'}
      >
        {children}
      </BaseToggleGroup>
    </ChipGroupContext.Provider>
  );
}

ChipGroup.displayName = 'ChipGroup';
