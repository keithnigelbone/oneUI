/**
 * CheckboxField.shared.ts
 *
 * - **Single field** (no `children`): integrated **Checkbox** with field `label` / `description`,
 *   then `InputFeedback`.
 * - **Multi-option** (`children`): `CheckboxGroup` of standalone **Checkbox** items; string
 *   `label` / `description` render as a field header (`fieldset` + legend when labelled), then
 *   options, then feedback and dynamic rows.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { CheckboxProps } from '../Checkbox/Checkbox.shared';
import type { CheckboxGroupProps } from '../CheckboxGroup/CheckboxGroup.shared';
import { resolveSize as resolveCheckboxSize } from '../Checkbox/Checkbox.shared';

/** Map CheckboxField S/M/L to Input f-step sizes (8 / 10 / 12) for `InputFeedback` sizing. */
export function checkboxFieldSizeToInputNumeric(size?: CheckboxProps['size']): 8 | 10 | 12 {
  const s = resolveCheckboxSize(size ?? 'm');
  if (s === 's') return 8;
  if (s === 'l') return 12;
  return 10;
}

/** Props owned by `CheckboxField` — not passed through to the inner `Checkbox`. */
type CheckboxFieldCompositionOmit =
  | 'labelAssociation'
  | 'labelSuffixInside'
  | 'labelTrailing'
  | 'errorHighlight'
  | 'label'
  | 'description'
  | 'children'
  | 'supplementaryDescribedById'
  /** Colour comes from `appearance` only on the field shell. */
  | 'accent';

export interface CheckboxFieldProps extends Omit<CheckboxProps, CheckboxFieldCompositionOmit> {
  /**
   * Multiple standalone **Checkbox** options.
   * When set, `label` / `description` render as the field header above the list; `feedback` and
   * Omit for a single integrated field
   * (label and description beside the control per Figma).
   */
  children?: ReactNode;

  /** Multi-option checked values (controlled). Use with `children`. */
  groupValue?: CheckboxGroupProps['value'];
  /** Multi-option default checked values (uncontrolled). Use with `children`. */
  groupDefaultValue?: CheckboxGroupProps['defaultValue'];
  /** Multi-option change handler. Use with `children`. */
  onGroupValueChange?: CheckboxGroupProps['onValueChange'];
  /** Mark the field invalid for `Field.Root` and error chrome on the checkbox wrapper. */
  invalid?: boolean;

  /** Label text for the field header (multi-option) or integrated checkbox label (single). */
  label?: string;
  /** Description below the label row. */
  description?: string;
  /** Trailing control beside the label (e.g. custom info `IconButton`, menu, or `InputFieldDefaultInfo`). */
  infoIconSlot?: ReactNode;
  /** Stretch to fill container width. */
  fullWidth?: boolean;

  /** Error message (shorthand for `InputFeedback` variant negative). */
  error?: string;
  /** Feedback slot — pass `<InputFeedback … />` or use `error` string. */
  feedback?: ReactNode;

  /** Validation mode for `Field.Root`. */
  validationMode?: 'onBlur' | 'onChange';
  /** Custom validation — return message(s) or null. */
  validate?: (value: unknown) => string | string[] | null;

  className?: string;
  style?: CSSProperties;
}
