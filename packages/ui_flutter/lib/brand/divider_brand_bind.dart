import 'package:flutter/widgets.dart';

import '../engine/divider_color_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'one_ui_brand_scope.dart';

/// Subscribes to brand / surface / token scopes so Divider repaints on switch.
void bindDividerBrandScope(BuildContext context) {
  OneUiScope.of(context);
  OneUiBrandLoadState.maybeOf(context);
  OneUiSurfaceScope.maybeOf(context);
  OneUiScope.nativeTypographyOf(context);
}

/// Cache-busting key when brand, surface, platform, density, or tokens change.
String dividerBrandScopeKey(
  BuildContext context, {
  String appearance = 'auto',
}) {
  final scope = OneUiScope.of(context);
  final load = OneUiBrandLoadState.maybeOf(context);
  final surface = OneUiSurfaceScope.maybeOf(context);
  final snap = load?.snapshot;
  final ds = scope.designSystem;

  var colorFingerprint = 0;
  if (ds != null) {
    final resolvedAppearance = appearance == 'auto' ? 'neutral' : appearance;
    final colors = resolveDividerColors(
      context,
      ds,
      resolvedAppearance: resolvedAppearance,
      attention: 'low',
    );
    colorFingerprint = Object.hash(
      colors.lineColor.toARGB32(),
      colors.contentColor.toARGB32(),
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

/// Wraps story/showcase trees so Flutter rebuilds paint on brand switch.
///
/// [instanceKey] must be unique among sibling frames on the same page.
Widget dividerBrandKeyed(
  BuildContext context, {
  required Widget child,
  required String instanceKey,
  String appearance = 'auto',
}) {
  bindDividerBrandScope(context);
  final scopeKey = dividerBrandScopeKey(context, appearance: appearance);
  return KeyedSubtree(
    key: ValueKey('$scopeKey|$instanceKey'),
    child: child,
  );
}
