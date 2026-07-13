import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_radio_types.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

/// Resolved paint — mirrors `Radio.module.css` `--_rd-*` / RN `paintFor`.
class RadioResolvedPaint {
  const RadioResolvedPaint({
    required this.borderColor,
    required this.backgroundColor,
    required this.pressedBackgroundColor,
    required this.indicatorColor,
    required this.borderWidth,
  });

  final Color borderColor;
  final Color backgroundColor;
  final Color pressedBackgroundColor;
  final Color indicatorColor;
  final double borderWidth;
}

Color _roleColor(
  FlatRoleTokens role,
  String suffix, {
  Color? fallback,
}) {
  switch (suffix) {
    case 'strokeMedium':
      return oneUiHexColor(
        role.content['strokeMedium'] ?? role.content['medium']!,
      );
    case 'high':
      return oneUiHexColor(role.content['high']!);
    case 'bold':
      return oneUiHexColor(role.surfaces[kSurfaceBold]!);
    case 'boldHigh':
      return oneUiHexColor(
        role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!,
      );
    case 'boldPressed':
      return oneUiHexColor(role.states['boldPressed']!);
    case 'boldHover':
      return oneUiHexColor(role.states['boldHover']!);
    case 'subtlePressed':
      return oneUiHexColor(role.states['subtlePressed']!);
    default:
      return fallback ?? Colors.transparent;
  }
}

RadioResolvedPaint resolveRadioPaint(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiRadioState state,
  required bool pressed,
  required bool hovered,
  required String roleAppearance,
  required String uncheckedRoleAppearance,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, roleAppearance);
  final uncheckedRole =
      OneUiSurfaceScope.tokensForAppearance(context, uncheckedRoleAppearance);
  final borderWidth = ds.resolveComponentLengthPxCascade(
        ['--Stroke-M'],
        gaps: const [],
        platformId: OneUiScope.of(context).platformId,
        density: OneUiScope.of(context).density,
        platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
      ) ??
      1;

  /// Mirrors web `.appearancePrimary` / `.appearanceSecondary` etc. — each maps
  /// `--{Role}-Bold` directly. `--Radio-role*` in Convex tracks the brand default
  /// input role (often primary) and must not override explicit [roleAppearance].
  Color pick(
    String suffix, {
    FlatRoleTokens? from,
    String? appearance,
  }) {
    final tokens = from ?? role;
    final appearanceLabel =
        oneUiAppearanceCssLabel(appearance ?? roleAppearance);
    final fromRole = _roleColor(tokens, suffix);
    final cssSuffix = switch (suffix) {
      'strokeMedium' => 'Stroke-Medium',
      'high' => 'High',
      'bold' => 'Bold',
      'boldHigh' => 'Bold-TintedA11y',
      'boldHover' => 'Bold-Hover',
      'boldPressed' => 'Bold-Pressed',
      'subtlePressed' => 'Pressed',
      _ => suffix,
    };
    return resolveButtonTokenColor(
          context,
          ds,
          '--$appearanceLabel-$cssSuffix',
          appearance: appearance ?? roleAppearance,
        ) ??
        fromRole;
  }

  if (state.isReadOnly) {
    // Mirrors `Radio.module.css` `[data-readonly]` — fill/border use
    // `--_rd-default-high`; inner dot uses `--_rd-bold-high`.
    final high = pick('high');
    final boldHigh = pick('boldHigh');
    return RadioResolvedPaint(
      borderColor: high,
      backgroundColor: state.isChecked ? high : Colors.transparent,
      pressedBackgroundColor: state.isChecked ? high : Colors.transparent,
      indicatorColor: boldHigh,
      borderWidth: borderWidth,
    );
  }

  if (state.isChecked) {
    final bold = pick('bold');
    final boldHover = pick('boldHover');
    final boldPressed = pick('boldPressed');
    final fill = pressed
        ? boldPressed
        : hovered
            ? boldHover
            : bold;
    return RadioResolvedPaint(
      borderColor: fill,
      backgroundColor: fill,
      pressedBackgroundColor: boldPressed,
      indicatorColor: pick('boldHigh'),
      borderWidth: borderWidth,
    );
  }

  final stroke = pick(
    'strokeMedium',
    from: uncheckedRole,
    appearance: uncheckedRoleAppearance,
  );
  final pressedBg = pick('subtlePressed');
  final neutral = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');
  final hoverBg = oneUiHexColor(
      neutral.states['hover'] ?? neutral.surfaces[kSurfaceMinimal]!);
  final neutralPressed = oneUiHexColor(
    neutral.states['subtlePressed'] ?? neutral.states['pressed']!,
  );

  if (pressed) {
    return RadioResolvedPaint(
      borderColor: stroke,
      backgroundColor: neutralPressed,
      pressedBackgroundColor: neutralPressed,
      indicatorColor: pick('boldHigh'),
      borderWidth: borderWidth,
    );
  }
  if (hovered) {
    return RadioResolvedPaint(
      borderColor: stroke,
      backgroundColor: hoverBg,
      pressedBackgroundColor: neutralPressed,
      indicatorColor: pick('boldHigh'),
      borderWidth: borderWidth,
    );
  }

  return RadioResolvedPaint(
    borderColor: stroke,
    backgroundColor: Colors.transparent,
    pressedBackgroundColor: neutralPressed,
    indicatorColor: pick('boldHigh'),
    borderWidth: borderWidth,
  );
}
