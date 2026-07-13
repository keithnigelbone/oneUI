/**
 * Link.shared.ts
 * Shared types and hooks for Link component
 * Used by both web and React Native implementations
 */

import { ReactNode, ReactElement } from 'react';
import type { ComponentIconInput } from '@oneui/shared';

export type LinkVariant = 'default' | 'subtle' | 'bold';
export type LinkSize = 'small' | 'medium' | 'large';

export interface LinkProps {
  /** Link text content */
  children: ReactNode;
  /** URL destination */
  href: string;
  /** Visual variant */
  variant?: LinkVariant;
  /** Size affecting font size */
  size?: LinkSize;
  /** Opens in new tab with proper security attributes */
  external?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Leading icon */
  leftIcon?: ComponentIconInput | ReactElement;
  /** Trailing icon (auto-added for external links if not specified) */
  rightIcon?: ComponentIconInput | ReactElement;
  /** Click handler (in addition to navigation) */
  onClick?: () => void;
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Hook for Link state management
 * Shared between web and native implementations
 */
export function useLinkState(props: LinkProps) {
  const isDisabled = props.disabled;
  const isExternal = props.external;

  // Auto-add external link icon if external and no rightIcon specified
  const effectiveRightIcon = isExternal && !props.rightIcon ? 'externalLink' : props.rightIcon;

  return {
    isDisabled,
    isExternal,
    effectiveRightIcon,
    linkProps: {
      target: isExternal ? '_blank' : undefined,
      rel: isExternal ? 'noopener noreferrer' : undefined,
      'aria-disabled': isDisabled,
    },
  };
}

/** Size to icon size mapping */
export const SIZE_TO_ICON_SIZE: Record<LinkSize, 'sm' | 'md' | 'lg'> = {
  small: 'sm',
  medium: 'sm',
  large: 'md',
};
