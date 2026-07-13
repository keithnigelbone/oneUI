/**
 * Input.styles.native.ts
 *
 * Geometry-only StyleSheet for Input — the bordered 4-slot shell. Mirrors
 * the web peer at `packages/ui/src/components/Input/Input.module.css`
 * (container + slots only; label / description live in `InputField`). Brand
 * paint (border, fill, text, slot icon tint) merges inline in
 * `Input.native.tsx` via `useSurfaceTokens(role)`. Verified by
 * `pnpm check:literals`.
 *
 * Web → native mapping:
 *
 *   | Web rule (CSS module)                         | Native style key                 |
 *   |-----------------------------------------------|----------------------------------|
 *   | `.container` (idle, outlined)                 | `styles.container` (+ per-size)  |
 *   | `.container[data-size="8\|10\|12"]`           | `CONTAINER_BY_SIZE['8\|10\|12']` |
 *   | `.shapePill.container[data-size="N"]`         | `RADIUS_PILL`                    |
 *   | `.start`, `.start2`, `.end`, `.end2`          | `styles.slot{Start,End}` + box   |
 *   | `.control`                                    | `styles.control`                 |
 *
 * Per-size table (Figma-verified, recovered from the original f6 spec in
 * `Input.module.css` before XS was removed on web — commit c6171946):
 *
 *   | Size | minH    | padH    | padV    | gap     | radius     | icon  |
 *   |------|---------|---------|---------|---------|------------|-------|
 *   | XS   | Sp/6    | Sp/1-5  | Sp/0    | Sp/1    | Shape/xs   | Sp/3  |
 *   | S    | Sp/8    | Sp/2    | Sp/0    | Sp/1-5  | Shape/s    | Sp/4  |
 *   | M    | Sp/10   | Sp/3    | Sp/1-5  | Sp/1-5  | Shape/s    | Sp/5  |
 *   | L    | Sp/12   | Sp/4    | Sp/2    | Sp/2    | Shape/m    | Sp/6  |
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { InputNumericSize } from './interface';

// ============================================================================
// Per-size dimensions
// ============================================================================

export interface InputSizeMetrics {
  minHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  gap: number;
  borderRadius: number;
  iconSize: number;
}

export const INPUT_SIZE_METRICS: Record<InputNumericSize, InputSizeMetrics> = {
  6: {
    minHeight: tokens.spacing['6'],
    paddingHorizontal: tokens.spacing['1-5'],
    paddingVertical: tokens.spacing['0'],
    gap: tokens.spacing['1'],
    borderRadius: tokens.shape['1-5'],
    iconSize: tokens.spacing['3'],
  },
  8: {
    minHeight: tokens.spacing['8'],
    paddingHorizontal: tokens.spacing['2'],
    paddingVertical: tokens.spacing['0'],
    gap: tokens.spacing['1-5'],
    borderRadius: tokens.shape['2'],
    iconSize: tokens.spacing['4'],
  },
  10: {
    minHeight: tokens.spacing['10'],
    paddingHorizontal: tokens.spacing['3'],
    paddingVertical: tokens.spacing['1-5'],
    gap: tokens.spacing['1-5'],
    borderRadius: tokens.shape['2'],
    iconSize: tokens.spacing['5'],
  },
  12: {
    minHeight: tokens.spacing['12'],
    paddingHorizontal: tokens.spacing['4'],
    paddingVertical: tokens.spacing['2'],
    gap: tokens.spacing['2'],
    borderRadius: tokens.shape['3'],
    iconSize: tokens.spacing['6'],
  },
};

/** Pill shape override — same value across every size. */
export const RADIUS_PILL = tokens.shape.Pill;

/** Container border width — idle (medium attention), focus, invalid. */
export const INPUT_BORDER_WIDTH = {
  idle: tokens.borderWidth.hairline,
  focus: tokens.spacing['0-5'],
  invalid: tokens.spacing['0-5'],
} as const;

/** Disabled opacity — mirrors web `var(--Disabled-Opacity)` (0.4). */
export const INPUT_DISABLED_OPACITY = 0.4;

// ============================================================================
// StyleSheet
// ============================================================================

export const styles = StyleSheet.create({
  // Bordered container — base layout (border colour + width set inline by paint).
  //
  // The `outline*` trio (style + width + color) suppresses React Native Web's
  // default browser focus ring on the wrapping `<div>`. Chrome's user-agent
  // stylesheet sets `outline: 1px auto -webkit-focus-ring-color`, so a bare
  // `outlineWidth: 0` is not enough — `outline-style: auto` keeps the ring
  // visible. Setting an explicit `solid` style + `0` width + `transparent`
  // colour overrides all three CSS sub-properties at once. No-op on iOS/Android.
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'solid',
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },

  // Disabled wrapper — opacity dim that web applies via `[data-disabled]`.
  containerDisabled: {
    opacity: INPUT_DISABLED_OPACITY,
  },

  // 4-slot wrappers — slot icons keep flex-shrink 0 so the control fills the row.
  slotStart: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotStart2: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEnd: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEnd2: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // The actual text control — fills remaining horizontal space. Same `outline*`
  // trio as the container to fully suppress the browser focus ring on the
  // underlying `<input>` element. No-op on iOS/Android.
  control: {
    flex: 1,
    minWidth: 0,
    padding: tokens.spacing['0'],
    margin: tokens.spacing['0'],
    backgroundColor: 'transparent',
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
});

// ============================================================================
// Per-size style maps — consumed via `CONTAINER_BY_SIZE[numericSize]` etc.
// ============================================================================

const containerByNumeric = StyleSheet.create({
  size6: {
    minHeight: INPUT_SIZE_METRICS[6].minHeight,
    paddingHorizontal: INPUT_SIZE_METRICS[6].paddingHorizontal,
    paddingVertical: INPUT_SIZE_METRICS[6].paddingVertical,
    gap: INPUT_SIZE_METRICS[6].gap,
    borderRadius: INPUT_SIZE_METRICS[6].borderRadius,
  },
  size8: {
    minHeight: INPUT_SIZE_METRICS[8].minHeight,
    paddingHorizontal: INPUT_SIZE_METRICS[8].paddingHorizontal,
    paddingVertical: INPUT_SIZE_METRICS[8].paddingVertical,
    gap: INPUT_SIZE_METRICS[8].gap,
    borderRadius: INPUT_SIZE_METRICS[8].borderRadius,
  },
  size10: {
    minHeight: INPUT_SIZE_METRICS[10].minHeight,
    paddingHorizontal: INPUT_SIZE_METRICS[10].paddingHorizontal,
    paddingVertical: INPUT_SIZE_METRICS[10].paddingVertical,
    gap: INPUT_SIZE_METRICS[10].gap,
    borderRadius: INPUT_SIZE_METRICS[10].borderRadius,
  },
  size12: {
    minHeight: INPUT_SIZE_METRICS[12].minHeight,
    paddingHorizontal: INPUT_SIZE_METRICS[12].paddingHorizontal,
    paddingVertical: INPUT_SIZE_METRICS[12].paddingVertical,
    gap: INPUT_SIZE_METRICS[12].gap,
    borderRadius: INPUT_SIZE_METRICS[12].borderRadius,
  },
});

export const CONTAINER_BY_SIZE: Record<InputNumericSize, ViewStyle> = {
  6: containerByNumeric.size6,
  8: containerByNumeric.size8,
  10: containerByNumeric.size10,
  12: containerByNumeric.size12,
};

const iconSlotByNumeric = StyleSheet.create({
  size6: { width: INPUT_SIZE_METRICS[6].iconSize, height: INPUT_SIZE_METRICS[6].iconSize },
  size8: { width: INPUT_SIZE_METRICS[8].iconSize, height: INPUT_SIZE_METRICS[8].iconSize },
  size10: { width: INPUT_SIZE_METRICS[10].iconSize, height: INPUT_SIZE_METRICS[10].iconSize },
  size12: { width: INPUT_SIZE_METRICS[12].iconSize, height: INPUT_SIZE_METRICS[12].iconSize },
});

export const ICON_SLOT_BY_SIZE: Record<InputNumericSize, ViewStyle> = {
  6: iconSlotByNumeric.size6,
  8: iconSlotByNumeric.size8,
  10: iconSlotByNumeric.size10,
  12: iconSlotByNumeric.size12,
};
