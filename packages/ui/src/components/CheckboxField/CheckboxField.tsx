/**
 * CheckboxField.tsx
 *
 * - **Single field** (no `children`): renders the checkbox control in a grid alongside the
 *   field label / description (owned by CheckboxField, not Checkbox), then `feedback`,
 *   below the control row.
 * - **Multi-option** (`children` are standalone **Checkbox** items): field `label` / `description`
 *   as header above the list; `feedback` and dynamic row after options. Each child uses
 *   its own inline `children` label.
 */

'use client';

import React, { cloneElement, forwardRef, Fragment, isValidElement, useId } from 'react';
import { Field } from '@base-ui/react/field';
import clsx from 'clsx';
import fieldStyles from '../InputField/InputField.module.css';
import checkboxFieldStyles from './CheckboxField.module.css';
import { Checkbox } from '../Checkbox/Checkbox';
import { CheckboxGroup } from '../CheckboxGroup/CheckboxGroup';
import type { CheckboxFieldProps } from './CheckboxField.shared';
import { checkboxFieldSizeToInputNumeric } from './CheckboxField.shared';
import type { CheckboxProps } from '../Checkbox/Checkbox.shared';
import {
  resolveFeedbackSize,
  type InputFeedbackSize,
} from '../Input/Input.shared';
import { checkboxSizeToLabelSize, resolveSize } from '../Checkbox/Checkbox.shared';
import labelStyles from '../Input/internals/FieldLabelStack.module.css';
import { InputFeedback } from '../Input/internals';

function isNonEmptyTrimmed(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

function flattenFieldChildren(nodes: React.ReactNode): React.ReactElement[] {
  const acc: React.ReactElement[] = [];
  React.Children.forEach(nodes, (node) => {
    if (!isValidElement(node)) {
      return;
    }
    if (node.type === Fragment) {
      const nested = (node.props as { children?: React.ReactNode }).children;
      acc.push(...flattenFieldChildren(nested));
      return;
    }
    acc.push(node);
  });
  return acc;
}

function countOptionChildren(children: React.ReactNode): number {
  return flattenFieldChildren(children).length;
}

function mergeFeedbackSlotSize<T extends { size?: unknown; className?: string; style?: React.CSSProperties }>(
  slot: React.ReactNode,
  fallbackSize: 8 | 10 | 12,
  extraClassName?: string,
  gridRow?: number,
): React.ReactNode {
  if (!isValidElement(slot)) return slot;
  const el = slot as React.ReactElement<T>;
  const hasSize = el.props != null && el.props.size !== undefined && el.props.size !== null;
  const style =
    gridRow != null
      ? { ...(el.props?.style ?? {}), gridRow } satisfies React.CSSProperties
      : el.props?.style;
  return cloneElement(el, {
    ...(!hasSize ? { size: fallbackSize } : {}),
    className: clsx(extraClassName, el.props?.className),
    ...(style ? { style } : {}),
  } as Partial<T>);
}

function enhanceCheckboxOptions(
  children: React.ReactNode,
  field: Pick<
    CheckboxFieldProps,
    'name' | 'disabled' | 'readOnly' | 'size' | 'appearance' | 'invalid'
  >
): React.ReactNode {
  const { name, disabled, readOnly, size, appearance, invalid } = field;
  return flattenFieldChildren(children).map((child, index) => {
    if (child.type !== Checkbox) {
      return child.key != null ? child : cloneElement(child, { key: index });
    }
    const el = child as React.ReactElement<CheckboxProps>;
    const listKey = child.key ?? el.props.value ?? index;
    return cloneElement(el, {
      key: listKey,
      name: el.props.name ?? name,
      disabled: el.props.disabled ?? disabled,
      readOnly: el.props.readOnly ?? readOnly,
      size: el.props.size ?? size,
      appearance: el.props.appearance ?? appearance,
      labelAssociation: 'native',
      errorHighlight: el.props.errorHighlight ?? invalid,
    });
  });
}

export const CheckboxField = forwardRef<HTMLSpanElement, CheckboxFieldProps>(function CheckboxField(
  {
    label,
    description,
    infoIconSlot,
    fullWidth,
    error,
    feedback,
    validationMode,
    validate,
    invalid,
    size = 'm',
    appearance,
    checked,
    defaultChecked,
    indeterminate,
    readOnly,
    disabled,
    required,
    name,
    value,
    id: idProp,
    onCheckedChange,
    className,
    style,
    children,
    groupValue,
    groupDefaultValue,
    onGroupValueChange,
  },
  ref
) {
  const isInvalid = invalid || !!error;
  const labelTier = checkboxSizeToLabelSize(size ?? 'm');
  const inputNumeric = checkboxFieldSizeToInputNumeric(size);
  const headerReactId = useId();
  const headerDescriptionId = `oneui-checkboxfield-desc-${headerReactId.replace(/:/g, '')}`;

  const feedbackContent =
    feedback ??
    (error ? (
      <InputFeedback
        variant="negative"
        attention="low"
        size={resolveFeedbackSize(inputNumeric as InputFeedbackSize)}
        feedback_message={error}
      />
    ) : null);

  const hasLabelHeader = isNonEmptyTrimmed(label);
  const hasDescriptionHeader = isNonEmptyTrimmed(description);
  const hasStringHeader = hasLabelHeader || hasDescriptionHeader;

  const labelSuffixInside =
    required && hasLabelHeader ? (
      <span className={labelStyles.asterisk} aria-hidden="true">
        *
      </span>
    ) : undefined;

  const labelTrailing = hasLabelHeader && infoIconSlot ? infoIconSlot : undefined;

  const checkboxCommon = {
    size,
    appearance,
    checked,
    defaultChecked,
    indeterminate,
    onCheckedChange,
    disabled,
    readOnly,
    required,
    name,
    value,
    id: idProp,
    labelAssociation: 'field' as const,
    labelWrapper: 'div' as const,
    errorHighlight: isInvalid,
  } satisfies Partial<CheckboxProps>;

  const outerClassName = clsx(fieldStyles.field, fullWidth && fieldStyles.fullWidth, className);

  const optionCount = countOptionChildren(children);
  const multiMode = optionCount > 0;

  const fieldErrorOnlyRow = !feedback && !error;

  const footerFeedback = feedbackContent;

  const multiOptions = multiMode ? (
    <CheckboxGroup
      value={groupValue}
      defaultValue={groupDefaultValue}
      onValueChange={onGroupValueChange}
      disabled={disabled}
      className={checkboxFieldStyles.multiOptions}
      {...(hasDescriptionHeader ? { 'aria-describedby': headerDescriptionId } : {})}
    >
      {enhanceCheckboxOptions(children, {
        name,
        disabled,
        readOnly,
        size,
        appearance,
        invalid: isInvalid,
      })}
    </CheckboxGroup>
  ) : null;

  const multiHeader =
    multiMode && hasStringHeader ? (
      <fieldset
        className={clsx(checkboxFieldStyles.fieldset, labelStyles.root)}
        data-size={labelTier}
        data-disabled={disabled || undefined}
      >
        {hasLabelHeader ? (
          <legend className={checkboxFieldStyles.legend}>
            <Field.Label className={labelStyles.label} data-disabled={disabled || undefined}>
              {label!.trim()}
              {labelSuffixInside}
            </Field.Label>
            {labelTrailing ? (
              <span className={labelStyles.labelTrailing}>{labelTrailing}</span>
            ) : null}
          </legend>
        ) : null}
        {hasDescriptionHeader ? (
          <Field.Description
            id={headerDescriptionId}
            className={labelStyles.description}
            data-disabled={disabled || undefined}
          >
            {description!.trim()}
          </Field.Description>
        ) : null}
        {multiOptions}
      </fieldset>
    ) : multiMode ? (
      multiOptions
    ) : null;

  let singleGridRow = 2;
  const bumpSingleGridRow = () => {
    const r = singleGridRow;
    singleGridRow += 1;
    return r;
  };

  const singleIntegrated = !multiMode ? (
    <div className={checkboxFieldStyles.singleGrid} data-size={resolveSize(size ?? 'm')}>
      <Checkbox
        ref={ref}
        {...checkboxCommon}
        className={checkboxFieldStyles.singleGridControl}
      />
      {hasLabelHeader ? (
        <div className={clsx(labelStyles.root, checkboxFieldStyles.singleGridLabel)} data-size={labelTier}>
          <div className={labelStyles.labelRow}>
            <Field.Label className={labelStyles.label} data-disabled={disabled || undefined}>
              {label!.trim()}
              {labelSuffixInside}
            </Field.Label>
            {labelTrailing ? <span className={labelStyles.labelTrailing}>{labelTrailing}</span> : null}
          </div>
        </div>
      ) : hasDescriptionHeader ? (
        <div className={clsx(labelStyles.root, checkboxFieldStyles.singleGridLabel)} data-size={labelTier}>
          <Field.Description
            id={headerDescriptionId}
            className={labelStyles.description}
            data-disabled={disabled || undefined}
          >
            {description!.trim()}
          </Field.Description>
        </div>
      ) : null}
      {hasDescriptionHeader && hasLabelHeader ? (
        <Field.Description
          id={headerDescriptionId}
          className={clsx(labelStyles.description, checkboxFieldStyles.singleGridCol2)}
          style={{ gridRow: bumpSingleGridRow() }}
          data-disabled={disabled || undefined}
        >
          {description!.trim()}
        </Field.Description>
      ) : null}
      {footerFeedback
        ? mergeFeedbackSlotSize(
            footerFeedback,
            resolveFeedbackSize(inputNumeric as InputFeedbackSize),
            checkboxFieldStyles.singleGridCol2,
            bumpSingleGridRow(),
          )
        : null}
      {fieldErrorOnlyRow ? (
        <div className={checkboxFieldStyles.singleGridCol2} style={{ gridRow: bumpSingleGridRow() }}>
          <InputFeedback
            variant="negative"
            attention="low"
            size={resolveFeedbackSize(inputNumeric as InputFeedbackSize)}
            fieldErrorSlot
          />
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <Field.Root
      role="radiogroup"
      name={name}
      disabled={disabled}
      invalid={isInvalid}
      validate={validate}
      validationMode={validationMode}
      className={outerClassName}
      style={style}
    >
      {multiMode ? multiHeader : null}
      {singleIntegrated}
      {multiMode ? footerFeedback : null}
      {multiMode && fieldErrorOnlyRow ? (
        <InputFeedback
          variant="negative"
          attention="low"
          size={resolveFeedbackSize(inputNumeric as InputFeedbackSize)}
          fieldErrorSlot
        />
      ) : null}
    </Field.Root>
  );
});

CheckboxField.displayName = 'CheckboxField';
