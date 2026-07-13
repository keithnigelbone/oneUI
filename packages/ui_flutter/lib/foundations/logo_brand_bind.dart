import 'package:flutter/widgets.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/logo_color_resolve.dart';
import '../engine/logo_material_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';

/// Subscribes to [OneUiScope], [OneUiBrandLoadState], and [OneUiSurfaceScope] so Logo
/// trees repaint on brand / surface / density changes.
void bindLogoBrandScope(BuildContext context) {
  OneUiScope.of(context);
  OneUiBrandLoadState.maybeOf(context);
  OneUiSurfaceScope.maybeOf(context);
}

/// Cache-busting key — must change when any brand-dependent input to Logo painting changes.
String logoBrandScopeKey(
  BuildContext context, {
  String? svgContent,
  String? material,
}) {
  final scope = OneUiScope.of(context);
  final load = OneUiBrandLoadState.maybeOf(context);
  final surface = OneUiSurfaceScope.maybeOf(context);
  final snap = load?.snapshot;
  final ds = scope.designSystem;
  final logoColor = resolveOneUiLogoColor(context);

  return [
    scope.platformId,
    scope.density,
    snap?.brandHash ?? 'unbranded',
    ds?.activeDimensionKey ?? '',
    ds?.componentCustomProperties.length ?? 0,
    load?.logoSvg?.hashCode ?? 0,
    svgContent?.hashCode ?? 0,
    load?.brandName ?? '',
    surface?.parentStep ?? 2500,
    surface?.parentMode ?? 'default',
    surface?.parentAppearance ?? 'primary',
    logoColor.toARGB32(),
    logoMaterialColorFingerprint(context, material),
    load?.loading == true ? 'loading' : 'ready',
  ].join('|');
}
