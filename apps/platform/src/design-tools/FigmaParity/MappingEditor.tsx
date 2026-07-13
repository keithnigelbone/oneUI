'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ParityEntry } from '@oneui/shared';
import styles from './MappingEditor.module.css';

export interface MappingEditorProps {
  entry: ParityEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (figmaName: string, cssTokenName: string) => void;
}

export function MappingEditor({ entry, isOpen, onClose, onSave }: MappingEditorProps) {
  const [cssTokenName, setCssTokenName] = useState(entry.cssTokenName ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCssTokenName(entry.cssTokenName ?? '');
  }, [entry.cssTokenName]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    const figmaName = entry.figmaVariableName ?? '';
    onSave(figmaName, cssTokenName);
  }, [entry.figmaVariableName, cssTokenName, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleSave();
      }
    },
    [onClose, handleSave],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Edit token mapping"
    >
      <div className={styles.dialog} ref={dialogRef}>
        <h3 className={styles.title}>Edit Mapping</h3>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="mapping-figma-name">
            Figma Variable
          </label>
          <input
            id="mapping-figma-name"
            className={styles.input}
            type="text"
            value={entry.figmaVariableName ?? ''}
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="mapping-css-token">
            CSS Token Name
          </label>
          <input
            id="mapping-css-token"
            ref={inputRef}
            className={styles.input}
            type="text"
            value={cssTokenName}
            onChange={(e) => setCssTokenName(e.target.value)}
            placeholder="--Token-Name"
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
