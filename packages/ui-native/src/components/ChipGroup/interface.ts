/**
 * ChipGroup interface (native)
 * Semantic source: packages/ui/src/components/ChipGroup/ChipGroup.shared.ts
 */

import { useCallback, useState, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ChipAppearance, ChipSize, ChipVariant } from '../Chip/interface';

export type { ChipAppearance, ChipSize, ChipVariant };

export interface ChipGroupProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  multiple?: boolean;
  orientation?: 'horizontal' | 'vertical';
  wrap?: boolean;
  size?: ChipSize;
  variant?: ChipVariant;
  appearance?: ChipAppearance;
  maxSelections?: number;
  required?: boolean;
  disabled?: boolean;
  loopFocus?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  children: ReactNode;
}

export interface ChipGroupToggleOptions {
  multiple?: boolean;
  required?: boolean;
  maxSelections?: number;
}

/** Pure selection step — used by `toggleValue` and unit tests. Returns `null` when blocked. */
export function computeNextChipGroupValues(
  current: string[],
  chipValue: string,
  options: ChipGroupToggleOptions,
): string[] | null {
  const { multiple = false, required, maxSelections } = options;
  const isOn = current.includes(chipValue);

  let next: string[];
  if (multiple) {
    if (isOn) {
      if (required && current.length === 1) return null;
      next = current.filter((v) => v !== chipValue);
    } else {
      if (maxSelections !== undefined && current.length >= maxSelections) return null;
      next = [...current, chipValue];
    }
  } else if (isOn) {
    if (required) return null;
    next = [];
  } else {
    next = [chipValue];
  }

  if (required && next.length === 0) return null;
  if (maxSelections !== undefined && next.length > maxSelections) return null;
  return next;
}

export interface ChipGroupSelectionNormalizeOptions {
  multiple?: boolean;
  maxSelections?: number;
}

/** Normalizes initial/controlled selection arrays to match group mode constraints. */
export function normalizeChipGroupSelection(
  values: string[],
  options: ChipGroupSelectionNormalizeOptions,
): string[] {
  const { multiple = false, maxSelections } = options;

  if (!multiple) {
    return values.length > 0 ? [values[0]!] : [];
  }

  if (maxSelections !== undefined && values.length > maxSelections) {
    return values.slice(0, maxSelections);
  }

  return values;
}

export function useChipGroupState(props: ChipGroupProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    multiple = false,
    maxSelections,
    required,
    orientation = 'horizontal',
    wrap = true,
  } = props;

  const selectionNormalizeOptions = { multiple, maxSelections };
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(() =>
    normalizeChipGroupSelection(defaultValue ?? [], selectionNormalizeOptions),
  );
  const rawSelectedValues = isControlled ? (value ?? []) : internalValue;
  const selectedValues = normalizeChipGroupSelection(
    rawSelectedValues,
    selectionNormalizeOptions,
  );

  const commitValues = useCallback(
    (next: string[]) => {
      if (required && next.length === 0) return;
      if (maxSelections !== undefined && next.length > maxSelections) return;

      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, maxSelections, onValueChange, required],
  );

  const toggleValue = useCallback(
    (chipValue: string) => {
      const current = isControlled ? (value ?? []) : internalValue;
      const next = computeNextChipGroupValues(current, chipValue, {
        multiple,
        required,
        maxSelections,
      });
      if (next == null) return;
      commitValues(next);
    },
    [commitValues, internalValue, isControlled, maxSelections, multiple, required, value],
  );

  return {
    selectedValues,
    toggleValue,
    orientation,
    wrap,
    multiple,
    isControlled,
  };
}

/**
 * Layout wrapper only — excluded from the a11y tree without hiding descendants.
 * Uses `'no'` (not `'no-hide-descendants'`) so child Chips stay reachable on
 * TalkBack; see Input.native.tsx for the same pattern.
 */
export function getChipGroupContainerAccessibilityProps(): {
  accessible: false;
  importantForAccessibility: 'no';
} {
  return {
    accessible: false,
    importantForAccessibility: 'no',
  };
}

/** Screen-reader-only group name when `aria-label` is set. Skip when `aria-labelledby` references an external heading. */
export function getChipGroupNameAccessibilityProps(
  props: Pick<ChipGroupProps, 'aria-label' | 'aria-labelledby' | 'accessibilityHint'>,
): {
  accessible: true;
  accessibilityRole: 'header';
  accessibilityLabel: string;
  accessibilityHint?: string;
} | null {
  if (props['aria-labelledby'] || !props['aria-label']) return null;
  return {
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
  };
}

export type ChipGroupContainerAccessibilityProps = ReturnType<
  typeof getChipGroupContainerAccessibilityProps
> & {
  accessibilityLabelledBy?: string;
};

/** Container a11y props — keeps child Chips individually focusable on VoiceOver / TalkBack. */
export function getChipGroupAccessibilityProps(
  props: Pick<ChipGroupProps, 'aria-label' | 'aria-labelledby' | 'accessibilityHint' | 'disabled'>,
): ChipGroupContainerAccessibilityProps {
  const labelledBy = props['aria-labelledby'];
  return {
    ...getChipGroupContainerAccessibilityProps(),
    ...(labelledBy ? { accessibilityLabelledBy: labelledBy } : {}),
  };
}
