import 'package:flutter/material.dart';

import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

class SliderResolvedColors {
  const SliderResolvedColors({
    required this.fill,
    required this.rail,
    required this.knob,
    required this.innerDot,
    required this.tick,
  });

  final Color fill;
  final Color rail;
  final Color knob;
  final Color innerDot;
  final Color tick;
}

Color _roleColor(FlatRoleTokens role, String suffix) {
  switch (suffix) {
    case 'bold':
      return oneUiHexColor(role.surfaces[kSurfaceBold]!);
    case 'subtle':
      return oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
    case 'minimal':
      return oneUiHexColor(role.surfaces[kSurfaceMinimal]!);
    case 'default':
      return oneUiHexColor(role.surfaces[kSurfaceDefault]!);
    default:
      return Colors.transparent;
  }
}

bool _sliderOnTintedSurface(BuildContext context) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface == null || surface.surfaceDepth == 0) return false;
  final mode = surface.parentMode ?? kSurfaceDefault;
  return mode == 'minimal' || mode == 'subtle' || mode == 'bold';
}

String _appearanceCssLabel(String appearance) {
  if (appearance == 'brand-bg') return 'Brand-Bg';
  if (appearance.isEmpty) return 'Secondary';
  return appearance[0].toUpperCase() + appearance.substring(1);
}

SliderResolvedColors resolveSliderColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);
  final neutral = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');

  Color? fromToken(String token) =>
      resolveButtonTokenColor(context, ds, token, appearance: appearance);

  final label = _appearanceCssLabel(appearance);
  final fill = fromToken('--$label-Bold') ?? _roleColor(role, 'bold');
  final knob = fill;

  Color rail;
  if (_sliderOnTintedSurface(context)) {
    rail = fromToken('--$label-Subtle') ?? _roleColor(role, 'subtle');
  } else {
    rail = fromToken('--Neutral-Minimal') ?? _roleColor(neutral, 'minimal');
  }

  final innerDot = fromToken('--Surface-Default') ??
      _roleColor(
        OneUiSurfaceScope.tokensForAppearance(context, 'primary'),
        'default',
      );
  final tick = fromToken('--Neutral-Subtle') ?? _roleColor(neutral, 'subtle');

  return SliderResolvedColors(
    fill: fill,
    rail: rail,
    knob: knob,
    innerDot: innerDot,
    tick: tick,
  );
}
