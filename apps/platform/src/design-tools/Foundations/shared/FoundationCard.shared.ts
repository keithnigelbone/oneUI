/**
 * FoundationCard.shared.ts
 * Shared types for foundation card wrapper
 */

import { ReactNode } from 'react';

export interface FoundationCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  collapsible?: boolean;
  /** Controls whether the whole header or only the chevron button toggles collapsible content. */
  toggleTrigger?: 'header' | 'button';
  defaultCollapsed?: boolean;
  icon?: ReactNode;
  /** Called when section is toggled, with true if now expanded, false if collapsed */
  onToggle?: (isExpanded: boolean) => void;
}

export interface FoundationCardState {
  isCollapsed: boolean;
}
