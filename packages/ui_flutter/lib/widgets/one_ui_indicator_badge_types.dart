import 'package:flutter/widgets.dart';

import '../engine/badge_slot_context.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_appearance_validate.dart';
import '../widgets/one_ui_slot_parent_appearance.dart';

typedef OneUiIndicatorBadgeSize = String;

const List<OneUiIndicatorBadgeSize> kOneUiIndicatorBadgeSizes = [
  'xs',
  's',
  'm',
  'l',
  'xl',
];

/// Figma API appearance roles (+ `auto`). Code also supports `brand-bg`.
const List<String> kOneUiIndicatorBadgeFigmaAppearances = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
];

/// Validates t-shirt size; unknown values fall back to `'m'`.
String oneUiResolveIndicatorBadgeSize(String size) {
  final t = size.trim().toLowerCase();
  if (kOneUiIndicatorBadgeSizes.contains(t)) return t;
  return 'm';
}

class OneUiIndicatorBadgeState {
  const OneUiIndicatorBadgeState({
    required this.size,
    required this.resolvedAppearance,
    required this.dataSize,
    required this.dataAppearance,
  });

  final OneUiIndicatorBadgeSize size;
  final String resolvedAppearance;
  final String dataSize;
  final String dataAppearance;
}

OneUiIndicatorBadgeState resolveOneUiIndicatorBadgeState({
  required BuildContext context,
  OneUiIndicatorBadgeSize? size,
  String appearance = 'auto',
}) {
  final slot = BadgeSlotSizeScope.maybeOf(context);
  final resolvedSize = oneUiResolveIndicatorBadgeSize(
    size ?? slot?.indicatorBadgeSize ?? 'm',
  );

  final surface = OneUiSurfaceScope.maybeOf(context);
  final slotParent = OneUiSlotParentAppearanceScope.maybeOf(context);
  final surfaceAppearance = surface != null && surface.surfaceDepth > 0
      ? surface.parentAppearance
      : null;

  final resolvedAppearance = appearance != 'auto'
      ? oneUiResolveExplicitAppearanceRole(
          context,
          appearance,
          componentName: 'OneUiIndicatorBadge',
        )
      : (surfaceAppearance ?? slotParent ?? 'primary');

  return OneUiIndicatorBadgeState(
    size: resolvedSize,
    resolvedAppearance: resolvedAppearance,
    dataSize: resolvedSize,
    dataAppearance: resolvedAppearance,
  );
}
