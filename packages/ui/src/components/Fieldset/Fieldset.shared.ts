/**
 * Fieldset.shared.ts
 * Shared types and hooks for Fieldset component
 */

import type { CSSProperties, ReactNode } from 'react';

export interface FieldsetProps {
  /** Fieldset content */
  children: ReactNode;
  /** Legend text */
  legend?: string;
  /** Whether the fieldset is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useFieldsetState(props: FieldsetProps) {
  return {
    isDisabled: props.disabled,
  };
}
