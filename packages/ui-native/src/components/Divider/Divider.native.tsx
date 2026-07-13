/**
 * Divider.native.tsx
 *
 * RN peer of `packages/ui/src/components/Divider/Divider.tsx`.
 * Stroke geometry in `Divider.styles.native.ts`; role/attention colours
 * and typography merge inline (web `--_motion-*` / `--Label-S-*` cascade).
 */

import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import { useSurfaceTokens, useTypographyTokens } from '../../theme';
import {
  DIVIDER_LINE_A11Y,
  getDividerAccessibilityProps,
  useDividerState,
  type DividerProps,
} from './interface';
import { LINE_STYLE, SEGMENT_STYLE, styles } from './Divider.styles.native';
import {
  SlotParentAppearanceProvider,
  type SlotParentAppearance,
} from '../../slots/SlotParentAppearanceContext.native';

function resolveDividerColours(
  role: ReturnType<typeof useSurfaceTokens>,
  attention: 'high' | 'medium' | 'low'
): { lineColour: string; contentColour: string } {
  if (attention === 'high') {
    return { lineColour: role.content.high, contentColour: role.content.high };
  }
  if (attention === 'medium') {
    return {
      lineColour: role.content.strokeMedium,
      contentColour: role.content.medium,
    };
  }
  return {
    lineColour: role.content.strokeLow,
    contentColour: role.content.low,
  };
}

export function Divider(props: DividerProps): React.ReactElement {
  const {
    orientation,
    size,
    contentType,
    contentAlign,
    resolvedAppearance,
    attention,
    roundCaps,
    hasContent,
  } = useDividerState(props);

  if (props.children != null && contentType === 'none') {
    console.warn(
      '[OneUI Divider] `children` must be either a string or an <Icon /> component.'
    );
  }

  const role = useSurfaceTokens(resolvedAppearance);
  const { lineColour, contentColour } = resolveDividerColours(role, attention);
  const a11y = getDividerAccessibilityProps(orientation, props.accessibilityHint);
  const radius = roundCaps ? tokens.shape.Pill : 0;
  const labelTypo = useTypographyTokens('label', 'XS', { emphasis: 'medium' });

  const linePaint = { backgroundColor: lineColour, borderRadius: radius };

  if (!hasContent) {
    return (
      <View
        {...a11y}
        style={[LINE_STYLE[orientation][size], linePaint, props.style as ViewStyle]}
        testID={props.testID}
      />
    );
  }

  const isHorizontal = orientation === 'horizontal';
  const segmentBase = SEGMENT_STYLE[orientation][size];
  const showLeadingLine = contentAlign !== 'start';
  const showTrailingLine = contentAlign !== 'end';

  const renderLine = (key: string): React.ReactElement => (
    <View key={key} {...DIVIDER_LINE_A11Y} style={[segmentBase, linePaint, styles.lineFlex]} />
  );

  const slot =
    contentType === 'label' ? (
      <Text
        style={[
          styles.contentText,
          {
            fontSize: labelTypo.fontSize,
            lineHeight: labelTypo.lineHeight,
            fontWeight: labelTypo.fontWeight,
            fontFamily: labelTypo.fontFamily,
            color: contentColour,
          },
        ]}
      >
        {props.children}
      </Text>
    ) : (
      <View style={contentType === 'icon' ? styles.contentSlot : undefined}>
        <SlotParentAppearanceProvider value={props.appearance as SlotParentAppearance}>
          {props.children}
        </SlotParentAppearanceProvider>
      </View>
    );

  return (
    <View
      {...a11y}
      style={[
        isHorizontal ? styles.containerHorizontal : styles.containerVertical,
        props.style as ViewStyle,
      ]}
      testID={props.testID}
    >
      {showLeadingLine ? renderLine('leading') : null}
      <View style={styles.content}>{slot}</View>
      {showTrailingLine ? renderLine('trailing') : null}
    </View>
  );
}

export type { DividerProps, DividerNativeProps } from './interface';
