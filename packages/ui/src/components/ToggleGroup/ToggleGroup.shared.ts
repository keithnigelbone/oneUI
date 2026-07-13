/**
 * ToggleGroup.shared.ts
 * Shared types and hooks for ToggleGroup component
 */

import { ReactNode } from 'react';

export type ToggleGroupSize = 'compact' | 'small' | 'medium' | 'large';
export type ToggleGroupVariant = 'default' | 'subtool';

export interface ToggleGroupProps {
  /** Toggle items */
  children: ReactNode;
  /** Selected value(s) (controlled) */
  value?: string | string[];
  /** Default value(s) (uncontrolled) */
  defaultValue?: string | string[];
  /** Called when value changes */
  onValueChange?: (value: string | string[]) => void;
  /** Whether multiple items can be selected */
  toggleMultiple?: boolean;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Visual variant: default (bold fill) or subtool (subtle, less prominent) */
  variant?: ToggleGroupVariant;
  /** Size preset */
  size?: ToggleGroupSize;
  /** Stretch to fill container width */
  fullWidth?: boolean;
  /** Additional class name */
  className?: string;
}

export interface ToggleGroupItemProps {
  /** Item content */
  children: ReactNode;
  /** Value for this item */
  value: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Accessible label */
  'aria-label'?: string;
  /** Additional class name */
  className?: string;
}

export function useToggleGroupState(props: ToggleGroupProps) {
  return {
    isDisabled: props.disabled,
  };
}
