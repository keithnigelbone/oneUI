/**
 * ActionsMenu.tsx
 *
 * Dropdown actions menu for the EditorPropertyPanel header.
 * Provides Reset All and Export CSS actions.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import styles from './EditorPropertyPanel.module.css';

export interface ActionsMenuProps {
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether there are any overrides (saved or unsaved) */
  hasOverrides?: boolean;
  /** Callback when reset all is clicked */
  onResetAll: () => void;
  /** Callback when export CSS is clicked */
  onExportCSS: () => void;
}

export function ActionsMenu({ isDirty, hasOverrides, onResetAll, onExportCSS }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className={styles.menuWrapper} ref={menuRef}>
      <IconButton
        icon={<MoreVertical size={14} />}
        appearance="neutral"
        attention="low"
        size="xs"
        condensed
        className={styles.menuButton}
        onPress={() => setIsOpen(!isOpen)}
        aria-label="Actions menu"
        aria-expanded={isOpen}
      />
      {isOpen && (
        <div className={styles.menuDropdown}>
          <Button
            appearance="neutral"
            attention="low"
            size="s"
            condensed
            fullWidth
            className={styles.menuItem}
            onPress={() => handleAction(onExportCSS)}
          >
            Export CSS
          </Button>
          <Button
            appearance="neutral"
            attention="low"
            size="s"
            condensed
            fullWidth
            className={styles.menuItem}
            onPress={() => handleAction(onResetAll)}
            disabled={!isDirty && !hasOverrides}
          >
            Reset All
          </Button>
        </div>
      )}
    </div>
  );
}

export default ActionsMenu;
