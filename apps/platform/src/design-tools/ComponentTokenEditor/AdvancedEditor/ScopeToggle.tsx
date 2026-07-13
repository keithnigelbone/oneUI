/**
 * ScopeToggle.tsx
 *
 * Segmented control for switching between Global and Granular editing scopes.
 * Reads and updates editingScope from the ComponentTokenEditor context.
 */

'use client';

import React from 'react';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import styles from './EditorPanel.module.css';

export interface ScopeToggleProps {
  /** Optional className override */
  className?: string;
}

const SCOPE_OPTIONS = [
  { value: 'global' as const, label: 'Global' },
  { value: 'granular' as const, label: 'Granular' },
];

export function ScopeToggle({ className }: ScopeToggleProps) {
  const { editingScope, setEditingScope } = useComponentTokenEditor();

  return (
    <ToggleGroup
      value={[editingScope]}
      onValueChange={(values) => {
        const value = Array.isArray(values) ? values[0] : values;
        if (value === 'global' || value === 'granular') setEditingScope(value);
      }}
      size="compact"
      variant="subtool"
      className={[styles.scopeToggle, className].filter(Boolean).join(' ')}
    >
      {SCOPE_OPTIONS.map((option) => (
        <ToggleGroup.Item key={option.value} value={option.value} className={styles.scopeButton}>
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
}

export default ScopeToggle;
