/**
 * Menu.shared.ts
 * Shared types and hooks for Menu component
 */

import { ReactNode } from 'react';

export type MenuSide = 'top' | 'bottom' | 'left' | 'right';
export type MenuAlign = 'start' | 'center' | 'end';

export interface MenuProps {
  /** Menu content (Trigger + Portal children) */
  children: ReactNode;
  /** Whether the menu is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes */
  onOpenChange?: (open: boolean) => void;
}

export interface MenuPortalProps {
  /** Menu items */
  children: ReactNode;
  /** Which side to position against */
  side?: MenuSide;
  /** Alignment along the side axis */
  align?: MenuAlign;
  /** Distance from anchor */
  sideOffset?: number;
}

export interface MenuItemProps {
  /** Item content */
  children: ReactNode;
  /** Called when the item is clicked */
  onClick?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

export interface MenuGroupProps {
  /** Group label */
  label?: string;
  /** Group items */
  children: ReactNode;
}

export function useMenuState(props: MenuProps) {
  return {
    isOpen: props.open,
  };
}
