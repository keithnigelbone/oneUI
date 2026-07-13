/**
 * TouchSlider.native.tsx
 *
 * Chunky fingertip-friendly slider — single size per Figma spec.
 * Aligned with packages/ui/src/components/TouchSlider/TouchSlider.tsx.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  PanResponder,
  type LayoutChangeEvent,
  type ViewStyle,
  type DimensionValue,
} from 'react-native';
import { useSurfaceTokens, useOneUITheme, useSurfaceAppearance } from '../../theme';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import { SlotParentAppearanceProvider } from '../../slots/SlotParentAppearanceContext.native';
import { styles, DISABLED_OPACITY } from './TouchSlider.styles.native';
import {
  useTouchSliderState,
  getTouchSliderAccessibilityProps,
  type TouchSliderProps,
} from './interface';
import { tokens } from '@oneui/tokens';

export function TouchSlider(props: TouchSliderProps): React.ReactElement {
  const {
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    start,
    testID,
    style: styleProp,
  } = props;

  const state = useTouchSliderState(props);
  const { resolvedAppearance, isDisabled, isReadOnly, isVertical, progressStyle } = state;

  const theme = useOneUITheme();
  const surfaceAppearance = useSurfaceAppearance();

  const role = useSurfaceTokens(resolvedAppearance);
  const surfaceRole = useSurfaceTokens(surfaceAppearance ?? 'neutral');

  const fill = role.surfaces.bold;
  const rail = surfaceRole.surfaces.minimal;

  const onColor = role.onBoldContent.tintedA11y;

  // Internal value state for uncontrolled/immediate updates
  const [internalValue, setInternalValue] = useState<number>(() => {
    const val = value ?? defaultValue ?? 0;
    return Array.isArray(val) ? val[0] : val;
  });

  // Keep internal value in sync with prop if controlled
  const currentValue = useMemo(() => {
    const val = value ?? internalValue;
    return Array.isArray(val) ? val[0] : val;
  }, [value, internalValue]);

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const containerRef = useRef<View>(null);
  const startValueRef = useRef<number>(0);
  const currentValueRef = useRef<number>(currentValue);

  // Sync ref with state for use in PanResponder without dependency re-creation
  currentValueRef.current = currentValue;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setLayout({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  }, []);

  // Simplified update logic using percentage
  const setValueFromPos = useCallback(
    (px: number) => {
      const size = isVertical ? layout.height : layout.width;
      if (size === 0) return currentValueRef.current;

      const clampedPx = Math.max(0, Math.min(px, size));
      // Vertical is bottom-up in web/Base UI for sliders
      const percentage = isVertical ? (size - clampedPx) / size : clampedPx / size;

      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const finalValue = Math.max(min, Math.min(max, steppedValue));

      if (finalValue !== currentValueRef.current) {
        if (value === undefined) {
          setInternalValue(finalValue);
        }
        onValueChange?.(finalValue);
      }
      return finalValue;
    },
    [isVertical, layout, min, max, step, onValueChange, value]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isDisabled && !isReadOnly,
        onMoveShouldSetPanResponder: () => !isDisabled && !isReadOnly,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const val = setValueFromPos(isVertical ? locationY : locationX);
          startValueRef.current = val;
        },
        onPanResponderMove: (evt, gestureState) => {
          const size = isVertical ? layout.height : layout.width;
          if (size === 0) return;

          const range = max - min;
          const change = isVertical
            ? -(gestureState.dy / size) * range
            : (gestureState.dx / size) * range;

          const nextValue = startValueRef.current + change;
          const steppedValue = Math.round(nextValue / step) * step;
          const finalValue = Math.max(min, Math.min(max, steppedValue));

          if (finalValue !== currentValueRef.current) {
            if (value === undefined) {
              setInternalValue(finalValue);
            }
            onValueChange?.(finalValue);
          }
        },
        onPanResponderRelease: () => {
          onValueCommitted?.(currentValueRef.current);
        },
      }),
    [
      isDisabled,
      isReadOnly,
      isVertical,
      layout,
      min,
      max,
      step,
      onValueChange,
      value,
      onValueCommitted,
      setValueFromPos,
    ]
  );

  const percentage = (currentValue - min) / (max - min);
  const pillRadius = theme.shape.Pill;

  const indicatorStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      backgroundColor: fill,
      position: 'absolute',
    };

    const pctString: DimensionValue = `${percentage * 100}%`;

    if (isVertical) {
      base.width = '100%';
      base.height = pctString;
      base.bottom = 0;
      base.borderBottomLeftRadius = pillRadius;
      base.borderBottomRightRadius = pillRadius;
      base.borderTopLeftRadius = progressStyle === 'rounded' ? pillRadius : 0;
      base.borderTopRightRadius = progressStyle === 'rounded' ? pillRadius : 0;
    } else {
      base.height = '100%';
      base.width = pctString;
      base.left = 0;
      base.borderTopLeftRadius = pillRadius;
      base.borderBottomLeftRadius = pillRadius;
      base.borderTopRightRadius = progressStyle === 'rounded' ? pillRadius : 0;
      base.borderBottomRightRadius = progressStyle === 'rounded' ? pillRadius : 0;
    }
    return base;
  }, [isVertical, percentage, fill, pillRadius, progressStyle]);

  const a11y = getTouchSliderAccessibilityProps(props, state);

  const slotContext = useMemo(() => ({ sizePx: tokens.spacing['4-5'], color: onColor }), [onColor]);

  return (
    <View
      style={[
        isVertical && styles.rootVertical,
        isDisabled && { opacity: DISABLED_OPACITY },
        styleProp,
      ]}
      testID={testID}
    >
      <View
        ref={containerRef}
        onLayout={handleLayout}
        {...a11y}
        style={[
          styles.control,
          isVertical ? styles.controlVertical : styles.controlHorizontal,
          { borderRadius: pillRadius, backgroundColor: rail },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.indicator, indicatorStyle]} pointerEvents="none" />
        <ComponentSlotIconContext.Provider value={slotContext}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>
            {start && (
              <View
                style={[
                  styles.slot,
                  isVertical ? styles.slotVertical : styles.slotHorizontal,
                  isVertical ? styles.slotStartVertical : styles.slotStartHorizontal,
                ]}
                pointerEvents="none"
              >
                {start}
              </View>
            )}
          </SlotParentAppearanceProvider>
        </ComponentSlotIconContext.Provider>
      </View>
    </View>
  );
}
