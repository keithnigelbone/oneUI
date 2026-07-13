import 'package:flutter/material.dart';

import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_text_types.dart';
import 'surface_engine.dart';

/// Content colour — mirrors web `--_text-*` / RN `role.content[attention]`.
Color resolveOneUiTextColor(
  BuildContext context, {
  required String appearance,
  required OneUiTextAttention attention,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);
  return oneUiHexColor(_contentToken(role, attention));
}

String _contentToken(FlatRoleTokens role, OneUiTextAttention attention) {
  return switch (attention) {
    OneUiTextAttention.high => role.content['high']!,
    OneUiTextAttention.medium =>
      role.content['medium'] ?? role.content['high']!,
    OneUiTextAttention.low => role.content['low'] ?? role.content['medium']!,
    OneUiTextAttention.tintedA11y =>
      role.content['tintedA11y'] ?? role.content['high']!,
    OneUiTextAttention.none => role.content['high']!,
  };
}
