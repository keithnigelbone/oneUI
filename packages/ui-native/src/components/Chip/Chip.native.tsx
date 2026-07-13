/**
 * Chip.native.tsx — RN peer of packages/ui/src/components/Chip/Chip.tsx
 */

import React, { isValidElement, useCallback, useState, type ReactNode } from 'react';
import { Pressable, Text, View, type GestureResponderEvent } from 'react-native';

import { resolvePressableHitSlop } from '../../utils/touchTargetA11y';
import {
  useMotion,
  useReduceMotion,
  useSurfaceAppearance,
  useSurfaceTokens,
  useRoleMaterial,
  type ResolvedMetallicGradient,
  type MaterialAssignmentTarget,
} from '../../theme';
import { MetallicGradientFill } from '../MetallicGradientFill';
import { useChipGroupSelectionContext } from '../ChipGroup/ChipGroupSelectionContext';
import {
  useChipState,
  getChipAccessibilityProps,
  invokeChipSelectedChange,
  resolveChipAccessibilityLabel,
  resolveChipTokenAppearance,
  type ChipProps,
} from './interface';
import { ChipSlot } from './ChipSlot.native';
import {
  classifyChipSlot,
  DISABLED_OPACITY,
  resolveChipLayout,
  styles,
} from './Chip.styles.native';
import type { SlotParentAppearance } from '../../slots/SlotParentAppearanceContext.native';
import { useChipStyle } from './useChipStyle';

function resolveSlot(node: ReactNode): ReactNode {
  if (typeof node === 'string') return null;
  if (isValidElement(node)) return node;
  if (node != null && node !== false) return node;
  return null;
}

export function Chip(props: ChipProps): React.ReactElement {
  const {
    children,
    selected,
    defaultSelected,
    onSelectedChange,
    disabled,
    start,
    end,
    style: styleProp,
    testID,
  } = props;

  const groupSelection = useChipGroupSelectionContext();
  const inGroup = groupSelection != null && props.value != null && props.value !== '';
  const [uncontrolledSelected, setUncontrolledSelected] = useState(defaultSelected ?? false);
  const isSelected = inGroup
    ? groupSelection.selectedValues.includes(props.value!)
    : (selected ?? uncontrolledSelected);
  const { size, isDisabled, resolvedVariant, resolvedAppearance } = useChipState(props);
  const surfaceAppearance = useSurfaceAppearance();
  /**
   * Web `explicitAppearanceClass`: explicit prop wins; otherwise inherit the
   * nearest `<Surface appearance>`, then fall back to Primary.
   */
  const roleAppearanceForTokens = resolveChipTokenAppearance(
    props.appearance,
    resolvedAppearance,
    surfaceAppearance
  );
  const slotParentAppearance = roleAppearanceForTokens as SlotParentAppearance;

  // Single-pass style resolution — paint, shape, and typography merged by the
  // pure `resolveChipStyle` function. Mirrors web's `buildAllComponentCSS` pass.
  const chipStyle = useChipStyle({
    resolvedVariant,
    roleAppearanceForTokens,
    size,
    isSelected,
  });
  const { basePaint } = chipStyle;

  // roleMaterial: only on bold+selected; falls back to basePaint.bgGradient from resolver.
  const roleMaterial = useRoleMaterial(roleAppearanceForTokens as MaterialAssignmentTarget);
  const activeGradient: ResolvedMetallicGradient | null =
    basePaint.bgGradient ??
    (resolvedVariant === 'bold' && isSelected && roleMaterial != null ? roleMaterial : null);

  const motion = useMotion();
  const reduceMotion = useReduceMotion();

  // role stays for ChipSlot (needs the full role tokens object).
  const role = useSurfaceTokens(roleAppearanceForTokens);

  const startNode = resolveSlot(start);
  const endNode = resolveSlot(end);
  const startKind = startNode != null ? classifyChipSlot(startNode) : null;
  const endKind = endNode != null ? classifyChipSlot(endNode) : null;
  const layout = resolveChipLayout(size, startKind, endKind);

  const a11y = getChipAccessibilityProps(props, { isSelected, isDisabled });
  const accessibilityLabel = resolveChipAccessibilityLabel(props);

  if (process.env.NODE_ENV !== 'production' && !accessibilityLabel) {
    // eslint-disable-next-line no-console
    console.warn(
      'Chip: an `aria-label` prop is recommended when Chip has no visible text content.'
    );
  }

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isDisabled) return;
      if (inGroup && props.value != null) {
        groupSelection.toggleValue(props.value);
        return;
      }
      const next = !isSelected;
      if (selected === undefined) {
        setUncontrolledSelected(next);
      }
      invokeChipSelectedChange(onSelectedChange, next, event);
    },
    [groupSelection, inGroup, isDisabled, isSelected, onSelectedChange, props.value, selected]
  );

  const [gradientDims, setGradientDims] = useState<{ w: number; h: number } | null>(null);

  const hitSlop = resolvePressableHitSlop(undefined, layout.height);
  const chipRadius = chipStyle.borderRadius;

  return (
    <Pressable
      accessible={a11y.accessible}
      focusable={a11y.focusable}
      accessibilityRole={a11y.accessibilityRole}
      accessibilityLabel={a11y.accessibilityLabel}
      accessibilityHint={a11y.accessibilityHint}
      accessibilityState={a11y.accessibilityState}
      hitSlop={hitSlop}
      disabled={isDisabled}
      onPress={handlePress}
      testID={testID}
    >
      {({ pressed }) => {
        const paint = pressed ? chipStyle.pressedPaint : basePaint;
        const showGradient = activeGradient != null && !pressed;
        const scale =
          pressed && !isDisabled && !reduceMotion ? 1 - motion.tapScale.default / 100 : 1;
        return (
          <View
            style={[
              styles.pressableBase,
              {
                height: layout.height,
                paddingLeft: layout.paddingLeft,
                paddingRight: layout.paddingRight,
                gap: layout.gap,
              },
              { borderRadius: chipRadius },
              {
                backgroundColor: showGradient ? 'transparent' : paint.bg,
                overflow: showGradient ? 'hidden' : undefined,
                borderColor: paint.borderColor,
                borderWidth: paint.borderWidth,
                opacity: isDisabled ? DISABLED_OPACITY : 1,
                transform: [{ scale }],
              },
              styleProp,
            ]}
            onLayout={
              showGradient
                ? (e) =>
                    setGradientDims({
                      w: e.nativeEvent.layout.width,
                      h: e.nativeEvent.layout.height,
                    })
                : undefined
            }
          >
            {showGradient && gradientDims && (
              <MetallicGradientFill
                colors={activeGradient!.colors}
                locations={activeGradient!.locations}
                angle={activeGradient!.angle}
                width={gradientDims.w}
                height={gradientDims.h}
                borderRadius={chipRadius as number}
              />
            )}
            {startNode != null ? (
              <ChipSlot
                side="start"
                variant={resolvedVariant}
                selected={isSelected}
                appearance={slotParentAppearance}
                role={role}
              >
                {startNode}
              </ChipSlot>
            ) : null}
            {children != null && (
              <Text
                accessible={false}
                importantForAccessibility="no"
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    fontFamily: chipStyle.labelFontFamily,
                    fontSize: chipStyle.labelFontSize,
                    lineHeight: chipStyle.labelLineHeight,
                    fontWeight: chipStyle.labelFontWeight,
                    color: paint.text,
                  },
                  chipStyle.textTransform ? { textTransform: chipStyle.textTransform } : null,
                  chipStyle.letterSpacing != null
                    ? { letterSpacing: chipStyle.letterSpacing }
                    : null,
                ]}
              >
                {children}
              </Text>
            )}
            {endNode != null ? (
              <ChipSlot
                side="end"
                variant={resolvedVariant}
                selected={isSelected}
                appearance={slotParentAppearance}
                role={role}
              >
                {endNode}
              </ChipSlot>
            ) : null}
          </View>
        );
      }}
    </Pressable>
  );
}

export type { ChipProps } from './interface';
