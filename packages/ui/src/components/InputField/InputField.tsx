/**
 * InputField.tsx
 *
 * Top-level field: `Field.Root` + label stack + **Input** (bordered control + slots),
 * then feedback and dynamic text.
 *
 * Label stack (Field.Label + Field.Description) is owned by InputField — the
 * standalone `Input` component has no label/description API.
 *
 * Figma: `.DNA/InputField` (4298:6330) — stack gap `--Spacing-1-5`;
 * order: label → input → feedback → dynamic row.
 */

import React from 'react';
import { Field } from '@base-ui/react/field';
import clsx from 'clsx';
import fieldStyles from './InputField.module.css';
import { Input } from '../Input/Input';
import type { InputFieldProps } from './InputField.shared';
import { resolveFeedbackSize, inputSizeToLabelSize, type InputFeedbackSize } from '../Input/Input.shared';
import labelStyles from '../Input/internals/FieldLabelStack.module.css';
import { InputFeedback, InputDynamicText } from '../Input/internals';
import { InputFieldDefaultInfo } from './InputFieldDefaultInfo';

function isNonEmptyTrimmed(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  {
    labelSlot,
    label,
    description,
    infoIcon,
    infoIconSlot,
    infoTooltipContent,
    infoIconAriaLabel = 'More information',
    fullWidth,
    error,
    feedback,
    dynamicTextSlot,
    dynamicText,
    helperButton,
    validationMode,
    validate,
    size = 10,
    appearance,
    shape = 'default',
    attention = 'medium',
    start,
    start2,
    end,
    end2,
    placeholder,
    value,
    defaultValue,
    onChange,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    type = 'text',
    onKeyDown,
    onBlur,
    onFocus,
    id,
    autoComplete,
    autoFocus,
    maxLength,
    decorative,
    className,
    style,
    'data-testid': dataTestId,
  },
  ref,
) {
  const isInvalid = invalid || !!error;
  const labelTier = inputSizeToLabelSize(size);

  const startContent = start;
  const start2Content = start2;
  const endContent = end;
  const end2Content = end2;

  const outerClassName = clsx(fieldStyles.field, fullWidth && fieldStyles.fullWidth, className);

  const feedbackContent =
    feedback ??
    (error ? (
      <InputFeedback
        variant="negative"
        attention="low"
        size={resolveFeedbackSize(size as InputFeedbackSize)}
        feedback_message={error}
      />
    ) : null);

  const dynamicContent =
    dynamicText != null && dynamicText.trim() !== '' ? dynamicText : undefined;
  const dynamicEnd =
    helperButton != null && helperButton.trim() !== '' ? helperButton : undefined;
  const hasDynamicStrings = dynamicContent != null || dynamicEnd != null;
  const dynamicRow =
    dynamicTextSlot ??
    (hasDynamicStrings ? (
      <InputDynamicText
        content={dynamicContent}
        end={dynamicEnd}
        size={labelTier}
        disabled={disabled}
      />
    ) : null);

  const hasLabelHeader = isNonEmptyTrimmed(label);
  const hasDescriptionHeader = isNonEmptyTrimmed(description);

  const labelSuffixInside =
    required && hasLabelHeader ? (
      <span className={labelStyles.asterisk} aria-hidden="true">
        *
      </span>
    ) : undefined;

  const labelTrailing =
    infoIcon && hasLabelHeader
      ? (infoIconSlot ?? (
          <InputFieldDefaultInfo
            disabled={disabled}
            ariaLabel={infoIconAriaLabel}
            tooltipContent={
              infoTooltipContent ??
              'Additional help for this field. Pass infoTooltipContent on InputField to customize.'
            }
            labelSize={labelTier}
          />
        ))
      : undefined;

  const labelRow =
    hasLabelHeader || labelTrailing ? (
      <div className={labelStyles.labelRow}>
        {hasLabelHeader ? (
          <Field.Label className={labelStyles.label} data-disabled={disabled || undefined}>
            {label!.trim()}
            {labelSuffixInside}
          </Field.Label>
        ) : null}
        {labelTrailing ? <span className={labelStyles.labelTrailing}>{labelTrailing}</span> : null}
      </div>
    ) : null;

  const descriptionBlock = hasDescriptionHeader ? (
    <Field.Description
      className={labelStyles.description}
      data-disabled={disabled || undefined}
    >
      {description!.trim()}
    </Field.Description>
  ) : null;

  const hasLabelStack = hasLabelHeader || hasDescriptionHeader || !!labelTrailing;

  const labelStack = hasLabelStack ? (
    <div
      className={labelStyles.root}
      data-size={labelTier}
      data-disabled={disabled || undefined}
    >
      {labelRow}
      {descriptionBlock}
    </div>
  ) : null;

  const inputCommon = {
    size,
    appearance,
    shape,
    attention,
    start: startContent,
    start2: start2Content,
    end: endContent,
    end2: end2Content,
    placeholder,
    value,
    defaultValue,
    onChange,
    disabled,
    readOnly,
    required,
    name,
    type,
    onKeyDown,
    onBlur,
    onFocus,
    id,
    autoComplete,
    autoFocus,
    maxLength,
    labelAssociation: 'field' as const,
    errorHighlight: isInvalid,
    ...(decorative ? { decorative } : {}),
    ...(dataTestId ? { 'data-testid': dataTestId } : {}),
  };

  return (
    <Field.Root
      name={name}
      disabled={disabled}
      invalid={isInvalid}
      validate={validate}
      validationMode={validationMode}
      className={outerClassName}
      style={style}
    >
      {labelSlot ?? labelStack}

      <Input ref={ref} {...inputCommon} />

      {feedbackContent}

      {!feedback && !error ? (
        <InputFeedback
          variant="negative"
          attention="low"
          size={resolveFeedbackSize(size as InputFeedbackSize)}
          fieldErrorSlot
        />
      ) : null}

      {dynamicRow}
    </Field.Root>
  );
});

InputField.displayName = 'InputField';
