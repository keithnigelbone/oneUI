/**
 * Radio.tsx
 * React (web) implementation using Base UI Radio + RadioGroup
 *
 * Standalone control — renders the interactive radio circle with optional `label` / `description` props.
 * For visible field labels, descriptions, feedback, and validation, use `RadioField`.
 */

'use client';

import React, { useCallback, useId, useLayoutEffect, useRef } from 'react';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import styles from './Radio.module.css';
import {
  RadioGroupProps,
  RadioProps,
  RadioGroupContext,
  useRadioGroupContext,
  useRadioState,
} from './Radio.shared';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { useSurfaceAppearance } from '../Surface/Surface';

const APPEARANCE_CLASSES = makeAppearanceClassMap(styles);

function isNonEmptyTrimmed(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null && typeof ref === 'object' && 'current' in ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled,
  readOnly,
  name,
  size,
  appearance,
  accent: _accentIgnored,
  orientation = 'vertical',
  className,
  style,
  omitLayoutWrapper,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const groupClassName = [omitLayoutWrapper ? undefined : styles.group, className]
    .filter(Boolean)
    .join(' ');

  const ctxValue = React.useMemo(
    () => ({ appearance, size, disabled, readOnly }),
    [appearance, size, disabled, readOnly]
  );

  return (
    <RadioGroupContext.Provider value={ctxValue}>
      <BaseRadioGroup
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (v) => onValueChange(v as string) : undefined}
        disabled={disabled}
        readOnly={readOnly}
        name={name}
        className={groupClassName}
        style={style}
        aria-label={ariaLabel}
        {...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {})}
        data-orientation={orientation}
      >
        {children}
      </BaseRadioGroup>
    </RadioGroupContext.Provider>
  );
};

type RadioRootElement = React.ComponentRef<typeof BaseRadio.Root>;

export const Radio = React.forwardRef<RadioRootElement, RadioProps>(function Radio(
  {
    children,
    label: labelProp,
    description: descriptionProp,
    labelAssociation = 'native',
    supplementaryDescribedById,
    errorHighlight,
    value,
    disabled,
    readOnly,
    required,
    size,
    appearance,
    accent: _accentIgnored,
    checked: _checkedIgnored,
    id: idProp,
    labelWrapper = 'label',
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledByProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalid,
    className: classNameProp,
    style,
    'data-testid': dataTestId,
  },
  ref
) {
  const reactId = useId();
  const controlId = idProp ?? `oneui-radio-${reactId.replace(/:/g, '')}`;
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;

  const trimmedLabel =
    (isNonEmptyTrimmed(labelProp) ? labelProp.trim() : undefined) ??
    (typeof children === 'string' && children.trim() !== '' ? children.trim() : undefined);
  const trimmedDescription = isNonEmptyTrimmed(descriptionProp) ? descriptionProp.trim() : undefined;
  const legacyLabelNode =
    trimmedLabel == null && children != null && typeof children !== 'string' ? children : null;

  const hasLabel = trimmedLabel != null;
  const hasDescription = trimmedDescription != null;
  const hasTextColumn = hasLabel || hasDescription || legacyLabelNode != null;

  const controlRef = useRef<RadioRootElement | null>(null);
  const setControlRef = useCallback(
    (el: RadioRootElement | null) => {
      controlRef.current = el;
      assignRef(ref, el);
    },
    [ref]
  );

  const groupCtx = useRadioGroupContext();
  const { isDisabled, isReadOnly, resolvedAppearance, resolvedSize, ariaProps, dataAttrs } =
    useRadioState({ value, appearance, disabled, readOnly, size }, groupCtx);

  // Unchecked-state stroke follows the parent Surface's appearance so the
  // border tints with the surface; on the bare page it stays neutral (no
  // appearance-driven tinting). Same pattern as Switch's unchecked track.
  const surfaceAppearance = useSurfaceAppearance();
  const uncheckedAppearance: Exclude<typeof resolvedAppearance, 'auto'> =
    isReadOnly ? 'neutral' : surfaceAppearance ?? 'neutral';

  const appearanceClass = APPEARANCE_CLASSES[resolvedAppearance];

  const radioClassName = [styles.radio, appearanceClass]
    .filter(Boolean)
    .join(' ');

  const wrapperClassName = [styles.wrapper, classNameProp].filter(Boolean).join(' ');

  const mustUseDivWrapper =
    labelWrapper === 'div' || labelAssociation === 'field';

  const Wrapper = mustUseDivWrapper ? 'div' : 'label';

  const mergeId = supplementaryDescribedById?.trim() ?? '';

  const resolvedAriaLabel =
    ariaLabelProp?.trim() ||
    (hasLabel ? trimmedLabel : undefined) ||
    (!hasLabel && hasDescription ? trimmedDescription : undefined) ||
    undefined;

  const resolvedAriaLabelledBy =
    ariaLabelledByProp?.trim() ||
    (mustUseDivWrapper && hasLabel && !ariaLabelProp?.trim() ? labelId : undefined) ||
    undefined;

  const nativeDescribedByParts = [
    ariaDescribedByProp?.trim() || null,
    hasLabel && hasDescription ? descriptionId : null,
    mergeId && labelAssociation === 'native' ? mergeId : null,
  ].filter(Boolean) as string[];
  const nativeDescribedBy =
    nativeDescribedByParts.length > 0 ? nativeDescribedByParts.join(' ').trim() : undefined;

  useLayoutEffect(() => {
    const el = controlRef.current;
    if (!el || labelAssociation !== 'field' || !mergeId) {
      return undefined;
    }

    const ensureMerged = () => {
      const cur = el.getAttribute('aria-describedby') ?? '';
      const parts = cur.split(/\s+/).filter(Boolean);
      if (!parts.includes(mergeId)) {
        el.setAttribute('aria-describedby', [...parts, mergeId].join(' ').trim());
      }
    };

    ensureMerged();
    const obs = new MutationObserver(ensureMerged);
    obs.observe(el, { attributes: true, attributeFilter: ['aria-describedby'] });

    return () => {
      obs.disconnect();
      const cur = el.getAttribute('aria-describedby') ?? '';
      const remaining = cur
        .split(/\s+/)
        .filter(Boolean)
        .filter((id) => id !== mergeId);
      if (remaining.length) {
        el.setAttribute('aria-describedby', remaining.join(' '));
      } else {
        el.removeAttribute('aria-describedby');
      }
    };
  }, [labelAssociation, mergeId]);

  if (
    process.env.NODE_ENV !== 'production' &&
    !resolvedAriaLabel &&
    !resolvedAriaLabelledBy
  ) {
    console.warn(
      'Radio: provide `label`, visible `children`, or `aria-label` so the control has an accessible name.',
    );
  }

  const rootRadioProps = {
    ref: setControlRef,
    id: controlId,
    value,
    disabled: isDisabled,
    readOnly: isReadOnly,
    required: required ?? false,
    className: radioClassName,
    'aria-label': resolvedAriaLabel,
    'aria-invalid': ariaInvalid,
    ...(labelAssociation === 'native' && nativeDescribedBy
      ? { 'aria-describedby': nativeDescribedBy }
      : {}),
    ...(resolvedAriaLabelledBy ? { 'aria-labelledby': resolvedAriaLabelledBy } : {}),
    ...ariaProps,
    ...dataAttrs,
    'data-unchecked-appearance': uncheckedAppearance,
    ...(dataTestId != null && String(dataTestId).trim() !== '' ? { 'data-testid': dataTestId } : {}),
  } as React.ComponentProps<typeof BaseRadio.Root>;

  return (
    <Wrapper
      className={wrapperClassName}
      style={style}
      data-disabled={isDisabled || isReadOnly || undefined}
      data-size={resolvedSize}
      data-invalid={errorHighlight || undefined}
    >
      <BaseRadio.Root {...rootRadioProps}>
        <BaseRadio.Indicator className={styles.indicator} keepMounted />
      </BaseRadio.Root>
      {hasTextColumn ? (
        <span className={styles.textColumn}>
          {hasLabel ? (
            <span id={labelId} className={styles.label}>
              {trimmedLabel}
            </span>
          ) : hasDescription ? (
            <span id={descriptionId} className={styles.label}>
              {trimmedDescription}
            </span>
          ) : legacyLabelNode != null ? (
            <span className={styles.label}>{legacyLabelNode}</span>
          ) : null}
          {hasLabel && hasDescription ? (
            <span id={descriptionId} className={styles.description}>
              {trimmedDescription}
            </span>
          ) : null}
        </span>
      ) : null}
    </Wrapper>
  );
});

Radio.displayName = 'Radio';
