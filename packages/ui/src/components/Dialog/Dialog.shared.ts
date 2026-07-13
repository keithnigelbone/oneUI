/**
 * Dialog.shared.ts
 * Shared types and hooks for Dialog component
 */

import { ReactNode } from 'react';

export type DialogSize = 'small' | 'medium' | 'large';

export interface DialogProps {
  /** Dialog content */
  children: ReactNode;
  /** Whether the dialog is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Size preset */
  size?: DialogSize;
  /** Whether clicking the backdrop closes the dialog */
  dismissible?: boolean;
}

export interface AlertDialogProps extends Omit<DialogProps, 'dismissible'> {
  /** Confirmation action label */
  confirmLabel?: string;
  /** Cancel action label */
  cancelLabel?: string;
  /** Called when the confirm action is triggered */
  onConfirm?: () => void;
  /** Whether the confirm action is destructive */
  destructive?: boolean;
}

export function useDialogState(props: DialogProps) {
  return {
    isOpen: props.open,
  };
}
