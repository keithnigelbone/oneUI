/**
 * SingleTextButton.tsx
 * React (web) implementation using Base UI Button primitive.
 *
 * Action button — circular, max 2 characters (e.g. "Ag", "En", "A").
 * Attention level drives the full visual:
 *   - high  → bold fill (Primary-Bold bg, Primary-Bold-High text)
 *   - medium → subtle fill (Primary-Subtle bg, Primary-TintedA11y text)
 *   - low   → ghost (transparent bg, Primary-TintedA11y text)
 * 3 sizes (S/M/L). Token-only styling. Surface-context-aware.
 *
 * @example
 * ```tsx
 * <SingleTextButton attention="high">Ag</SingleTextButton>
 * <SingleTextButton attention="medium" size="l">En</SingleTextButton>
 * <SingleTextButton attention="low" appearance="negative">X</SingleTextButton>
 * ```
 */

'use client';

import React from 'react';
import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';
import styles from './SingleTextButton.module.css';
import {
  SingleTextButtonProps,
  SingleTextButtonAppearance,
  SingleTextButtonSize,
  useSingleTextButtonState,
} from './SingleTextButton.shared';
import { explicitAppearanceClass } from '../_shared/appearanceClasses';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '../CircularProgressIndicator';

// Map button size → CircularProgressIndicator size so the spinner scales with
// the button.
const SPINNER_SIZE_MAP: Record<SingleTextButtonSize, CircularProgressIndicatorSize> = {
  s: 'S',
  m: 'M',
  l: 'L',
};

// Map resolved appearance to CSS module class (all 11 V4 roles, type-safe).
const appearanceClassMap: Record<
  Exclude<SingleTextButtonAppearance, 'auto'>,
  string | undefined
> = {
  primary: undefined, // primary is the default — no extra class needed
  neutral: styles.appearanceNeutral,
  secondary: styles.appearanceSecondary,
  tertiary: styles.appearanceTertiary,
  quaternary: styles.appearanceQuaternary,
  sparkle: styles.appearanceSparkle,
  'brand-bg': styles.appearanceBrandBg,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

export const SingleTextButton = React.forwardRef<
  HTMLButtonElement,
  SingleTextButtonProps
>(function SingleTextButton(
  {
    children,
    size,
    attention,
    appearance,
    condensed,
    fullWidth,
    disabled,
    loading,
    onPress,
    onClick,
    'aria-label': ariaLabel,
    className: classNameProp,
    style: styleProp,
    type: typeProp,
  },
  ref,
) {
  const { isDisabled, resolvedAppearance, inheritedFromSurface, dataAttrs, ariaProps } =
    useSingleTextButtonState({
      children,
      size,
      attention,
      appearance,
      condensed,
      disabled,
      loading,
    });

  // Enforce max 2 characters — circular shape breaks beyond that.
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof children === 'string' &&
    children.length > 2
  ) {
    console.warn(
      `SingleTextButton: children "${children}" exceeds 2 characters. ` +
        'This component is designed for 1-2 character labels (e.g. "Ag", "En"). ' +
        'Text will be truncated.',
    );
  }
  const truncatedChildren =
    typeof children === 'string' && children.length > 2
      ? children.slice(0, 2)
      : children;

  const appearanceClassName = explicitAppearanceClass(
    appearance,
    resolvedAppearance,
    appearanceClassMap,
    inheritedFromSurface,
  );

  const className = clsx(
    styles.singleTextButton,
    appearanceClassName,
    { [styles.fullWidth]: fullWidth },
    classNameProp,
  );

  return (
    <BaseButton
      ref={ref}
      disabled={isDisabled}
      onClick={onPress ?? onClick}
      className={className}
      style={styleProp}
      aria-label={ariaLabel}
      type={typeProp}
      {...ariaProps}
      {...dataAttrs}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true">
          <CircularProgressIndicator
            variant="indeterminate"
            size={SPINNER_SIZE_MAP[(size ?? 'm') as SingleTextButtonSize]}
            // Pass the button's resolved appearance straight through.
            // CPI's declared union is currently narrower (no tertiary /
            // quaternary / brand-bg CSS classes wired), but in practice
            // the .spinner wrapper overrides --CircularProgressIndicator-
            // indicatorColor to currentColor, so the role only influences
            // the static track ring — which gracefully falls back to the
            // primary track for unmapped roles. The cast keeps the call
            // site honest about the declared shape while reflecting that
            // appearance is brand-fixed and should propagate, not branch.
            appearance={resolvedAppearance as CircularProgressIndicatorAppearance}
            aria-label="Loading"
          />
        </span>
      ) : (
        <span className={styles.label}>{truncatedChildren}</span>
      )}
    </BaseButton>
  );
});

SingleTextButton.displayName = 'SingleTextButton';
