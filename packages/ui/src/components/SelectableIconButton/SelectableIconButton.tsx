/**
 * SelectableIconButton.tsx
 * React (web) implementation using Base UI Toggle
 *
 * Key features:
 * - Uses @base-ui/react/toggle primitive
 * - Icon-only toggle button — stays selected after click (like/favourite pattern)
 * - Unselected state is always muted ghost regardless of attention level
 * - Selected appearance driven by `attention` prop:
 *   - high  → bold fill (fg-bold bg, on-bold-high icon)
 *   - medium → subtle fill (bg-subtle bg, accent icon)
 *   - low   → ghost with accent border
 * - 6 sizes (2XS/XS/S/M/L/XL), condensed mode, 1:1/2:3 shape proportions
 * - Token-only styling in CSS Module (zero literals)
 * - WCAG AA accessible via Base UI Toggle (aria-pressed, keyboard toggle)
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 * - `aria-label` is required (icon-only buttons must have accessible name)
 *
 * @example Basic toggle
 * ```tsx
 * <SelectableIconButton aria-label="Like" icon={<HeartIcon />} />
 * <SelectableIconButton aria-label="Like" icon={<HeartIcon />} attention="medium" defaultSelected />
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [liked, setLiked] = useState(false);
 * <SelectableIconButton
 *   aria-label={liked ? 'Unlike' : 'Like'}
 *   icon={<HeartIcon />}
 *   selected={liked}
 *   onSelectedChange={setLiked}
 * />
 * ```
 */

'use client';

import React, { isValidElement } from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import clsx from 'clsx';
import styles from './SelectableIconButton.module.css';
import {
  SelectableIconButtonProps,
  SelectableIconButtonAppearance,
  useSelectableIconButtonState,
} from './SelectableIconButton.shared';
import { explicitAppearanceClass, makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { Icon } from '../../icons/Icon';
import type { SemanticIconName } from '@oneui/shared';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '../CircularProgressIndicator';

/** SelectableIconButton numeric f-step size → CPI size preset */
const SPINNER_SIZE_MAP: Record<number, CircularProgressIndicatorSize> = {
  4: '2XS',
  6: 'XS',
  8: 'S',
  10: 'M',
  12: 'L',
  14: 'XL',
};

const appearanceClassMap = makeAppearanceClassMap(styles);

export const SelectableIconButton = React.forwardRef<HTMLButtonElement, SelectableIconButtonProps>(function SelectableIconButton(
  {
    icon,
    selected,
    defaultSelected,
    onSelectedChange,
    value,
    attention,
    size,
    appearance,
    condensed,
    shape,
    contained,
    fullWidth,
    disabled,
    loading,
    'aria-label': ariaLabel,
    className: classNameProp,
    style: styleProp,
    'data-testid': testId,
  },
  ref,
) {
    const { isDisabled, resolvedAppearance, inheritedFromSurface, numericSize, fullWidth: isFullWidth, dataAttrs } = useSelectableIconButtonState({
      icon,
      attention,
      size,
      appearance,
      condensed,
      shape,
      contained,
      fullWidth,
      disabled,
      loading,
      'aria-label': ariaLabel,
    });

    // Dev-mode warning for missing accessible label
    if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
      console.warn(
        'SelectableIconButton: `aria-label` is required for icon-only toggle buttons to ensure accessibility.',
      );
    }

    const appearanceClassName = explicitAppearanceClass(
      appearance,
      resolvedAppearance,
      appearanceClassMap,
      inheritedFromSurface,
    );

    const className = clsx(
      styles.selectableIconButton,
      appearanceClassName,
      isFullWidth && styles.fullWidth,
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
          {isValidElement(icon) ? icon : <Icon name={icon as SemanticIconName} aria-hidden={true} />}
        </span>
      );
    };

    return (
      <BaseToggle
        ref={ref}
        pressed={selected}
        defaultPressed={defaultSelected}
        onPressedChange={onSelectedChange}
        value={value}
        disabled={isDisabled}
        className={className}
        style={styleProp}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        data-testid={testId}
        {...dataAttrs}
      >
        {renderContent()}
      </BaseToggle>
    );
});

SelectableIconButton.displayName = 'SelectableIconButton';
