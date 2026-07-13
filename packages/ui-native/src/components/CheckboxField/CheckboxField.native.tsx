/**
 * CheckboxField.native.tsx
 *
 * RN peer of `packages/ui/src/components/CheckboxField/CheckboxField.tsx`.
 *
 * Composition:
 *   - **Single mode** (no `children`): renders a `Checkbox` with the field's
 *     `label` / `description`, an optional `labelSuffixInside` (asterisk for
 *     `required`), and the `infoIconSlot` forwarded as `labelTrailing`.
 *   - **Multi-option mode** (children = `<Checkbox>` items): renders the
 *     label / description as a fieldset-style header (legend + description),
 *     then the children stacked vertically. The field manages a list of
 *     selected `value`s and forwards `disabled` / `readOnly` / `size` /
 *     `appearance` / `errorHighlight` to each child Checkbox.
 *
 * Below the control(s) the field renders, in order:
 *   1. `feedback` slot (or auto-generated negative row when `error` is set)
 *   2. `dynamicTextSlot` (or auto-generated `dynamicText` + `helperButton` row)
 *
 * Native simplification: web composes
 * `InputFeedback` / `InputDynamicText` ports — those native peers are not
 * shipped yet, so the field renders semantically equivalent `<Text>` rows
 * coloured via the theme's role tokens (`Negative-High` for error,
 * `Text-Low` for helper, accent role for the helper button). When the
 * native InputFeedback / InputDynamicText components land we swap the
 * inline rows for the typed slots without breaking the public contract.
 */

import React, {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSurfaceTokens, useTypographyTokens, typographyToTextStyle } from '../../theme';
import { Checkbox } from '../Checkbox/Checkbox.native';
import type { CheckboxProps } from '../Checkbox/interface';
import { resolveSize } from '../Checkbox/interface';
import {
  getCheckboxFieldAccessibilityProps,
  useCheckboxFieldState,
  type CheckboxFieldProps,
} from './interface';
import {
  FIELD_DISABLED_OPACITY,
  FIELD_FEEDBACK_BODY_SIZE,
  FIELD_HEADER_DESCRIPTION_SIZE,
  FIELD_HEADER_LABEL_SIZE,
  styles,
} from './CheckboxField.styles.native';

// ─── Helpers ────────────────────────────────────────────────────────────────

function flattenChildren(nodes: ReactNode): ReactElement[] {
  const acc: ReactElement[] = [];
  Children.forEach(nodes, (node) => {
    if (!isValidElement(node)) return;
    if (node.type === React.Fragment) {
      const nested = (node.props as { children?: ReactNode }).children;
      acc.push(...flattenChildren(nested));
      return;
    }
    acc.push(node);
  });
  return acc;
}

function isCheckboxElement(el: ReactElement): el is ReactElement<CheckboxProps> {
  return el.type === Checkbox;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function CheckboxField(props: CheckboxFieldProps): React.ReactElement {
  const {
    label,
    description,
    infoIconSlot,
    fullWidth,
    required,
    error,
    feedback,
    dynamicTextSlot,
    dynamicText,
    helperButton,
    onHelperPress,
    invalid,
    size = 'm',
    appearance,
    selected,
    defaultSelected,
    indeterminate,
    readOnly,
    disabled,
    onSelectedChange,
    onPress,
    style: styleProp,
    children,
    groupValue,
    groupDefaultValue,
    onGroupValueChange,
    testID,
    ...rest
  } = props;

  const { isInvalid, isDisabled, isMultiMode } = useCheckboxFieldState({
    invalid,
    error,
    children,
    disabled,
  });

  const resolvedSize = resolveSize(size);

  // Surface tokens for paint — header + feedback rows. Negative role for
  // error messages mirrors web's `<InputFeedback variant="negative">`.
  const role = useSurfaceTokens(appearance ?? 'auto');
  const negativeRole = useSurfaceTokens('negative');

  const headerLabelTypo = useTypographyTokens('body', FIELD_HEADER_LABEL_SIZE[resolvedSize], {
    emphasis: 'medium',
  });
  const headerDescriptionTypo = useTypographyTokens('body', FIELD_HEADER_DESCRIPTION_SIZE, {
    emphasis: 'low',
  });
  const feedbackTypo = useTypographyTokens('body', FIELD_FEEDBACK_BODY_SIZE[resolvedSize], {
    emphasis: 'low',
  });

  // ─── Multi-option mode: track selected values ────────────────────────────

  const isGroupControlled = groupValue !== undefined;
  const [internalGroupValue, setInternalGroupValue] = useState<string[]>(groupDefaultValue ?? []);
  // Keep the latest controlled snapshot in a ref so the per-child handler
  // resolves against fresh state without re-binding on every render.
  const groupRef = useRef<string[]>(isGroupControlled ? (groupValue ?? []) : internalGroupValue);
  groupRef.current = isGroupControlled ? (groupValue ?? []) : internalGroupValue;

  const handleChildToggle = useCallback(
    (value: string | undefined, next: boolean) => {
      if (value === undefined) return;
      const current = groupRef.current;
      const has = current.includes(value);
      let nextValues: string[];
      if (next && !has) nextValues = [...current, value];
      else if (!next && has) nextValues = current.filter((v) => v !== value);
      else nextValues = current;
      if (!isGroupControlled) setInternalGroupValue(nextValues);
      onGroupValueChange?.(nextValues);
    },
    [isGroupControlled, onGroupValueChange]
  );

  // ─── Single-mode integrated checkbox ────────────────────────────────────

  const labelSuffixInside =
    required && label ? (
      <Text
        accessible={false}
        style={[typographyToTextStyle(headerLabelTypo), { color: negativeRole.content.high }]}
      >
        {' *'}
      </Text>
    ) : null;

  const labelTrailing = label && infoIconSlot ? infoIconSlot : null;

  const integrated = !isMultiMode ? (
    <Checkbox
      {...rest}
      label={label}
      description={description}
      labelSuffixInside={labelSuffixInside}
      labelTrailing={labelTrailing}
      size={size}
      appearance={appearance}
      selected={selected}
      defaultSelected={defaultSelected}
      indeterminate={indeterminate}
      readOnly={readOnly}
      disabled={disabled}
      errorHighlight={isInvalid}
      onSelectedChange={onSelectedChange}
      onPress={onPress}
      style={fullWidth ? styles.controlStretch : undefined}
      testID={!isMultiMode ? testID : undefined}
    />
  ) : null;

  // ─── Multi-option header + cloned children ───────────────────────────────

  const childCheckboxes = useMemo<ReactElement[]>(() => {
    if (!isMultiMode) return [];
    return flattenChildren(children).map((child, index) => {
      if (!isCheckboxElement(child)) {
        return child.key != null ? child : cloneElement(child, { key: index });
      }
      const childProps = child.props;
      const value = childProps.value;
      const isCheckedFromGroup = value !== undefined && groupRef.current.includes(value);
      const childSelected = childProps.selected ?? isCheckedFromGroup;
      const handleChildSelected = (next: boolean) => {
        childProps.onSelectedChange?.(next);
        handleChildToggle(value, next);
      };
      return cloneElement<CheckboxProps>(child, {
        key: child.key ?? value ?? index,
        size: childProps.size ?? size,
        appearance: childProps.appearance ?? appearance,
        disabled: childProps.disabled ?? disabled,
        readOnly: childProps.readOnly ?? readOnly,
        errorHighlight: childProps.errorHighlight ?? isInvalid,
        selected: childSelected,
        onSelectedChange: handleChildSelected,
      });
    });
  }, [isMultiMode, children, size, appearance, disabled, readOnly, isInvalid, handleChildToggle]);

  const labelTextStyle: StyleProp<TextStyle> = [
    typographyToTextStyle(headerLabelTypo),
    { color: role.content.high },
  ];
  const descriptionTextStyle: StyleProp<TextStyle> = [
    typographyToTextStyle(headerDescriptionTypo),
    { color: role.content.medium },
  ];

  const multiHeader = isMultiMode ? (
    <View style={styles.fieldset}>
      {label || infoIconSlot ? (
        <View style={styles.legendRow}>
          {label ? (
            <View style={styles.legendLabel}>
              <Text style={labelTextStyle} accessible={false}>
                {label}
              </Text>
              {labelSuffixInside}
            </View>
          ) : null}
          {infoIconSlot ? <View style={styles.legendTrailing}>{infoIconSlot}</View> : null}
        </View>
      ) : null}
      {description ? (
        <Text style={descriptionTextStyle} accessible={false}>
          {description}
        </Text>
      ) : null}
      <View style={styles.multiOptions}>{childCheckboxes}</View>
    </View>
  ) : null;

  // ─── Feedback / dynamic rows ────────────────────────────────────────────

  const feedbackContent =
    feedback ??
    (typeof error === 'string' && error.trim() !== '' ? (
      <Text
        accessible
        style={[typographyToTextStyle(feedbackTypo), { color: negativeRole.content.high }]}
      >
        {error}
      </Text>
    ) : null);

  const hasDynamicStrings =
    (typeof dynamicText === 'string' && dynamicText.trim() !== '') ||
    (typeof helperButton === 'string' && helperButton.trim() !== '');
  const dynamicRow =
    dynamicTextSlot ??
    (hasDynamicStrings ? (
      <View style={styles.dynamicRow}>
        {dynamicText ? (
          <Text
            accessible={false}
            style={[
              typographyToTextStyle(feedbackTypo),
              styles.dynamicLeading,
              { color: role.content.medium },
            ]}
          >
            {dynamicText}
          </Text>
        ) : (
          <View style={styles.dynamicLeading} />
        )}
        {helperButton ? (
          <Pressable
            disabled={isDisabled}
            onPress={onHelperPress}
            accessibilityRole="button"
            accessibilityLabel={helperButton}
          >
            {({ pressed }) => (
              <Text
                style={[
                  typographyToTextStyle(feedbackTypo),
                  {
                    color: pressed ? role.content.tintedA11y : role.content.tintedA11y,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                {helperButton}
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    ) : null);

  // ─── Outer wrapper ──────────────────────────────────────────────────────

  const fieldA11y = getCheckboxFieldAccessibilityProps(props, {
    isInvalid,
    isDisabled
  });

  const wrapperStyle: StyleProp<ViewStyle> = [
    styles.field,
    fullWidth ? styles.fieldFullWidth : null,
    isDisabled ? { opacity: FIELD_DISABLED_OPACITY } : null,
    styleProp,
  ];

  return (
    <View {...fieldA11y} testID={isMultiMode ? testID : undefined} style={wrapperStyle}>
      {isMultiMode ? multiHeader : integrated}
      {feedbackContent ? (
        <View style={styles.feedbackRow} accessible accessibilityLiveRegion="polite">
          {feedbackContent}
        </View>
      ) : null}
      {dynamicRow}
    </View>
  );
}

CheckboxField.displayName = 'CheckboxField';

export type { CheckboxFieldProps } from './interface';
