/**
 * ScrollArea.shared.ts
 * Shared types and hooks for ScrollArea component
 */

import type { CSSProperties, ReactNode } from 'react';

export type ScrollAreaType = 'hover' | 'scroll' | 'always' | 'auto';

export interface ScrollAreaProps {
  /** Scrollable content */
  children: ReactNode;
  /** When to show scrollbars */
  type?: ScrollAreaType;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useScrollAreaState(props: ScrollAreaProps) {
  return {
    type: props.type ?? 'hover',
  };
}
