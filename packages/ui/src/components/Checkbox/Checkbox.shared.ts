/**
 * Checkbox.shared.ts
 * Shared types and hooks for Checkbox component
 * Used by both web and React Native implementations
 *
 * Architecture:
 * - `appearance` controls ALL tokens (border, hover/context, and checked fill).
 * - `appearance="auto"` resolves to the **secondary** role for the full stack.
 *
 * Base UI integration:
 * - Checkbox supports `disabled` and `readOnly` as separate props
 * - `readOnly` keeps the element focusable but prevents value changes
 * - `disabled` makes the element completely non-interactive
 */

import type { CSSProperties, ReactNode } from 'react';
import type { InputLabelSize } from '../Input/Input.shared';
import type { ComponentAppearance } from '@oneui/shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type CheckboxAppearance = ComponentAppearance;

/** @deprecated Ignored at runtime — use `appearance` for colour. Kept for backward-compatible call sites. */
export type CheckboxAccent = 'primary' | 'secondary' | 'sparkle';

/**
 * Checkbox sizes aligned with Figma spec: S, M, L.
 * Legacy 'small'/'medium'/'large' aliases accepted but deprecated.
 */
export type CheckboxSize = 's' | 'm' | 'l' | 'small' | 'medium' | 'large';

/** Map legacy t-shirt aliases to canonical short names */
const SIZE_ALIASES: Record<string, string> = {
  small: 's',
  medium: 'm',
  large: 'l',
};

/** Resolve any CheckboxSize to canonical 's' | 'm' | 'l' */
export function resolveSize(size: CheckboxSize): string {
  return SIZE_ALIASES[size] ?? size;
}

/** Map Checkbox S/M/L to field label stack header tier (same as `Input` size → label). */
export function checkboxSizeToLabelSize(size: CheckboxSize): InputLabelSize {
  const s = resolveSize(size) as 's' | 'm' | 'l';
  if (s === 's' || s === 'm' || s === 'l') return s;
  return 'm';
}

export interface CheckboxProps {
  /**
   * Render inside `Field.Root` (CheckboxField) or standalone.
   * @default 'native'
   * @internal Used by CheckboxField — standalone callers should not set this.
   */
  labelAssociation?: 'native' | 'field';

  /** Visible label beside the control. Maps to `aria-label` when the wrapper is a `div`. */
  label?: string;
  /** Supplementary copy below the label row. Maps to `aria-describedby` on the control. */
  description?: string;

  /**
   * @deprecated Use the `label` prop instead.
   * Inline label content beside the checkbox box — kept for backward-compatible call sites.
   */
  children?: ReactNode;

  /**
   * Accessible label when there is no visible `label` (or when overriding the visible copy).
   * Maps directly to `aria-label` on the underlying checkbox control.
   * When using `CheckboxField`, the visible `Field.Label` provides association
   * automatically — prefer that over `aria-label`.
   */
  'aria-label'?: string;

  /**
   * @internal Merged onto the control `aria-describedby` in `field` mode
   * for auxiliary copy outside `Field.Description`.
   */
  supplementaryDescribedById?: string;

  /**
   * Error-state chrome on the wrapper (from `CheckboxField` when invalid).
   * Standalone `Checkbox` does not use `errorHighlight`; use `CheckboxField` for validation UX.
   */
  errorHighlight?: boolean;
  /** Whether the checkbox is checked (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Whether the checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Size preset. Default: 'm' */
  size?: CheckboxSize;
  /** Appearance role — border, hover, and checked fill. `auto` → secondary stack. */
  appearance?: CheckboxAppearance;
  /** @deprecated Ignored — use `appearance` only. */
  accent?: CheckboxAccent;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is read-only (visually distinct from disabled) */
  readOnly?: boolean;
  /** HTML required — form validation when unchecked */
  required?: boolean;
  /** Field name for form submission */
  name?: string;
  /** Value used when inside a CheckboxGroup */
  value?: string;
  /** HTML id attribute */
  id?: string;
  /**
   * Outer wrapper element. Use `'div'` inside `CheckboxField` (with `Field.Label`)
   * so the visible label is not nested inside a second `<label>`.
   * @default 'label'
   */
  labelWrapper?: 'label' | 'div';
  /** For composite fields — links to `Field.Description` etc. */
  'aria-describedby'?: string;
  /** Invalid state for form validation (exposed on the checkbox control). */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test automation id — forwarded to the checkbox control (`BaseCheckbox.Root`). */
  'data-testid'?: string;
}

export function useCheckboxState(
  props: Pick<CheckboxProps, 'appearance' | 'accent' | 'disabled' | 'readOnly' | 'size'>,
) {
  const isDisabled = props.disabled ?? false;
  const isReadOnly = props.readOnly ?? false;
  const rawAppearance = props.appearance;
  const isAutoAppearance = !rawAppearance || rawAppearance === 'auto';
  /** `auto` → full secondary role stack (border + fill). */
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> = isAutoAppearance
    ? 'secondary'
    : (rawAppearance as Exclude<ComponentAppearance, 'auto'>);
  const resolvedSize = resolveSize(props.size ?? 'm');

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
      ...(isReadOnly && { 'data-readonly': '' }),
    },
  };
}
