/**
 * Button.tsx
 * React (web) implementation using Base UI
 *
 * Key features:
 * - Uses @base-ui/react Button primitive (never fork)
 * - Token-only styling in CSS Module
 * - 3 sizes (S/M/L) aligned with Figma spec, with condensed mode
 * - Multi-accent appearance roles (all 9 V4 roles)
 * - WCAG AA accessible
 * - Generic start/end slots accept any ReactNode (icons, avatars, badges)
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 *
 * @example Surface context — buttons adapt on colored backgrounds
 * ```tsx
 * import { Button, Surface } from '@oneui/ui';
 *
 * // Bold button inverts, subtle gets tinted fill, ghost gets light text
 * <Surface mode="bold">
 *   <Button attention="high">Inverted fill</Button>
 *   <Button attention="medium">Tinted fill</Button>
 *   <Button attention="low">Light text</Button>
 * </Surface>
 * ```
 */

'use client';

import React, { isValidElement, useMemo } from 'react';
import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';
import styles from './Button.module.css';
import { ButtonProps, useButtonState } from './Button.shared';
import { ButtonDecoration } from './ButtonDecoration';
import { explicitAppearanceClass, makeAppearanceClassMap } from '../_shared/appearanceClasses';
import type { SemanticIconName } from '@oneui/shared';
import { useComponentDecoration } from '../../hooks/useDecorationContext';
import { LinkButton } from '../LinkButton/LinkButton';
import type { LinkButtonProps } from '../LinkButton/LinkButton.shared';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';
import { renderHostSlotIcon } from '../_shared/slotIconDefaults';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '../CircularProgressIndicator';

/** Button numeric f-step size → CPI size preset (matches --Button-iconSize per step) */
const SPINNER_SIZE_MAP: Record<number, CircularProgressIndicatorSize> = {
  6: 'XS',
  8: 'S',
  10: 'M',
  12: 'L',
};

const CLEAR_DECORATION_STYLE: React.CSSProperties = {
  '--Button-ornament-width-left': 'var(--Spacing-0)',
  '--Button-ornament-width-right': 'var(--Spacing-0)',
  '--Button-ornament-border-left': 'var(--_btn-bw)',
  '--Button-ornament-border-right': 'var(--_btn-bw)',
  '--Button-ornament-radius-left': 'var(--_btn-radius)',
  '--Button-ornament-radius-right': 'var(--_btn-radius)',
} as React.CSSProperties;

/**
 * Props Button drops when delegating to LinkButton. Captured at the type
 * level so "these are intentionally ignored" is visible in the signature,
 * not buried in a comment. Adding a new contained-only prop to Button and
 * forgetting to add it here becomes a type error at the call site.
 */
type ContainedOnlyProps = 'contained' | 'condensed' | 'fullWidth' | 'decoration';

/**
 * Map Button props → LinkButton props for the `contained={false}` delegation
 * path. Typed so that prop additions on either side surface as compile errors
 * instead of quietly being dropped. Contained-only props are excluded from
 * the input type (see {@link ContainedOnlyProps}) — callers needing those
 * should use `<LinkButton>` directly.
 *
 * Both components' variant / attention / size / appearance unions overlap by
 * design (LinkButton accepts a subset). The casts here are narrowed to the
 * specific prop shapes Button emits; TypeScript still flags shape drift.
 */
function toLinkButtonProps(props: Omit<ButtonProps, ContainedOnlyProps>): LinkButtonProps {
  const {
    attention,
    size,
    appearance,
    disabled,
    loading,
    onPress,
    onClick,
    children,
    start: startProp,
    end: endProp,
    leftIcon,
    rightIcon,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
    'aria-describedby': ariaDescribedby,
    'aria-haspopup': ariaHasPopup,
    'data-testid': dataTestId,
    className,
    style,
    type,
  } = props;

  const leading: LinkButtonProps['start'] =
    typeof startProp === 'string'
      ? startProp
      : startProp ??
        (leftIcon
          ? isValidElement(leftIcon)
            ? leftIcon
            : (leftIcon as SemanticIconName)
          : undefined);
  const trailing: LinkButtonProps['end'] =
    typeof endProp === 'string'
      ? endProp
      : endProp ??
        (rightIcon
          ? isValidElement(rightIcon)
            ? rightIcon
            : (rightIcon as SemanticIconName)
          : undefined);

  return {
    attention: attention as LinkButtonProps['attention'],
    size: size as LinkButtonProps['size'],
    appearance: appearance as LinkButtonProps['appearance'],
    disabled,
    loading,
    onPress,
    onClick,
    start: leading,
    end: trailing,
    // Figma's Contained=false paints the underline transparent by default;
    // visible underline is a hover affordance. `showUnderline={false}`
    // encodes that semantic instead of leaking LinkButton's internal CSS
    // var name into Button.
    showUnderline: false,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
    'aria-describedby': ariaDescribedby,
    'aria-haspopup': ariaHasPopup,
    'data-testid': dataTestId,
    className,
    style,
    type,
    children,
  };
}

const appearanceClassMap = makeAppearanceClassMap(styles);

export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    attention,
    size = 10,
    appearance,
    contained = true,
    condensed,
    fullWidth,
    disabled,
    loading,
    onPress,
    onClick,
    children,
    start: startProp,
    end: endProp,
    leftIcon,
    rightIcon,
    decoration: decorationProp,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
    'aria-describedby': ariaDescribedby,
    'aria-haspopup': ariaHasPopup,
    'data-testid': dataTestId,
    className: classNameProp,
    style: styleProp,
    type: typeProp,
  },
  ref,
) {
  // Uncontained form (Figma `Contained = false`): delegate to LinkButton
  // via a typed mapping so prop-shape drift on either component surfaces
  // as a compile error. `showUnderline={false}` on the result matches the
  // Figma spec (underline transparent by default, revealed on hover).
  if (!contained) {
    return (
      <LinkButton
        ref={ref}
        {...toLinkButtonProps({
          attention,
          size,
          appearance,
          disabled,
          loading,
          onPress,
          onClick,
          children,
          start: startProp,
          end: endProp,
          leftIcon,
          rightIcon,
          'aria-label': ariaLabel,
          'aria-pressed': ariaPressed,
          'aria-expanded': ariaExpanded,
          'aria-controls': ariaControls,
          'aria-describedby': ariaDescribedby,
          'aria-haspopup': ariaHasPopup,
          'data-testid': dataTestId,
          className: classNameProp,
          style: styleProp,
          type: typeProp,
        })}
      />
    );
  }
  const { isDisabled, resolvedVariant, resolvedAppearance, inheritedFromSurface, numericSize, ariaProps, dataAttrs } = useButtonState({
    attention,
    size,
    appearance,
    condensed,
    fullWidth,
    disabled,
    loading,
    onPress,
    children,
    start: startProp,
    end: endProp,
    leftIcon,
    rightIcon,
    'aria-label': ariaLabel,
  });
  const appearanceClassName = explicitAppearanceClass(
    appearance,
    resolvedAppearance,
    appearanceClassMap,
    inheritedFromSurface,
  );

  // String values are treated as semantic icon names — host renders <Icon> with
  // Figma-aligned default emphasis; slot CSS (--Icon-color: currentColor) owns colour.
  const startContent =
    typeof startProp === 'string'
      ? renderHostSlotIcon(startProp, attention)
      : startProp ?? (leftIcon ? renderHostSlotIcon(leftIcon, attention) : undefined);
  const endContent =
    typeof endProp === 'string'
      ? renderHostSlotIcon(endProp, attention)
      : endProp ?? (rightIcon ? renderHostSlotIcon(rightIcon, attention) : undefined);

  // Prop overrides context — allows Storybook/tests to pass decoration directly
  const contextDecoration = useComponentDecoration('Button');
  const decoration = decorationProp !== undefined ? decorationProp : contextDecoration;
  const hasDecoration = decoration !== null;
  const isGhost = resolvedVariant === 'ghost';

  // Lightweight parent vars only. SVG parsing/rendering lives in ButtonDecoration
  // and only runs when decoration exists.
  const decorationStyle = useMemo((): React.CSSProperties | undefined => {
    if (decorationProp === null) return CLEAR_DECORATION_STYLE;
    if (!decoration) return undefined;

    const ratio = decoration.aspectRatio;
    const ornamentWidth = `calc(var(--_btn-min-h) * ${ratio} * var(--Button-ornamentHeightScale, 1))`;
    const showRight = decoration.placement === 'edges' || decoration.placement === 'right';
    const showLeft = decoration.placement === 'edges' || decoration.placement === 'left';
    const s: Record<string, string> = {
      overflow: 'visible',
      position: 'relative',
      '--Button-ornament-width-left': showLeft ? ornamentWidth : 'var(--Spacing-0)',
      '--Button-ornament-width-right': showRight ? ornamentWidth : 'var(--Spacing-0)',
    };
    if (showLeft) {
      s['--Button-ornament-radius-left'] = 'var(--Shape-0)';
      s['--Button-ornament-border-left'] = 'var(--Stroke-None)';
    }
    if (showRight) {
      s['--Button-ornament-radius-right'] = 'var(--Shape-0)';
      s['--Button-ornament-border-right'] = 'var(--Stroke-None)';
    }
    return s as React.CSSProperties;
  }, [decoration, decorationProp]);

  const className = clsx(
    styles.button,
    styles[resolvedVariant],
    appearanceClassName,
    {
      [styles.fullWidth]: fullWidth,
      [styles.disabled]: isDisabled,
      [styles.loading]: !!loading,
    },
    classNameProp,
  );

  const buttonContent = (
    <>
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <CircularProgressIndicator
            variant="indeterminate"
            size={SPINNER_SIZE_MAP[numericSize] ?? 'M'}
            appearance={resolvedAppearance as CircularProgressIndicatorAppearance}
            aria-label="Loading"
          />
        </span>
      )}
      {startContent && (
        <span className={styles.start}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>{startContent}</SlotParentAppearanceProvider>
        </span>
      )}
      {children && <span className={styles.label}>{children}</span>}
      {endContent && (
        <span className={styles.end}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>{endContent}</SlotParentAppearanceProvider>
        </span>
      )}
    </>
  );

  return (
    <BaseButton
      ref={ref}
      className={className}
      style={styleProp ? { ...decorationStyle, ...styleProp } : decorationStyle}
      disabled={isDisabled}
      onClick={onPress ?? onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-describedby={ariaDescribedby}
      aria-haspopup={ariaHasPopup}
      type={typeProp}
      {...(hasDecoration ? { 'data-has-decoration': '' } : {})}
      data-testid={dataTestId}
      {...ariaProps}
      {...dataAttrs}
    >
      {decoration ? (
        <ButtonDecoration decoration={decoration} isGhost={isGhost}>
          {buttonContent}
        </ButtonDecoration>
      ) : buttonContent}
    </BaseButton>
  );
});

Button.displayName = 'Button';
