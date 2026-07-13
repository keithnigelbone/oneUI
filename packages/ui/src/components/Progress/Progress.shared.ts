/**
 * Progress.shared.ts
 * Shared types and hooks for Progress component
 */

export type ProgressSize = 'small' | 'medium' | 'large';

export interface ProgressProps {
  /** Current value (0-100) */
  value?: number;
  /** Maximum value */
  max?: number;
  /** Minimum value */
  min?: number;
  /** Size preset */
  size?: ProgressSize;
  /** Accessible label */
  'aria-label'?: string;
  /** Accessible labelledby */
  'aria-labelledby'?: string;
  /** Additional class name */
  className?: string;
}

export function useProgressState(props: ProgressProps) {
  const { value = 0, min = 0, max = 100 } = props;
  const percentage = ((value - min) / (max - min)) * 100;

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    isIndeterminate: props.value === undefined || props.value === null,
  };
}
