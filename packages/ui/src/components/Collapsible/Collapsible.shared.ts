/**
 * Collapsible.shared.ts
 * Shared types and hooks for Collapsible component
 */

import type { CSSProperties, ReactNode } from 'react';

export interface CollapsibleProps {
  /** Collapsible content (Trigger + Panel) */
  children: ReactNode;
  /** Whether the collapsible is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the collapsible opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the collapsible is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export interface CollapsibleTriggerProps {
  /** Trigger content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export interface CollapsiblePanelProps {
  /** Panel content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export function useCollapsibleState(props: CollapsibleProps) {
  return {
    isDisabled: props.disabled,
  };
}
