/**
 * MetallicGradientFill.tsx
 *
 * Absolutely-positioned SVG gradient layer that renders metallic fill (and
 * optional gradient border) using `react-native-svg` — already a peer dep of
 * `@oneui/ui-native` via icons and Logo. No external gradient library required.
 *
 * Angle → SVG coords uses the same math as `materialSvg.ts`'s
 * `getLinearGradientAttrs`, which is already proven correct for Logo metallic
 * rendering on native.
 */

import React, { useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Path } from 'react-native-svg';

export interface MetallicGradientFillProps {
  /** 8 fill gradient hex stops from `ResolvedMetallicGradient.colors`. */
  colors: readonly string[];
  /** 8 fill gradient position offsets (0–1). */
  locations: readonly number[];
  /** 6 stroke gradient hex stops — present when a `strokeImage` tokenRef is configured. */
  strokeColors?: readonly string[];
  /** 6 stroke gradient positions (0–1). */
  strokeLocations?: readonly number[];
  /** CSS gradient angle in degrees (0 = up, 90 = right). */
  angle: number;
  /** Measured pixel width of the parent container. */
  width: number;
  /** Measured pixel height of the parent container. */
  height: number;
  /** Uniform border radius in pixels. Ignored when borderRadii is provided. */
  borderRadius?: number;
  /**
   * Per-corner radii. When provided, renders a <Path> rounded-rect instead of
   * <Rect rx> so ornament-facing corners can be zeroed independently.
   */
  borderRadii?: { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number };
  /** When set, renders outer stroke gradient (full area) + inset fill gradient. */
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Convert a CSS gradient angle to SVG LinearGradient x1/y1/x2/y2 (0-1 fractional,
 * objectBoundingBox units). Mirrors `getLinearGradientAttrs` in materialSvg.ts.
 */
function angleToSvgCoords(angle: number): { x1: number; y1: number; x2: number; y2: number } {
  const radians = (((angle % 360) + 360) % 360) * (Math.PI / 180);
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const scale = 0.5 / Math.max(Math.abs(dx), Math.abs(dy), 0.0001);
  return {
    x1: 0.5 - dx * scale,
    y1: 0.5 - dy * scale,
    x2: 0.5 + dx * scale,
    y2: 0.5 + dy * scale,
  };
}

/**
 * Build an SVG path for a rounded rectangle with independent per-corner radii.
 * All radii are capped to half the shorter dimension to prevent overlap.
 */
function roundedRectPath(
  x: number, y: number, w: number, h: number,
  tl: number, tr: number, br: number, bl: number,
): string {
  const cap = Math.min(w / 2, h / 2);
  const rtl = Math.min(tl, cap);
  const rtr = Math.min(tr, cap);
  const rbr = Math.min(br, cap);
  const rbl = Math.min(bl, cap);
  return [
    `M ${x + rtl} ${y}`,
    `H ${x + w - rtr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rtr}`,
    `V ${y + h - rbr}`,
    `Q ${x + w} ${y + h} ${x + w - rbr} ${y + h}`,
    `H ${x + rbl}`,
    `Q ${x} ${y + h} ${x} ${y + h - rbl}`,
    `V ${y + rtl}`,
    `Q ${x} ${y} ${x + rtl} ${y}`,
    'Z',
  ].join(' ');
}

export function MetallicGradientFill({
  colors,
  locations,
  strokeColors,
  strokeLocations,
  angle,
  width,
  height,
  borderRadius = 0,
  borderRadii,
  borderWidth,
  style,
}: MetallicGradientFillProps): React.ReactElement {
  // Stable unique ID per component instance to prevent SVG <defs> collisions
  // when multiple metallic fills are on screen simultaneously.
  const idRef = useRef(`mg-${Math.random().toString(36).slice(2, 8)}`);
  const id = idRef.current;

  const coords = angleToSvgCoords(angle);
  // Cap radius so pill (9999px) clips correctly to the actual SVG size.
  const rx = Math.min(borderRadius, width / 2, height / 2);

  const hasBorder =
    borderWidth != null &&
    borderWidth > 0 &&
    strokeColors != null &&
    strokeLocations != null &&
    strokeColors.length > 0;

  const bw = hasBorder ? (borderWidth ?? 0) : 0;
  const innerRx = hasBorder ? Math.max(0, rx - bw) : rx;

  // Per-corner path rendering — used when ornament corners must be zeroed.
  const usePerCorner = borderRadii != null;
  const outerPath = usePerCorner
    ? roundedRectPath(0, 0, width, height,
        borderRadii!.topLeft, borderRadii!.topRight,
        borderRadii!.bottomRight, borderRadii!.bottomLeft)
    : null;
  const innerPath = usePerCorner
    ? roundedRectPath(bw, bw, width - 2 * bw, height - 2 * bw,
        Math.max(0, borderRadii!.topLeft - bw), Math.max(0, borderRadii!.topRight - bw),
        Math.max(0, borderRadii!.bottomRight - bw), Math.max(0, borderRadii!.bottomLeft - bw))
    : null;

  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, style]}
    >
      <Defs>
        {hasBorder && (
          <SvgLinearGradient
            id={`${id}-s`}
            x1={coords.x1}
            y1={coords.y1}
            x2={coords.x2}
            y2={coords.y2}
            gradientUnits="objectBoundingBox"
          >
            {(strokeColors as readonly string[]).map((color, i) => (
              <Stop
                key={i}
                offset={`${((strokeLocations as readonly number[])[i]! * 100).toFixed(1)}%`}
                stopColor={color}
                stopOpacity={1}
              />
            ))}
          </SvgLinearGradient>
        )}
        <SvgLinearGradient
          id={`${id}-f`}
          x1={coords.x1}
          y1={coords.y1}
          x2={coords.x2}
          y2={coords.y2}
          gradientUnits="objectBoundingBox"
        >
          {(colors as readonly string[]).map((color, i) => (
            <Stop
              key={i}
              offset={`${((locations as readonly number[])[i]! * 100).toFixed(1)}%`}
              stopColor={color}
              stopOpacity={1}
            />
          ))}
        </SvgLinearGradient>
      </Defs>

      {/* Outer stroke gradient (full area) — only when borderWidth is configured */}
      {hasBorder && (
        usePerCorner
          ? <Path d={outerPath!} fill={`url(#${id}-s)`} />
          : <Rect x={0} y={0} width={width} height={height} rx={rx} ry={rx} fill={`url(#${id}-s)`} />
      )}

      {/* Fill gradient — inset when border is present, full-size otherwise */}
      {usePerCorner
        ? <Path d={innerPath!} fill={`url(#${id}-f)`} />
        : <Rect x={bw} y={bw} width={width - 2 * bw} height={height - 2 * bw} rx={innerRx} ry={innerRx} fill={`url(#${id}-f)`} />
      }
    </Svg>
  );
}
