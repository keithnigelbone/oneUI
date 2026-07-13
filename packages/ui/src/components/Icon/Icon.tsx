/**
 * Icon.tsx
 * Design-system Icon component (React web)
 *
 * Key features:
 * - Token-based sizing via CSS Module (20 sizes from spacing scale)
 * - 8 appearance roles (V4 colour system)
 * - 5 emphasis levels (on-colour token prominence)
 * - Accepts semantic icon names (resolved via brand icon set) or React elements
 * - Surface-context-aware: inherits nearest `<Surface>` appearance when the
 *   `appearance` prop is omitted; slot parents (Button, Badge, …) win over Surface
 * - Matches Figma Icon component spec (node 2342:40776)
 */

import React, { isValidElement } from 'react';
import clsx from 'clsx';
import styles from './Icon.module.css';
import { type IconProps, type IconAppearance, type IconEmphasis, useIconState } from './Icon.shared';
import { Icon as IconResolver } from '../../icons/Icon';

/** Map appearance to CSS module class. Neutral is default (no class). */
const appearanceClassMap: Record<IconAppearance, string | undefined> = {
  neutral: undefined,
  primary: styles.appearancePrimary,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  negative: styles.appearanceNegative,
  positive: styles.appearancePositive,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

/** Map emphasis to CSS class */
const emphasisClassMap: Record<IconEmphasis, string> = {
  high: styles.high,
  medium: styles.medium,
  low: styles.low,
  tinted: styles.tinted,
  tintedA11y: styles.tintedA11y,
};

export function Icon(props: IconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { ref } = props;
  const {
    icon,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    'data-testid': dataTestId,
  } = props;

  const { resolvedAppearance, resolvedEmphasis, dataAttrs } = useIconState(props);

  const rootClassName = clsx(
    styles.root,
    emphasisClassMap[resolvedEmphasis],
    appearanceClassMap[resolvedAppearance],
    className,
  );

  const renderIcon = () => {
    if (isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function') {
      return <IconResolver icon={icon} aria-hidden={true} />;
    }
    return <IconResolver icon={icon} aria-hidden={true} />;
  };

  return (
    <span
      ref={ref}
      className={rootClassName}
      style={style}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? !ariaLabel}
      data-testid={dataTestId}
      {...dataAttrs}
    >
      {renderIcon()}
    </span>
  );
}
