/**
 * Switch interface (native)
 *
 * Single source for the native Switch prop contract and state resolver.
 * Mirrors `packages/ui/src/components/Switch/Switch.shared.ts` — no import
 * from `@oneui/ui/components/Switch/` (per native build playbook).
 *
 * Key architecture:
 *   - `appearance` controls the interactive checked fill (auto → secondary)
 *   - Unchecked track = neutral subtle by default (matches web)
 *   - `readOnly` collapses both states to neutral
 *   - Controlled + uncontrolled via `checked` / `defaultChecked`
 *   - Accessibility: `accessibilityRole: 'switch'`, `accessibilityState.checked`
 *
 * Cross-check: Layers `jdsswitch-4/generated/interface.ts`
 */

import { useState } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type SwitchAppearance = ComponentAppearance;

/** Accent override for the checked-state fill only. */
export type SwitchAccent = 'primary' | 'secondary' | 'sparkle';

/**
 * Switch sizes: S, M (default), L.
 */
export type SwitchSize = 's' | 'm' | 'l';

/** Resolve a `SwitchSize` to its canonical `'s' | 'm' | 'l'` value. */
export function resolveSize(size: SwitchSize): 's' | 'm' | 'l' {
  return size;
}

export interface SwitchProps {
  /** Whether the switch is on (controlled). */
  checked?: boolean;
  /** Default state (uncontrolled). */
  defaultChecked?: boolean;
  /** Change handler — fires with the next checked value. */
  onCheckedChange?: (checked: boolean) => void;
  /** Size preset. Default: `'m'`. */
  size?: SwitchSize;
  /**
   * Multi-accent appearance role.
   * Checked fill uses explicit role; `auto`/unset → secondary.
   * ReadOnly forces neutral in both states.
   */
  appearance?: SwitchAppearance;
  /**
   * Accent override for selected fill color.
   * When set, overrides the fill from appearance while keeping appearance's context.
   */
  accent?: SwitchAccent;
  /** Whether the switch is disabled (non-interactive, dimmed). */
  disabled?: boolean;
  /** Whether the switch is read-only (visually distinct from disabled). */
  readOnly?: boolean;
  /** Field name — for form integration on native (forwarded to form library if needed). */
  name?: string;
  /** Label text alongside the switch. */
  children?: string;
  /** Accessible name when there is no `children` label. */
  'aria-label'?: string;
  /** Describes the result of toggling (React Native). */
  accessibilityHint?: string;
  /** Hide the switch from the accessibility tree. */
  'aria-hidden'?: boolean;
  /** Inline native styles on the wrapper. */
  style?: ViewStyle;
  /** React Native test identifier — forwarded to the Pressable. */
  testID?: string;
}

/**
 * Resolve a `SwitchProps` shape into the runtime decisions used by
 * `Switch.native.tsx`. Mirrors `useSwitchState` in `Switch.shared.ts`.
 */
export function useSwitchState(
  props: Pick<
    SwitchProps,
    | 'appearance'
    | 'accent'
    | 'disabled'
    | 'readOnly'
    | 'size'
    | 'checked'
    | 'defaultChecked'
    | 'children'
    | 'aria-label'
    | 'onCheckedChange'
  >,
): {
  isDisabled: boolean;
  isReadOnly: boolean;
  resolvedAppearance: Exclude<ComponentAppearance, 'auto'>;
  resolvedAccent: SwitchAccent | undefined;
  resolvedSize: 's' | 'm' | 'l';
  isControlled: boolean;
  /** checked value for controlled usage (undefined if uncontrolled) */
  controlledChecked: boolean | undefined;
} {
  const isDisabled = props.disabled ?? false;
  const isReadOnly = props.readOnly ?? false;
  const rawAppearance = props.appearance;
  const isAutoAppearance = !rawAppearance || rawAppearance === 'auto';
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> = isAutoAppearance
    ? 'secondary'
    : (rawAppearance as Exclude<ComponentAppearance, 'auto'>);
  const resolvedSize = resolveSize(props.size ?? 'm');
  const resolvedAccent = isReadOnly ? undefined : props.accent;
  const isControlled = props.checked !== undefined;

  return {
    isDisabled,
    isReadOnly,
    resolvedAppearance,
    resolvedAccent,
    resolvedSize,
    isControlled,
    controlledChecked: isControlled ? props.checked : undefined,
  };
}

/**
 * Map `SwitchProps` to React Native accessibility props.
 * Switch uses `accessibilityRole: 'switch'` with `accessibilityState.checked`.
 */
export function getSwitchAccessibilityProps(
  props: Pick<
    SwitchProps,
    | 'aria-label'
    | 'aria-hidden'
    | 'accessibilityHint'
    | 'children'
  >,
  state: {
    isDisabled: boolean;
    isReadOnly: boolean;
    isChecked: boolean;
  },
): {
  accessible: boolean;
  focusable?: boolean;
  accessibilityRole: 'switch';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: {
    disabled: boolean;
    checked: boolean;
  };
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  'aria-disabled'?: boolean;
  'aria-readonly'?: boolean;
} {
  const ariaHidden = props['aria-hidden'] === true;
  const accessibilityLabel =
    props['aria-label'] ?? (typeof props.children === 'string' ? props.children : undefined);

  return {
    accessible: !ariaHidden,
    focusable: !ariaHidden,
    accessibilityRole: 'switch',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      disabled: state.isDisabled || state.isReadOnly,
      checked: state.isChecked,
    },
    accessibilityElementsHidden: ariaHidden,
    importantForAccessibility: ariaHidden ? 'no-hide-descendants' : undefined,
    'aria-disabled': state.isDisabled || undefined,
    'aria-readonly': state.isReadOnly || undefined,
  };
}
