/**
 * Toast.shared.ts
 * Shared types and hooks for Toast/AlertToast component
 */

import { ReactNode } from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';

export interface ToastProps {
  /** Toast title */
  title: string;
  /** Toast description */
  description?: string;
  /** Visual variant */
  variant?: ToastVariant;
  /** Action element */
  action?: ReactNode;
  /** Whether the toast can be dismissed */
  dismissible?: boolean;
}

export interface ToastViewportProps {
  /** Toast elements */
  children: ReactNode;
  /** Position on screen */
  position?: ToastPosition;
  /** Additional class name */
  className?: string;
}

export function useToastState(props: ToastProps) {
  return {
    variant: props.variant ?? 'info',
  };
}
