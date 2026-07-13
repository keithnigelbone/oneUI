import 'package:flutter/widgets.dart';

import '../brand/one_ui_brand_scope.dart';
import '../theme/one_ui_scope.dart';

void bindCheckboxFieldBrandScope(BuildContext context) {
  OneUiScope.of(context);
  OneUiBrandLoadState.maybeOf(context);
}

String checkboxFieldBrandScopeKey(BuildContext context) {
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
