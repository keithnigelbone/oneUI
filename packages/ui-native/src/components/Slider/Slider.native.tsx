/**
 * Slider.native.tsx
 *
 * OneUI Slider with full web parity.
 * Supports single/range mode, orientation, knob styles, and tooltips.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  PanResponder,
  type LayoutChangeEvent,
  type ViewStyle,
  type DimensionValue,
} from 'react-native';
import { useSurfaceTokens, useSurfaceAppearance } from '../../theme';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import { SlotParentAppearanceProvider } from '../../slots/SlotParentAppearanceContext.native';
import { styles, DISABLED_OPACITY, SLIDER_SIZES } from './Slider.styles.native';
import { useSliderState, getSliderAccessibilityProps, type SliderProps } from './interface';
import { tokens } from '@oneui/tokens';
import { Tooltip } from '../Tooltip';

export function Slider(props: SliderProps): React.ReactElement {
  const {
    value,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    knobStyle = 'outside',
    showSteps = false,
    snapToSteps = true,
    start,
    end,
    testID,
    style: styleProp,
    formatValue,
    showTooltip = 'auto',
  } = props;

  const state = useSliderState(props);
  const {
    resolvedAppearance,
    isDisabled,
    isReadOnly,
    isVertical,
    isRange,
    size,
    values: initialValues,
  } = state;

  const surfaceAppearance = useSurfaceAppearance();

  const role = useSurfaceTokens(resolvedAppearance);
  const surfaceRole = useSurfaceTokens(surfaceAppearance ?? 'neutral');

  const accentColor = role.surfaces.bold;
  const railColor = surfaceRole.surfaces.minimal;
  const stepDotColor = surfaceRole.surfaces.bold;

  const dimensions = SLIDER_SIZES[size];
  const trackHeight = dimensions.track;
  const knobSize = dimensions.knob;

  // Internal values state for uncontrolled mode
  const [internalValues, setInternalValues] = useState<number[]>(initialValues);
  const [activeThumbIndex, setActiveThumbIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Source of truth for values
  const currentValues = useMemo(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value];
    }
    return internalValues;
  }, [value, internalValues]);

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const containerRef = useRef<View>(null);
  const activeThumbRef = useRef<number | null>(null);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setLayout({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  }, []);

  const getValueFromPos = useCallback(
    (px: number) => {
      const sizePx = isVertical ? layout.height : layout.width;
      if (sizePx === 0) return min;

      const clampedPx = Math.max(0, Math.min(px, sizePx));
      // Vertical is bottom-up in web/Base UI for sliders
      const percentage = isVertical ? (sizePx - clampedPx) / sizePx : clampedPx / sizePx;

      const rawValue = min + percentage * (max - min);
      let finalValue = rawValue;

      if (snapToSteps) {
        finalValue = Math.round(rawValue / step) * step;
      }

      return Math.max(min, Math.min(max, finalValue));
    },
    [isVertical, layout, min, max, step, snapToSteps]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isDisabled && !isReadOnly,
        onMoveShouldSetPanResponder: () => !isDisabled && !isReadOnly,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const touchVal = getValueFromPos(isVertical ? locationY : locationX);

          // Find nearest thumb
          let nearestIndex = 0;
          if (isRange) {
            let minDiff = Infinity;
            currentValues.forEach((v, i) => {
              const diff = Math.abs(v - touchVal);
              if (diff < minDiff) {
                minDiff = diff;
                nearestIndex = i;
              }
            });
          }

          activeThumbRef.current = nearestIndex;
          setActiveThumbIndex(nearestIndex);
          setIsDragging(true);

          const nextValues = [...currentValues];
          nextValues[nearestIndex] = touchVal;

          // Ensure range constraints (no crossing)
          if (isRange) {
            nextValues.sort((a, b) => a - b);
            if (nearestIndex === 0 && nextValues[0] > nextValues[1]) nextValues[0] = nextValues[1];
            if (nearestIndex === 1 && nextValues[1] < nextValues[0]) nextValues[1] = nextValues[0];
          }

          if (value === undefined) {
            setInternalValues(isRange ? nextValues : [nextValues[0]]);
          }
          onValueChange?.(isRange ? nextValues : nextValues[0]);
        },
        onPanResponderMove: (evt) => {
          if (activeThumbRef.current === null) return;
          const { locationX, locationY } = evt.nativeEvent;
          const touchVal = getValueFromPos(isVertical ? locationY : locationX);

          const nextValues = [...currentValues];
          const index = activeThumbRef.current;
          nextValues[index] = touchVal;

          // Range constraints
          if (isRange) {
            if (index === 0 && nextValues[0] > nextValues[1]) nextValues[0] = nextValues[1];
            if (index === 1 && nextValues[1] < nextValues[0]) nextValues[1] = nextValues[0];
          }

          if (value === undefined) {
            setInternalValues(isRange ? nextValues : [nextValues[0]]);
          }
          onValueChange?.(isRange ? nextValues : nextValues[0]);
        },
        onPanResponderRelease: () => {
          onValueCommitted?.(isRange ? currentValues : currentValues[0]);
          activeThumbRef.current = null;
          setActiveThumbIndex(null);
          setIsDragging(false);
        },
      }),
    [
      isDisabled,
      isReadOnly,
      isVertical,
      isRange,
      currentValues,
      getValueFromPos,
      onValueChange,
      onValueCommitted,
      value,
    ]
  );

  const getPercentage = (v: number) => (v - min) / (max - min);

  const renderSteps = () => {
    if (!showSteps) return null;
    const stepCount = Math.floor((max - min) / step);
    if (stepCount > 50) return null; // Performance safeguard

    const dotSize = trackHeight / 2;
    const marks = [];

    for (let i = 0; i <= stepCount; i++) {
      const v = min + i * step;
      const pct = getPercentage(v);
      const pos: DimensionValue = `${pct * 100}%`;

      marks.push(
        <View
          key={i}
          style={[
            styles.stepMark,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: stepDotColor,
            },
            isVertical
              ? {
                  bottom: pos,
                  marginBottom: -(dotSize / 2),
                  left: '50%',
                  marginLeft: -(dotSize / 2),
                }
              : { left: pos, marginLeft: -(dotSize / 2), top: '50%', marginTop: -(dotSize / 2) },
          ]}
        />
      );
    }

    return (
      <View
        style={[
          styles.stepContainer,
          isVertical ? styles.stepContainerVertical : styles.stepContainerHorizontal,
        ]}
        pointerEvents="none"
      >
        {marks}
      </View>
    );
  };

  const renderActiveTrack = () => {
    const sorted = [...currentValues].sort((a, b) => a - b);
    const vMin = isRange ? sorted[0] : min;
    const vMax = isRange ? sorted[1] : currentValues[0];

    const startPct = getPercentage(vMin);
    const endPct = getPercentage(vMax);

    const activeTrackStyle: ViewStyle = {
      backgroundColor: accentColor,
      position: 'absolute',
    };

    if (isVertical) {
      activeTrackStyle.width = '100%';
      activeTrackStyle.bottom = `${startPct * 100}%`;
      activeTrackStyle.height = `${(endPct - startPct) * 100}%`;
    } else {
      activeTrackStyle.height = '100%';
      activeTrackStyle.left = `${startPct * 100}%`;
      activeTrackStyle.width = `${(endPct - startPct) * 100}%`;
    }

    return <View style={[styles.activeTrack, activeTrackStyle]} pointerEvents="none" />;
  };

  const renderThumb = (v: number, index: number) => {
    const pct = getPercentage(v);
    const pos: DimensionValue = `${pct * 100}%`;
    const isOutside = knobStyle === 'outside';

    const thumbStyle: ViewStyle = {
      position: 'absolute',
      zIndex: activeThumbIndex === index ? 10 : 1,
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (isVertical) {
      thumbStyle.bottom = pos;
      thumbStyle.transform = [{ translateY: knobSize / 2 }];
    } else {
      thumbStyle.left = pos;
      thumbStyle.transform = [{ translateX: -knobSize / 2 }];
    }

    const a11yBase = getSliderAccessibilityProps(props, state, index);
    const a11y = {
      ...a11yBase,
      accessibilityValue: { ...a11yBase.accessibilityValue, now: v },
    };

    const showTooltipNow =
      showTooltip === 'always' ||
      (showTooltip === 'auto' && isDragging && activeThumbIndex === index);

    const label = formatValue ? formatValue(v, index) : String(Math.round(v * 100) / 100);

    return (
      <View
        key={index}
        style={[
          styles.knob,
          {
            width: isOutside ? knobSize : trackHeight,
            height: isOutside ? knobSize : trackHeight,
            backgroundColor: accentColor,
          },
          thumbStyle,
        ]}
        {...a11y}
        pointerEvents="none"
      >
        {!isOutside && (
          <View
            style={[
              styles.knobInsideDot,
              {
                width: dimensions.knobInside,
                height: dimensions.knobInside,
                backgroundColor: role.surfaces.default,
              },
            ]}
          />
        )}
        <Tooltip
          content={label}
          open={showTooltipNow}
          trigger="manual"
          side={isVertical ? 'right' : 'top'}
          arrow={true}
          popupPointerEvents="none"
          minWidth={tokens.spacing['20']}
        >
          <View
            style={{
              width: isOutside ? knobSize : trackHeight,
              height: isOutside ? knobSize : trackHeight,
              backgroundColor: 'transparent',
            }}
          />
        </Tooltip>
      </View>
    );
  };

  const slotContextValue = useMemo(
    () => ({ sizePx: tokens.spacing['5'], color: surfaceRole.content.medium }),
    [surfaceRole.content.medium]
  );

  return (
    <View
      style={[
        styles.root,
        isVertical ? styles.rootVertical : styles.rootHorizonatal,
        isDisabled && { opacity: DISABLED_OPACITY },
        { minHeight: knobSize, minWidth: knobSize },
        styleProp,
      ]}
      testID={testID}
    >
      {start && (
        <ComponentSlotIconContext.Provider value={slotContextValue}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>
            <View style={[styles.slot, isVertical ? styles.slotVertical : styles.slotHorizontal]}>
              {start}
            </View>
          </SlotParentAppearanceProvider>
        </ComponentSlotIconContext.Provider>
      )}

      <View
        ref={containerRef}
        onLayout={handleLayout}
        style={[
          styles.control,
          isVertical
            ? { width: knobSize * 2, height: '100%' }
            : { height: knobSize, width: '100%' },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.track,
            isVertical ? styles.trackVertical : styles.trackHorizontal,
            isVertical ? { width: trackHeight } : { height: trackHeight },
            { backgroundColor: railColor },
          ]}
          pointerEvents="none"
        >
          {renderSteps()}
          {renderActiveTrack()}
        </View>
        {currentValues.map((v, i) => renderThumb(v, i))}
      </View>

      {end && (
        <ComponentSlotIconContext.Provider value={slotContextValue}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>
            <View style={[styles.slot, isVertical ? styles.slotVertical : styles.slotHorizontal]}>
              {end}
            </View>
          </SlotParentAppearanceProvider>
        </ComponentSlotIconContext.Provider>
      )}
    </View>
  );
}
