import 'package:flutter/material.dart';

import '../widgets/one_ui_image_types.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/platform_foundation_config.dart';
import '../utils/one_ui_hex_color.dart';

BoxFit boxFitForImageObjectFit(OneUiImageObjectFit fit) {
  return switch (fit) {
    OneUiImageObjectFit.cover => BoxFit.cover,
    OneUiImageObjectFit.contain => BoxFit.contain,
    OneUiImageObjectFit.fill => BoxFit.fill,
    OneUiImageObjectFit.none => BoxFit.none,
    OneUiImageObjectFit.scaleDown => BoxFit.scaleDown,
  };
}

/// Resolved Image chrome from Convex `--Image-*` + neutral role fallbacks.
class ImageResolvedStyle {
  const ImageResolvedStyle({
    required this.borderRadius,
    required this.fallbackBackground,
    required this.fallbackColor,
    required this.stateLayerHover,
    required this.stateLayerPressed,
    required this.disabledOpacity,
    required this.minFallbackHeightPx,
    required this.fallbackIconSizePx,
    required this.objectFit,
    required this.objectPositionAlignment,
  });

  final BorderRadius borderRadius;
  final Color fallbackBackground;
  final Color fallbackColor;
  final Color stateLayerHover;
  final Color stateLayerPressed;
  final double disabledOpacity;
  final double minFallbackHeightPx;
  final double fallbackIconSizePx;
  final OneUiImageObjectFit objectFit;
  final Alignment objectPositionAlignment;
}

Color? _colorFromToken(
  BuildContext context,
  NativeDesignSystemPayload ds,
  String? raw,
) {
  return resolveButtonTokenColor(context, ds, raw, appearance: 'neutral');
}

Alignment _alignmentFromObjectPosition(String raw) {
  final t = raw.trim().toLowerCase();
  if (t.contains('top') && t.contains('left')) return Alignment.topLeft;
  if (t.contains('top') && t.contains('right')) return Alignment.topRight;
  if (t.contains('bottom') && t.contains('left')) return Alignment.bottomLeft;
  if (t.contains('bottom') && t.contains('right')) return Alignment.bottomRight;
  if (t.contains('top')) return Alignment.topCenter;
  if (t.contains('bottom')) return Alignment.bottomCenter;
  if (t.contains('left')) return Alignment.centerLeft;
  if (t.contains('right')) return Alignment.centerRight;
  return Alignment.center;
}

ImageResolvedStyle resolveImageStyle(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  OneUiImageObjectFit? fit,
  OneUiImageObjectFit? objectFit,
  String objectPosition = 'center',
  String? borderRadiusToken,
}) {
  final scope = OneUiScope.of(context);
  final gaps = <String>[];
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  final neutral = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');

  double? pxFor(List<String> keys, {double? relativeToPx}) {
    return ds.resolveComponentLengthPxCascade(
      keys,
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
      relativeToPx: relativeToPx,
    );
  }

  final radiusPx = borderRadiusToken != null
      ? pxFor([borderRadiusToken]) ?? 0
      : pxFor(['--Image-borderRadius', '--Shape-0']) ?? 0;
  final minFallback = pxFor(['--Spacing-10']) ?? 40;
  final iconSize = pxFor(['--Spacing-8']) ?? 32;

  Color pickColor(List<String> componentKeys, String roleHex) {
    for (final k in componentKeys) {
      final raw = ds.rawComponentCascade([k]);
      final c = _colorFromToken(context, ds, raw);
      if (c != null) return c;
    }
    return oneUiHexColor(roleHex);
  }

  final resolvedFit =
      OneUiImageObjectFitX.resolve(fit: fit, objectFit: objectFit);
  final fitRaw = ds.rawComponentCascade(['--Image-objectFit']);
  final resolvedObjectFit = fit != null || objectFit != null
      ? resolvedFit
      : OneUiImageObjectFitX.fromWire(fitRaw);

  final disabledOpacityRaw =
      ds.rawComponentCascade(['--Image-disabledOpacity']);
  final disabledOpacity = disabledOpacityRaw != null
      ? (double.tryParse(
              disabledOpacityRaw.replaceAll(RegExp(r'[^0-9.]'), '')) ??
          0.5)
      : 0.5;

  return ImageResolvedStyle(
    borderRadius: BorderRadius.circular(radiusPx),
    fallbackBackground: pickColor(
      ['--Image-fallbackBackground'],
      neutral?.surfaces[kSurfaceMinimal] ?? '#E8E8E8',
    ),
    fallbackColor: pickColor(
      ['--Image-fallbackColor'],
      neutral?.content['low'] ?? '#666666',
    ),
    stateLayerHover: pickColor(
      ['--Image-stateLayerHover'],
      neutral?.states['hover'] ??
          neutral?.surfaces[kSurfaceMinimal] ??
          '#00000014',
    ),
    stateLayerPressed: pickColor(
      ['--Image-stateLayerPressed'],
      neutral?.states['pressed'] ??
          neutral?.surfaces[kSurfaceMinimal] ??
          '#00000029',
    ),
    disabledOpacity: disabledOpacity.clamp(0, 1),
    minFallbackHeightPx: minFallback,
    fallbackIconSizePx: iconSize,
    objectFit: resolvedObjectFit,
    objectPositionAlignment: _alignmentFromObjectPosition(
      ds.rawComponentCascade(['--Image-objectPosition']) ?? objectPosition,
    ),
  );
}

double? parseImageLayoutLength(Object? value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  final s = value.toString().trim();
  if (s.endsWith('%')) return null;
  final n = double.tryParse(s.replaceAll('px', '').trim());
  return n;
}
