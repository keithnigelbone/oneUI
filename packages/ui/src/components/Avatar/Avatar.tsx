/**
 * Avatar.tsx
 * React (web) implementation
 *
 * Key features:
 * - Token-only styling in CSS Module
 * - Circular shape = Shape-Pill (default)
 * - Multi-accent appearance roles (all 9 V4 roles)
 * - Attention levels (high/medium/low) for visual emphasis
 * - Graceful fallback when image fails to load
 * - Optional `onClick` / `onPress` — renders as Base UI `Button` when set
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';
import styles from './Avatar.module.css';
import { type AvatarProps, type AvatarAppearance, useAvatarState, getInitials } from './Avatar.shared';

/** Map resolved appearance to CSS module class (all 9 V4 roles, type-safe) */
const appearanceClassMap: Record<Exclude<AvatarAppearance, 'auto'>, string | undefined> = {
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
  low: styles.low,
};

/** Sizes where text content falls back to icon (too small for legible text) */
const TEXT_FALLBACK_SIZES = new Set(['2xs', 'xs']);

/** Default person icon matching Figma's IcProfile (filled person silhouette) */
const DefaultPersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"
      clipRule="evenodd"
    />
  </svg>
);

export const Avatar = forwardRef<HTMLElement, AvatarProps>(function Avatar(props, ref) {
  const {
    content = 'image',
    src,
    alt = '',
    fallback,
    icon,
    customSize,
    className,
    style,
    onPress,
    onClick,
    'data-testid': dataTestId,
  } = props;

  const { resolvedSize, resolvedAttention, resolvedAppearance, isDisabled, isInteractive, dataAttrs } =
    useAvatarState(props);

  const [imageError, setImageError] = useState(false);
  const showImage = content === 'image' && src && !imageError;

  const effectiveContent =
    content === 'text' && TEXT_FALLBACK_SIZES.has(resolvedSize) ? 'icon' : content;

  const rootClassName = clsx(
    styles.root,
    attentionClassMap[resolvedAttention],
    appearanceClassMap[resolvedAppearance],
    { [styles.disabled]: isDisabled },
    { [styles.interactive]: isInteractive },
    className,
  );

  const rootStyle = customSize
    ? { ...style, '--Avatar-customSize': `${customSize}px` } as React.CSSProperties
    : style;

  const renderFallback = () => {
    if (effectiveContent === 'text') {
      return (
        <span className={styles.text}>
          {fallback ?? getInitials(alt)}
        </span>
      );
    }
    return (
      <span className={styles.icon}>
        {icon ?? fallback ?? <DefaultPersonIcon />}
      </span>
    );
  };

  const body = showImage ? (
    <img
      src={src}
      alt=""
      role="presentation"
      className={styles.image}
      onError={() => setImageError(true)}
    />
  ) : (
    renderFallback()
  );

  const handleActivate = () => {
    if (!isInteractive || isDisabled) return;
    (onPress ?? onClick)?.();
  };

  if (isInteractive) {
    return (
      <BaseButton
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={rootClassName}
        style={rootStyle}
        disabled={isDisabled}
        onClick={handleActivate}
        aria-label={alt}
        data-testid={dataTestId}
        data-showing-image={showImage || undefined}
        {...dataAttrs}
      >
        {body}
      </BaseButton>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={rootClassName}
      style={rootStyle}
      role="img"
      aria-label={alt}
      data-testid={dataTestId}
      data-showing-image={showImage || undefined}
      {...dataAttrs}
    >
      {body}
    </span>
  );
});
Avatar.displayName = 'Avatar';
