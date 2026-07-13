/**
 * SelectableButton.tsx
 * React (web) implementation using Base UI Toggle
 *
 * Key features:
 * - Uses @base-ui/react/toggle primitive (same as Chip)
 * - Toggle button — stays selected after click (like/favourite pattern)
 * - Unselected state is always muted ghost regardless of attention level
 * - Selected appearance driven by `attention` prop:
 *   - high  → bold fill (fg-bold bg, on-bold-high text)
 *   - medium → subtle fill (bg-subtle bg, accent text)
 *   - low   → ghost with accent border
 * - `contained` prop: true (default) = pill container; false = inline text only
 * - Token-only styling in CSS Module (zero literals)
 * - WCAG AA accessible via Base UI Toggle (aria-pressed, keyboard toggle)
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 *
 * @example Basic toggle
 * ```tsx
 * <SelectableButton>Like</SelectableButton>
 * <SelectableButton attention="medium" defaultSelected>Following</SelectableButton>
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [liked, setLiked] = useState(false);
 * <SelectableButton selected={liked} onSelectedChange={setLiked} start={<HeartIcon />}>
 *   {liked ? 'Liked' : 'Like'}
 * </SelectableButton>
 * ```
 *
 * @example Inline (uncontained)
 * ```tsx
 * <SelectableButton contained={false} attention="low">Bookmark</SelectableButton>
 * ```
 */

'use client';

import React from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import clsx from 'clsx';
import styles from './SelectableButton.module.css';
import {
  SelectableButtonProps,
  SelectableButtonAppearance,
  useSelectableButtonState,
} from './SelectableButton.shared';
import { explicitAppearanceClass, makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';

const appearanceClassMap = makeAppearanceClassMap(styles);

export const SelectableButton = React.forwardRef<HTMLButtonElement, SelectableButtonProps>(function SelectableButton(
  {
    children,
    size,
    attention,
    appearance,
    selected,
    defaultSelected = true,
    onSelectedChange,
    value,
    contained,
    condensed,
    fullWidth,
    disabled,
    loading,
    start,
    end,
    'aria-label': ariaLabel,
    className: classNameProp,
    style: styleProp,
  },
  ref,
) {
    const { isDisabled, resolvedAppearance, inheritedFromSurface, dataAttrs } = useSelectableButtonState({
      size,
      attention,
      appearance,
      contained,
      condensed,
      disabled,
      loading,
    });

    // Dev-mode warning for missing accessible label
    if (process.env.NODE_ENV !== 'production' && !ariaLabel && !children) {
      console.warn(
        'SelectableButton: an `aria-label` prop is recommended when SelectableButton has no visible text content.',
      );
    }

    const isContained = contained !== false;

    const appearanceClassName = explicitAppearanceClass(
      appearance,
      resolvedAppearance,
      appearanceClassMap,
      inheritedFromSurface,
    );

    const className = clsx(
      styles.selectableButton,
      appearanceClassName,
      { [styles.fullWidth]: fullWidth && isContained },
      classNameProp,
    );

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
        {...dataAttrs}
      >
        {start && (
          <span className={styles.start}>
            <SlotParentAppearanceProvider value={resolvedAppearance}>{start}</SlotParentAppearanceProvider>
          </span>
        )}
        {children && <span className={styles.label}>{children}</span>}
        {end && (
          <span className={styles.end}>
            <SlotParentAppearanceProvider value={resolvedAppearance}>{end}</SlotParentAppearanceProvider>
          </span>
        )}
      </BaseToggle>
    );
});

SelectableButton.displayName = 'SelectableButton';
