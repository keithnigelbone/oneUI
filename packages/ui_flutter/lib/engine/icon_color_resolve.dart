import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_icon_types.dart';
import 'badge_slot_context.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

String _emphasisCssSuffix(OneUiIconEmphasis emphasis) {
  return switch (emphasis) {
    OneUiIconEmphasis.high => 'high',
    OneUiIconEmphasis.medium => 'medium',
    OneUiIconEmphasis.low => 'low',
    OneUiIconEmphasis.tinted => 'tinted',
    OneUiIconEmphasis.tintedA11y => 'tintedA11y',
  };
}

String _emphasisSurfaceSuffix(OneUiIconEmphasis emphasis) {
  return switch (emphasis) {
    OneUiIconEmphasis.high => 'High',
    OneUiIconEmphasis.medium => 'Medium-Text',
    OneUiIconEmphasis.low => 'Low',
    OneUiIconEmphasis.tinted => 'Tinted',
    OneUiIconEmphasis.tintedA11y => 'TintedA11y',
  };
}

String _contentTokenKey(OneUiIconEmphasis emphasis) {
  return switch (emphasis) {
    OneUiIconEmphasis.high => 'high',
    OneUiIconEmphasis.medium => 'medium',
    OneUiIconEmphasis.low => 'low',
    OneUiIconEmphasis.tinted => 'tinted',
    OneUiIconEmphasis.tintedA11y => 'tintedA11y',
  };
}

/// Glyph colour — web `Icon.module.css` emphasis classes + surface role tokens.
Color resolveOneUiIconColor(
  BuildContext context, {
  required String appearance,
  required OneUiIconEmphasis emphasis,
}) {
  final badgeSlotTint = BadgeSlotIconColorScope.maybeOf(context);
  if (badgeSlotTint != null) return badgeSlotTint;
  final effectiveEmphasis = resolveOneUiIconEmphasis(context, emphasis);

  // Surface-step tokens first — web `[data-surface-step]` + role CSS before
  // brand `--Icon-color-*` overrides (matches Icon.module.css cascade).
  final role = OneUiSurfaceScope.tokensMaybe(context, appearance);
  if (role != null) {
    final key = _contentTokenKey(effectiveEmphasis);
    final hex = role.content[key] ?? role.content['high'];
    if (hex != null) return oneUiHexColor(hex);
  }

  final ds = OneUiScope.designSystemOf(context);
  final suffix = _emphasisCssSuffix(effectiveEmphasis);

  // Brand component overrides reference `var(--Primary-High)` etc. — resolving
  // those requires [OneUiSurfaceScope]. Without it, fall through to Theme.
  if (ds != null && OneUiSurfaceScope.maybeOf(context) != null) {
    final fromComponent = resolveColorFromComponentPropertyKeys(
      context,
      ds,
      keys: [
        '--Icon-color-$suffix',
        '--Icon-color',
      ],
      appearance: appearance,
    );
    if (fromComponent != null) return fromComponent;

    final token =
        '--${oneUiAppearanceCssLabel(appearance)}-${_emphasisSurfaceSuffix(effectiveEmphasis)}';
    final c =
        resolveButtonTokenColor(context, ds, token, appearance: appearance);
    if (c != null) return c;
  }

  return Theme.of(context).colorScheme.onSurface;
}
