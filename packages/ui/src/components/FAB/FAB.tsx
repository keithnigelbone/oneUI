/**
 * FAB.tsx
 * Floating Action Button component using Base UI
 *
 * Key features:
 * - Uses @base-ui/react Button primitive (never fork)
 * - Token-only styling in CSS Module
 * - Interactive shape = Pill (999px)
 * - Elevated with shadow for floating effect
 * - WCAG AA accessible
 * - Supports extended mode (icon + label)
 */

import React, { isValidElement } from 'react';
import { Button as BaseButton } from '@base-ui/react';
import styles from './FAB.module.css';
import { FABProps, FABSize, FABVariant, useFABState, SIZE_TO_ICON_SIZE } from './FAB.shared';
import { Icon } from '../../icons/Icon';
import type { SemanticIconName } from '@oneui/shared';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '../CircularProgressIndicator';

const SPINNER_SIZE_MAP: Record<FABSize, CircularProgressIndicatorSize> = {
  small: 'S',
  medium: 'M',
  large: 'L',
};

/** FAB's `surface` variant has no CPI appearance equivalent — fall back to primary. */
const VARIANT_TO_CPI_APPEARANCE: Record<FABVariant, CircularProgressIndicatorAppearance> = {
  primary: 'primary',
  secondary: 'secondary',
  surface: 'primary',
};

export const FAB: React.FC<FABProps> = ({
  icon,
  label,
  variant = 'primary',
  size = 'medium',
  position = 'bottom-right',
  disabled,
  loading,
  onPress,
  'aria-label': ariaLabel,
  className,
  style,
  'data-testid': testId,
}) => {
  const { isDisabled, isExtended, ariaProps } = useFABState({
    icon,
    label,
    variant,
    size,
    position,
    disabled,
    loading,
    onPress,
    'aria-label': ariaLabel,
  });

  const fabClassName = [
    styles.fab,
    styles[variant],
    styles[size],
    styles[position],
    isExtended && styles.extended,
    isDisabled && styles.disabled,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = SIZE_TO_ICON_SIZE[size];

  const renderIcon = () => {
    if (loading) {
      return (
        <span className={styles.spinner} aria-hidden="true">
          <CircularProgressIndicator
            variant="indeterminate"
            size={SPINNER_SIZE_MAP[size]}
            appearance={VARIANT_TO_CPI_APPEARANCE[variant]}
            aria-label="Loading"
          />
        </span>
      );
    }

    // If it's already a React element, render it directly
    if (isValidElement(icon)) {
      return icon;
    }

    // Otherwise, use the Icon component with semantic name
    return <Icon name={icon as SemanticIconName} size={iconSize} aria-hidden={true} />;
  };

  return (
    <BaseButton
      className={fabClassName}
      disabled={isDisabled}
      onClick={onPress}
      data-testid={testId}
      style={style}
      {...ariaProps}
    >
      <span className={styles.icon}>{renderIcon()}</span>
      {isExtended && <span className={styles.label}>{label}</span>}
    </BaseButton>
  );
};

FAB.displayName = 'FAB';
