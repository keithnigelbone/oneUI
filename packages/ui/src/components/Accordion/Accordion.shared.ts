/**
 * Accordion.shared.ts
 * Shared types and hooks for Accordion component
 */

import type { CSSProperties, ReactNode } from 'react';

export interface AccordionProps {
  /** Accordion items */
  children: ReactNode;
  /** Controlled open items (array of values) */
  value?: string[];
  /** Default open items */
  defaultValue?: string[];
  /** Called when open items change */
  onValueChange?: (value: string[]) => void;
  /** Whether multiple items can be open at once */
  openMultiple?: boolean;
  /** Whether the accordion is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export interface AccordionItemProps {
  /** Item content (Header + Panel) */
  children: ReactNode;
  /** Unique value for this item */
  value: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

export interface AccordionTriggerProps {
  /** Trigger label */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export interface AccordionPanelProps {
  /** Panel content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export function useAccordionState(props: AccordionProps) {
  return {
    isDisabled: props.disabled,
  };
}
