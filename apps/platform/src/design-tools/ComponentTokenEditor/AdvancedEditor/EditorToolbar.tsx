/**
 * EditorToolbar.tsx
 *
 * Top toolbar for the Advanced Editor with back navigation,
 * brand/mode selectors, and action buttons.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import styles from './EditorToolbar.module.css';

// Brand options - in production these would come from Convex
const BRAND_OPTIONS = [
  { value: '', label: 'Select brand...' },
  { value: 'jio-default', label: 'Jio Default' },
  { value: 'jiocinema', label: 'JioCinema' },
  { value: 'jiomart', label: 'JioMart' },
  { value: 'jiohotstar', label: 'JioHotstar' },
];

export interface EditorToolbarProps {
  /** Component name being edited */
  componentName: string;
  /** Total number of tokens */
  totalTokens: number;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Currently selected brand ID */
  selectedBrandId: string | null;
  /** Callback when brand changes */
  onBrandChange: (brandId: string) => void;
  /** Currently selected mode */
  selectedMode: 'light' | 'dark' | 'dim';
  /** Callback when mode changes */
  onModeChange: (mode: 'light' | 'dark' | 'dim') => void;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether save is in progress */
  isSaving: boolean;
  /** Callback when reset all is clicked */
  onResetAll: () => void;
  /** Callback when export CSS is clicked */
  onExportCSS: () => void;
  /** Callback when save is clicked */
  onSave: () => void;
}

export function EditorToolbar({
  componentName,
  totalTokens,
  onBack,
  selectedBrandId,
  onBrandChange,
  selectedMode,
  onModeChange,
  isDirty,
  isSaving,
  onResetAll,
  onExportCSS,
  onSave,
}: EditorToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {/* Left section: Back button + Title */}
      <div className={styles.toolbarLeft}>
        <IconButton
          icon={<ArrowLeft size={12} />}
          appearance="neutral"
          attention="low"
          size="xs"
          condensed
          className={styles.backButton}
          onPress={onBack}
          aria-label="Go back"
        />
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{componentName}</h1>
          <span className={styles.subtitle}>({totalTokens} tokens)</span>
        </div>
      </div>

      {/* Center section: Brand + Mode selectors */}
      <div className={styles.toolbarCenter}>
        <div className={styles.selectorGroup}>
          <span className={styles.selectorLabel}>Brand</span>
          <Select
            value={selectedBrandId || ''}
            onChange={onBrandChange}
            options={BRAND_OPTIONS}
            size="sm"
            className={styles.brandSelect}
            aria-label="Select brand"
          />
        </div>
        <div className={styles.selectorGroup}>
          <span className={styles.selectorLabel}>Mode</span>
          <ToggleGroup
            value={[selectedMode]}
            onValueChange={(values) => {
              const val = Array.isArray(values) ? values[0] : values;
              if (val) onModeChange(val as 'light' | 'dark' | 'dim');
            }}
            size="compact"
          >
            {(['light', 'dark', 'dim'] as const).map((mode) => (
              <ToggleGroup.Item key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* Right section: Actions Menu */}
      <div className={styles.toolbarRight}>
        {isDirty && <span className={styles.dirtyIndicator}>Unsaved</span>}
        <ActionsMenu
          isDirty={isDirty}
          isSaving={isSaving}
          onResetAll={onResetAll}
          onExportCSS={onExportCSS}
          onSave={onSave}
        />
      </div>
    </div>
  );
}

/** Actions Menu Component */
function ActionsMenu({
  isDirty,
  isSaving,
  onResetAll,
  onExportCSS,
  onSave,
}: {
  isDirty: boolean;
  isSaving: boolean;
  onResetAll: () => void;
  onExportCSS: () => void;
  onSave: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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
        icon={<MoreVertical size={16} />}
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
            onPress={() => handleAction(onSave)}
            disabled={!isDirty || isSaving}
          >
            Save
          </Button>
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
            disabled={!isDirty}
          >
            Reset All
          </Button>
        </div>
      )}
    </div>
  );
}

export default EditorToolbar;
