/**
 * HeaderItem.native.tsx
 *
 * Individual navigation item — Figma Header.Item (3342:59395)
 *
 * Attention levels control active visual:
 *   low:    content/high when active; content/low when inactive
 *   medium: accent when active; content/low when inactive
 *   high:   accent + pill when active; content/low when inactive
 */

import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSurfaceTokens, useTypographyTokens, typographyToTextStyle } from '../../theme';
import {
  HEADER_INDICATOR_A11Y,
  getHeaderItemAccessibilityProps,
  useHeaderItemState,
  type HeaderItemProps,
} from './interface';
import { headerItemLabelColor, resolveHeaderChromePaint } from './Header.chrome.native';
import { slotSizeStyle, styles } from './Header.styles.native';
import { resolveStateLayerInsets } from './HeaderItem.layout.native';

export function HeaderItem(props: HeaderItemProps): React.ReactElement {
  const {
    onPress,
    children,
    start,
    end,
    startSize,
    endSize,
    visuallyAlignToStart,
    style,
    testID,
  } = props;

  const state = useHeaderItemState(props);
  const neutral = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  const paint = resolveHeaderChromePaint(neutral, primary);
  const labelTypography = useTypographyTokens('label', 'S', { emphasis: 'medium' });
  const [pressed, setPressed] = useState(false);
  const a11y = getHeaderItemAccessibilityProps(props, state);

  const labelColor = headerItemLabelColor(state.resolvedAttention, state.isActive, paint);

  const showPill = state.resolvedAttention === 'high' && state.isActive;
  const showItemUnderline = state.resolvedAttention === 'medium' && state.isActive;
  const pillBackgroundColor =
    showPill && pressed ? paint.pressed : showPill ? paint.subtle : undefined;

  const stateLayerInsets = resolveStateLayerInsets({
    hasStartSlot: state.hasStartSlot,
    hasEndSlot: state.hasEndSlot,
    startSize,
    endSize,
    visuallyAlignToStart,
  });

  return (
    <Pressable
      testID={testID}
      {...a11y}
      disabled={state.isDisabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.item, style]}
    >
      <View
        style={[
          styles.itemStateLayer,
          stateLayerInsets,
          showPill
            ? [styles.itemStateLayerPill, { backgroundColor: pillBackgroundColor }]
            : undefined,
        ]}
      >
        <View style={styles.itemContentWrapper}>
          {start ? <View style={[styles.itemSlot, slotSizeStyle(startSize)]}>{start}</View> : null}
          <Text
            style={[typographyToTextStyle(labelTypography), { color: labelColor }]}
            numberOfLines={1}
          >
            {children}
          </Text>
          {showItemUnderline ? (
            <View
              {...HEADER_INDICATOR_A11Y}
              style={[styles.itemIndicator, { backgroundColor: paint.indicator }]}
            />
          ) : null}
          {end ? <View style={[styles.itemSlot, slotSizeStyle(endSize)]}>{end}</View> : null}
        </View>
      </View>
    </Pressable>
  );
}
