/**
 * Scrim.native.tsx
 *
 * Native-only — no web peer. Spec: `./scrim.md`.
 *
 * Decorative background overlay (edge gradient or flat tint). Non-interactive;
 * pair with Modal / Sheet for dismiss and focus management.
 */

import React, { useId } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useOneUITheme } from '../../theme';
import {
  getScrimAccessibilityProps,
  resolveScrimTone,
  useScrimState,
  type ScrimProps,
} from './interface';
import { resolveScrimPaint } from './scrimPaint';
import { styles } from './Scrim.styles.native';

function ScrimBand({
  paint,
  direction,
  gradientId,
}: {
  paint: ReturnType<typeof resolveScrimPaint>;
  direction: { x1: string; y1: string; x2: string; y2: string };
  gradientId: string;
}): React.ReactElement {
  if (paint.flatColor) {
    return (
      <View style={[styles.band, styles.svg, { backgroundColor: paint.flatColor }]} />
    );
  }

  return (
    <View style={styles.band}>
      <Svg width='100%' height='100%' style={styles.svg}>
        <Defs>
          <LinearGradient
            id={gradientId}
            x1={direction.x1}
            y1={direction.y1}
            x2={direction.x2}
            y2={direction.y2}
          >
            {paint.gradientStops.map((stop) => (
              <Stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.stopColor}
                stopOpacity={stop.stopOpacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x='0' y='0' width='100%' height='100%' fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

export function Scrim(props: ScrimProps): React.ReactElement {
  const { style: styleProp, testID } = props;
  const { attention, size, position, variant, layout } = useScrimState(props);
  const theme = useOneUITheme();
  const tone = resolveScrimTone(theme.darkMode);
  const paint = resolveScrimPaint(theme, tone, attention, variant, position, size);
  const gradientId = useId().replace(/:/g, '');

  const zoneStyle = (visible: boolean): ViewStyle => ({
    ...styles.zone,
    flex: visible ? layout.zoneFlex : 0,
  });

  const bandStyle: ViewStyle = {
    ...styles.band,
    flex: layout.bandFlex,
  };

  return (
    <View
      {...getScrimAccessibilityProps()}
      pointerEvents='none'
      style={[
        styles.root,
        layout.rootAlign,
        // Root stays transparent — spacer zones must reveal content beneath
        // (images, scroll areas). `surfaces.ghost` paints the page step and
        // would block the layer below; Layers `color_surface_ghost` = transparent.
        styleProp,
      ]}
      testID={testID}
    >
      <View style={zoneStyle(layout.showZone1)} />
      <View style={bandStyle}>
        <ScrimBand paint={paint} direction={layout.gradientDirection} gradientId={gradientId} />
      </View>
      <View style={zoneStyle(layout.showZone2)} />
    </View>
  );
}

export type { ScrimProps } from './interface';
