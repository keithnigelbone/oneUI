/**
 * Dialog.tsx
 * React (web) implementation using Base UI Dialog
 *
 * Key features:
 * - Uses @base-ui/react Dialog primitive (never fork)
 * - Token-only styling in CSS Module
 * - Non-interactive shape = Shape-L
 * - WCAG AA accessible with proper focus management
 * - Supports backdrop dismiss
 */

import React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import styles from './Dialog.module.css';
import { DialogProps, AlertDialogProps } from './Dialog.shared';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';

export const Dialog: React.FC<DialogProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  size = 'medium',
  dismissible = true,
}) => {
  const popupClassName = [styles.popup, styles[size]].filter(Boolean).join(' ');

  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
      disablePointerDismissal={!dismissible}
    >
      {children}
    </BaseDialog.Root>
  );
};

/** Dialog sub-components re-exported with styling */
export const DialogTrigger = BaseDialog.Trigger;

export const DialogPortal: React.FC<{ children: React.ReactNode; size?: DialogProps['size']; title?: string; description?: string }> = ({
  children,
  size = 'medium',
  title,
  description,
}) => {
  const popupClassName = [styles.popup, styles[size]].filter(Boolean).join(' ');

  return (
    <BaseDialog.Portal>
      <BrandScopePortal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Popup className={popupClassName}>
          {title && <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>}
          {description && (
            <BaseDialog.Description className={styles.description}>
              {description}
            </BaseDialog.Description>
          )}
          {children}
        </BaseDialog.Popup>
      </BrandScopePortal>
    </BaseDialog.Portal>
  );
};

export const DialogClose = BaseDialog.Close;

/** AlertDialog - requires user action, cannot be dismissed by clicking backdrop */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  size = 'small',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive,
}) => {
  const popupClassName = [styles.popup, styles[size]].filter(Boolean).join(' ');

  return (
    <BaseAlertDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
    >
      {children}
    </BaseAlertDialog.Root>
  );
};

export const AlertDialogTrigger = BaseAlertDialog.Trigger;

export const AlertDialogPortal: React.FC<{
  children: React.ReactNode;
  size?: DialogProps['size'];
  title?: string;
  description?: string;
}> = ({ children, size = 'small', title, description }) => {
  const popupClassName = [styles.popup, styles[size]].filter(Boolean).join(' ');

  return (
    <BaseAlertDialog.Portal>
      <BrandScopePortal>
        <BaseAlertDialog.Backdrop className={styles.backdrop} />
        <BaseAlertDialog.Popup className={popupClassName}>
          {title && <BaseAlertDialog.Title className={styles.title}>{title}</BaseAlertDialog.Title>}
          {description && (
            <BaseAlertDialog.Description className={styles.description}>
              {description}
            </BaseAlertDialog.Description>
          )}
          {children}
        </BaseAlertDialog.Popup>
      </BrandScopePortal>
    </BaseAlertDialog.Portal>
  );
};

export const AlertDialogClose = BaseAlertDialog.Close;
