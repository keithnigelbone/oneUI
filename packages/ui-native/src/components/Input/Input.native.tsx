/**
 * Input.native.tsx
 *
 * RN peer of `packages/ui/src/components/Input/Input.tsx` — the bordered
 * 4-slot text-input shell. Label / description / required asterisk / info
 * trigger live in the higher-level `InputField` aggregator; this component
 * exposes only `accessibilityLabel` (+ `aria-label` alias for web parity).
 *
 * Pipeline:
 *   1. `useInputState(props)` from `./interface` — appearance + size + flags.
 *   2. `useSurfaceTokens(role)` resolves the brand paint against the surrounding
 *      `<Surface>` cascade.
 *   3. `inputPaintFor(...)` maps the resolved role × attention × focus / error
 *      into a `Paint` (border, fill, text, placeholder, slot-icon colours) —
 *      mirrors web's intermediate `--_inp-*` cascade in `Input.module.css`.
 *   4. `getInputAccessibilityProps(props, state)` produces RN a11y props for
 *      the inner `<TextInput>`.
 *   5. The bordered `<Pressable>` shell forwards slot-whitespace taps to the
 *      inner `<TextInput>` (RN doesn't bubble label-click → focus).
 *
 * Surface context: the same intermediate variables that web emits via
 * `.appearance*` classes are computed in JS here against the resolved role,
 * so children placed inside `<Surface mode="bold">` automatically pick up the
 * on-bold tone — no per-surface overrides needed in callers.
 */

import React, { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputSubmitEditingEventData,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  useSurfaceTokens,
  useTypographyTokens,
  useComponentTheme,
  useOneUITheme,
  resolveShapeLanguageBorderRadius,
  type NativeRoleTokens,
} from '../../theme';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import {
  getInputAccessibilityProps,
  resolveTextInputType,
  useInputState,
  type InputAppearance,
  type InputAttention,
  type InputFocusEvent,
  type InputNumericSize,
  type InputProps,
} from './interface';
import {
  CONTAINER_BY_SIZE,
  ICON_SLOT_BY_SIZE,
  INPUT_BORDER_WIDTH,
  INPUT_SIZE_METRICS,
  RADIUS_PILL,
  styles,
} from './Input.styles.native';

// ============================================================================
// Paint resolution — peer of web's `--_inp-*` intermediate cascade.
// ============================================================================

interface Paint {
  /** Background fill (transparent for outlined, role subtle for filled). */
  background: string;
  /** Border colour for idle state. */
  borderColor: string;
  /** Border width (idle / focus / invalid). */
  borderWidth: number;
  /**
   * Per-side padding compensation (>= 0) to subtract from the container's
   * static `paddingHorizontal` / `paddingVertical`. RN treats `borderWidth`
   * as part of the box — when it grows on focus/error, the inner content
   * shrinks and slots + text shift inward. Subtracting this delta from the
   * padding keeps `border + padding` constant per side so the content
   * position never moves. Always `0` when `borderWidth` equals the idle
   * baseline for the current attention level.
   */
  paddingShrink: number;
  /** Typed value colour. */
  textColor: string;
  /** Placeholder text colour. */
  placeholderColor: string;
  /** Tint for slot icons (start / start2 / end / end2). */
  slotColor: string;
}

interface PaintInputs {
  role: NativeRoleTokens;
  attention: InputAttention;
  hasFocus: boolean;
  hasError: boolean;
  isDisabled: boolean;
}

function inputPaintFor({ role, attention, hasFocus, hasError, isDisabled }: PaintInputs): Paint {
  // Web parity — `Input.module.css` gates every interactive paint rule with
  // `:not([data-disabled])`. Treat focus as "off" when the row is disabled
  // so the border stays at idle even if RNW lets the underlying `<input>`
  // (rendered as `readOnly` when editable=false) catch a direct click and
  // raise `onFocus`. Hover is already gated upstream via `canShowHover`.
  const effectiveFocus = hasFocus && !isDisabled;
  const effectiveError = hasError && !isDisabled;
  // Resolved appearance defaults that mirror Input.module.css §APPEARANCE
  // intermediate variable map. Web uses TWO distinct medium tokens here:
  //
  //   --_inp-default-medium-stroke → --{Role}-Stroke-Medium → role.content.strokeMedium
  //                                  (idle border — softer / lighter)
  //   --_inp-default-medium-text   → --{Role}-Medium-Text   → role.content.medium
  //                                  (slot icon tint — slightly darker for legibility)
  //
  // Using `role.content.medium` for the idle border produces a noticeably
  // darker stroke than web; the stroke token is purpose-built for borders.
  const borderIdleColor = role.content.strokeMedium;
  const borderAccentColor = role.content.tinted; // matches web `--_inp-default-tinted`
  const errorColor = role.surfaces.bold; // overridden below when `hasError`
  const slotColor = role.content.medium;
  const subtleFill = role.surfaces.subtle;

  // Resolve border + fill per attention level. Web parity:
  //   medium idle  → border-width: Stroke-M; border-color: medium-stroke.
  //   high idle    → border-width: 0;        background: subtle.
  //   focus        → border-width: Spacing-0-5; border-color: tinted.
  //   invalid      → border-width: Spacing-0-5; border-color: negative-bold.
  let background: string = 'transparent';
  let borderColor: string = borderIdleColor;
  let borderWidth: number = INPUT_BORDER_WIDTH.idle;

  // Per-attention idle border width. The padding compensation below uses
  // this as the baseline so the idle visual stays identical to the design;
  // only focus / error states (which grow the border) need to give the
  // padding back to keep slot content in place.
  const idleBorderForAttention = attention === 'high' ? 0 : INPUT_BORDER_WIDTH.idle;

  if (attention === 'high') {
    background = subtleFill;
    borderWidth = 0;
    borderColor = 'transparent';
  }

  if (effectiveFocus) {
    borderWidth = INPUT_BORDER_WIDTH.focus;
    borderColor = borderAccentColor;
  }

  if (effectiveError) {
    // Negative role error colour is supplied by the caller via the `role`
    // input — see `paintRole` swap above where the `negative` role replaces
    // the default during error rendering.
    //
    // Web width tokens differ between idle vs focus error states (see
    // Input.module.css §INVALID):
    //
    //   medium attention + idle  → `Stroke-M` (hairline)      — softer stroke
    //   medium attention + focus → `Spacing-0-5` (~2px)       — strong stroke
    //   high attention   + idle  → `Spacing-0-5`              — base invalid rule
    //   high attention   + focus → `Spacing-0-5`              — focus rule
    //
    // Using the same width for both idle and focus erases the visual
    // hierarchy web ships, so the per-attention branch is required.
    if (effectiveFocus || attention === 'high') {
      borderWidth = INPUT_BORDER_WIDTH.focus;
    } else {
      borderWidth = INPUT_BORDER_WIDTH.idle;
    }
    borderColor = errorColor;
  }

  // RN treats `borderWidth` as part of the box — when it grows above its
  // idle baseline (focus / invalid / high-attention-focused), the inner
  // content area shrinks symmetrically and slots + text shift inward.
  // Subtract the delta from the container's padding so `border + padding`
  // per side stays constant across every state.
  const paddingShrink = Math.max(0, borderWidth - idleBorderForAttention);

  return {
    background,
    borderColor,
    borderWidth,
    paddingShrink,
    textColor: role.content.high,
    placeholderColor: role.content.low,
    slotColor,
  };
}

// ============================================================================
// Type guards
// ============================================================================

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// ============================================================================
// Component
// ============================================================================

function bodySizeForInputNumeric(size: InputNumericSize): 'XS' | 'S' | 'M' | 'L' {
  if (size <= 6) return 'XS';
  if (size <= 8) return 'S';
  if (size <= 10) return 'M';
  return 'L';
}

export function Input(props: InputProps): React.ReactElement {
  const state = useInputState(props);
  const {
    resolvedAppearance,
    numericSize,
    shape,
    attention,
    isDisabled,
    isReadOnly,
    hasErrorHighlight,
  } = state;

  const componentTheme = useComponentTheme('inputfield');
  const { shape: nativeShape } = useOneUITheme();

  // Two roles drive the cascade. Web reads `--Negative-Bold` directly for the
  // error stroke; native pulls the same value from the negative role tokens.
  const role = useSurfaceTokens(resolvedAppearance as Exclude<InputAppearance, 'auto'>);
  const negativeRole = useSurfaceTokens('negative');

  // Focus + error visual state.
  const [hasFocus, setHasFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  // Pick the role that owns the border colour. For invalid rows we swap to
  // negative so the focus + idle paint flow through one helper.
  const paintRole: NativeRoleTokens = hasErrorHighlight ? negativeRole : role;
  const paint = useMemo(
    () =>
      inputPaintFor({
        role: paintRole,
        attention,
        hasFocus,
        hasError: hasErrorHighlight,
        isDisabled,
      }),
    [paintRole, attention, hasFocus, hasErrorHighlight, isDisabled]
  );

  const containerSizeStyle = CONTAINER_BY_SIZE[numericSize];
  const iconSlotStyle = ICON_SLOT_BY_SIZE[numericSize];
  const radius = shape === 'pill'
    ? RADIUS_PILL
    : (resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, nativeShape, 'inputs')
      ?? INPUT_SIZE_METRICS[numericSize].borderRadius);

  // Typography — body row size matches input height tier (S → Body-S, etc.).
  const bodyTypo = useTypographyTokens('body', bodySizeForInputNumeric(numericSize), {
    emphasis: 'low',
  });

  // RN TextInput `type` → keyboardType + secureTextEntry.
  const { keyboardType, secureTextEntry } = resolveTextInputType(props.type);

  // ---- Handlers ----
  const handleChangeText = useCallback(
    (next: string) => {
      if (isReadOnly) return;
      props.onChange?.(next);
    },
    [isReadOnly, props]
  );

  const handleSubmitEditing = useCallback(
    (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      props.onSubmitEditing?.(e);
      props.onSubmit?.(props.value ?? e.nativeEvent.text ?? '');
    },
    [props]
  );

  const handleFocus = useCallback(
    (e: InputFocusEvent) => {
      // RNW renders `editable={false}` as `<input readonly>`, which can still
      // catch focus from a direct click. Skip the state flip when disabled so
      // the row stays painted in its idle state — mirrors web
      // `:focus-within:not([data-disabled])`.
      if (isDisabled) return;
      setHasFocus(true);
      props.onFocus?.(e);
    },
    [isDisabled, props]
  );

  const handleBlur = useCallback(
    (e: InputFocusEvent) => {
      setHasFocus(false);
      props.onBlur?.(e);
    },
    [props]
  );

  const handleContainerPress = useCallback(() => {
    if (isDisabled) return;
    inputRef.current?.focus();
  }, [isDisabled]);

  // ---- Slot rendering ----
  // Each slot reuses the icon slot context so nested OneUI `<Icon>` instances
  // pick up size + colour automatically (peer of web `currentColor`).
  const slotIconPx = INPUT_SIZE_METRICS[numericSize].iconSize;

  const renderIconSlot = (node: ReactNode, sizeStyle: StyleProp<ViewStyle>, iconColor: string) => {
    if (node == null) return null;
    return (
      <ComponentSlotIconContext.Provider value={{ color: iconColor, sizePx: slotIconPx }}>
        <View style={sizeStyle}>{node}</View>
      </ComponentSlotIconContext.Provider>
    );
  };

  const renderTextSlot = (node: ReactNode, color: string, slotStyle: StyleProp<ViewStyle>) => {
    if (node == null) return null;
    if (isString(node) || typeof node === 'number') {
      return (
        <View style={slotStyle}>
          <Text
            style={{
              fontFamily: bodyTypo.fontFamily,
              fontSize: bodyTypo.fontSize,
              lineHeight: bodyTypo.lineHeight,
              fontWeight: bodyTypo.fontWeight,
              color,
            }}
          >
            {String(node)}
          </Text>
        </View>
      );
    }
    return (
      <ComponentSlotIconContext.Provider value={{ color, sizePx: slotIconPx }}>
        <View style={slotStyle}>{node}</View>
      </ComponentSlotIconContext.Provider>
    );
  };

  // ---- Accessibility ----
  const a11y = getInputAccessibilityProps(props, state);
  const { accessibilityState, ...restA11y } = a11y;

  const controlStyle: StyleProp<TextStyle> = [
    styles.control,
    {
      fontFamily: bodyTypo.fontFamily,
      fontSize: bodyTypo.fontSize,
      lineHeight: bodyTypo.lineHeight,
      fontWeight: bodyTypo.fontWeight,
      color: paint.textColor,
    },
  ];

  // Hover paint — web `Input.module.css` fills the container with
  // `--_inp-default-hover` (= `role.states.hover`) on `:hover` when the row
  // is not focused, not disabled, and not read-only (`.readOnly:hover`
  // explicitly returns the background to transparent). Native tracks hover
  // via Pressable's `onHoverIn` / `onHoverOut` callbacks (typed in RN core
  // since these fire on RNW + macOS / tvOS pointer environments).
  const canShowHover = !isDisabled && !isReadOnly && !hasFocus;
  const hoverBackground = paintRole.states.hover;

  const handleHoverIn = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleHoverOut = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Padding compensation — see `Paint.paddingShrink` comment in
  // `inputPaintFor`. Subtracts the focus-vs-idle border delta from the
  // container's static padding so slot icons / text don't shift inward
  // when the border grows on focus or error.
  const baseSizeMetrics = INPUT_SIZE_METRICS[numericSize];
  const compensatedPaddingStyle: ViewStyle | null =
    paint.paddingShrink > 0
      ? {
          paddingHorizontal: Math.max(0, baseSizeMetrics.paddingHorizontal - paint.paddingShrink),
          paddingVertical: Math.max(0, baseSizeMetrics.paddingVertical - paint.paddingShrink),
        }
      : null;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    containerSizeStyle,
    compensatedPaddingStyle,
    {
      backgroundColor: paint.background,
      borderColor: paint.borderColor,
      borderWidth: paint.borderWidth,
      borderRadius: radius,
    },
    isHovered && canShowHover ? { backgroundColor: hoverBackground } : null,
    isDisabled ? styles.containerDisabled : null,
  ];

  return (
    <Pressable
      testID={props.testID}
      onPress={handleContainerPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      disabled={isDisabled}
      accessible={false}
      // `'no'` (NOT `'no-hide-descendants'`) keeps the decorative wrapper out
      // of the Android accessibility tree while leaving its descendants —
      // crucially the inner <TextInput> — reachable by TalkBack and standard
      // React Native Testing Library queries. `'no-hide-descendants'` would
      // also hide the TextInput, making the field inaccessible to assistive
      // tech and only queryable via `includeHiddenElements: true`.
      importantForAccessibility="no"
      // The container is a tap-forwarder — focus belongs to the inner
      // <TextInput>, never to this wrapper. On RNW, omitting this lets the
      // Pressable `<div>` claim browser focus and paint the default focus
      // ring inside our design-system border. `focusable={false}` keeps the
      // wrapper out of the tab order on web; iOS/Android ignore it.
      focusable={false}
      style={[containerStyle, props.style]}
    >
      {renderIconSlot(props.start, [styles.slotStart, iconSlotStyle], paint.slotColor)}
      {renderTextSlot(props.start2, paint.slotColor, styles.slotStart2)}

      <TextInput
        ref={inputRef}
        {...restA11y}
        style={controlStyle}
        value={props.value}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        placeholderTextColor={paint.placeholderColor}
        // `editable={false}` is reserved for `disabled` only. Do not pass RN's
        // `readOnly` prop — it forces `editable={false}` internally, which sets
        // `isEnabled=false` on Android and TalkBack announces "disabled".
        // Read-only is enforced in `handleChangeText` + a11y readonly flags.
        editable={!isDisabled}
        showSoftInputOnFocus={!isDisabled && !isReadOnly}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={props.onKeyPress}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoComplete={props.autoComplete as TextInput['props']['autoComplete']}
        autoFocus={props.autoFocus}
        maxLength={props.maxLength}
        nativeID={props.id}
        selectionColor={role.surfaces.bold}
        accessibilityState={accessibilityState}
      />

      {renderTextSlot(props.end2, paint.slotColor, styles.slotEnd2)}
      {renderIconSlot(props.end, [styles.slotEnd, iconSlotStyle], paint.slotColor)}
    </Pressable>
  );
}

Input.displayName = 'Input';

export type { InputProps, InputNativeProps } from './interface';
