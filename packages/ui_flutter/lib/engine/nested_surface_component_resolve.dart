import 'package:flutter/material.dart';

import '../theme/surface_scope.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';

/// True when the widget sits inside a nested [OneUiSurface] (`surfaceDepth > 0`).
///
/// Web equivalent: any selector under `[data-surface="…"]` where brand CSS remaps
/// role tokens; root-only literals in Convex must not pin colours here.
bool oneUiInsideNestedSurface(BuildContext context) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  return surface != null && surface.surfaceDepth > 0;
}

/// Convex `componentCustomProperties` sometimes store a fixed `#RRGGBB` at the
/// brand root. Web ignores those inside `[data-surface]` blocks; Flutter must skip
/// them and fall through to scoped [OneUiSurfaceScope] role tokens or `var(--Role-*)`.
bool oneUiIsRootPinnedLiteral(String raw) {
  final t = raw.trim();
  if (t.isEmpty || t.toLowerCase() == 'transparent') return false;
  if (t.startsWith('#')) return true;
  return NativeDesignSystemPayload.peelLeadingVar(t) == null &&
      !t.contains('var(--');
}

/// Inside nested surfaces, prefer `--Component-role*` keys before variant fill
/// literals so remapped `var(--Primary-*)` wins over pinned hex (Chip/Button parity).
List<String> oneUiComponentColorKeyOrder(
  BuildContext context,
  List<String> keys,
) {
  if (!oneUiInsideNestedSurface(context)) return keys;
  final roleKeys = <String>[];
  final otherKeys = <String>[];
  for (final k in keys) {
    if (k.contains('-role')) {
      roleKeys.add(k);
    } else {
      otherKeys.add(k);
    }
  }
  return [...roleKeys, ...otherKeys];
}

/// Shared `fromComponent` for all interactive colour resolvers.
Color? resolveColorFromComponentPropertyKeys(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) {
  final ordered = oneUiComponentColorKeyOrder(context, keys);
  final nested = oneUiInsideNestedSurface(context);
  for (final k in ordered) {
    final raw = ds.rawComponentCascade([k]);
    if (raw == null) continue;
    if (nested && oneUiIsRootPinnedLiteral(raw)) continue;
    final c = resolveButtonTokenColor(
      context,
      ds,
      raw,
      appearance: appearance,
    );
    if (c != null) return c;
  }
  return null;
}
