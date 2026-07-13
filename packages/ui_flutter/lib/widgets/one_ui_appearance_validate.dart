import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';

/// Canonical multi-accent roles shared by Badge, CounterBadge, and IndicatorBadge.
final Set<String> kOneUiBadgeFamilyCanonicalAppearances = {
  ...appearanceRoles,
};

/// Validates an explicit [appearance] prop (not `auto`).
///
/// RN `useSurfaceTokens(appearance)` resolves unknown roles via
/// `resolvedRoles[appearance] ?? primary ?? neutral`. Flutter normalises
/// invalid explicit values to [fallback] and logs in debug builds.
String oneUiResolveExplicitAppearanceRole(
  BuildContext context,
  String appearance, {
  required String componentName,
  String fallback = 'neutral',
}) {
  final key = normalizeAppearanceRoleKey(appearance);
  if (key.isEmpty || key == 'auto') return key;
  if (OneUiSurfaceScope.isAppearanceConfigured(context, key)) {
    return key;
  }
  // Isolated widget tests without [OneUiSurfaceBootstrap] have no brand theme;
  // allow syntactically valid canonical roles so explicit props still resolve.
  if (OneUiSurfaceScope.maybeOf(context) == null &&
      kOneUiBadgeFamilyCanonicalAppearances.contains(key)) {
    return key;
  }
  assert(() {
    debugPrint(
      '$componentName: unknown appearance "$appearance"; falling back to $fallback.',
    );
    return true;
  }());
  return fallback;
}

/// Paint-time guard when [appearance] is not present on the active brand
/// [ThemeConfig] (web/RN cascade → neutral, never Material `colorScheme`).
String oneUiResolvePaintAppearanceOnBrand(
  BuildContext context,
  String appearance, {
  required String componentName,
}) {
  final key = normalizeAppearanceRoleKey(appearance);
  if (OneUiSurfaceScope.isAppearanceConfigured(context, key)) {
    return key;
  }
  assert(() {
    debugPrint(
      '$componentName: appearance "$appearance" is not configured on '
      'this brand; falling back to neutral.',
    );
    return true;
  }());
  return 'neutral';
}
