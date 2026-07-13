/**
 * RadioField.tsx
 *
 * - **Integrated single** (no `children`, string `label`): implicit **Radio** beside the field label
 *   / description (`aria-labelledby` to the field heading), then `feedback`
 *   (CheckboxField parity). Use `checked` / `defaultChecked` / `onCheckedChange` or string `value` /
 *   `defaultValue` with `singleOptionValue`.
 * - **Multiple options** (two+ **Radio** children): field `label` / `description` above the list;
 *   `feedback` and dynamic row after options.
 */

'use client';

import React, {
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field } from '@base-ui/react/field';
import clsx from 'clsx';
import fieldStyles from '../InputField/InputField.module.css';
import radioFieldStyles from './RadioField.module.css';
import { Radio, RadioGroup } from '../Radio/Radio';
import type { RadioFieldProps } from './RadioField.shared';
import { radioFieldSizeToInputNumeric } from './RadioField.shared';
import type { RadioProps } from '../Radio/Radio.shared';
import { resolveFeedbackSize, type InputFeedbackSize } from '../Input/Input.shared';
import { radioSizeToLabelSize, resolveSize } from '../Radio/Radio.shared';
import labelStyles from '../Input/internals/FieldLabelStack.module.css';
import { InputFeedback } from '../Input/internals';

function isNonEmptyTrimmed(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

/** Radiogroup naming when the visible field label is absent. */
function radioGroupNameA11yProps(
  hasLabelHeader: boolean,
  ariaLabel: string | undefined,
  labelledById?: string,
): { 'aria-labelledby'?: string; 'aria-label'?: string } {
  if (hasLabelHeader && labelledById) {
    return { 'aria-labelledby': labelledById };
  }
  const trimmed = ariaLabel?.trim();
  if (trimmed) {
    return { 'aria-label': trimmed };
  }
  return {};
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

function enhanceRadioOptions(
  children: React.ReactNode,
  field: Pick<RadioFieldProps, 'disabled' | 'readOnly' | 'size' | 'appearance' | 'invalid' | 'required'>,
): React.ReactNode {
  const { disabled, readOnly, size, appearance, invalid, required } = field;
  return flattenFieldChildren(children).map((child, index) => {
    if (child.type !== Radio) {
      return child.key != null ? child : cloneElement(child, { key: index });
    }
    const el = child as React.ReactElement<RadioProps>;
    const listKey = child.key ?? el.props.value ?? index;
    return cloneElement(el, {
      key: listKey,
      disabled: el.props.disabled ?? disabled,
      readOnly: el.props.readOnly ?? readOnly,
      required: el.props.required ?? required,
      size: el.props.size ?? size,
      appearance: el.props.appearance ?? appearance,
      errorHighlight: el.props.errorHighlight ?? invalid,
    });
  });
}

export const RadioField = forwardRef<HTMLDivElement, RadioFieldProps>(function RadioField(
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
    required,
    children,
    value,
    defaultValue,
    onValueChange,
    onCheckedChange,
    checked,
    defaultChecked,
    singleOptionValue: singleOptionValueProp,
    name,
    disabled,
    readOnly,
    size = 'm',
    appearance,
    orientation = 'vertical',
    className,
    style,
    'aria-label': ariaLabelProp,
  },
  ref,
) {
  const isInvalid = invalid || !!error;
  const labelTier = radioSizeToLabelSize(size);
  const inputNumeric = radioFieldSizeToInputNumeric(size);
  const sv = singleOptionValueProp ?? 'on';

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

  const headerReactId = useId();
  const headerDescriptionId = `oneui-radiofield-desc-${headerReactId.replace(/:/g, '')}`;
  const singleFieldHeadingId = `oneui-radiofield-heading-${headerReactId.replace(/:/g, '')}`;

  const optionCount = countOptionChildren(children);
  const multiOptionMode = optionCount > 1;
  const integratedSingle = optionCount === 0;
  const plainOptionMode = optionCount >= 1 && !multiOptionMode;

  if (
    process.env.NODE_ENV !== 'production' &&
    integratedSingle &&
    !hasLabelHeader &&
    !ariaLabelProp?.trim()
  ) {
    console.warn(
      'RadioField: integrated single fields require a string `label` or `aria-label` for accessibility.',
    );
  }

  const useFieldsetLegend = multiOptionMode && hasLabelHeader;

  const fieldErrorOnlyRow = !feedback && !error;

  const footerFeedback = feedbackContent;

  const headerWithoutFieldset =
    !useFieldsetLegend && !integratedSingle && plainOptionMode && (hasDescriptionHeader || labelTrailing) ? (
      <div
        className={labelStyles.root}
        data-size={labelTier}
        data-disabled={disabled || undefined}
      >
        {labelTrailing ? (
          <div className={labelStyles.labelRow}>
            <span className={labelStyles.labelTrailing}>{labelTrailing}</span>
          </div>
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
      </div>
    ) : null;

  let mergedDefaultValue = defaultValue;
  if (integratedSingle && checked === undefined && value === undefined && defaultChecked !== undefined) {
    mergedDefaultValue = defaultChecked ? sv : '';
  }

  const isBoolControlled = integratedSingle && checked !== undefined;
  const isStringControlled = value !== undefined;

  /** Integrated single must stay controlled so we can clear to `''`; Base UI never fires change when re-clicking the selected item. */
  const useIntegratedInternalValue = integratedSingle && !isBoolControlled && !isStringControlled;
  const [integratedInternalValue, setIntegratedInternalValue] = useState<string | undefined>(undefined);

  const groupValueProps = isBoolControlled
    ? { value: checked ? sv : '' }
    : isStringControlled
      ? { value }
      : { defaultValue: mergedDefaultValue };

  const effectiveIntegratedString = useMemo(() => {
    if (!integratedSingle) return '';
    if (isBoolControlled) return checked ? sv : '';
    if (isStringControlled) return value ?? '';
    return integratedInternalValue ?? mergedDefaultValue ?? '';
  }, [
    integratedSingle,
    isBoolControlled,
    checked,
    sv,
    isStringControlled,
    value,
    integratedInternalValue,
    mergedDefaultValue,
  ]);

  const effectiveIntegratedStrRef = useRef(effectiveIntegratedString);
  effectiveIntegratedStrRef.current = effectiveIntegratedString;

  const fieldDomRef = useRef<HTMLDivElement | null>(null);
  const setFieldRef = useCallback(
    (node: HTMLDivElement | null) => {
      fieldDomRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null && typeof ref === 'object' && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  // `aria-readonly` is invalid on `role="radio"` (axe: aria-allowed-attr). RadioField
  // forwards `readOnly` to inner Radio/Base UI for interaction suppression and
  // `data-readonly` styling, then strips the invalid attribute within this field shell.
  useLayoutEffect(() => {
    const root = fieldDomRef.current;
    if (!root || !readOnly) {
      return undefined;
    }

    const stripReadonlyAria = () => {
      root.querySelectorAll('[role="radio"][aria-readonly]').forEach((el) => {
        el.removeAttribute('aria-readonly');
      });
    };

    stripReadonlyAria();
    const obs = new MutationObserver(stripReadonlyAria);
    obs.observe(root, { subtree: true, attributes: true, attributeFilter: ['aria-readonly'] });

    return () => obs.disconnect();
  }, [readOnly]);

  const handleGroupValueChange = useCallback(
    (v: string) => {
      if (useIntegratedInternalValue) {
        setIntegratedInternalValue(v);
      }
      onValueChange?.(v);
      if (integratedSingle) {
        onCheckedChange?.(v === sv);
      }
    },
    [useIntegratedInternalValue, integratedSingle, onValueChange, onCheckedChange, sv],
  );

  const clearIntegratedSingleIfSelected = useCallback(
    (e: React.MouseEvent) => {
      if (!integratedSingle || disabled || readOnly) return;
      if (effectiveIntegratedStrRef.current !== sv) return;
      e.preventDefault();
      e.stopPropagation();
      handleGroupValueChange('');
    },
    [integratedSingle, disabled, readOnly, sv, handleGroupValueChange],
  );

  const radioGroupCommon = {
    ...groupValueProps,
    onValueChange: handleGroupValueChange,
    disabled,
    readOnly,
    name,
    size,
    appearance,
    orientation,
  } as const;

  const integratedSingleRadioGroupProps = {
    value: effectiveIntegratedString,
    onValueChange: handleGroupValueChange,
    disabled,
    readOnly,
    name,
    size,
    appearance,
    orientation,
  } as const;

  const outerClassName = clsx(fieldStyles.field, fullWidth && fieldStyles.fullWidth, className);

  const multiRadioGroupClassName = clsx(radioFieldStyles.multiOptions);

  const multiOptionsFixed = multiOptionMode ? (
    <RadioGroup
      {...radioGroupCommon}
      className={multiRadioGroupClassName}
      {...radioGroupNameA11yProps(hasLabelHeader, ariaLabelProp)}
      {...(hasDescriptionHeader ? { 'aria-describedby': headerDescriptionId } : {})}
    >
      {enhanceRadioOptions(children, {
        disabled,
        readOnly,
        required,
        size,
        appearance,
        invalid: isInvalid,
      })}
    </RadioGroup>
  ) : null;

  const multiHeader =
    multiOptionMode && hasStringHeader ? (
      <fieldset
        className={clsx(radioFieldStyles.fieldset, labelStyles.root)}
        data-size={labelTier}
        data-disabled={disabled || undefined}
      >
        {hasLabelHeader ? (
          <legend className={radioFieldStyles.legend}>
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
        {multiOptionsFixed}
      </fieldset>
    ) : multiOptionMode ? (
      multiOptionsFixed
    ) : null;

  const loneRadioA11yName = hasLabelHeader
    ? { 'aria-labelledby': singleFieldHeadingId }
    : isNonEmptyTrimmed(ariaLabelProp)
      ? { 'aria-label': ariaLabelProp.trim() }
      : {};

  const loneRadio = (
    <Radio
      value={sv}
      className={radioFieldStyles.singleGridControl}
      children={null}
      labelWrapper="div"
      {...loneRadioA11yName}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      size={size}
      appearance={appearance}
      errorHighlight={isInvalid}
    />
  );

  let singleGridRow = 2;
  const bumpSingleGridRow = () => {
    const r = singleGridRow;
    singleGridRow += 1;
    return r;
  };

  const singleIntegrated = integratedSingle ? (
    <div className={radioFieldStyles.singleGrid} data-size={resolveSize(size ?? 'm')}>
      <div className={radioFieldStyles.groupDisplayContents} onClickCapture={clearIntegratedSingleIfSelected}>
        <RadioGroup
          {...integratedSingleRadioGroupProps}
          omitLayoutWrapper
          className={radioFieldStyles.groupDisplayContents}
          {...radioGroupNameA11yProps(hasLabelHeader, ariaLabelProp, singleFieldHeadingId)}
          {...(hasDescriptionHeader ? { 'aria-describedby': headerDescriptionId } : {})}
        >
          {loneRadio}
        </RadioGroup>
      </div>
      {hasLabelHeader ? (
        <div className={clsx(labelStyles.root, radioFieldStyles.singleGridLabel)} data-size={labelTier}>
          <div className={labelStyles.labelRow}>
            <Field.Label className={labelStyles.label} data-disabled={disabled || undefined}>
              <span id={singleFieldHeadingId}>
                {label!.trim()}
                {labelSuffixInside}
              </span>
            </Field.Label>
            {labelTrailing ? <span className={labelStyles.labelTrailing}>{labelTrailing}</span> : null}
          </div>
        </div>
      ) : hasDescriptionHeader ? (
        <div className={clsx(labelStyles.root, radioFieldStyles.singleGridLabel)} data-size={labelTier}>
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
          className={clsx(labelStyles.description, radioFieldStyles.singleGridCol2)}
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
            radioFieldStyles.singleGridCol2,
            bumpSingleGridRow(),
          )
        : null}
      {fieldErrorOnlyRow ? (
        <div className={radioFieldStyles.singleGridCol2} style={{ gridRow: bumpSingleGridRow() }}>
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

  const plainRadioGroup = plainOptionMode ? (
    <>
      {headerWithoutFieldset}
      <RadioGroup
        {...radioGroupCommon}
        {...radioGroupNameA11yProps(hasLabelHeader, ariaLabelProp)}
        {...(hasDescriptionHeader ? { 'aria-describedby': headerDescriptionId } : {})}
      >
        {enhanceRadioOptions(children, {
          disabled,
          readOnly,
          required,
          size,
          appearance,
          invalid: isInvalid,
        })}
      </RadioGroup>
    </>
  ) : null;

  const footerOutsideGrid = !integratedSingle ? (
    <>
      {footerFeedback}
      {fieldErrorOnlyRow ? (
        <InputFeedback
          variant="negative"
          attention="low"
          size={resolveFeedbackSize(inputNumeric as InputFeedbackSize)}
          fieldErrorSlot
        />
      ) : null}
    </>
  ) : null;

  return (
    <Field.Root
      role="radiogroup"
      ref={setFieldRef}
      name={name}
      disabled={disabled}
      invalid={isInvalid}
      validate={validate}
      validationMode={validationMode}
      className={outerClassName}
      style={style}
      data-readonly={readOnly || undefined}
    >
      {multiOptionMode ? multiHeader : null}
      {singleIntegrated}
      {plainRadioGroup}
      {footerOutsideGrid}
    </Field.Root>
  );
});

RadioField.displayName = 'RadioField';
