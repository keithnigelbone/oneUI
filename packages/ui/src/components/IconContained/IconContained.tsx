/**
 * IconContained.tsx
 * React (web) implementation
 *
 * Key features:
 * - Token-only styling in CSS Module
 * - Circular shape = Shape-Pill (default)
 * - Multi-accent appearance roles (all 9 V4 roles)
 * - Attention levels (high/medium) for visual emphasis
 * - Non-interactive (decorative icon container)
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 */

import React, { isValidElement } from 'react';
import clsx from 'clsx';
import styles from './IconContained.module.css';
import {
  type IconContainedProps,
  type IconContainedAppearance,
  useIconContainedState,
} from './IconContained.shared';
import { Icon } from '../../icons/Icon';
import type { SemanticIconName } from '@oneui/shared';

/** Map resolved appearance to CSS module class (all 9 V4 roles, type-safe) */
const appearanceClassMap: Record<Exclude<IconContainedAppearance, 'auto'>, string | undefined> = {
  primary: undefined,
  neutral: styles.appearanceNeutral,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  'brand-bg': styles.appearanceBrandBg,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

/** Map attention level to CSS class */
const attentionClassMap: Record<string, string> = {
  high: styles.high,
  medium: styles.medium,
};

function isNonEmptyAriaLabel(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

export function IconContained(props: IconContainedProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { ref } = props;
  const {
    icon,
    className,
    style,
    'aria-label': ariaLabel,
  } = props;

  const { resolvedAttention, resolvedAppearance, isDisabled, dataAttrs } =
    useIconContainedState(props);

  const meaningfulLabel = isNonEmptyAriaLabel(ariaLabel) ? ariaLabel.trim() : undefined;

  if (process.env.NODE_ENV !== 'production' && !meaningfulLabel) {
    console.warn(
      'IconContained: omit `aria-label` for decorative icons (root is aria-hidden). Provide a non-empty `aria-label` when the icon conveys meaning.',
    );
  }

  const rootClassName = clsx(
    styles.root,
    attentionClassMap[resolvedAttention],
    appearanceClassMap[resolvedAppearance],
    { [styles.disabled]: isDisabled },
    className,
  );

  const renderIcon = () => {
    if (isValidElement(icon)) {
      return icon;
    }
    return <Icon name={icon as SemanticIconName} aria-hidden={true} />;
  };

  const a11yProps = meaningfulLabel
    ? ({ role: 'img' as const, 'aria-label': meaningfulLabel })
    : ({ 'aria-hidden': true as const });

  return (
    <span
      ref={ref}
      className={rootClassName}
      style={style}
      {...a11yProps}
      {...dataAttrs}
    >
      <span className={styles.icon}>{renderIcon()}</span>
    </span>
  );
}
