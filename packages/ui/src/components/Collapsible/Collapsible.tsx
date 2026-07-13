/**
 * Collapsible.tsx
 * React (web) implementation using Base UI Collapsible
 *
 * Key features:
 * - Uses @base-ui/react Collapsible primitive (never fork)
 * - Token-only styling in CSS Module
 * - WCAG AA accessible
 * - Animated expand/collapse
 */

import React, { ReactNode } from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import styles from './Collapsible.module.css';
import {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsiblePanelProps,
} from './Collapsible.shared';

export const Collapsible: React.FC<CollapsibleProps> & {
  Trigger: typeof CollapsibleTrigger;
  Panel: typeof CollapsiblePanel;
} = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  className,
  style,
}) => {
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <BaseCollapsible.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      className={rootClassName}
      style={style}
    >
      {children}
    </BaseCollapsible.Root>
  );
};

const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ children, className }) => {
  const triggerClassName = [styles.trigger, className].filter(Boolean).join(' ');

  return (
    <BaseCollapsible.Trigger className={triggerClassName}>
      <ChevronIcon className={styles.chevron} />
      {children}
    </BaseCollapsible.Trigger>
  );
};

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ children, className }) => {
  const panelClassName = [styles.panel, className].filter(Boolean).join(' ');

  return (
    <BaseCollapsible.Panel className={panelClassName}>
      <div className={styles.panelContent}>{children}</div>
    </BaseCollapsible.Panel>
  );
};

function ChevronIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 12 12" fill="currentcolor" {...props}>
      <path d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 0 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

Collapsible.Trigger = CollapsibleTrigger;
Collapsible.Panel = CollapsiblePanel;
