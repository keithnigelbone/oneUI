import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_bottom_navigation_types.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved item colours — web `--_bn-*` intermediates.
class BottomNavigationResolvedColors {
  const BottomNavigationResolvedColors({
    required this.textHigh,
    required this.textLow,
    required this.accent,
    required this.hover,
    required this.pressed,
    required this.dividerColor,
    required this.dividerHeight,
  });

  final Color textHigh;
  final Color textLow;
  final Color accent;
  final Color hover;
  final Color pressed;
  final Color dividerColor;
  final double dividerHeight;
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

Color _roleState(FlatRoleTokens role, String key) {
  return oneUiHexColor(role.states[key] ?? role.states['pressed']!);
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

BottomNavigationResolvedColors resolveBottomNavigationColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
}) {
  final scope = OneUiScope.of(context);
  final role = _role(context, appearance);

  final textHigh = _fromComponent(context, ds,
          keys: [
            '--BottomNavItem-color-active',
            '--BottomNavItem-labelColor-active',
          ],
          appearance: appearance) ??
      _roleContent(role, key: 'high', fallbackKey: 'high');

  final textLow = _fromComponent(context, ds,
          keys: [
            '--BottomNavItem-color',
            '--BottomNavItem-labelColor',
            '--BottomNavItem-iconColor',
          ],
          appearance: appearance) ??
      _roleContent(role, key: 'low', fallbackKey: 'low');

  final accent = _fromComponent(context, ds,
          keys: [
            '--BottomNavItem-iconColor-active',
            '--BottomNavItem-accentColor',
          ],
          appearance: appearance) ??
      _roleContent(role, key: 'tintedA11y', fallbackKey: 'high');

  final hover = _fromComponent(context, ds,
          keys: [
            '--BottomNavItem-backgroundColor-hover',
          ],
          appearance: appearance) ??
      _roleState(role, 'hover');

  final pressed = _fromComponent(context, ds,
          keys: [
            '--BottomNavItem-backgroundColor-pressed',
          ],
          appearance: appearance) ??
      _roleState(role, 'pressed');

  // Web uses `<Divider size="s" />` — Neutral-Stroke-Low on page, Primary-Stroke-Low
  // inside non-default `[data-surface]` blocks (Divider.module.css).
  final surface = OneUiSurfaceScope.maybeOf(context);
  final dividerStrokeRole = surface != null &&
          surface.surfaceDepth > 0 &&
          surface.parentMode != null &&
          surface.parentMode != 'default'
      ? 'primary'
      : 'neutral';
  final dividerStrokeRoleTokens = _role(context, dividerStrokeRole);

  final dividerColor = _fromComponent(context, ds,
          keys: [
            '--BottomNavigation-dividerColor',
            '--Divider-color',
          ],
          appearance: appearance) ??
      _roleContent(
        dividerStrokeRoleTokens,
        key: 'strokeLow',
        fallbackKey: 'low',
      );

  final dividerHeightRaw = ds.resolveComponentLengthPxCascade(
        [
          '--BottomNavigation-dividerWidth',
          '--BottomNavigation-dividerHeight',
          '--Stroke-S',
        ],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: OneUiScope.nativeTypographyOf(context),
      ) ??
      0.5;

  // Flutter cannot reliably paint sub-1px geometry; match strokes foundations preview.
  final dividerHeight = dividerHeightRaw <= 0
      ? 0.0
      : (dividerHeightRaw < 1 ? 1.0 : dividerHeightRaw);

  return BottomNavigationResolvedColors(
    textHigh: textHigh,
    textLow: textLow,
    accent: accent,
    hover: hover,
    pressed: pressed,
    dividerColor: dividerColor,
    dividerHeight: dividerHeight,
  );
}

Color bottomNavLabelColor({
  required bool isActive,
  required BottomNavigationResolvedColors colors,
}) {
  return isActive ? colors.textHigh : colors.textLow;
}

Color bottomNavIconColor({
  required bool isActive,
  required BottomNavigationResolvedColors colors,
}) {
  return isActive ? colors.accent : colors.textLow;
}
