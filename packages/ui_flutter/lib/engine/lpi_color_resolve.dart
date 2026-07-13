import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_linear_progress_indicator_types.dart';
import 'nested_surface_component_resolve.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

/// Resolved bar colours — web `--_indicator-color` / `--_track-color`.
class LpiResolvedColors {
  const LpiResolvedColors({
    required this.indicator,
    required this.track,
  });

  final Color indicator;
  final Color track;
}

FlatRoleTokens? _lpiRoleTokens(BuildContext context, String appearance) {
  return OneUiSurfaceScope.tokensForAppearance(context, appearance);
}

Color? _lpiColorFromRole(FlatRoleTokens role, String suffix) {
  switch (suffix) {
    case 'Bold':
      return oneUiHexColor(role.surfaces[kSurfaceBold]!);
    case 'Subtle':
      return oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
    default:
      return null;
  }
}

bool _lpiUseRoleTrackRail(BuildContext context) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  final mode = surface?.parentMode;
  return mode != null && kLpiTintedSurfaceModes.contains(mode);
}

LpiResolvedColors resolveLpiColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
}) {
  final role = _lpiRoleTokens(context, appearance);
  if (role == null) {
    final scheme = Theme.of(context).colorScheme;
    return LpiResolvedColors(
      indicator: scheme.primary,
      track: scheme.primaryContainer,
    );
  }

  Color? fromComponent(List<String> keys) =>
      resolveColorFromComponentPropertyKeys(
        context,
        ds,
        keys: keys,
        appearance: appearance,
      );

  final indicator = fromComponent(['--LinearProgressIndicator-indicatorColor']) ??
      _lpiColorFromRole(role, 'Bold')!;

  final neutralRole = _lpiRoleTokens(context, 'neutral');
  final trackRoleSubtle = _lpiColorFromRole(role, 'Subtle');
  final neutralSubtle = neutralRole != null
      ? _lpiColorFromRole(neutralRole, 'Subtle')
      : trackRoleSubtle;

  final trackRail = _lpiUseRoleTrackRail(context)
      ? (trackRoleSubtle ?? neutralSubtle)
      : neutralSubtle;

  final track = fromComponent(['--LinearProgressIndicator-trackColor']) ??
      trackRail ??
      trackRoleSubtle!;

  return LpiResolvedColors(
    indicator: indicator,
    track: track,
  );
}
