/**
 * InputField.shared.ts
 *
 * Public props for the `InputField` aggregator (cloned from the former `Input/InputField` surface).
 * Core input container props (`InputProps`) live in `../Input/Input.shared`.
 */

import type { ReactNode } from 'react';
import type { InputProps } from '../Input/Input.shared';

/** Props owned by `InputField` composition — not set by consumers on the field API. */
type InputFieldCompositionOmit = 'labelAssociation' | 'labelSuffixInside' | 'labelTrailing' | 'errorHighlight';

export interface InputFieldProps extends Omit<InputProps, InputFieldCompositionOmit> {
  /** Mark the field invalid for `Field.Root` and error chrome on the bordered control. */
  invalid?: boolean;

  /**
   * Label slot — custom node (same `Field.Root`) replacing string `label` / `description` / default info props when set.
   * When set, `label`, `description`, `infoIcon`, and default info props are ignored.
   */
  labelSlot?: ReactNode;
  /** Label text for the field (ignored when `labelSlot` is set) */
  label?: string;
  /** Description text below the label row (ignored when `labelSlot` is set) */
  description?: string;
  /** When true with a string `label`, shows the default info control unless `infoIconSlot` is set. */
  infoIcon?: boolean;
  /** Replaces the default tooltip + info `IconButton` when `infoIcon` is true. */
  infoIconSlot?: ReactNode;
  /** Tooltip content for the default info control. Ignored when `infoIconSlot` is set. */
  infoTooltipContent?: ReactNode;
  /** Accessible name for the default info `IconButton`. Ignored when `infoIconSlot` is set. */
  infoIconAriaLabel?: string;
  /** Stretch to fill container width */
  fullWidth?: boolean;

  // --- Feedback ---
  /** Error message to display (shorthand for InputFeedback variant="negative") */
  error?: string;
  /** Feedback slot — pass `<InputFeedback … />` or leave unset and use `error` string. */
  feedback?: ReactNode;

  // --- Dynamic text row (Figma DynamicText → `InputDynamicText`) ---
  /**
   * Dynamic text row slot — pass `<InputDynamicText … />`.
   * When set, `dynamicText` and `helperButton` are ignored.
   */
  dynamicTextSlot?: ReactNode;
  /** Leading copy (trimmed non-empty string only). Ignored when `dynamicTextSlot` is set. */
  dynamicText?: string;
  /** Trailing action label (trimmed non-empty string only); renders as `Button` attention low + condensed. Ignored when `dynamicTextSlot` is set. */
  helperButton?: string;

  // --- Validation ---
  /** Validation mode */
  validationMode?: 'onBlur' | 'onChange';
  /** Custom validation function */
  validate?: (value: unknown) => string | string[] | null;
}
