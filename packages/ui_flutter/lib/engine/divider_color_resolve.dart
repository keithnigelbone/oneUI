import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_divider_types.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved stroke + centre content colours — web `--_div-color` / `--_div-content-color`.
class DividerResolvedColors {
  const DividerResolvedColors({
    required this.lineColor,
    required this.contentColor,
  });

  final Color lineColor;
  final Color contentColor;
}

FlatRoleTokens _role(BuildContext context, String appearance) {
  return OneUiSurfaceScope.tokensForAppearance(context, appearance);
}

Color _roleContent(
  FlatRoleTokens role, {
  required String key,
  required String fallbackKey,
}) {
  return oneUiHexColor(role.content[key] ?? role.content[fallbackKey]!);
}

Color? _fromComponent(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) =>
    resolveColorFromComponentPropertyKeys(
      context,
      ds,
      keys: keys,
      appearance: appearance,
    );

/// Neutral defaults remap to Primary inside nested surfaces — `Divider.module.css`.
String _effectiveStrokeAppearance(
  BuildContext context,
  String resolvedAppearance,
) {
  if (resolvedAppearance != 'neutral') return resolvedAppearance;
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface != null &&
      surface.surfaceDepth > 0 &&
      surface.parentMode != null &&
      surface.parentMode != 'default') {
    return 'primary';
  }
  return 'neutral';
}

Color _lineColorForAttention(
  FlatRoleTokens role,
  OneUiDividerAttention attention,
) {
  return switch (attention) {
    'high' => _roleContent(role, key: 'high', fallbackKey: 'high'),
    'medium' => _roleContent(role, key: 'strokeMedium', fallbackKey: 'medium'),
    _ => _roleContent(role, key: 'strokeLow', fallbackKey: 'low'),
  };
}

Color _contentColorForAttention(
  FlatRoleTokens role,
  OneUiDividerAttention attention,
) {
  return switch (attention) {
    'high' => _roleContent(role, key: 'high', fallbackKey: 'high'),
    'medium' => _roleContent(role, key: 'medium', fallbackKey: 'medium'),
    _ => _roleContent(role, key: 'low', fallbackKey: 'low'),
  };
}

DividerResolvedColors resolveDividerColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String resolvedAppearance,
  required OneUiDividerAttention attention,
}) {
  final strokeAppearance =
      _effectiveStrokeAppearance(context, resolvedAppearance);
  final role = _role(context, strokeAppearance);

  final lineFallback = _lineColorForAttention(role, attention);
  final contentFallback = _contentColorForAttention(role, attention);

  final lineColor = _fromComponent(context, ds,
          keys: [
            '--Divider-color-${attention}',
            '--Divider-color',
          ],
          appearance: strokeAppearance) ??
      lineFallback;

  final contentColor = _fromComponent(context, ds,
          keys: [
            '--Divider-contentColor-${attention}',
            '--Divider-contentColor',
          ],
          appearance: strokeAppearance) ??
      contentFallback;

  return DividerResolvedColors(
    lineColor: lineColor,
    contentColor: contentColor,
  );
}
