/**
 * InputDynamicText.native.tsx
 *
 * RN peer of `packages/ui/src/components/Input/internals/InputDynamicText.tsx`.
 *
 * Same prop contract + visual fidelity as web:
 *   - Optional leading copy (Body / Text-Medium → Text-Low when disabled).
 *   - Optional trailing action via `<Button attention="low" condensed>`.
 *   - Per-size Body XS / S / M typography (`useTypographyTokens`).
 *   - Surface context: content colour comes from
 *     `useSurfaceTokens('primary').content.medium / .low` so the row remaps
 *     correctly inside `<Surface mode="...">`.
 */

import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import {
  getInputDynamicTextAccessibilityProps,
  useInputDynamicTextState,
  type InputDynamicTextProps,
  type InputDynamicTextSize,
} from './interface';
import { CONTENT_MIN_HEIGHT, styles } from './InputDynamicText.styles.native';
import { useSurfaceTokens, useTypographyTokens } from '../../theme';
import type { SizeForRole } from '../../theme';
import { Button } from '../Button';
import type { ButtonSize } from '../Button';

/**
 * Row size → Body typography size. Mirrors web's per-size font-size /
 * line-height overrides in `InputDynamicText.module.css`:
 *   s → --Body-XS-FontSize / --Body-XS-LineHeight
 *   m → --Body-S-FontSize  / --Body-S-LineHeight
 *   l → --Body-M-FontSize  / --Body-M-LineHeight
 */
const SIZE_TO_BODY: Record<InputDynamicTextSize, SizeForRole['body']> = {
  s: 'XS',
  m: 'S',
  l: 'M',
};

/** Row size → Button size (same mapping as web's `LABEL_TO_BUTTON_SIZE`). */
const SIZE_TO_BUTTON: Record<InputDynamicTextSize, ButtonSize> = {
  s: 's',
  m: 'm',
  l: 'l',
};

export function InputDynamicText(props: InputDynamicTextProps): React.ReactElement | null {
  const { size, hasContent, hasEnd, trailingOnly, isEmpty, isDisabled } =
    useInputDynamicTextState(props);

  if (isEmpty) return null;

  // Content paint — web `--Text-Medium` / `--Text-Low` are aliases for the
  // Primary role's default on-colours. Reading from the Primary role here
  // keeps the surface-context cascade intact: inside `<Surface mode="bold">`
  // `content.medium` automatically remaps to the on-bold medium tone.
  const role = useSurfaceTokens('primary');
  const contentColour = isDisabled ? role.content.low : role.content.medium;
  const contentTypo = useTypographyTokens('body', SIZE_TO_BODY[size], {
    emphasis: 'low',
  });
  const a11y = getInputDynamicTextAccessibilityProps({ 'aria-live': props['aria-live'] });

  const contentMinHeight = CONTENT_MIN_HEIGHT[size];

  return (
    <View
      style={[styles.root, trailingOnly ? styles.rootTrailingOnly : null, props.style as ViewStyle]}
      testID={props.testID}
    >
      {hasContent ? (
        <Text
          {...a11y}
          style={[
            styles.content,
            {
              fontSize: contentTypo.fontSize,
              lineHeight: contentTypo.lineHeight,
              fontWeight: contentTypo.fontWeight,
              fontFamily: contentTypo.fontFamily,
              color: contentColour,
            },
            contentMinHeight != null ? { minHeight: contentMinHeight } : null,
          ]}
        >
          {props.content}
        </Text>
      ) : null}
      {hasEnd ? (
        <View style={styles.end}>
          <Button
            attention='low'
            condensed
            size={SIZE_TO_BUTTON[size]}
            disabled={isDisabled}
            onPress={props.onEndClick}
            aria-label={props.endAriaLabel}
            accessibilityHint={props.accessibilityHint}
          >
            {props.end as string}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export type { InputDynamicTextProps, InputDynamicTextNativeProps } from './interface';
