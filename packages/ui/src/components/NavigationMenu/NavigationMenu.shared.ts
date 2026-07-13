/**
 * NavigationMenu.shared.ts
 * Shared types and hooks for NavigationMenu component
 */

import { ReactNode } from 'react';

export type NavigationMenuOrientation = 'horizontal' | 'vertical';

export interface NavigationMenuProps {
  /** Navigation items */
  children: ReactNode;
  /** Currently active value (controlled) */
  value?: string;
  /** Default active value (uncontrolled) */
  defaultValue?: string;
  /** Called when active item changes */
  onValueChange?: (value: string) => void;
  /** Layout orientation */
  orientation?: NavigationMenuOrientation;
  /** Additional class name */
  className?: string;
}

export interface NavigationMenuItemProps {
  /** Item content (Trigger + Content) */
  children: ReactNode;
  /** Unique value for this item */
  value: string;
  /** Additional class name */
  className?: string;
}

export interface NavigationMenuTriggerProps {
  /** Trigger label */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export interface NavigationMenuContentProps {
  /** Dropdown content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export function useNavigationMenuState(props: NavigationMenuProps) {
  return {
    isVertical: props.orientation === 'vertical',
  };
}
