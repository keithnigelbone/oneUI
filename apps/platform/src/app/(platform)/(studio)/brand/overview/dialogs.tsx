/**
 * brand/overview/dialogs.tsx
 *
 * Stateless presentational dialogs for the Brand Overview page.
 * Pulled out of OverviewContent so dialog open/close state changes don't
 * force a re-render of the whole 1k-line page body.
 */

'use client';

import React from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Input } from '@oneui/ui/components/Input';
import styles from './page.module.css';

interface RenameDialogProps {
  open: boolean;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const RenameDialog = React.memo(function RenameDialog({
  open,
  value,
  loading,
  onChange,
  onCancel,
  onSubmit,
}: RenameDialogProps) {
  if (!open) return null;
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogBox}>
        <h3 className={styles.dialogTitle}>Rename Brand</h3>
        <Input
          className={styles.dialogInput}
          value={value}
          onChange={onChange}
          placeholder="Enter new name"
          size="m"
          autoFocus
        />
        <div className={styles.dialogActions}>
          <Button attention="low" size="s" onPress={onCancel}>
            Cancel
          </Button>
          <Button
            attention="high"
            size="s"
            onPress={onSubmit}
            disabled={!value.trim()}
            loading={loading}
          >
            Rename
          </Button>
        </div>
      </div>
    </div>
  );
});

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = React.memo(function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  loading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogBox}>
        <h3 className={styles.dialogTitle}>{title}</h3>
        <p className={styles.dialogMessage}>{message}</p>
        <div className={styles.dialogActions}>
          <Button attention="low" size="s" onPress={onCancel}>
            Cancel
          </Button>
          <Button
            attention="high"
            size="s"
            appearance="negative"
            onPress={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
});
