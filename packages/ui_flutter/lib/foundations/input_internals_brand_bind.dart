import 'package:flutter/widgets.dart';

import '../brand/one_ui_brand_scope.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';

/// Registers [OneUiScope], surfaces, and brand load state so internals repaint when
/// the toolbar brand / theme / density / platform changes (same as [InputDefaultStoryPage]).
void bindInputInternalsBrandScope(BuildContext context) {
  OneUiScope.of(context);
  OneUiSurfaceScope.maybeOf(context);
  OneUiBrandLoadState.maybeOf(context);
}

/// Stable key segment for preview widgets — forces fresh resolve after Convex snapshot swap.
String inputInternalsBrandScopeKey(BuildContext context) {
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
