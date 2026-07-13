/**
 * Switch.tsx
 * React (web) implementation using Base UI Switch
 *
 * Key features:
 * - Uses @base-ui/react Switch primitive (never fork)
 * - Token-only styling in CSS Module
 * - Interactive checked: explicit appearance → secondary
 * - Interactive unchecked: parent Surface appearance → neutral
 * - ReadOnly: neutral in both states
 * - Accent optionally overrides fill only (for cross-role combinations)
 * - 3 sizes (S/M/L) aligned with Figma spec
 * - Multi-accent appearance roles (all 9 V4 roles)
 * - ReadOnly: unchecked = neutral outline + role dot (`--_sw-readonly-ink`; primary/neutral prefer Bold so the dot stays visible on white inside neutral Surface); checked matches interactive
 * - Focus ring always uses Informative token (per Figma spec)
 * - Interactive shape = Pill (track + thumb)
 * - WCAG AA accessible
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 */

import React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import styles from './Switch.module.css';
import { type SwitchProps, type SwitchAppearance, useSwitchState } from './Switch.shared';
import {
  makeAppearanceClassMap,
  makeAccentClassMap,
} from '../_shared/appearanceClasses';
import { useSurfaceAppearance } from '../Surface/Surface';

const APPEARANCE_CLASSES = makeAppearanceClassMap(styles);

const ACCENT_CLASSES = makeAccentClassMap(styles);

type ResolvedSwitchAppearance = Exclude<SwitchAppearance, 'auto'>;

function explicitSwitchAppearance(
  appearance: SwitchAppearance | undefined,
): ResolvedSwitchAppearance | null {
  if (!appearance || appearance === 'auto') return null;
  return appearance;
}

export const Switch: React.FC<SwitchProps> = ({
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  size = 'm',
  appearance,
  accent,
  disabled,
  readOnly,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className: classNameProp,
  style,
  'data-testid': dataTestId,
}) => {
  const {
    isDisabled,
    isReadOnly,
    resolvedAppearance,
    resolvedAccent,
    resolvedSize,
    ariaProps,
    dataAttrs,
  } = useSwitchState({
    appearance,
    accent,
    disabled,
    readOnly,
    size,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  });

  const surfaceAppearance = useSurfaceAppearance();
  const explicitAppearance = explicitSwitchAppearance(appearance);
  const checkedAppearance: ResolvedSwitchAppearance = isReadOnly
    ? 'neutral'
    : explicitAppearance ?? (resolvedAppearance as ResolvedSwitchAppearance);
  const uncheckedAppearance: ResolvedSwitchAppearance = isReadOnly
    ? 'neutral'
    : surfaceAppearance ?? 'neutral';

  // Accent class only applied when accent prop is explicitly set.
  // When not set, fill follows appearance via CSS cascade.
  const accentClass = resolvedAccent && !isReadOnly ? ACCENT_CLASSES[resolvedAccent] : undefined;
  const appearanceClass = APPEARANCE_CLASSES[checkedAppearance];

  const switchClassName = [
    styles.switch,
    appearanceClass,
    accentClass,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClassName = [
    styles.wrapper,
    classNameProp,
  ]
    .filter(Boolean)
    .join(' ');

  const switchDataAttrs = {
    ...dataAttrs,
    'data-accent': resolvedAccent && !isReadOnly ? resolvedAccent : undefined,
    'data-appearance': checkedAppearance,
    'data-checked-appearance': checkedAppearance,
    'data-unchecked-appearance': uncheckedAppearance,
  };

  return (
    <label
      className={wrapperClassName}
      style={style}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-size={resolvedSize}
    >
      <BaseSwitch.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={isReadOnly ? undefined : onCheckedChange}
        disabled={isDisabled}
        name={name}
        className={switchClassName}
        {...(dataTestId ? { 'data-testid': dataTestId } : {})}
        {...ariaProps}
        {...switchDataAttrs}
      >
        <BaseSwitch.Thumb className={styles.thumb} />
      </BaseSwitch.Root>
      {children && <span className={styles.label}>{children}</span>}
    </label>
  );
};
