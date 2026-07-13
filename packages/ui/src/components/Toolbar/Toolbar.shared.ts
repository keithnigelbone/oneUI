/**
 * Toolbar.shared.ts
 * Shared types and hooks for Toolbar component
 */

import type { CSSProperties, ReactNode } from 'react';

export type ToolbarOrientation = 'horizontal' | 'vertical';

export interface ToolbarProps {
  /** Toolbar content */
  children: ReactNode;
  /** Layout orientation */
  orientation?: ToolbarOrientation;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useToolbarState(props: ToolbarProps) {
  return {
    isVertical: props.orientation === 'vertical',
  };
}
