/**
 * Popover.shared.ts
 * Shared types and hooks for Popover component
 */

import { ReactNode } from 'react';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  /** Popover content (Trigger + Portal children) */
  children: ReactNode;
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the popover opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Whether clicking outside closes the popover */
  dismissible?: boolean;
}

export interface PopoverPortalProps {
  /** Portal content */
  children: ReactNode;
  /** Which side to position against */
  side?: PopoverSide;
  /** Alignment along the side axis */
  align?: PopoverAlign;
  /** Distance from anchor */
  sideOffset?: number;
  /** Popover title */
  title?: string;
  /** Popover description */
  description?: string;
  /** Whether to show arrow */
  arrow?: boolean;
  /** Whether to show backdrop */
  backdrop?: boolean;
}

export function usePopoverState(props: PopoverProps) {
  return {
    isOpen: props.open,
  };
}
