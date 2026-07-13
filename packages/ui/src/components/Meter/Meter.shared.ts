/**
 * Meter.shared.ts
 * Shared types and hooks for Meter component
 */

export type MeterSize = 'small' | 'medium' | 'large';

export interface MeterProps {
  /** Current value */
  value: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Size preset */
  size?: MeterSize;
  /** Accessible label */
  'aria-label'?: string;
  /** Additional class name */
  className?: string;
}

export function useMeterState(props: MeterProps) {
  const { value, min = 0, max = 100 } = props;
  const percentage = ((value - min) / (max - min)) * 100;

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
  };
}
