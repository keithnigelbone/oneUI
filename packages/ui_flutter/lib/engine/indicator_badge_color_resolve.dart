import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_appearance_validate.dart';
import 'color_math.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

class IndicatorBadgeResolvedColors {
  const IndicatorBadgeResolvedColors({
    required this.background,
    this.borderColor,
    this.borderWidth,
  });

  final Color background;
  final Color? borderColor;
  final double? borderWidth;
}

/// WCAG 1.4.11 non-text contrast — bold dot vs parent surface fill.
const double kIndicatorBadgeMinContrast = 3.0;

String? _firstRoleHex(Map<String, String> map, List<String> keys) {
  for (final key in keys) {
    final hex = map[key];
    if (hex != null && hex.isNotEmpty) return hex;
  }
  return null;
}

/// Indicator dot uses role bold fill — `IndicatorBadge.module.css` `--_idb-bold`.
///
/// When bold fill falls below 3:1 against the parent surface (e.g. warning bold
/// on warning-subtle), or when the platform requests high contrast, applies a
/// role stroke so the dot boundary stays perceivable.
const String _kIndicatorBadgeSurfaceFallbackHex = '#808080';

IndicatorBadgeResolvedColors resolveIndicatorBadgeColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
}) {
  final paintAppearance = oneUiResolvePaintAppearanceOnBrand(
    context,
    appearance,
    componentName: 'OneUiIndicatorBadge',
  );
  final role = OneUiSurfaceScope.tokensForAppearance(context, paintAppearance);
  final scope = OneUiScope.of(context);

  Color? fromComponent(List<String> keys) =>
      resolveColorFromComponentPropertyKeys(
        context,
        ds,
        keys: keys,
        appearance: paintAppearance,
      );

  // Web parity: IndicatorBadge.module.css reads `--IndicatorBadge-backgroundColor`
  // before `--_idb-bold` for every appearance — not gated on primary.
  final bgHex = _firstRoleHex(role.surfaces, [
    kSurfaceBold,
    kSurfaceModerate,
    kSurfaceDefault,
  ]);
  final background = fromComponent(['--IndicatorBadge-backgroundColor']) ??
      (bgHex != null
          ? oneUiHexColor(bgHex)
          : oneUiHexColor(
              OneUiSurfaceScope.tokensForAppearance(context, 'neutral')
                      .surfaces[kSurfaceBold] ??
                  _kIndicatorBadgeSurfaceFallbackHex,
            ));

  final dotHex = rgbToHex(
    (background.toARGB32() >> 16) & 0xFF,
    (background.toARGB32() >> 8) & 0xFF,
    background.toARGB32() & 0xFF,
  );

  final surfaceCtx = OneUiSurfaceScope.maybeOf(context);
  var parentMode = kSurfaceDefault;
  if (surfaceCtx != null && surfaceCtx.surfaceDepth > 0) {
    parentMode = surfaceCtx.parentMode ?? kSurfaceDefault;
  }
  final parentSurfaceHex =
      _firstRoleHex(role.surfaces, [parentMode, kSurfaceDefault]) ?? bgHex;
  final String parentHex;
  if (parentSurfaceHex != null) {
    parentHex = normalizePaletteHexForEngine(parentSurfaceHex);
  } else {
    final surface = Theme.of(context).colorScheme.surface;
    parentHex = rgbToHex(
      (surface.toARGB32() >> 16) & 0xFF,
      (surface.toARGB32() >> 8) & 0xFF,
      surface.toARGB32() & 0xFF,
    );
  }
  final contrastRatio = getContrastRatioRgb(
    hexToRgbTuple(dotHex),
    hexToRgbTuple(parentHex),
  );

  final highContrast = MediaQuery.highContrastOf(context);
  final needsStroke =
      highContrast || contrastRatio < kIndicatorBadgeMinContrast;

  Color? borderColor;
  double? borderWidth;
  if (needsStroke) {
    final strokeHex = role.content['strokeMedium'] ??
        role.content['strokeLow'] ??
        role.content['medium'] ??
        role.content['low'];
    borderColor = fromComponent(['--IndicatorBadge-borderColor']) ??
        (strokeHex != null ? oneUiHexColor(strokeHex) : null);
    borderWidth = ds.resolveComponentLengthPxCascade(
      ['--IndicatorBadge-borderWidth', '--Stroke-M'],
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
  }

  return IndicatorBadgeResolvedColors(
    background: background,
    borderColor: borderColor,
    borderWidth: borderWidth,
  );
}
