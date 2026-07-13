'use client';

/**
 * Radio.shared.ts
 * Shared types and hooks for Radio/RadioGroup component
 * Used by both web and React Native implementations
 *
 * Architecture:
 * - `appearance` controls ALL tokens (border, hover/context, and checked-state fill).
 * - `appearance="auto"` resolves to the **secondary** role for the full stack.
 *
 * Base UI integration:
 * - Radio.Root supports `disabled` and `readOnly` as separate props
 * - `readOnly` keeps the element focusable but prevents value changes
 * - `disabled` makes the element completely non-interactive
 */

'use client';

import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import type { InputLabelSize } from '../Input/Input.shared';
import type { ComponentAppearance } from '@oneui/shared';

/** @deprecated Ignored at runtime — use `appearance` for colour. Kept for backward-compatible call sites. */
export type RadioAccent = 'primary' | 'secondary' | 'sparkle';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type RadioAppearance = ComponentAppearance;

/** Radio sizes aligned with Figma spec: S, M, L. */
export type RadioSize = 's' | 'm' | 'l';

const VALID_SIZES: ReadonlySet<RadioSize> = new Set(['s', 'm', 'l']);

/** Normalise `RadioSize`; unknown values default to `'m'`. */
export function resolveSize(size: RadioSize): RadioSize {
  return VALID_SIZES.has(size) ? size : 'm';
}

/** Map Radio S/M/L to field label stack header tier (same as `Input` / `Checkbox`). */
export function radioSizeToLabelSize(size: RadioSize | undefined): InputLabelSize {
  return resolveSize(size ?? 'm');
}

export interface RadioGroupProps {
  /** Radio items */
  children: ReactNode;
  /** Selected value (controlled) */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Called when value changes */
  onValueChange?: (value: string) => void;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Whether the group is read-only (focusable but value cannot change) */
  readOnly?: boolean;
  /** Field name for form submission */
  name?: string;
  /** Size preset for all children. Default: 'm' */
  size?: RadioSize;
  /** Multi-accent appearance role for all children. */
  appearance?: RadioAppearance;
  /** @deprecated Ignored — use `appearance` only. */
  accent?: RadioAccent;
  /** Layout orientation. Default: 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Accessible label */
  'aria-label'?: string;
  /** Optional description id(s) for the radiogroup (e.g. field description). */
  'aria-describedby'?: string;
  /** When true, the group root does not apply the default flex layout (use with `display: contents` class for grid embedding). */
  omitLayoutWrapper?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export interface RadioProps {
  /**
   * Render inside `Field.Root` (RadioField) or standalone.
   * @default 'native'
   * @internal Used by RadioField — standalone callers should not set this.
   */
  labelAssociation?: 'native' | 'field';

  /** Visible label beside the control. Maps to `aria-label` when the wrapper is a `div`. */
  label?: string;
  /** Supplementary copy below the label row. Maps to `aria-describedby` on the control. */
  description?: string;

  /**
   * @deprecated Use the `label` prop instead.
   * Inline label content beside the radio control — kept for backward-compatible call sites.
   */
  children?: ReactNode;

  /**
   * Accessible label when there is no visible `label` (or when overriding the visible copy).
   * Maps directly to `aria-label` on the underlying radio control.
   */
  'aria-label'?: string;

  /**
   * @internal Merged onto the control `aria-describedby` in `field` mode
   * for auxiliary copy outside `Field.Description`.
   */
  supplementaryDescribedById?: string;

  /**
   * Error-state chrome on the wrapper (from `RadioField` when invalid).
   * Standalone `Radio` does not use `errorHighlight`; use `RadioField` for validation UX.
   */
  errorHighlight?: boolean;
  /** Value for this radio item (required) */
  value: string;
  /**
   * Whether this option is selected. Selection is owned by the parent **`RadioGroup`** via `value` /
   * `defaultValue` matching this `value`. This prop is accepted for tooling (e.g. Storybook) and
   * is **not** forwarded to the underlying primitive.
   */
  checked?: boolean;
  /** Whether this radio is disabled */
  disabled?: boolean;
  /** Whether this radio is read-only (focusable but value cannot change) */
  readOnly?: boolean;
  /** HTML required — form validation */
  required?: boolean;
  /** Size preset. Default: 'm' */
  size?: RadioSize;
  /** Multi-accent appearance role. Controls border, hover, AND fill tokens. `auto` → secondary stack. */
  appearance?: RadioAppearance;
  /** @deprecated Ignored — use `appearance` only. */
  accent?: RadioAccent;
  /** HTML id attribute */
  id?: string;
  /**
   * Outer wrapper element. Use `'div'` inside a field composition so the visible label is not
   * nested inside a second `<label>`.
   * @default 'label'
   */
  labelWrapper?: 'label' | 'div';
  /**
   * When set, names the control via `aria-labelledby` (e.g. `RadioField` single-option layout
   * where the visible label lives on the field, not on this `Radio`).
   */
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test automation id — forwarded to the radio control (`BaseRadio.Root`). */
  'data-testid'?: string;
}

/** Context passed from RadioGroup to child Radio items */
export interface RadioGroupContextValue {
  appearance?: RadioAppearance;
  size?: RadioSize;
  disabled?: boolean;
  readOnly?: boolean;
}

export const RadioGroupContext = createContext<RadioGroupContextValue>({});

export function useRadioGroupContext(): RadioGroupContextValue {
  return useContext(RadioGroupContext);
}

export function useRadioState(props: RadioProps, groupCtx?: RadioGroupContextValue) {
  const ctx = groupCtx ?? {};
  const isDisabled = props.disabled ?? ctx.disabled ?? false;
  const isReadOnly = props.readOnly ?? ctx.readOnly ?? false;

  const rawAppearance = props.appearance ?? ctx.appearance;
  const isAutoAppearance = !rawAppearance || rawAppearance === 'auto';
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> = isAutoAppearance
    ? 'secondary'
    : (rawAppearance as Exclude<ComponentAppearance, 'auto'>);
  const resolvedSize = resolveSize(props.size ?? ctx.size ?? 'm');

  return {
    isDisabled,
    isReadOnly,
    resolvedAppearance,
    resolvedSize,
    ariaProps: {
      'aria-disabled': isDisabled || undefined,
      ...(isReadOnly && { 'aria-readonly': true as const }),
    },
    dataAttrs: {
      'data-size': resolvedSize,
      'data-appearance': resolvedAppearance,
      ...(isReadOnly && { 'data-readonly': '' as const }),
    },
  };
}