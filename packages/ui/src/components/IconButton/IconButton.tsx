/**
 * IconButton.tsx
 * React (web) implementation using Base UI
 *
 * Key features:
 * - Uses @base-ui/react Button primitive (never fork)
 * - Token-only styling in CSS Module
 * - 6 sizes (2XS/XS/S/M/L/XL) aligned with Figma spec, with condensed mode
 * - Multi-accent appearance roles (all 9 V4 roles)
 * - Shape layouts: 1:1 (square) and 3:2 (wide rectangle)
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 * - WCAG AA accessible (requires aria-label)
 */

import React, { isValidElement } from 'react';
import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';
import styles from './IconButton.module.css';
import { IconButtonProps, useIconButtonState } from './IconButton.shared';
import { explicitAppearanceClass, makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { Icon } from '../../icons/Icon';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '../CircularProgressIndicator';

/** IconButton numeric f-step size → CPI size preset (matches --IconButton-iconSize per step) */
const SPINNER_SIZE_MAP: Record<number, CircularProgressIndicatorSize> = {
  4: '2XS',
  6: 'XS',
  8: 'S',
  10: 'M',
  12: 'L',
  14: 'XL',
};

const appearanceClassMap = makeAppearanceClassMap(styles);

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    attention,
    size = 10,
    appearance,
    condensed,
    layout = '1:1',
    contained = true,
    fullWidth,
    disabled,
    loading,
    onPress,
    onClick,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
    className: classNameProp,
    style: styleProp,
    'data-testid': testId,
    ...buttonProps
  },
  ref,
) {
  if (process.env.NODE_ENV !== 'production' && !ariaLabel?.trim()) {
    console.warn(
      'IconButton: `aria-label` is required for icon-only buttons. A semantic icon fallback was applied for accessibility.',
    );
  }

  const { isDisabled, resolvedVariant, resolvedAppearance, inheritedFromSurface, numericSize, fullWidth: isFullWidth, ariaProps, dataAttrs } = useIconButtonState({
    icon,
    attention,
    size,
    appearance,
    condensed,
    layout,
    contained,
    fullWidth,
    disabled,
    loading,
    onPress,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
  });
  const appearanceClassName = explicitAppearanceClass(
    appearance,
    resolvedAppearance,
    appearanceClassMap,
    inheritedFromSurface,
  );

  const className = clsx(
    styles.iconButton,
    styles[resolvedVariant],
    appearanceClassName,
    {
      [styles.fullWidth]: isFullWidth,
      [styles.disabled]: isDisabled,
      [styles.loading]: !!loading,
    },
    classNameProp,
  );

  const renderContent = () => {
    if (loading) {
      return (
        <span className={styles.spinner} aria-hidden="true">
          <CircularProgressIndicator
            variant="indeterminate"
            size={SPINNER_SIZE_MAP[numericSize] ?? 'M'}
            appearance={resolvedAppearance as CircularProgressIndicatorAppearance}
            aria-label="Loading"
          />
        </span>
      );
    }

    return (
      <span className={styles.icon} aria-hidden="true">
        {isValidElement(icon) ? icon : <Icon icon={icon} aria-hidden={true} />}
      </span>
    );
  };

  return (
    <BaseButton
      {...buttonProps}
      ref={ref}
      className={className}
      style={styleProp}
      disabled={isDisabled}
      onClick={onPress ?? onClick}
      data-testid={testId}
      {...ariaProps}
      {...dataAttrs}
    >
      {renderContent()}
    </BaseButton>
  );
});

IconButton.displayName = 'IconButton';
