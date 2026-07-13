/**
 * Toast.tsx
 * React (web) implementation using Base UI Toast
 *
 * Key features:
 * - Uses @base-ui/react Toast primitive (never fork)
 * - Token-only styling in CSS Module
 * - Non-interactive shape = Shape-L
 * - WCAG AA accessible (role="alert" for important toasts)
 * - Status variants: info, success, warning, error
 * - Uses imperative toast manager pattern (useToastManager)
 */

import React from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import styles from './Toast.module.css';
import { ToastViewportProps } from './Toast.shared';

type ToastData = {
  variant?: 'info' | 'success' | 'warning' | 'error';
  action?: React.ReactNode;
  dismissible?: boolean;
};

export const ToastViewport: React.FC<ToastViewportProps> = ({
  children,
  position = 'bottom-right',
  className,
}) => {
  const positionStyles: Record<string, string> = {
    'top-center': styles.topCenter,
    'top-right': styles.topRight,
    'bottom-center': styles.bottomCenter,
    'bottom-right': styles.bottomRight,
  };

  const viewportClassName = [
    styles.viewport,
    positionStyles[position],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseToast.Viewport className={viewportClassName}>
      {children}
    </BaseToast.Viewport>
  );
};

/**
 * Renders an individual toast. Must receive a `toast` object from useToastManager().
 */
export const ToastItem: React.FC<{
  toast: BaseToast.Root.ToastObject<ToastData>;
}> = ({ toast }) => {
  const variant = toast.data?.variant ?? 'info';
  const action = toast.data?.action;
  const dismissible = toast.data?.dismissible ?? true;
  const toastClassName = [styles.toast, styles[variant]].filter(Boolean).join(' ');

  return (
    <BaseToast.Root toast={toast} className={toastClassName}>
      <div className={styles.content}>
        <BaseToast.Title className={styles.title}>{toast.title}</BaseToast.Title>
        {toast.description && (
          <BaseToast.Description className={styles.description}>
            {toast.description}
          </BaseToast.Description>
        )}
        {action && <div className={styles.action}>{action}</div>}
      </div>
      {dismissible && (
        <BaseToast.Close className={styles.close}>
          <CloseIcon />
        </BaseToast.Close>
      )}
    </BaseToast.Root>
  );
};

export const ToastProvider = BaseToast.Provider;

export const useToastManager = BaseToast.useToastManager;

/**
 * Simple display-only Toast card component.
 * For imperative toast management, use ToastProvider + useToastManager + ToastItem.
 */
export const Toast: React.FC<{
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  onDismiss?: () => void;
}> = ({ title, description, variant = 'info', dismissible = true, onDismiss }) => {
  const toastClassName = [styles.toast, styles[variant]].filter(Boolean).join(' ');

  return (
    <div className={toastClassName} role="alert">
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
      {dismissible && (
        <button className={styles.close} type="button" aria-label="Dismiss" onClick={onDismiss}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

function CloseIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentcolor" {...props}>
      <path d="M9.53 3.53L7.06 6l2.47 2.47-1.06 1.06L6 7.06 3.53 9.53 2.47 8.47 4.94 6 2.47 3.53 3.53 2.47 6 4.94l2.47-2.47 1.06 1.06z" />
    </svg>
  );
}
