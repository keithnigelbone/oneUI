/**
 * SelectableSingleTextButton.tsx
 * React (web) implementation using Base UI Toggle
 *
 * Key features:
 * - Uses @base-ui/react/toggle primitive (same as SelectableButton and Chip)
 * - Single text toggle button — max 2 characters (e.g. "Ag", "En", "A")
 * - Renders as a circular button (aspect-ratio: 1); shape customisable per brand
 * - 3 sizes (S/M/L)
 * - Unselected state is always muted ghost regardless of attention level
 * - Selected appearance driven by `attention` prop:
 *   - high  → bold fill (fg-bold bg, on-bold-high text)
 *   - medium → subtle fill (bg-subtle bg, accent text)
 *   - low   → ghost with accent border
 * - Loading state: shows circular spinner replacing text
 * - Token-only styling in CSS Module (zero literals)
 * - WCAG AA accessible via Base UI Toggle (aria-pressed, keyboard toggle)
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 *
 * @example Basic toggle
 * ```tsx
 * <SelectableSingleTextButton>Ag</SelectableSingleTextButton>
 * <SelectableSingleTextButton attention="medium" defaultSelected>En</SelectableSingleTextButton>
 * ```
 *
 * @example Language selector
 * ```tsx
 * const [active, setActive] = useState(false);
 * <SelectableSingleTextButton selected={active} onSelectedChange={setActive}>
 *   Hi
 * </SelectableSingleTextButton>
 * ```
 */

'use client';

import React from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import clsx from 'clsx';
import styles from './SelectableSingleTextButton.module.css';
import {
  SelectableSingleTextButtonProps,
  SelectableSingleTextButtonAppearance,
  SelectableSingleTextButtonSize,
  useSelectableSingleTextButtonState,
} from './SelectableSingleTextButton.shared';
import { explicitAppearanceClass, makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '../CircularProgressIndicator';

const SPINNER_SIZE_MAP: Record<SelectableSingleTextButtonSize, CircularProgressIndicatorSize> = {
  s: 'S',
  m: 'M',
  l: 'L',
};

const appearanceClassMap = makeAppearanceClassMap(styles);

export const SelectableSingleTextButton = React.forwardRef<HTMLButtonElement, SelectableSingleTextButtonProps>(function SelectableSingleTextButton(
  {
    children,
    size,
    attention,
    appearance,
    selected,
    defaultSelected,
    onSelectedChange,
    value,
    condensed,
    fullWidth,
    disabled,
    loading,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    className: classNameProp,
    style: styleProp,
  },
  ref,
) {
  const { isDisabled, resolvedAppearance, inheritedFromSurface, dataAttrs } =
    useSelectableSingleTextButtonState({
      children,
      size,
      attention,
      appearance,
      condensed,
      disabled,
      loading,
    });

  // Enforce max 2 characters — this component is circular and designed for 1-2 chars
  const text = typeof children === 'string' ? children : children;
  if (process.env.NODE_ENV !== 'production' && typeof children === 'string' && children.length > 2) {
    console.warn(
      `SelectableSingleTextButton: children "${children}" exceeds 2 characters. This component is designed for 1-2 character labels (e.g. "Ag", "En"). Text will be truncated.`,
    );
  }
  const truncatedChildren = typeof text === 'string' && text.length > 2
    ? text.slice(0, 2)
    : text;

  const appearanceClassName = explicitAppearanceClass(
    appearance,
    resolvedAppearance,
    appearanceClassMap,
    inheritedFromSurface,
  );

  const className = clsx(
    styles.selectableSingleTextButton,
    appearanceClassName,
    { [styles.fullWidth]: fullWidth },
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
      aria-busy={loading || undefined}
      data-testid={dataTestId}
      {...dataAttrs}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true">
          <CircularProgressIndicator
            variant="indeterminate"
            size={SPINNER_SIZE_MAP[(size ?? 'm') as SelectableSingleTextButtonSize]}
            appearance={resolvedAppearance as CircularProgressIndicatorAppearance}
            aria-label="Loading"
          />
        </span>
      ) : (
        <span className={styles.label}>{truncatedChildren}</span>
      )}
    </BaseToggle>
  );
});

SelectableSingleTextButton.displayName = 'SelectableSingleTextButton';
