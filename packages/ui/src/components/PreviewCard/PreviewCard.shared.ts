/**
 * PreviewCard.shared.ts
 * Shared types and hooks for PreviewCard component
 */

import { ReactNode } from 'react';

export type PreviewCardSide = 'top' | 'bottom' | 'left' | 'right';
export type PreviewCardAlign = 'start' | 'center' | 'end';

export interface PreviewCardProps {
  /** Trigger element and card content */
  children: ReactNode;
  /** Whether the card is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the card opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Delay before showing (ms) */
  delay?: number;
  /** Delay before hiding (ms) */
  closeDelay?: number;
}

export interface PreviewCardPortalProps {
  /** Card content */
  children: ReactNode;
  /** Which side to position against */
  side?: PreviewCardSide;
  /** Alignment along the side axis */
  align?: PreviewCardAlign;
  /** Distance from anchor */
  sideOffset?: number;
  /** Whether to show the arrow */
  arrow?: boolean;
}

export function usePreviewCardState(props: PreviewCardProps) {
  return {
    isOpen: props.open,
  };
}
