/**
 * SegmentedControl.native.tsx
 *
 * RN peer of `packages/ui/src/components/SegmentedControl/SegmentedControl.tsx`.
 * Single-select segmented control. Compound API:
 * `SegmentedControl` + `SegmentedControl.Item`.
 *
 * Web resolves paint through the `[data-surface]` CSS cascade + role class map;
 * native resolves the same tokens explicitly via `useSurfaceTokens`:
 *   - Track: `trackAppearance` (parent Surface ?? neutral) × trackEmphasis
 *   - Selected segment: `selectedAppearance` × attention (bold / subtle)
 *   - Unselected segment text + hover/pressed: track role
 * Selected-segment slots publish a `<Surface mode="bold|subtle">` boundary so a
 * nested CounterBadge re-steps for bold-on-bold contrast (web's slot step lookup).
 */

import React, { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Surface,
  useElevation,
  useOneUITheme,
  useSurfaceAppearance,
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
  type NativeRoleTokens,
} from '../../theme';
import { SlotParentAppearanceProvider } from '../../slots/SlotParentAppearanceContext.native';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import {
  SegmentedControlContext,
  getSegmentItemAccessibilityProps,
  getSegmentedControlAccessibilityProps,
  resolveSegmentSlotSurface,
  useSegmentedControlGroupState,
  useSegmentedControlItemState,
  type ResolvedSegmentedAppearance,
  type SegmentedControlAttention,
  type SegmentedControlItemProps,
  type SegmentedControlProps,
  type SegmentedControlShape,
  type SegmentedControlTrackEmphasis,
} from './interface';
import { DISABLED_OPACITY, resolveSegmentGeometry, styles } from './SegmentedControl.styles.native';

/* ===== Paint helpers ===== */

interface SegmentPaint {
  /** Background per interaction state. */
  bg: string;
  hoverBg: string;
  pressedBg: string;
  text: string;
}

function resolveSegmentPaint(params: {
  isSelected: boolean;
  attention: SegmentedControlAttention;
  trackEmphasis: SegmentedControlTrackEmphasis;
  selectedRole: NativeRoleTokens;
  trackRole: NativeRoleTokens;
}): SegmentPaint {
  const { isSelected, attention, trackEmphasis, selectedRole, trackRole } = params;

  if (isSelected) {
    if (attention === 'high') {
      return {
        bg: selectedRole.surfaces.bold,
        hoverBg: selectedRole.states.boldHover,
        pressedBg: selectedRole.states.boldPressed,
        text: selectedRole.onBoldContent.tintedA11y,
      };
    }
    // medium + low → subtle fill, tinted-a11y text (item role / track role resp.)
    return {
      bg: selectedRole.surfaces.subtle,
      hoverBg: selectedRole.states.subtleHover,
      pressedBg: selectedRole.states.subtlePressed,
      text: selectedRole.content.tintedA11y,
    };
  }

  // Unselected — track role. High emphasis: subtle on minimal; medium/low: minimal on ghost.
  const isHighEmphasis = trackEmphasis === 'high';
  return {
    bg: 'transparent',
    hoverBg: isHighEmphasis ? trackRole.surfaces.subtle : trackRole.surfaces.minimal,
    pressedBg: isHighEmphasis ? trackRole.states.subtlePressed : trackRole.states.pressed,
    text: trackRole.content.high,
  };
}

function resolveShapeRadius(
  shape: SegmentedControlShape,
  themeShape: { Pill: number; '3XS': number },
): number {
  // pill → Shape-Pill · rectangular → Shape-2 (NativeShape '3XS'). Mirrors the recipe.
  return shape === 'pill' ? themeShape.Pill : themeShape['3XS'];
}

/* ===== Slot wrapper ===== */

/**
 * Wraps a start (icon) / end (CounterBadge) slot. Publishes the slot's icon
 * tint + resolved appearance, and — when the segment is selected — a Surface
 * boundary (bold/subtle) so a nested CounterBadge re-steps for contrast.
 */
function SegmentSlot({
  slotAppearance,
  slotSurface,
  iconColor,
  iconSize,
  children,
}: {
  slotAppearance: ResolvedSegmentedAppearance;
  slotSurface: 'bold' | 'subtle' | undefined;
  iconColor: string;
  iconSize: number;
  children: ReactNode;
}): React.ReactElement {
  const inner = (
    <SlotParentAppearanceProvider value={slotAppearance}>
      <ComponentSlotIconContext.Provider value={{ sizePx: iconSize, color: iconColor }}>
        {children}
      </ComponentSlotIconContext.Provider>
    </SlotParentAppearanceProvider>
  );

  if (slotSurface) {
    return (
      <Surface
        mode={slotSurface}
        appearance={slotAppearance}
        // Suppress the Surface fill — the segment already paints the background;
        // the boundary exists only to re-step nested badges.
        style={{ backgroundColor: 'transparent' }}
      >
        <View style={styles.slot} accessible={false} importantForAccessibility="no-hide-descendants">
          {inner}
        </View>
      </Surface>
    );
  }

  return (
    <View style={styles.slot} accessible={false} importantForAccessibility="no-hide-descendants">
      {inner}
    </View>
  );
}

/* ===== Item ===== */

function SegmentedControlItem(props: SegmentedControlItemProps): React.ReactElement {
  const { value, children, start, end, style: styleProp, testID, onPress, onClick } = props;

  const state = useSegmentedControlItemState(props);
  const { ctx, isSelected, isDisabled, showLabel, slotAppearance } = state;

  const theme = useOneUITheme();
  const selectedRole = useSurfaceTokens(ctx.selectedAppearance);
  const trackRole = useSurfaceTokens(ctx.trackAppearance);
  const elevation = useElevation();

  const geometry = resolveSegmentGeometry(ctx.size, ctx.trackEmphasis);
  const labelTypo = useTypographyTokens('label', geometry.labelSize, { emphasis: 'high' });
  const labelStyle = typographyToTextStyle(labelTypo);

  const paint = resolveSegmentPaint({
    isSelected,
    attention: ctx.attention,
    trackEmphasis: ctx.trackEmphasis,
    selectedRole,
    trackRole,
  });

  const [isHovered, setIsHovered] = useState(false);
  const a11y = getSegmentItemAccessibilityProps(props, state);

  const borderRadius = resolveShapeRadius(ctx.shape, theme.shape);
  const isIconCell = ctx.type === 'icon';
  const slotSurface = resolveSegmentSlotSurface(isSelected, ctx.attention);

  // Elevation-1 halo only under the high-attention selected segment.
  const selectedElevation = useMemo<ViewStyle | null>(
    () =>
      isSelected && ctx.attention === 'high'
        ? {
            ...(elevation.byLevel[1]?.ios ?? {}),
            elevation: elevation.byLevel[1]?.androidElevation ?? 0,
          }
        : null,
    [elevation, isSelected, ctx.attention],
  );

  // `onClick` is only a web-parity alias for `onPress` — fire at most one so a
  // caller that (defensively) sets both doesn't double-trigger side effects.
  const { selectValue } = ctx;
  const handlePress = useCallback(() => {
    if (isDisabled) return;
    (onPress ?? onClick)?.();
    selectValue(value);
  }, [isDisabled, onClick, onPress, selectValue, value]);

  const pressableStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => {
      const bg = pressed ? paint.pressedBg : isHovered ? paint.hoverBg : paint.bg;
      return [
        styles.item,
        isIconCell
          ? styles.itemHug
          : ctx.equalWidth
            ? styles.itemEqual
            : styles.itemHug,
        { borderRadius, backgroundColor: bg },
        isIconCell ? { width: geometry.iconItemSize, height: geometry.iconItemSize } : null,
        selectedElevation,
        isDisabled ? { opacity: DISABLED_OPACITY } : null,
        styleProp,
      ];
    },
    [
      borderRadius,
      ctx.equalWidth,
      geometry.iconItemSize,
      isDisabled,
      isHovered,
      isIconCell,
      paint.bg,
      paint.hoverBg,
      paint.pressedBg,
      selectedElevation,
      styleProp,
    ],
  );

  return (
    <Pressable
      accessible={a11y.accessible}
      accessibilityRole={a11y.accessibilityRole}
      accessibilityLabel={a11y.accessibilityLabel}
      accessibilityHint={a11y.accessibilityHint}
      accessibilityState={a11y.accessibilityState}
      disabled={isDisabled}
      onPress={handlePress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      testID={testID}
      style={pressableStyle}
    >
      <View
        style={[
          styles.stateLayer,
          {
            minHeight: isIconCell ? geometry.iconItemSize : geometry.item.minHeight,
            paddingVertical: isIconCell ? 0 : geometry.item.paddingVertical,
            paddingHorizontal: isIconCell ? 0 : geometry.item.paddingHorizontal,
          },
        ]}
      >
        <View style={[styles.contentWrapper, { gap: geometry.contentGap }]}>
          {start ? (
            <SegmentSlot
              slotAppearance={slotAppearance}
              slotSurface={slotSurface}
              iconColor={paint.text}
              iconSize={geometry.iconGlyphSize}
            >
              {start}
            </SegmentSlot>
          ) : null}
          {showLabel ? (
            <Text style={[styles.label, labelStyle, { color: paint.text }]} numberOfLines={1}>
              {children}
            </Text>
          ) : null}
          {end ? (
            <SegmentSlot
              slotAppearance={slotAppearance}
              slotSurface={slotSurface}
              iconColor={paint.text}
              iconSize={geometry.iconGlyphSize}
            >
              {end}
            </SegmentSlot>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

SegmentedControlItem.displayName = 'SegmentedControl.Item';

/* ===== Root ===== */

function resolveTrackPaint(
  trackRole: NativeRoleTokens,
  trackEmphasis: SegmentedControlTrackEmphasis,
): { backgroundColor: string; borderColor: string } {
  if (trackEmphasis === 'medium') {
    return { backgroundColor: trackRole.surfaces.ghost, borderColor: trackRole.content.strokeMedium };
  }
  if (trackEmphasis === 'low') {
    return { backgroundColor: trackRole.surfaces.ghost, borderColor: 'transparent' };
  }
  // high — tinted minimal fill, no border
  return { backgroundColor: trackRole.surfaces.minimal, borderColor: 'transparent' };
}

function SegmentedControlRoot(props: SegmentedControlProps): React.ReactElement {
  const { children, style: styleProp, testID } = props;
  const parentAppearance = useSurfaceAppearance();
  const { contextValue } = useSegmentedControlGroupState(props, parentAppearance);
  const trackRole = useSurfaceTokens(contextValue.trackAppearance);
  const theme = useOneUITheme();
  const a11y = getSegmentedControlAccessibilityProps(props);

  const trackPaint = resolveTrackPaint(trackRole, contextValue.trackEmphasis);
  const borderRadius = resolveShapeRadius(contextValue.shape, theme.shape);
  const fillWidth = contextValue.equalWidth && contextValue.type !== 'icon';

  return (
    <SegmentedControlContext.Provider value={contextValue}>
      <View
        accessible={a11y.accessible}
        accessibilityRole={a11y.accessibilityRole}
        accessibilityLabel={a11y.accessibilityLabel}
        accessibilityHint={a11y.accessibilityHint}
        testID={testID}
        pointerEvents={contextValue.groupDisabled ? 'none' : 'auto'}
        style={[
          styles.track,
          fillWidth ? styles.trackFullWidth : null,
          { borderRadius, backgroundColor: trackPaint.backgroundColor, borderColor: trackPaint.borderColor },
          contextValue.groupDisabled ? { opacity: DISABLED_OPACITY } : null,
          styleProp,
        ]}
      >
        {children}
      </View>
    </SegmentedControlContext.Provider>
  );
}

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
});

export default SegmentedControl;

export type {
  SegmentedControlProps,
  SegmentedControlItemProps,
  SegmentedControlSize,
  SegmentedControlAttention,
  SegmentedControlTrackEmphasis,
  SegmentedControlShape,
  SegmentedControlType,
  SegmentedControlAppearance,
} from './interface';
