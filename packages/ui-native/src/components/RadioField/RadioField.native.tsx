/**
 * RadioField.native.tsx
 *
 * RN peer of `packages/ui/src/components/RadioField/RadioField.tsx`.
 *
 * Three render modes (mirroring web):
 *   - **Integrated single mode** (no `children`, string `label`): a lone
 *     implicit `<Radio>` rendered next to the field label / description,
 *     with on/off semantics. Toggle via `checked` + `onCheckedChange` or
 *     string `value` / `onValueChange` against `singleOptionValue`.
 *   - **Plain option mode** (1 `<Radio>` child): renders the optional
 *     description / info-icon row, then the option itself (the option owns
 *     its own label).
 *   - **Multi-option mode** (>=2 `<Radio>` children): renders a
 *     fieldset-style legend row + description, then a `<RadioGroup>` that
 *     stacks the children, then the feedback / dynamic rows.
 *
 * Native simplification: web composes `<InputFeedback>` / `<InputDynamicText>`
 * — those native ports are not yet shipped, so feedback / helper rows
 * render inline `<Text>` rows with the same paint contract. When the native
 * peers land we swap them in without breaking the slot contract.
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
import {
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
} from '../../theme';
import { Radio } from '../Radio/Radio.native';
import type { RadioProps } from '../Radio/interface';
import { resolveSize } from '../Radio/interface';
import {
  getRadioFieldAccessibilityProps,
  useRadioFieldState,
  type RadioFieldProps,
} from './interface';
import {
  FIELD_DISABLED_OPACITY,
  FIELD_FEEDBACK_BODY_SIZE,
  FIELD_HEADER_DESCRIPTION_SIZE,
  FIELD_HEADER_LABEL_SIZE,
  styles,
} from './RadioField.styles.native';

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

function isRadioElement(el: ReactElement): el is ReactElement<RadioProps> {
  return el.type === Radio;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function RadioField(props: RadioFieldProps): React.ReactElement {
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
    orientation = 'vertical',
    children,
    value: valueProp,
    defaultValue,
    onValueChange,
    checked,
    defaultChecked,
    onCheckedChange,
    singleOptionValue,
    disabled,
    readOnly,
    style: styleProp,
    testID,
  } = props;

  const flatChildren = useMemo(() => flattenChildren(children), [children]);
  const optionCount = flatChildren.length;

  const isInvalid = invalid === true || (typeof error === 'string' && error.trim() !== '');
  const isDisabled = disabled === true;
  const sv = singleOptionValue ?? 'on';

  const isMultiOptionMode = optionCount > 1;
  const isPlainOptionMode = optionCount === 1;
  const hasLabel = typeof label === 'string' && label.trim() !== '';
  const isIntegratedSingle = optionCount === 0 && hasLabel;

  const resolvedSize = resolveSize(size);

  // ─── Theme tokens ────────────────────────────────────────────────────────

  const role = useSurfaceTokens(appearance ?? 'auto');
  const negativeRole = useSurfaceTokens('negative');

  const headerLabelTypo = useTypographyTokens(
    'body',
    FIELD_HEADER_LABEL_SIZE[resolvedSize],
    { emphasis: 'medium' },
  );
  const headerDescriptionTypo = useTypographyTokens(
    'body',
    FIELD_HEADER_DESCRIPTION_SIZE,
    { emphasis: 'low' },
  );
  const feedbackTypo = useTypographyTokens(
    'body',
    FIELD_FEEDBACK_BODY_SIZE[resolvedSize],
    { emphasis: 'low' },
  );

  const labelTextStyle: StyleProp<TextStyle> = [
    typographyToTextStyle(headerLabelTypo),
    { color: role.content.high },
  ];
  const descriptionTextStyle: StyleProp<TextStyle> = [
    typographyToTextStyle(headerDescriptionTypo),
    { color: role.content.medium },
  ];

  const labelSuffixInside = required && hasLabel ? (
    <Text
      accessible={false}
      style={[typographyToTextStyle(headerLabelTypo), { color: negativeRole.content.high }]}
    >
      {' *'}
    </Text>
  ) : null;

  // ─── Group state (controlled / uncontrolled) ─────────────────────────────

  const isBoolControlled = isIntegratedSingle && checked !== undefined;
  const isStringControlled = valueProp !== undefined;

  let mergedDefaultValue = defaultValue;
  if (
    isIntegratedSingle &&
    !isBoolControlled &&
    !isStringControlled &&
    defaultChecked !== undefined
  ) {
    mergedDefaultValue = defaultChecked ? sv : '';
  }

  const useInternalValue = !isBoolControlled && !isStringControlled;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    mergedDefaultValue,
  );
  const internalRef = useRef<string | undefined>(internalValue);
  internalRef.current = internalValue;

  const effectiveValue = useMemo(() => {
    if (isBoolControlled) return checked ? sv : '';
    if (isStringControlled) return valueProp;
    return internalValue ?? mergedDefaultValue ?? '';
  }, [isBoolControlled, checked, sv, isStringControlled, valueProp, internalValue, mergedDefaultValue]);

  const handleValueChange = useCallback(
    (next: string) => {
      if (useInternalValue) setInternalValue(next);
      onValueChange?.(next);
      if (isIntegratedSingle) {
        onCheckedChange?.(next === sv);
      }
    },
    [useInternalValue, onValueChange, isIntegratedSingle, onCheckedChange, sv],
  );

  // Integrated single mode supports clearing on re-press of the same value
  // (matches web behaviour where Base UI suppresses the duplicate event).
  const handleIntegratedPress = useCallback(() => {
    if (isDisabled || readOnly) return;
    const current = effectiveValue;
    handleValueChange(current === sv ? '' : sv);
  }, [isDisabled, readOnly, effectiveValue, handleValueChange, sv]);

  // ─── Feedback / dynamic rows ────────────────────────────────────────────

  const feedbackContent =
    feedback ??
    (typeof error === 'string' && error.trim() !== '' ? (
      <Text
        accessible
        accessibilityLiveRegion='polite'
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
            accessibilityRole='button'
            accessibilityLabel={helperButton}
          >
            {({ pressed }) => (
              <Text
                style={[
                  typographyToTextStyle(feedbackTypo),
                  {
                    color: role.content.tintedA11y,
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

  // ─── Multi-option header + cloned options ────────────────────────────────

  const enhancedOptions = useMemo<ReactElement[]>(() => {
    if (optionCount === 0) return [];
    return flatChildren.map((child, index) => {
      if (!isRadioElement(child)) {
        return child.key != null ? child : cloneElement(child, { key: index });
      }
      const childProps = child.props;
      const itemValue = childProps.value;
      const itemKey = itemValue ?? index;
      const callerPress = childProps.onPress;
      // RadioField owns the selection model — push controlled `checked` +
      // `onPress` to each child so the previously-checked Radio is cleared
      // automatically when another is pressed. The child's own `onPress`
      // (if any) still fires for callers that want to observe the press.
      return cloneElement<RadioProps>(child, {
        key: child.key ?? itemKey,
        size: childProps.size ?? size,
        appearance: childProps.appearance ?? appearance,
        disabled: childProps.disabled ?? disabled,
        readOnly: childProps.readOnly ?? readOnly,
        errorHighlight: childProps.errorHighlight ?? isInvalid,
        checked: itemValue != null ? itemValue === effectiveValue : childProps.checked,
        onPress:
          itemValue != null
            ? () => {
                callerPress?.();
                if (isDisabled || readOnly) return;
                // Press-to-clear in single-option mode (matches web Base UI
                // behaviour); otherwise just select the pressed value.
                if (isPlainOptionMode && effectiveValue === itemValue) {
                  handleValueChange('');
                } else {
                  handleValueChange(itemValue);
                }
              }
            : callerPress,
        testID: childProps.testID ?? (testID ? `${testID}-item-${itemKey}` : undefined),
      });
    });
  }, [
    flatChildren,
    optionCount,
    size,
    appearance,
    disabled,
    readOnly,
    isInvalid,
    isDisabled,
    isPlainOptionMode,
    effectiveValue,
    handleValueChange,
    testID,
  ]);

  const hasDescription = typeof description === 'string' && description.trim() !== '';

  const multiHeader = isMultiOptionMode ? (
    <View style={styles.fieldset}>
      {hasLabel || infoIconSlot ? (
        <View style={styles.legendRow}>
          {hasLabel ? (
            <View style={styles.legendLabel}>
              <Text style={labelTextStyle} accessible={false}>
                {label}
              </Text>
              {labelSuffixInside}
            </View>
          ) : null}
          {infoIconSlot ? (
            <View style={styles.legendTrailing}>{infoIconSlot}</View>
          ) : null}
        </View>
      ) : null}
      {hasDescription ? (
        <Text style={descriptionTextStyle} accessible={false}>
          {description}
        </Text>
      ) : null}
      <View
        accessibilityLabel={hasLabel ? undefined : props['aria-label']}
        testID={testID ? `${testID}-group` : undefined}
        style={
          orientation === 'horizontal' ? styles.groupHorizontal : styles.groupVertical
        }
      >
        {enhancedOptions}
      </View>
    </View>
  ) : null;

  const plainOption = isPlainOptionMode ? (
    <View style={{ width: fullWidth ? '100%' : undefined, gap: 0 }}>
      {hasDescription || infoIconSlot ? (
        <View style={styles.legendRow}>
          {hasDescription ? (
            <Text style={[descriptionTextStyle, { flex: 1 }]} accessible={false}>
              {description}
            </Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {infoIconSlot ? (
            <View style={styles.legendTrailing}>{infoIconSlot}</View>
          ) : null}
        </View>
      ) : null}
      <View
        accessibilityLabel={props['aria-label']}
        testID={testID ? `${testID}-group` : undefined}
        style={
          orientation === 'horizontal' ? styles.groupHorizontal : styles.groupVertical
        }
      >
        {enhancedOptions}
      </View>
    </View>
  ) : null;

  // ─── Integrated single mode ──────────────────────────────────────────────

  const integratedSingle = isIntegratedSingle ? (
    <View style={styles.integratedRow}>
      <Radio
        value={sv}
        size={size}
        appearance={appearance}
        disabled={disabled}
        readOnly={readOnly}
        errorHighlight={isInvalid}
        checked={effectiveValue === sv}
        onPress={handleIntegratedPress}
        aria-label={label}
        testID={testID ? `${testID}-item-${sv}` : undefined}
      />
      <View style={styles.integratedLabelColumn}>
        <View style={styles.legendRow}>
          {hasLabel ? (
            <View style={styles.legendLabel}>
              <Text style={labelTextStyle} accessible={false}>
                {label}
              </Text>
              {labelSuffixInside}
            </View>
          ) : null}
          {infoIconSlot ? (
            <View style={styles.legendTrailing}>{infoIconSlot}</View>
          ) : null}
        </View>
        {hasDescription ? (
          <Text style={descriptionTextStyle} accessible={false}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  ) : null;

  // ─── Outer wrapper ──────────────────────────────────────────────────────

  const fieldA11y = getRadioFieldAccessibilityProps(props, {
    isInvalid,
    isDisabled,
  });

  const wrapperStyle: StyleProp<ViewStyle> = [
    styles.field,
    fullWidth ? styles.fieldFullWidth : null,
    isDisabled ? { opacity: FIELD_DISABLED_OPACITY } : null,
    styleProp,
  ];

  return (
    <View {...fieldA11y} testID={testID} style={wrapperStyle}>
      {isMultiOptionMode ? multiHeader : null}
      {isPlainOptionMode ? plainOption : null}
      {isIntegratedSingle ? integratedSingle : null}
      {feedbackContent ? <View style={styles.feedbackRow}>{feedbackContent}</View> : null}
      {dynamicRow}
    </View>
  );
}

RadioField.displayName = 'RadioField';

export type { RadioFieldProps } from './interface';
