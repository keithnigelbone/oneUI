/**
 * LinkButton.tsx
 * React (web) implementation using Base UI
 *
 * Key features:
 * - Uses @base-ui/react Button primitive (never fork) — semantic <button>
 * - Token-only styling in CSS Module
 * - Link-like styling: underline + text color based on attention level
 * - NOT a navigation element — use Link for actual <a> navigation
 * - 3 sizes (S/M/L), 11 appearance roles, start/end slots
 * - Surface-context-aware
 *
 * @example Surface context — link buttons adapt on colored backgrounds
 * ```tsx
 * import { LinkButton, Surface } from '@oneui/ui';
 *
 * <Surface mode="bold">
 *   <LinkButton attention="high">Adapts automatically</LinkButton>
 * </Surface>
 * ```
 */

import React from 'react';
import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';
import styles from './LinkButton.module.css';
import { LinkButtonProps, useLinkButtonState } from './LinkButton.shared';
import { explicitAppearanceClass, makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';
import { renderHostSlotIcon } from '../_shared/slotIconDefaults';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '../CircularProgressIndicator';

/** LinkButton numeric f-step size → CPI size preset */
const SPINNER_SIZE_MAP: Record<number, CircularProgressIndicatorSize> = {
  6: 'XS',
  8: 'S',
  10: 'M',
  12: 'L',
};

const appearanceClassMap = makeAppearanceClassMap(styles);

export const LinkButton = React.forwardRef<HTMLElement, LinkButtonProps>(function LinkButton(
  {
    attention,
    size = 10,
    appearance,
    disabled,
    loading,
    onPress,
    onClick,
    children,
    start: startProp,
    end: endProp,
    showUnderline,
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
  const { isDisabled, resolvedVariant, resolvedAppearance, inheritedFromSurface, numericSize, ariaProps, dataAttrs } = useLinkButtonState({
    attention,
    size,
    appearance,
    disabled,
    loading,
    onPress,
    children,
    showUnderline,
  });

  const appearanceClassName = explicitAppearanceClass(
    appearance,
    resolvedAppearance,
    appearanceClassMap,
    inheritedFromSurface,
  );

  const startContent =
    typeof startProp === 'string'
      ? renderHostSlotIcon(startProp, attention)
      : startProp;
  const endContent =
    typeof endProp === 'string'
      ? renderHostSlotIcon(endProp, attention)
      : endProp;

  const className = clsx(
    styles.linkButton,
    styles[resolvedVariant],
    appearanceClassName,
    {
      [styles.disabled]: isDisabled,
      [styles.loading]: !!loading,
    },
    classNameProp,
  );

  return (
    <BaseButton
      ref={ref}
      className={className}
      style={styleProp}
      disabled={isDisabled}
      onClick={onPress ?? onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-describedby={ariaDescribedby}
      aria-haspopup={ariaHasPopup}
      type={typeProp}
      data-testid={dataTestId}
      {...ariaProps}
      {...dataAttrs}
    >
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
    </BaseButton>
  );
});

LinkButton.displayName = 'LinkButton';
