import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved ring colours — web `--_indicator-color` / `--_track-color` / `--_text-color`.
class CpiResolvedColors {
  const CpiResolvedColors({
    required this.indicator,
    required this.track,
    required this.text,
  });

  final Color indicator;
  final Color track;
  final Color text;
}

/// Role tokens for CPI — mirrors web `CircularProgressIndicator.module.css`:
/// `var(--{Role}-Bold, var(--Surface-Bold))` where `--Surface-Bold` is the
/// neutral legacy alias at `:root`, not primary.
FlatRoleTokens? _cpiRoleTokens(BuildContext context, String appearance) {
  return OneUiSurfaceScope.tokensForAppearance(context, appearance);
}

Color? _cpiColorFromRole(FlatRoleTokens role, String suffix) {
  switch (suffix) {
    case 'Bold':
      return oneUiHexColor(role.surfaces[kSurfaceBold]!);
    case 'Subtle':
      return oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
    case 'TintedA11y':
      return oneUiHexColor(role.content['tintedA11y']!);
    default:
      return null;
  }
}

CpiResolvedColors resolveCpiColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
}) {
  final role = _cpiRoleTokens(context, appearance);
  if (role == null) {
    final scheme = Theme.of(context).colorScheme;
    return CpiResolvedColors(
      indicator: scheme.primary,
      track: scheme.primaryContainer,
      text: scheme.onSurface,
    );
  }

  Color? fromComponent(List<String> keys) =>
      resolveColorFromComponentPropertyKeys(
        context,
        ds,
        keys: keys,
        appearance: appearance,
      );

  return CpiResolvedColors(
    indicator: fromComponent(['--CircularProgressIndicator-indicatorColor']) ??
        _cpiColorFromRole(role, 'Bold')!,
    track: fromComponent(['--CircularProgressIndicator-trackColor']) ??
        _cpiColorFromRole(role, 'Subtle')!,
    text: fromComponent(['--CircularProgressIndicator-textColor']) ??
        _cpiColorFromRole(role, 'TintedA11y')!,
  );
}
