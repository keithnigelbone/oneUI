/**
 * Separator.shared.ts
 * Shared types and hooks for Separator component
 */

import type { CSSProperties } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps {
  /** Visual orientation */
  orientation?: SeparatorOrientation;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useSeparatorState(props: SeparatorProps) {
  return {
    isVertical: props.orientation === 'vertical',
  };
}
