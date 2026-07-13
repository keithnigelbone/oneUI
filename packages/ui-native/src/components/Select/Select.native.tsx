/**
 * Select.native.tsx
 *
 * RN peer of `packages/ui/src/components/Select/Select.tsx`. Triggers reuse the
 * native `Input` / `Button` / `IconButton`; the dropdown is a transparent RN
 * `Modal` anchored to the trigger via `measureInWindow` (robust against clipping
 * inside ScrollViews). Rows reuse `Checkbox` (multi) and an inline check glyph
 * (single). All paint comes from `useSurfaceTokens(appearance)` — Surface
 * context + brand foundation resolve automatically; geometry is token-only.
 *
 * Base UI is web-only and is intentionally never imported here.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@oneui/tokens';
import {
  useElevation,
  useMotion,
  useReduceMotion,
  useSurfaceTokens,
  useTypographyTokens,
} from '../../theme';
import { Input, type InputAppearance } from '../Input';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Checkbox } from '../Checkbox';
import {
  getSelectAccessibilityProps,
  groupSelectOptions,
  selectTriggerText,
  useSelectState,
  type SelectOption,
  type SelectProps,
} from './interface';
import {
  MENU_MAX_HEIGHT,
  MENU_MIN_WIDTH,
  MENU_OFFSET,
  styles,
} from './Select.styles.native';

interface TriggerRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function ChevronGlyph({ open, color }: { open: boolean; color: string }): React.ReactElement {
  // Down chevron; rotated 180° when open.
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 10l5 5 5-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={open ? 'rotate(180 12 12)' : undefined}
      />
    </Svg>
  );
}

function CheckGlyph({ color }: { color: string }): React.ReactElement {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Select<T extends string | number = string>(
  props: SelectProps<T>,
): React.ReactElement {
  const {
    options,
    sections,
    placeholder,
    searchable = false,
    onChange,
    onValuesChange,
    onAction,
    onOpenChange,
    label,
    description,
    required,
    helperText,
    feedback,
    errorHighlight,
    triggerIcon,
    attention = 'medium',
    style,
    testID,
  } = props;

  const state = useSelectState(props);
  const role = useSurfaceTokens(state.appearance);
  const neutral = useSurfaceTokens('neutral');
  const elevation = useElevation();
  const motion = useMotion();
  const reduceMotion = useReduceMotion();
  const labelTypo = useTypographyTokens('label', 'M');
  const secondaryTypo = useTypographyTokens('body', 'S', { emphasis: 'low' });
  const fieldLabelTypo = useTypographyTokens('label', 'S', { emphasis: 'medium' });
  const helperTypo = useTypographyTokens('body', 'S', { emphasis: 'low' });

  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<TriggerRect | null>(null);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<View>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.96)).current;

  const setOpen = useCallback(
    (next: boolean) => {
      if (state.isDisabled) return;
      setIsOpen(next);
      onOpenChange?.(next);
      if (!next) setQuery('');
    },
    [onOpenChange, state.isDisabled],
  );

  const open = useCallback(() => {
    const node = triggerRef.current;
    if (!node) return;
    node.measureInWindow((x, y, width, height) => {
      setRect({ x, y, width, height });
      setOpen(true);
      if (reduceMotion) {
        opacity.setValue(1);
        scale.setValue(1);
        return;
      }
      opacity.setValue(0);
      scale.setValue(0.96);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.duration.moderate.m,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: motion.duration.moderate.m,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [motion.duration.moderate.m, opacity, reduceMotion, scale, setOpen]);

  const toggle = useCallback(() => (isOpen ? setOpen(false) : open()), [isOpen, open, setOpen]);

  // ── selection handlers ─────────────────────────────────────────────────────
  const handleRowPress = useCallback(
    (option: SelectOption<T>) => {
      if (option.disabled) return;
      if (state.menu === 'actions') {
        onAction?.(option.value);
        setOpen(false);
        return;
      }
      if (state.isMulti) {
        const has = state.selectedValues.includes(option.value);
        const next = has
          ? state.selectedValues.filter((v) => v !== option.value)
          : [...state.selectedValues, option.value];
        onValuesChange?.(next);
        return; // multi keeps the menu open
      }
      onChange?.(option.value);
      setOpen(false);
    },
    [onAction, onChange, onValuesChange, setOpen, state.isMulti, state.menu, state.selectedValues],
  );

  // ── search filter ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.secondaryText?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query, searchable]);

  const grouped = useMemo(() => groupSelectOptions(filtered, sections), [filtered, sections]);

  const { text: triggerLabel, isPlaceholder } = selectTriggerText(options, state, placeholder);
  const a11y = getSelectAccessibilityProps(props, state, isOpen);

  // ── menu position ────────────────────────────────────────────────────────────
  const win = Dimensions.get('window');
  const menuPosition = useMemo<ViewStyle>(() => {
    if (!rect) return { top: 0, left: 0 };
    const isInline = state.trigger !== 'input';
    const width = isInline ? Math.max(rect.width, MENU_MIN_WIDTH) : rect.width;
    const left = Math.min(rect.x, win.width - width - MENU_OFFSET);
    if (state.menuDirection === 'above') {
      return { bottom: win.height - rect.y + MENU_OFFSET, left, width };
    }
    if (state.menuDirection === 'alignWithTrigger') {
      return { top: rect.y, left, width };
    }
    return { top: rect.y + rect.height + MENU_OFFSET, left, width };
  }, [rect, state.menuDirection, state.trigger, win.height, win.width]);

  // ── trigger render ────────────────────────────────────────────────────────────
  const chevron = <ChevronGlyph open={isOpen} color={role.content.tintedA11y} />;

  let triggerNode: React.ReactNode;
  if (state.trigger === 'button') {
    triggerNode = (
      <Button
        attention={attention}
        appearance={state.appearance}
        size={state.size}
        onPress={toggle}
        end={chevron}
        disabled={state.isDisabled}
        aria-expanded={isOpen}
        aria-haspopup={state.menu === 'actions' ? 'menu' : 'listbox'}
        aria-label={props['aria-label']}
      >
        {triggerLabel}
      </Button>
    );
  } else if (state.trigger === 'iconButton') {
    triggerNode = (
      <IconButton
        icon={(triggerIcon as React.ReactElement) ?? chevron}
        attention={attention}
        appearance={state.appearance}
        size={state.size}
        onPress={toggle}
        disabled={state.isDisabled}
        aria-label={props['aria-label'] ?? label ?? 'Select'}
        aria-expanded={isOpen}
        aria-haspopup={state.menu === 'actions' ? 'menu' : 'listbox'}
      />
    );
  } else {
    // input trigger — read-only Input + chevron; Pressable captures the tap.
    // Input's appearance union has no `brand-bg`; fall back to 'auto' for it.
    const inputAppearance: InputAppearance =
      state.appearance === 'brand-bg' ? 'auto' : (state.appearance as InputAppearance);
    triggerNode = (
      <Pressable onPress={toggle} disabled={state.isDisabled}>
        <View pointerEvents="none">
          <Input
            size={state.size}
            appearance={inputAppearance}
            value={isPlaceholder ? undefined : triggerLabel}
            placeholder={isPlaceholder ? triggerLabel : undefined}
            readOnly
            disabled={state.isDisabled}
            errorHighlight={errorHighlight}
            start={props.start}
            end={chevron}
          />
        </View>
      </Pressable>
    );
  }

  // ── row renderer ──────────────────────────────────────────────────────────────
  const renderRow = (option: SelectOption<T>): React.ReactElement => {
    const isSelected = state.isMulti
      ? state.selectedValues.includes(option.value)
      : state.selectedValue === option.value;
    return (
      <Pressable
        key={String(option.value)}
        onPress={() => handleRowPress(option)}
        disabled={option.disabled}
        accessibilityRole={state.menu === 'actions' ? 'button' : 'menuitem'}
        accessibilityState={{ disabled: option.disabled, selected: isSelected }}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: pressed ? neutral.stateLayers.pressed : 'transparent' },
          option.disabled ? { opacity: 0.4 } : null,
        ]}
      >
        {state.isMulti ? (
          <View style={styles.rowStart} pointerEvents="none">
            <Checkbox selected={isSelected} appearance={state.appearance} size="m" aria-hidden />
          </View>
        ) : null}
        <View style={styles.rowContent}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: labelTypo.fontSize,
              lineHeight: labelTypo.lineHeight,
              fontFamily: labelTypo.fontFamily,
              fontWeight: labelTypo.fontWeight,
              color: role.content.high,
            }}
          >
            {option.label}
          </Text>
          {option.secondaryText ? (
            <Text
              numberOfLines={1}
              style={{
                fontSize: secondaryTypo.fontSize,
                lineHeight: secondaryTypo.lineHeight,
                fontFamily: secondaryTypo.fontFamily,
                fontWeight: secondaryTypo.fontWeight,
                color: role.content.low,
              }}
            >
              {option.secondaryText}
            </Text>
          ) : null}
        </View>
        {!state.isMulti && state.menu !== 'actions' && isSelected ? (
          <View style={styles.rowEnd}>
            <CheckGlyph color={role.content.tintedA11y} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  const menuFill = role.surfaces.elevated;
  const iosShadow = elevation.byLevel[1]?.ios ?? {};
  const androidElevation = elevation.byLevel[1]?.androidElevation ?? 0;

  const onMenuLayout = (_e: LayoutChangeEvent): void => {
    /* reserved: clamp menu height to viewport if needed */
  };

  return (
    <View style={[styles.root, style]} testID={testID} {...a11y}>
      {/* Label + description (input trigger only) */}
      {state.trigger === 'input' && label ? (
        <View style={{ gap: tokens.spacing['1'] }}>
          <View style={styles.labelRow}>
            <Text
              style={{
                fontSize: fieldLabelTypo.fontSize,
                lineHeight: fieldLabelTypo.lineHeight,
                fontFamily: fieldLabelTypo.fontFamily,
                fontWeight: fieldLabelTypo.fontWeight,
                color: role.content.high,
              }}
            >
              {label}
            </Text>
            {required ? (
              <Text
                style={{
                  fontSize: fieldLabelTypo.fontSize,
                  lineHeight: fieldLabelTypo.lineHeight,
                  fontFamily: fieldLabelTypo.fontFamily,
                  color: role.content.tintedA11y,
                }}
              >
                *
              </Text>
            ) : null}
          </View>
          {description ? (
            <Text
              style={{
                fontSize: helperTypo.fontSize,
                lineHeight: helperTypo.lineHeight,
                fontFamily: helperTypo.fontFamily,
                color: role.content.low,
              }}
            >
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        ref={triggerRef}
        collapsable={false}
        style={state.trigger === 'input' ? styles.triggerWrap : styles.triggerInline}
      >
        {triggerNode}
      </View>

      {/* Helper / feedback (input trigger only) */}
      {state.trigger === 'input' && (feedback || helperText) ? (
        <Text
          style={{
            fontSize: helperTypo.fontSize,
            lineHeight: helperTypo.lineHeight,
            fontFamily: helperTypo.fontFamily,
            color: feedback ? role.content.tintedA11y : role.content.low,
          }}
        >
          {feedback ?? helperText}
        </Text>
      ) : null}

      {/* Dropdown */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityRole="none" />
        <Animated.View
          onLayout={onMenuLayout}
          style={[
            styles.menuAbsolute,
            menuPosition,
            {
              backgroundColor: menuFill,
              borderRadius: tokens.shape['4'],
              maxHeight: MENU_MAX_HEIGHT,
              opacity,
              transform: [{ scale }],
              zIndex: tokens.zIndex.dropdown,
              ...iosShadow,
              elevation: androidElevation,
            },
          ]}
        >
          <View style={styles.menu}>
            {searchable ? (
              <View style={styles.searchHeader}>
                <Input
                  size="s"
                  shape="pill"
                  type="search"
                  placeholder="Search…"
                  value={query}
                  onChange={setQuery}
                  aria-label="Filter options"
                />
              </View>
            ) : null}
            <ScrollView
              style={styles.menuScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {grouped.map((group, gi) => (
                <View key={group.section?.id ?? `g${gi}`}>
                  {group.section?.label ? (
                    <View style={styles.sectionHeader}>
                      <Text
                        style={{
                          fontSize: fieldLabelTypo.fontSize,
                          lineHeight: fieldLabelTypo.lineHeight,
                          fontFamily: fieldLabelTypo.fontFamily,
                          fontWeight: fieldLabelTypo.fontWeight,
                          color: role.content.low,
                        }}
                      >
                        {group.section.label}
                      </Text>
                    </View>
                  ) : gi > 0 ? (
                    <View
                      style={[styles.divider, { backgroundColor: neutral.content.strokeLow }]}
                    />
                  ) : null}
                  {group.options.map(renderRow)}
                </View>
              ))}
              {searchable && filtered.length === 0 ? (
                <View style={styles.row}>
                  <Text
                    style={{
                      fontSize: labelTypo.fontSize,
                      lineHeight: labelTypo.lineHeight,
                      fontFamily: labelTypo.fontFamily,
                      color: role.content.low,
                    }}
                  >
                    No matches
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

export type { SelectProps } from './interface';
