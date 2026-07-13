/**
 * Stepper.shared.ts
 * Shared types and hooks for Stepper component
 * Used by both web and React Native implementations
 *
 * Architecture:
 * - `appearance` controls ALL tokens (border + fill) — fill follows appearance by default
 * - `accent` optionally OVERRIDES fill only — for cross-role combinations
 *   e.g. appearance="neutral" + accent="sparkle" = grey context, purple fill
 * - `attention` maps to high/medium/low visual weight (like Button bold/subtle/ghost)
 * - When no accent is set, fill uses the appearance role's tokens
 */

import type {
  CSSProperties,
  ComponentPropsWithRef,
  ReactElement,
  SyntheticEvent,
} from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import type { IconButtonProps } from '../IconButton/IconButton.shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type StepperAppearance = ComponentAppearance;

/** Accent overrides which role's Bold fills the container when at high attention */
export type StepperAccent = 'primary' | 'secondary' | 'sparkle';

/** Attention level controls visual weight (maps to Figma high/medium/low) */
export type StepperAttention = 'high' | 'medium' | 'low';

/** Stepper sizes aligned with Figma spec: S, M, L */
export type StepperSize = 's' | 'm' | 'l';

/** Visual layout direction: LTR = decrement left / increment right; RTL mirrors that order. */
export type StepperDirection = 'ltr' | 'rtl';

/** Custom Stepper controls are intentionally IconButton-only. */
export type StepperControlSlot = ReactElement<IconButtonProps>;

export interface StepperProps {
  // --- Core Value & Constraints (Base UI Standard) ---
  /** Controlled value */
  value?: number | null;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Change handler — Base UI standard signature */
  onChange?: (event: SyntheticEvent | null, value: number | null) => void;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment. Default: 1 */
  step?: number;
  /** Jump by larger amount when holding Shift. Maps to Base UI's largeStep. */
  shiftMultiplier?: number;

  // --- Form & Interaction States ---
  /** Whether the stepper is disabled */
  disabled?: boolean;
  /** Whether the stepper is read-only */
  readOnly?: boolean;
  /** Whether the stepper is in error state */
  error?: boolean;
  /** Whether the field is required */
  required?: boolean;

  // --- Design Tokens ---
  /** Size preset. Default: 'm' */
  size?: StepperSize;
  /** Attention level controls visual weight. Default: 'medium' */
  attention?: StepperAttention;
  /** Multi-accent appearance role. Controls all tokens.
   *  `'auto'` or omit: inherit nearest `<Surface>` effective role (see `useSurfaceAppearance`),
   *  else `'secondary'` when outside any Surface (same pattern as Badge, different root fallback). */
  appearance?: StepperAppearance;
  /** Accent override for fill color at high attention.
   *  When set, overrides the fill from appearance while keeping appearance's context.
   *  When not set, fill follows appearance role. */
  accent?: StepperAccent;
  /** Whether to use condensed height. Default: false */
  condensed?: boolean;
  /** Visual direction. Default: 'ltr' keeps decrement left and increment right; 'rtl' mirrors the visual order. */
  direction?: StepperDirection;

  /**
   * Optional decrement control (left in LTR, right in RTL). Must be a **single `<IconButton />` element**
   * whose root accepts merged props and ref from the NumberField. Uses Base UI
   * `render` on `Decrement`. Omitted: default remove icon. `partProps.decrementButton.render` overrides.
   *
   * **Semantics:** this slot always drives **decrease** behaviour (not “leading” in the abstract).
   */
  start?: StepperControlSlot;
  /**
   * Optional increment control (right in LTR, left in RTL). Same rules as {@link StepperProps.start}.
   * Omitted: default add icon. `partProps.incrementButton.render` overrides.
   *
   * **Semantics:** this slot always drives **increase** behaviour.
   */
  end?: StepperControlSlot;

  // --- Base UI Overrides ---
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Props for internal Base UI parts. Use for primitive-level overrides, not public content slots. */
  partProps?: {
    root?: ComponentPropsWithRef<'div'>;
    input?: ComponentPropsWithRef<'input'>;
    incrementButton?: ComponentPropsWithRef<'button'>;
    decrementButton?: ComponentPropsWithRef<'button'>;
  };

  // --- Testing ---
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Resolve Stepper appearance: explicit role wins; else nearest Surface (web); else secondary.
 * Mirrors Badge's `useBadgeState` pattern with Stepper's `'secondary'` root fallback.
 */
export function resolveStepperAppearance(
  appearance: StepperAppearance | undefined,
  surfaceAppearance: Exclude<StepperAppearance, 'auto'> | null | undefined,
): Exclude<StepperAppearance, 'auto'> {
  if (appearance !== undefined && appearance !== 'auto') {
    return appearance;
  }
  if (surfaceAppearance != null) {
    return surfaceAppearance;
  }
  return 'secondary';
}

/** @internal Props slice for `useStepperState` — web passes `surfaceAppearance` from `useSurfaceAppearance`. */
export type StepperStateInput = StepperProps & {
  surfaceAppearance?: Exclude<StepperAppearance, 'auto'> | null;
};

/**
 * Hook to compute Stepper state from props
 */
export function useStepperState(props: StepperStateInput) {
  const isDisabled = props.disabled ?? false;
  const isReadOnly = props.readOnly ?? false;
  const isError = props.error ?? false;
  const resolvedAppearance = resolveStepperAppearance(props.appearance, props.surfaceAppearance);
  const resolvedSize = props.size ?? 'm';
  const resolvedAttention = props.attention ?? 'medium';
  const resolvedDirection = props.direction ?? 'ltr';
  const isCond = props.condensed ?? false;

  const resolvedAccent = props.accent;

  return {
    isDisabled,
    isReadOnly,
    isError,
    resolvedAppearance,
    resolvedAccent,
    resolvedSize,
    resolvedAttention,
    resolvedDirection,
    isCond,
    dataAttrs: {
      'data-size': resolvedSize,
      'data-attention': resolvedAttention,
      'data-direction': resolvedDirection,
      'data-appearance': resolvedAppearance,
      ...(resolvedAccent && { 'data-accent': resolvedAccent }),
      ...(isCond && { 'data-condensed': '' }),
      ...(isReadOnly && { 'data-readonly': '' }),
      ...(isError && { 'data-error': '' }),
    },
  };
}
