import 'package:flutter/material.dart';

import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_input_types.dart';
import 'input_size_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Optional explicit component tokens (`--Input-textColor`, etc.) — not `--Input-role*`
/// (web maps role slots per `.appearance*` class; Flutter uses [appearance] on the widget).
Color? resolveInputExplicitComponentColor(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
  required String tokenKey,
}) {
  return resolveColorFromComponentPropertyKeys(
    context,
    ds,
    keys: [tokenKey],
    appearance: appearance,
  );
}

/// Resolved chrome paint — peer of RN `inputPaintFor` / web `--_inp-*` cascade.
///
/// Focus and invalid states grow the layout border (RN) rather than painting a
/// second fill layer. [paddingShrink] keeps slot content stationary when the
/// border thickens.
class InputResolvedPaint {
  const InputResolvedPaint({
    required this.background,
    required this.layoutBorderColor,
    required this.layoutBorderWidth,
    required this.paddingShrink,
    required this.ringColor,
    required this.textColor,
    required this.placeholderColor,
    required this.slotColor,
    this.hoverBackground,
  });

  final Color background;
  final Color layoutBorderColor;
  final double layoutBorderWidth;

  /// RN `paddingShrink` — subtract from shell padding when border grows.
  final double paddingShrink;

  /// Accent stroke / caret / selection (when text is selected).
  final Color? ringColor;
  final Color textColor;
  final Color placeholderColor;
  final Color slotColor;
  final Color? hoverBackground;

  Color get accentBorderColor => ringColor ?? layoutBorderColor;
}

FlatRoleTokens resolveInputRoleTokens(BuildContext context, String appearance) {
  final surfaceCtx = OneUiSurfaceScope.maybeOf(context);
  var role = appearance;
  if (role == 'neutral' && surfaceCtx != null && surfaceCtx.surfaceDepth > 0) {
    role = 'primary';
  }
  return OneUiSurfaceScope.tokensOf(context, role);
}

InputResolvedPaint resolveInputPaint({
  required BuildContext context,
  required NativeDesignSystemPayload designSystem,
  required String appearance,
  required FlatRoleTokens role,
  required FlatRoleTokens? errorRole,
  required OneUiInputAttention attention,
  required InputBorderWidths borders,
  required bool hasFocus,
  required bool hasError,
  required bool isDisabled,
  required bool isHovered,
  bool isReadOnly = false,
}) {
  final effectiveFocus = hasFocus && !isDisabled;
  final effectiveError = hasError && !isDisabled;
  final paintRole = effectiveError && errorRole != null ? errorRole : role;
  final isHigh = attention == OneUiInputAttention.high;

  var borderIdleColor = oneUiHexColor(
    paintRole.content['strokeMedium'] ?? paintRole.content['medium']!,
  );
  final borderAccentColor = oneUiHexColor(paintRole.surfaces[kSurfaceBold]!);
  var slotColor = oneUiHexColor(paintRole.content['medium']!);
  var subtleFill = oneUiHexColor(
    paintRole.surfaces[kSurfaceMinimal] ?? paintRole.surfaces[kSurfaceSubtle]!,
  );
  var hoverFill = oneUiHexColor(
    paintRole.states['hover'] ?? paintRole.surfaces[kSurfaceMinimal]!,
  );
  var textColor = oneUiHexColor(paintRole.content['high']!);
  var placeholderColor = oneUiHexColor(paintRole.content['low']!);

  borderIdleColor = resolveInputExplicitComponentColor(
        context,
        designSystem,
        appearance: appearance,
        tokenKey: '--Input-borderColor',
      ) ??
      borderIdleColor;
  textColor = resolveInputExplicitComponentColor(
        context,
        designSystem,
        appearance: appearance,
        tokenKey: '--Input-textColor',
      ) ??
      textColor;
  placeholderColor = resolveInputExplicitComponentColor(
        context,
        designSystem,
        appearance: appearance,
        tokenKey: '--Input-placeholderColor',
      ) ??
      placeholderColor;
  final explicitBg = resolveInputExplicitComponentColor(
    context,
    designSystem,
    appearance: appearance,
    tokenKey: '--Input-backgroundColor',
  );

  final idleBorderForAttention = isHigh ? 0.0 : borders.idle;
  var layoutBorderWidth = idleBorderForAttention;
  var layoutBorderColor = isHigh ? Colors.transparent : borderIdleColor;
  var background = Colors.transparent;
  Color? accentColor;

  if (isHigh) {
    background = explicitBg ?? subtleFill;
  }

  // Mirrors RN `inputPaintFor` — grow border + accent colour; never fill interior.
  if (effectiveFocus) {
    layoutBorderWidth = borders.focus;
    layoutBorderColor = borderAccentColor;
    accentColor = borderAccentColor;
  }

  if (effectiveError) {
    final errorBold = oneUiHexColor(paintRole.surfaces[kSurfaceBold]!);
    layoutBorderWidth =
        (effectiveFocus || isHigh) ? borders.focus : idleBorderForAttention;
    layoutBorderColor = errorBold;
    accentColor = errorBold;
  }

  final paddingShrink =
      (layoutBorderWidth - idleBorderForAttention).clamp(0.0, double.infinity);

  if (!effectiveFocus &&
      !effectiveError &&
      isHovered &&
      !isDisabled &&
      !isReadOnly &&
      attention == OneUiInputAttention.medium) {
    background = hoverFill;
  }

  if (!effectiveFocus &&
      !effectiveError &&
      isHovered &&
      !isDisabled &&
      !isReadOnly &&
      isHigh) {
    background = hoverFill;
  }

  return InputResolvedPaint(
    background: background,
    layoutBorderColor: layoutBorderColor,
    layoutBorderWidth: layoutBorderWidth,
    paddingShrink: paddingShrink,
    ringColor: accentColor,
    textColor: textColor,
    placeholderColor: placeholderColor,
    slotColor: slotColor,
    hoverBackground: hoverFill,
  );
}
