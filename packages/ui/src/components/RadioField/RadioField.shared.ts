/**
 * RadioField.shared.ts
 *
 * - **Integrated single** (no `children`, string `label`): implicit lone **Radio** beside the field
 *   label / description (same a11y pattern as **CheckboxField**). Use `checked` / `defaultChecked` /
 *   `onCheckedChange` for on/off, or `value` / `defaultValue` / `onValueChange` with `singleOptionValue`.
 * - **Multiple options** (two+ **Radio** children): field `label` / `description` above the list;
 *   `feedback` after options.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { RadioGroupProps, RadioSize } from '../Radio/Radio.shared';
import { resolveSize } from '../Radio/Radio.shared';

/** Map Radio S/M/L to Input f-step sizes for `InputFeedback`. */
export function radioFieldSizeToInputNumeric(size?: RadioSize): 8 | 10 | 12 {
  const s = resolveSize(size ?? 'm');
  if (s === 's') return 8;
  if (s === 'l') return 12;
  return 10;
}

/** Group props not surfaced on `RadioField` — colour is `appearance` only (no `accent`). */
type RadioFieldGroupOmit = 'children' | 'accent' | 'aria-label';

export interface RadioFieldProps extends Omit<RadioGroupProps, RadioFieldGroupOmit> {
  /** `Radio` options. Omit for integrated single-option field (label + implicit control). */
  children?: ReactNode;

  /** Mark the field invalid for `Field.Root`. */
  invalid?: boolean;

  label?: string;
  description?: string;
  /** Trailing control beside the label (custom info trigger or `InputFieldDefaultInfo`). */
  infoIconSlot?: ReactNode;
  fullWidth?: boolean;

  error?: string;
  feedback?: ReactNode;

  validationMode?: 'onBlur' | 'onChange';
  validate?: (value: unknown) => string | string[] | null;

  /** When true with a string `label`, shows the required asterisk in the label row. */
  required?: boolean;

  /**
   * Integrated single mode only — controlled on/off (`true` = selected `singleOptionValue`).
   * Prefer `value` / `onValueChange` when you need the string value directly.
   */
  checked?: boolean;
  /**
   * Integrated single mode only — uncontrolled default on/off.
   * When set, overrides `defaultValue` for the implicit lone option unless `value` is controlled.
   */
  defaultChecked?: boolean;
  /** Integrated single mode — fired when the lone option toggles (in addition to `onValueChange`). */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Form value for the implicit lone **Radio** when `children` is omitted (default `'on'`).
   * Group is “on” when `value === singleOptionValue`, “off” when `value === ''`.
   */
  singleOptionValue?: string;

  /** When there is no string `label`, sets the radiogroup accessible name. */
  'aria-label'?: string;

  className?: string;
  style?: CSSProperties;
}
