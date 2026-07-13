/**
 * Link.tsx
 * Text link component for navigation
 *
 * Key features:
 * - Token-only styling in CSS Module
 * - Auto external icon for external links
 * - WCAG AA accessible
 * - Supports semantic icon names and React elements
 */

import React, { isValidElement, ReactElement } from 'react';
import styles from './Link.module.css';
import { LinkProps, useLinkState, SIZE_TO_ICON_SIZE } from './Link.shared';
import { Icon } from '../../icons/Icon';
import type { SemanticIconName, ComponentIconInput } from '@oneui/shared';

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  variant = 'default',
  size = 'medium',
  external,
  disabled,
  leftIcon,
  rightIcon,
  onClick,
  className,
  'data-testid': testId,
}) => {
  const { isDisabled, effectiveRightIcon, linkProps } = useLinkState({
    children,
    href,
    variant,
    size,
    external,
    disabled,
    leftIcon,
    rightIcon,
    onClick,
  });

  const linkClassName = [
    styles.link,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = SIZE_TO_ICON_SIZE[size];

  const renderIcon = (
    icon: ComponentIconInput | ReactElement | undefined,
    position: 'left' | 'right'
  ) => {
    if (!icon) return null;

    // If it's already a React element, render it directly
    if (isValidElement(icon)) {
      return <span className={styles[`${position}Icon`]}>{icon}</span>;
    }

    // Otherwise, use the Icon component with semantic name
    return (
      <span className={styles[`${position}Icon`]}>
        <Icon name={icon as SemanticIconName} size={iconSize} aria-hidden={true} />
      </span>
    );
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  return (
    <a
      href={isDisabled ? undefined : href}
      className={linkClassName}
      onClick={handleClick}
      data-testid={testId}
      {...linkProps}
    >
      {renderIcon(leftIcon, 'left')}
      <span className={styles.text}>{children}</span>
      {renderIcon(effectiveRightIcon, 'right')}
    </a>
  );
};

Link.displayName = 'Link';
