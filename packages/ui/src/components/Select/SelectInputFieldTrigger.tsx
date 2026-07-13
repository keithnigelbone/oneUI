/**
 * SelectInputFieldTrigger.tsx
 *
 * Figma Select.SelectableInput — label stack + Input control as combobox trigger;
 * menu anchors to the input row width (node 3877:38141, 328px fill).
 */

'use client';

import React, { useId } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Field } from '@base-ui/react/field';
import clsx from 'clsx';
import styles from './Select.module.css';
import fieldStyles from '../InputField/InputField.module.css';
import labelStyles from '../Input/internals/FieldLabelStack.module.css';
import { Input } from '../Input/Input';
import { InputFeedback, InputDynamicText } from '../Input/internals';
import { InputFieldDefaultInfo } from '../InputField/InputFieldDefaultInfo';
import {
  resolveFeedbackSize,
  inputSizeToLabelSize,
  type InputFeedbackSize,
} from '../Input/Input.shared';
import { SelectChevronIcon } from './SelectIcons';
import {
  getSelectAccessibilityProps,
  selectAppearanceToInputAppearance,
  selectSizeToInputSize,
  type SelectResolvedState,
} from './Select.shared';
import type { SelectProps } from './Select';
import { resolveSelectTriggerStart } from './SelectStartSlots';

export interface SelectInputFieldTriggerProps<T extends string | number = string> {
  props: SelectProps<T>;
  state: SelectResolvedState<T>;
  isOpen: boolean;
  displayText: string;
  isPlaceholder: boolean;
  className?: string;
}

function inputFieldSizeFromSelect(size: ReturnType<typeof selectSizeToInputSize>): 8 | 10 | 12 {
  if (size === 's') return 8;
  if (size === 'l') return 12;
  return 10;
}

function isNonEmptyTrimmed(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

export function SelectInputFieldTrigger<T extends string | number = string>({
  props,
  state,
  isOpen,
  displayText,
  isPlaceholder,
  className,
}: SelectInputFieldTriggerProps<T>) {
  const labelId = useId();
  const a11y = getSelectAccessibilityProps(props, state, isOpen);
  const inputSize = inputFieldSizeFromSelect(selectSizeToInputSize(state.size));
  const labelTier = inputSizeToLabelSize(inputSize);
  const attention =
    props.inputAttention ??
    (props.filled || !isPlaceholder || isOpen || props.attention === 'high' ? 'high' : 'medium');
  const isInvalid = props.invalid || !!props.feedback;
  const chevron = <SelectChevronIcon open={isOpen} />;
  const startNode = resolveSelectTriggerStart(props);

  const hasLabelHeader = isNonEmptyTrimmed(props.label);
  const hasDescriptionHeader = isNonEmptyTrimmed(props.description);

  const labelSuffixInside =
    props.required && hasLabelHeader ? (
      <span className={labelStyles.asterisk} aria-hidden="true">
        *
      </span>
    ) : undefined;

  const labelTrailing =
    props.infoIcon && hasLabelHeader ? (
      <InputFieldDefaultInfo
        disabled={state.isDisabled}
        ariaLabel="More information"
        tooltipContent="Additional help for this field."
        labelSize={labelTier}
      />
    ) : undefined;

  const labelRow =
    hasLabelHeader || labelTrailing ? (
      <div className={labelStyles.labelRow}>
        {hasLabelHeader ? (
          <Field.Label id={labelId} className={labelStyles.label} data-disabled={state.isDisabled || undefined}>
            {props.label!.trim()}
            {labelSuffixInside}
          </Field.Label>
        ) : null}
        {labelTrailing ? <span className={labelStyles.labelTrailing}>{labelTrailing}</span> : null}
      </div>
    ) : null;

  const descriptionBlock = hasDescriptionHeader ? (
    <Field.Description className={labelStyles.description} data-disabled={state.isDisabled || undefined}>
      {props.description!.trim()}
    </Field.Description>
  ) : null;

  const labelStack =
    hasLabelHeader || hasDescriptionHeader || labelTrailing ? (
      <div
        className={clsx(labelStyles.root, styles.inputLabelDescription)}
        data-size={labelTier}
        data-disabled={state.isDisabled || undefined}
      >
        {labelRow}
        {descriptionBlock}
      </div>
    ) : null;

  const feedbackContent = props.feedback ? (
    <InputFeedback
      variant="negative"
      attention="low"
      size={resolveFeedbackSize(inputSize as InputFeedbackSize)}
      feedback_message={props.feedback}
    />
  ) : null;

  const dynamicRow =
    props.helperText != null && props.helperText.trim() !== '' ? (
      <InputDynamicText content={props.helperText} size={labelTier} disabled={state.isDisabled} />
    ) : null;

  return (
    <Field.Root
      disabled={state.isDisabled}
      invalid={isInvalid}
      className={clsx(fieldStyles.field, fieldStyles.fullWidth, styles.inputTriggerRoot, className)}
    >
      {labelStack}

      {/* Figma SelectInputWrapper — input row only; menu anchors to this width (3877:38141). */}
      <div className={styles.inputSelectWrapper}>
        <div className={styles.selectInput}>
          <BaseSelect.Trigger
            nativeButton={false}
            aria-label={!props.label ? a11y['aria-label'] : undefined}
            aria-labelledby={props.label ? labelId : a11y['aria-labelledby']}
            aria-describedby={a11y['aria-describedby']}
            aria-required={a11y['aria-required']}
            aria-invalid={a11y['aria-invalid']}
            render={(triggerProps) => (
              <div {...triggerProps} className={styles.inputTriggerAnchor}>
                <Input
              size={inputSize}
              appearance={selectAppearanceToInputAppearance(state.appearance)}
              shape={props.shape ?? 'default'}
              attention={attention}
              start={startNode}
              end={chevron}
              placeholder={props.placeholder}
              value={displayText}
              readOnly
              disabled={state.isDisabled}
              labelAssociation="native"
              errorHighlight={isInvalid}
              decorative
              className={clsx(
                styles.inputFieldInTrigger,
                isPlaceholder ? styles.inputFieldPlaceholder : styles.inputFieldHasValue,
              )}
              />
            </div>
          )}
          />
        </div>
      </div>

      {feedbackContent}

      {!feedbackContent && isInvalid ? (
        <InputFeedback
          variant="negative"
          attention="low"
          size={resolveFeedbackSize(inputSize as InputFeedbackSize)}
          fieldErrorSlot
        />
      ) : null}

      {dynamicRow}
    </Field.Root>
  );
}
