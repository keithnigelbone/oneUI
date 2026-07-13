/**
 * Checkbox.tsx
 * React (web) implementation using Base UI Checkbox
 *
 * Standalone control — renders the interactive box with optional `label` / `description` props.
 * For visible field labels, descriptions, feedback, and validation, use `CheckboxField`.
 *
 * @example Surface context — checkboxes adapt on colored backgrounds
 * ```tsx
 * import { Checkbox, Surface } from '@oneui/ui';
 *
 * <Surface mode="bold">
 *   <Checkbox label="Adapts automatically" />
 * </Surface>
 * ```
 */

'use client';

import React, { useCallback, useId, useLayoutEffect, useRef } from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import styles from './Checkbox.module.css';
import { CheckboxProps, useCheckboxState } from './Checkbox.shared';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { Icon } from '../../icons/Icon';
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

export const Checkbox = React.forwardRef<HTMLSpanElement, CheckboxProps>(function Checkbox(
  {
    children,
    label: labelProp,
    description: descriptionProp,
    labelAssociation = 'native',
    supplementaryDescribedById,
    errorHighlight,
    checked,
    defaultChecked,
    indeterminate,
    onCheckedChange,
    size = 'm',
    appearance,
    accent: _accentIgnored,
    disabled,
    readOnly,
    required,
    name,
    value,
    id: idProp,
    labelWrapper = 'label',
    'aria-label': ariaLabelProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalid,
    className: classNameProp,
    style,
    'data-testid': dataTestId,
  },
  ref
) {
  const reactId = useId();
  const controlId = idProp ?? `oneui-checkbox-${reactId.replace(/:/g, '')}`;
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

  const controlRef = useRef<HTMLSpanElement | null>(null);
  const setControlRef = useCallback(
    (el: HTMLSpanElement | null) => {
      controlRef.current = el;
      assignRef(ref, el);
    },
    [ref]
  );

  const { isDisabled, isReadOnly, resolvedAppearance, resolvedSize, ariaProps, dataAttrs } =
    useCheckboxState({ appearance, accent: _accentIgnored, disabled, readOnly, size });

  // Unchecked-state stroke follows the parent Surface's appearance so the
  // border tints with the surface; on the bare page it stays neutral.
  const surfaceAppearance = useSurfaceAppearance();
  const uncheckedAppearance: Exclude<typeof resolvedAppearance, 'auto'> =
    isReadOnly ? 'neutral' : surfaceAppearance ?? 'neutral';

  const appearanceClass = APPEARANCE_CLASSES[resolvedAppearance];

  const checkboxClassName = [styles.checkbox, appearanceClass]
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
    mustUseDivWrapper && hasLabel && !ariaLabelProp?.trim() ? labelId : undefined;

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

  const rootCheckboxProps = {
    ref: setControlRef,
    id: controlId,
    checked,
    defaultChecked,
    indeterminate,
    onCheckedChange: isReadOnly ? undefined : onCheckedChange,
    disabled: isDisabled,
    required: required ?? false,
    name,
    value,
    className: checkboxClassName,
    'aria-label': resolvedAriaLabel,
    'aria-invalid': ariaInvalid,
    ...(resolvedAriaLabelledBy ? { 'aria-labelledby': resolvedAriaLabelledBy } : {}),
    ...(labelAssociation === 'native' && nativeDescribedBy
      ? { 'aria-describedby': nativeDescribedBy }
      : {}),
    ...ariaProps,
    ...dataAttrs,
    'data-unchecked-appearance': uncheckedAppearance,
    ...(dataTestId != null && String(dataTestId).trim() !== '' ? { 'data-testid': dataTestId } : {}),
  } as React.ComponentProps<typeof BaseCheckbox.Root>;

  return (
    <Wrapper
      className={wrapperClassName}
      style={style}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-size={resolvedSize}
      data-invalid={errorHighlight || undefined}
    >
      <BaseCheckbox.Root {...rootCheckboxProps}>
        <span className={styles.indicator} aria-hidden>
          <span className={styles.indicatorIcon}>
            <span className={styles.iconCheck} aria-hidden>
              <Icon name="check" aria-hidden />
            </span>
            <span className={styles.iconRemove} aria-hidden>
              <Icon name="remove" aria-hidden />
            </span>
          </span>
        </span>
      </BaseCheckbox.Root>
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

Checkbox.displayName = 'Checkbox';
