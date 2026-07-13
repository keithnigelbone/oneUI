/**
 * Switch.shared.ts
 * Shared types and hooks for Switch component
 * Used by both web and React Native implementations
 *
 * Architecture:
 * - `appearance` controls the interactive checked fill
 * - Interactive unchecked rail resolves from parent Surface appearance, then neutral
 * - ReadOnly forces both visual states to neutral
 * - `accent` optionally OVERRIDES fill only — for cross-role combinations
 *   e.g. appearance="neutral" + accent="sparkle" = grey context, purple fill
 * - When no accent is set, checked fill uses the appearance role's Bold
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type SwitchAppearance = ComponentAppearance;

/** Accent overrides which role's Bold fills the track when selected */
export type SwitchAccent = 'primary' | 'secondary' | 'sparkle';

/**
 * Switch sizes aligned with Figma spec: S, M, L.
 */
export type SwitchSize = 's' | 'm' | 'l';

/** Resolve a SwitchSize to its canonical 's' | 'm' | 'l' value. */
export function resolveSize(size: SwitchSize): SwitchSize {
  return size;
}

export interface SwitchProps {
  /** Label text */
  children?: ReactNode;
  /** Whether the switch is on (controlled) */
  checked?: boolean;
  /** Default state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Size preset. Default: 'm' */
  size?: SwitchSize;
  /** Multi-accent appearance role.
   *  Interactive checked: explicit role wins; 'auto'/unset resolves to secondary.
   *  Interactive unchecked: ignores this prop and uses nearest Surface appearance, then neutral.
   *  ReadOnly: neutral in both visual states. */
  appearance?: SwitchAppearance;
  /** Accent override for selected fill color.
   *  When set, overrides the fill from appearance while keeping appearance's border/context.
   *  When not set, fill follows appearance role. */
  accent?: SwitchAccent;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Whether the switch is read-only (visually distinct from disabled) */
  readOnly?: boolean;
  /** Field name for form submission */
  name?: string;
  /** HTML id attribute */
  id?: string;
  /** Accessible label for switches without a text child. */
  'aria-label'?: string;
  /** ID of an element that labels the switch. */
  'aria-labelledby'?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Stable anchor for QA / e2e — forwarded to the root switch control only (not the label wrapper). */
  'data-testid'?: string;
}

export function useSwitchState(props: SwitchProps) {
  const isDisabled = props.disabled || props.readOnly;
  const isReadOnly = props.readOnly ?? false;
  const isAutoAppearance = !props.appearance || props.appearance === 'auto';
  // auto → 'secondary'. The web wrapper keeps checked on this role while
  // allowing unchecked to inherit parent Surface appearance.
  const resolvedAppearance = isAutoAppearance ? 'secondary' : props.appearance;
  const resolvedSize = resolveSize(props.size ?? 'm');

  const resolvedAccent = props.accent;

  return {
    isDisabled,
    isReadOnly,
    resolvedAppearance,
    resolvedAccent,
    resolvedSize,
    ariaProps: {
      'aria-disabled': isDisabled || undefined,
      'aria-label':
        props['aria-label'] ??
        (typeof props.children === 'string' ? props.children : undefined),
      'aria-labelledby': props['aria-labelledby'],
      ...(isReadOnly && { 'aria-readonly': true as const }),
    },
    dataAttrs: {
      'data-size': resolvedSize,
      'data-appearance': resolvedAppearance,
      ...(resolvedAccent && { 'data-accent': resolvedAccent }),
      ...(isReadOnly && { 'data-readonly': '' }),
    },
  };
}
