/**
 * FAB.shared.ts
 * Shared types and hooks for FAB (Floating Action Button) component
 * Used by both web and React Native implementations
 */

import { ReactNode, ReactElement, CSSProperties } from 'react';
import type { ComponentIconInput } from '@oneui/shared';

export type FABVariant = 'primary' | 'secondary' | 'surface';
export type FABSize = 'small' | 'medium' | 'large';
export type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface FABProps {
  /** Icon to display */
  icon: ComponentIconInput | ReactElement;
  /** Optional label text (creates extended FAB) */
  label?: ReactNode;
  /** Visual variant affecting colors */
  variant?: FABVariant;
  /** Size affecting dimensions */
  size?: FABSize;
  /** Position on screen (only applies when position="fixed") */
  position?: FABPosition;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Press/click handler */
  onPress?: () => void;
  /** Accessibility label (required if no label prop) */
  'aria-label'?: string;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles (primarily for Storybook positioning) */
  style?: CSSProperties;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Hook for FAB state management
 * Shared between web and native implementations
 */
export function useFABState(props: FABProps) {
  const isDisabled = props.disabled || props.loading;
  const isExtended = !!props.label;

  // Accessibility label: use aria-label, or label text if it's a string
  const accessibleName =
    props['aria-label'] ||
    (typeof props.label === 'string' ? props.label : undefined);

  return {
    isDisabled,
    isExtended,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': props.loading,
      'aria-label': accessibleName,
    },
  };
}

/** Size to icon size mapping */
export const SIZE_TO_ICON_SIZE: Record<FABSize, 'sm' | 'md' | 'lg'> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};
