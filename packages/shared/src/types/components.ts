/**
 * Component Type Definitions
 */

import React from 'react';

export interface ComponentProps {
  // Common React component props base
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface InteractiveComponentProps extends ComponentProps {
  disabled?: boolean;
  loading?: boolean;
}

export interface ButtonProps extends InteractiveComponentProps {
  variant?: 'bold' | 'subtle' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}
