/**
 * CollapsibleSection.tsx
 *
 * Expandable/collapsible section for the property panel.
 * Figma-style with chevron icon and item count.
 * Supports both uncontrolled (defaultOpen) and controlled (isOpen/onToggle) modes.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import styles from './CollapsibleSection.module.css';

export interface CollapsibleSectionProps {
  /** Section title */
  title: string;
  /** Item count to display */
  count?: number;
  /** Whether section is open by default (uncontrolled) */
  defaultOpen?: boolean;
  /** Controlled open state — overrides internal state when provided */
  isOpen?: boolean;
  /** Callback when toggled (works in both controlled and uncontrolled modes) */
  onToggle?: (open: boolean) => void;
  /** Icon to show next to title (optional) */
  icon?: React.ReactNode;
  /** Remove content padding (for sections with nested CollapsibleSections) */
  noPadding?: boolean;
  /** Children content */
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultOpen = true,
  isOpen: controlledOpen,
  onToggle,
  icon,
  noPadding,
  children,
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Sync internal state when controlled prop changes
  useEffect(() => {
    if (isControlled) {
      setInternalOpen(controlledOpen);
    }
  }, [isControlled, controlledOpen]);

  const handleToggle = () => {
    const next = !open;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onToggle?.(next);
  };

  return (
    <div className={styles.section} data-open={open}>
      <button
        className={styles.header}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={`section-${title}`}
      >
        <span className={styles.chevron}>
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        </span>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.title}>{title}</span>
        {count !== undefined && (
          <span className={styles.count}>({count})</span>
        )}
      </button>
      {open && (
        <div
          className={noPadding ? styles.contentNoPadding : styles.content}
          id={`section-${title}`}
          role="region"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
