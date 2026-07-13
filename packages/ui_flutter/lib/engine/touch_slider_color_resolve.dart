import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

class TouchSliderResolvedColors {
  const TouchSliderResolvedColors({
    required this.fill,
    required this.rail,
    required this.slotOnFill,
    required this.slotOnFillLow,
    required this.slotOnRail,
  });

  final Color fill;
  final Color rail;
  final Color slotOnFill;
  final Color slotOnFillLow;
  final Color slotOnRail;
}

Color _roleColor(FlatRoleTokens role, String suffix) {
  switch (suffix) {
    case 'bold':
      return oneUiHexColor(role.surfaces[kSurfaceBold]!);
    case 'subtle':
      return oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
    case 'minimal':
      return oneUiHexColor(role.surfaces[kSurfaceMinimal]!);
    case 'tintedA11y':
      return oneUiHexColor(role.content['tintedA11y']!);
    case 'boldTintedA11y':
      return oneUiHexColor(
        role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!,
      );
    case 'boldLow':
      return oneUiHexColor(
        role.onBoldContent['low'] ?? role.content['low']!,
      );
    case 'low':
      return oneUiHexColor(role.content['low']!);
    default:
      return Colors.transparent;
  }
}

bool _touchSliderOnTintedSurface(BuildContext context) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface == null || surface.surfaceDepth == 0) return false;
  final mode = surface.parentMode ?? kSurfaceDefault;
  return mode != kSurfaceDefault && mode != 'elevated';
}

TouchSliderResolvedColors resolveTouchSliderColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);
  final neutral = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');

  Color? fromToken(String token) =>
      resolveButtonTokenColor(context, ds, token, appearance: appearance);

  final fill = fromToken('--${appearanceLabel(appearance)}-Bold') ??
      _roleColor(role, 'bold');

  Color rail;
  Color slotOnRail;
  if (_touchSliderOnTintedSurface(context)) {
    // Web: --Text-Minimal / --Text-Low follow the PARENT surface appearance
    // (data-appearance on <Surface>), not the slider's appearance prop.
    final surface = OneUiSurfaceScope.of(context);
    final parentTokens = OneUiSurfaceScope.tokensForAppearance(
      context,
      surface.parentAppearance,
    );
    rail = fromToken('--Text-Minimal') ?? _roleColor(parentTokens, 'minimal');
    slotOnRail = fromToken('--Text-Low') ?? _roleColor(parentTokens, 'low');
  } else {
    rail = fromToken('--Neutral-Minimal') ??
        _roleColor(neutral, 'minimal');
    slotOnRail = fromToken('--Neutral-Low') ?? _roleColor(neutral, 'low');
  }

  final slotOnFill = fromToken('--${appearanceLabel(appearance)}-Bold-TintedA11y') ??
      _roleColor(role, 'boldTintedA11y');
  final slotOnFillLow = fromToken('--${appearanceLabel(appearance)}-Bold-Low') ??
      _roleColor(role, 'boldLow');

  return TouchSliderResolvedColors(
    fill: fill,
    rail: rail,
    slotOnFill: slotOnFill,
    slotOnFillLow: slotOnFillLow,
    slotOnRail: slotOnRail,
  );
}

/// Start-slot icon tint — web `.slot { color: var(--_ts-on-color) }` with
/// `[data-start-on-rail]` / rounded-at-min branches (`TouchSlider.module.css`).
Color resolveTouchSliderStartSlotColor({
  required TouchSliderResolvedColors colors,
  required bool startOnRail,
  required double fillRatio,
  required String progressStyle,
}) {
  if (startOnRail) return colors.slotOnRail;
  if (fillRatio <= 0 && progressStyle == 'rounded') {
    return colors.slotOnFillLow;
  }
  return colors.slotOnFill;
}
