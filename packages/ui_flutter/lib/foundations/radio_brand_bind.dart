import 'package:flutter/widgets.dart';

import '../brand/one_ui_brand_scope.dart';
import '../theme/one_ui_scope.dart';

/// Subscribes to [OneUiScope] + [OneUiBrandLoadState] so Radio trees repaint on brand switch.
void bindRadioBrandScope(BuildContext context) {
  OneUiScope.of(context);
  OneUiBrandLoadState.maybeOf(context);
}

/// Stable key fragment when toolbar brand / platform / density / tokens change.
String radioBrandScopeKey(BuildContext context) {
  final scope = OneUiScope.of(context);
  final load = OneUiBrandLoadState.maybeOf(context);
  final snap = load?.snapshot;
  return [
    scope.platformId,
    scope.density,
    snap?.brandHash ?? 'unbranded',
    scope.designSystem?.activeDimensionKey ?? '',
    scope.designSystem?.componentCustomProperties.length ?? 0,
    scope.nativeTypography?.fontFamilyPrimary ?? '',
    load?.loading == true ? 'loading' : 'ready',
  ].join('|');
}
