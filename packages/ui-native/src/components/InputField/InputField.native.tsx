/**
 * InputField.native.tsx
 *
 * RN peer of `packages/ui/src/components/InputField/InputField.tsx`.
 *
 * Pipeline:
 *   1. `useInputFieldState(props)` resolves appearance / size / invalid /
 *      visibility flags for the optional rows.
 *   2. The label header (string `label` + `description` + optional required
 *      asterisk + info icon) renders as a vertical stack matching web
 *      `.labelArea`. The info icon sits inline, immediately after the label /
 *      asterisk (left-aligned), mirroring web `.labelRow`.
 *   3. The bordered `<Input>` renders next — `errorHighlight` is set from
 *      the resolved `invalid` flag, every other Input prop is forwarded.
 *   4. Optional `<InputFeedback>` row — either the caller-supplied `feedback`
 *      node, the `error` string shorthand (variant=negative, attention=low),
 *      or nothing.
 *   5. Optional `<InputDynamicText>` row — composed from the `dynamicText` /
 *      `helperButton` strings (with `onHelperPress` wired to the trailing
 *      action).
 *
 * Visual fidelity mirrors web: stack gap `Spacing-1-5`, label area gap
 * `Spacing-0-5`, label row gap `Spacing-0-5`, label tier from
 * `inputSizeToLabelSize`, and the negative-bold asterisk colour from
 * `useSurfaceTokens('negative').content.tintedA11y`.
 */

import React, { type ReactNode } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { IconComponent, IconComponentProps } from '@oneui/shared';
import {
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
} from '../../theme';
import { Input } from '../Input/Input.native';
import { InputFeedback } from '../InputFeedback/InputFeedback.native';
import { InputDynamicText } from '../InputDynamicText/InputDynamicText.native';
import { IconButton } from '../IconButton';
import type { IconButtonSize } from '../IconButton';
import {
  getInputFieldAccessibilityProps,
  useInputFieldState,
  type InputFieldProps,
  type InputLabelSize,
} from './interface';
import { styles } from './InputField.styles.native';

// ============================================================================
// Default info-icon glyph — inline SVG matching the Material `info` semantic
// icon used by web `InputFieldDefaultInfo`. Conforms to the
// `IconComponentProps` shape so it plugs straight into `<IconButton icon={…}>`.
// ============================================================================

const INFO_PATH =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';

const InfoGlyph: IconComponent = ({
  size,
  width,
  height,
  color,
  fill,
}: IconComponentProps) => {
  const w = width ?? size ?? '100%';
  const h = height ?? size ?? '100%';
  const tint = (fill ?? color ?? 'currentColor') as string;
  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none">
      <Path d={INFO_PATH} fill={tint} />
    </Svg>
  );
};

// ============================================================================
// Label / info-icon tier maps (Figma .DNA/InputField)
// ============================================================================

const LABEL_SIZE_TO_TYPO: Record<InputLabelSize, 'S' | 'M' | 'L'> = {
  s: 'S',
  m: 'M',
  l: 'L',
};

/**
 * Info `IconButton` size mirrors web `InputFieldDefaultInfo.ICON_BUTTON_SIZE`:
 * the icon button container collapses to the same numeric f-step as the
 * label tier so the hit target lines up with the painted glyph.
 */
const LABEL_SIZE_TO_ICON_BUTTON: Record<InputLabelSize, IconButtonSize> = {
  s: 8,
  m: 10,
  l: 12,
};

// ============================================================================
// Component
// ============================================================================

export function InputField(props: InputFieldProps): ReactNode {
  const state = useInputFieldState(props);
  const {
    resolvedAppearance,
    labelSize,
    shape,
    attention,
    isDisabled,
    isReadOnly,
    isInvalid,
    hasLabel,
    hasDescription,
    hasInfoIcon,
    hasFeedback,
    hasDynamicRow,
    feedbackSize,
    infoIconAriaLabel,
    resolvedAccessibilityLabel,
  } = state;

  // Neutral role drives label / description copy colour (web `Text-High` /
  // `Text-Low` are aliases for the Primary role's default on-colours; we
  // reuse the neutral cascade so descender colour matches the bordered
  // Input's own label paint exactly).
  const neutralRole = useSurfaceTokens('neutral');
  const negativeRole = useSurfaceTokens('negative');

  const labelTypo = useTypographyTokens('label', LABEL_SIZE_TO_TYPO[labelSize], {
    emphasis: 'medium',
  });
  const descriptionTypo = useTypographyTokens('body', 'XS', { emphasis: 'low' });

  const labelStyle: TextStyle = {
    ...typographyToTextStyle(labelTypo),
    color: neutralRole.content.high,
  };

  const descriptionStyle: TextStyle = {
    ...typographyToTextStyle(descriptionTypo),
    color: neutralRole.content.low,
  };

  const asteriskStyle: TextStyle = {
    ...typographyToTextStyle(labelTypo),
    color: negativeRole.content.tintedA11y,
  };

  const rootA11y = getInputFieldAccessibilityProps(props);

  // ---- Label header ----
  const renderLabelArea = (): ReactNode => {
    if (!hasLabel && !hasDescription) {
      return null;
    }
    const labelRow = hasLabel ? (
      <View style={styles.labelRow}>
        <View style={styles.labelText}>
          <Text style={labelStyle} accessibilityRole="text">
            {props.label!.trim()}
            {props.required ? (
              <Text style={asteriskStyle} accessible={false}>
                {' *'}
              </Text>
            ) : null}
          </Text>
        </View>
        {hasInfoIcon ? (
          <View style={styles.labelTrailing}>{renderInfoTrigger()}</View>
        ) : null}
      </View>
    ) : null;

    const descriptionNode = hasDescription ? (
      <Text style={[styles.description, descriptionStyle]} accessibilityRole="text">
        {props.description!.trim()}
      </Text>
    ) : null;

    return (
      <View style={styles.labelArea}>
        {labelRow}
        {descriptionNode}
      </View>
    );
  };

  const renderInfoTrigger = (): ReactNode => {
    if (props.infoIconSlot != null) {
      return props.infoIconSlot;
    }
    return (
      <IconButton
        icon={InfoGlyph}
        aria-label={infoIconAriaLabel}
        disabled={isDisabled}
        size={LABEL_SIZE_TO_ICON_BUTTON[labelSize]}
        appearance="neutral"
        attention="low"
        condensed
      />
    );
  };

  // ---- Feedback row ----
  const renderFeedback = (): ReactNode => {
    if (props.feedback != null) {
      return props.feedback;
    }
    if (props.error != null && props.error.trim() !== '') {
      return (
        <InputFeedback
          variant="negative"
          attention="low"
          size={feedbackSize}
          feedback_message={props.error}
        />
      );
    }
    return null;
  };

  // ---- Dynamic text row ----
  const renderDynamicRow = (): ReactNode => {
    const dynamicContent =
      props.dynamicText != null && props.dynamicText.trim() !== ''
        ? props.dynamicText
        : undefined;
    const dynamicEnd =
      props.helperButton != null && props.helperButton.trim() !== ''
        ? props.helperButton
        : undefined;
    if (dynamicContent == null && dynamicEnd == null) {
      return null;
    }
    return (
      <InputDynamicText
        content={dynamicContent}
        end={dynamicEnd}
        onEndClick={props.onHelperPress}
        size={labelSize}
        disabled={isDisabled}
      />
    );
  };

  return (
    <View
      {...rootA11y}
      // `testID` targets the interactive Input control (forwarded below) so
      // Maestro `tapOn: { id: <testID> }` reaches the field. The decorative
      // root wrapper takes a derived `-field` id to remain addressable without
      // duplicating the control's id.
      testID={props.testID != null ? `${props.testID}-field` : undefined}
      style={[styles.field, props.style]}
    >
      {renderLabelArea()}

      <Input
        testID={props.testID}
        size={props.size}
        appearance={resolvedAppearance}
        shape={shape}
        attention={attention}
        start={props.start}
        start2={props.start2}
        end={props.end}
        end2={props.end2}
        placeholder={props.placeholder}
        value={props.value}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        onSubmit={props.onSubmit}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={props.required}
        maxLength={props.maxLength}
        id={props.id}
        name={props.name}
        type={props.type}
        autoComplete={props.autoComplete}
        autoFocus={props.autoFocus}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        errorHighlight={isInvalid}
        aria-invalid={isInvalid || undefined}
        // Visible `label` flows through `resolvedAccessibilityLabel`
        // automatically so the screen reader announces the field without
        // callers needing to mirror the string into `aria-label`.
        accessibilityLabel={resolvedAccessibilityLabel}
        aria-describedby={props['aria-describedby']}
        accessibilityHint={props.accessibilityHint}
      />

      {hasFeedback ? renderFeedback() : null}
      {hasDynamicRow ? renderDynamicRow() : null}
    </View>
  );
}

InputField.displayName = 'InputField';

export type { InputFieldProps, InputFieldNativeProps } from './interface';
