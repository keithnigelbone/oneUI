/**
 * Toggle.shared.ts
 * Shared types and hooks for Toggle component
 */

import { ReactNode } from 'react';

export type ToggleSize = 'small' | 'medium' | 'large';

export interface ToggleProps {
  /** Toggle content (icon or text) */
  children: ReactNode;
  /** Whether pressed (controlled) */
  pressed?: boolean;
  /** Default pressed state (uncontrolled) */
  defaultPressed?: boolean;
  /** Called when pressed state changes */
  onPressedChange?: (pressed: boolean) => void;
  /** Size preset */
  size?: ToggleSize;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Accessible label */
  'aria-label'?: string;
  /** Additional class name */
  className?: string;
}

export function useToggleState(props: ToggleProps) {
  return {
    isDisabled: props.disabled,
  };
}
