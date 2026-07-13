import 'package:flutter/widgets.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/bottom_navigation_color_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';

/// Subscribes to brand / surface / token scopes so BottomNavigation repaints on switch.
void bindBottomNavigationBrandScope(BuildContext context) {
  OneUiScope.of(context);
  OneUiBrandLoadState.maybeOf(context);
  OneUiSurfaceScope.maybeOf(context);
}

/// Cache-busting key when brand, surface, platform, density, or tokens change.
String bottomNavigationBrandScopeKey(
  BuildContext context, {
  String appearance = 'primary',
}) {
  final scope = OneUiScope.of(context);
  final load = OneUiBrandLoadState.maybeOf(context);
  final surface = OneUiSurfaceScope.maybeOf(context);
  final snap = load?.snapshot;
  final ds = scope.designSystem;

  var colorFingerprint = 0;
  if (ds != null) {
    final colors = resolveBottomNavigationColors(
      context,
      ds,
      appearance: appearance,
    );
    colorFingerprint = Object.hash(
      colors.textHigh.toARGB32(),
      colors.textLow.toARGB32(),
      colors.accent.toARGB32(),
      colors.dividerColor.toARGB32(),
    );
  }

  return [
    scope.platformId,
    scope.density,
    snap?.brandHash ?? 'unbranded',
    ds?.activeDimensionKey ?? '',
    ds?.componentCustomProperties.length ?? 0,
    scope.nativeTypography?.fontFamilyPrimary ?? '',
    surface?.parentStep ?? 2500,
    surface?.parentMode ?? 'default',
    surface?.parentAppearance ?? 'primary',
    appearance,
    colorFingerprint,
    load?.loading == true ? 'loading' : 'ready',
  ].join('|');
}

/// Wraps story/showcase nav so Flutter rebuilds paint on brand switch.
///
/// [instanceKey] must be unique among sibling frames on the same page — otherwise
/// Flutter reuses [OneUiBottomNavigation] state across unrelated demos.
Widget bottomNavigationBrandKeyed(
  BuildContext context, {
  required Widget child,
  required String instanceKey,
  String appearance = 'primary',
}) {
  bindBottomNavigationBrandScope(context);
  final scopeKey =
      bottomNavigationBrandScopeKey(context, appearance: appearance);
  return KeyedSubtree(
    key: ValueKey('$scopeKey|$instanceKey'),
    child: child,
  );
}
