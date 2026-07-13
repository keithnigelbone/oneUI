/**
 * CheckboxGroup.shared.ts
 * Shared types and hooks for CheckboxGroup component
 */

import type { ReactNode } from 'react';

export interface CheckboxGroupProps {
  /** Checkbox items */
  children: ReactNode;
  /** Selected values (controlled) */
  value?: string[];
  /** Default values (uncontrolled) */
  defaultValue?: string[];
  /** Called when values change */
  onValueChange?: (value: string[]) => void;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Optional description id(s) for the group container (e.g. field description). */
  'aria-describedby'?: string;
}

export function useCheckboxGroupState(props: CheckboxGroupProps) {
  return {
    isDisabled: props.disabled,
  };
}
