import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_badge_types.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved fill / label / border for [OneUiBadge].
class BadgeResolvedColors {
  const BadgeResolvedColors({
    required this.background,
    required this.foreground,
    this.borderColor,
    this.borderWidth,
    required this.slotIconColor,
  });

  final Color background;
  final Color foreground;
  final Color? borderColor;
  final double? borderWidth;

  /// Icon / avatar glyph tint inside start/end slots.
  final Color slotIconColor;
}

String? _firstRoleHex(Map<String, String> map, List<String> keys) {
  for (final key in keys) {
    final hex = map[key];
    if (hex != null && hex.isNotEmpty) return hex;
  }
  return null;
}

BadgeResolvedColors resolveBadgeColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiBadgeVariant variant,
  required String appearance,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);

  /// Brand `--Badge-*` overrides win for every appearance when present in the
  /// flat map (manual overrides / theme family). Role fallbacks use [appearance].
  Color? fromComponent(List<String> keys) =>
      resolveColorFromComponentPropertyKeys(
        context,
        ds,
        keys: keys,
        appearance: appearance,
      );

  switch (variant) {
    case 'subtle':
      return BadgeResolvedColors(
        background: fromComponent([
              '--Badge-backgroundColor-subtle',
            ]) ??
            oneUiHexColor(role.surfaces[kSurfaceSubtle]!),
        foreground: fromComponent([
              '--Badge-textColor-subtle',
            ]) ??
            oneUiHexColor(role.content['tintedA11y']!),
        slotIconColor: oneUiHexColor(role.content['tintedA11y']!),
      );
    case 'ghost':
      final borderW = ds.resolveComponentLengthPxCascade(
        ['--Badge-borderWidth-ghost', '--Stroke-M'],
        platformId: OneUiScope.of(context).platformId,
        density: OneUiScope.of(context).density,
        platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
        nativeTypography: OneUiScope.nativeTypographyOf(context),
      );
      final highContrast = MediaQuery.highContrastOf(context);
      final ghostStrokeHex = _firstRoleHex(
        role.content,
        highContrast
            ? ['strokeMedium', 'strokeLow', 'medium', 'low']
            : ['strokeLow', 'strokeMedium', 'low', 'medium'],
      );
      return BadgeResolvedColors(
        background: fromComponent(['--Badge-backgroundColor-ghost']) ??
            const Color(0x00000000),
        foreground: fromComponent(['--Badge-textColor-ghost']) ??
            oneUiHexColor(role.content['tintedA11y']!),
        borderColor: fromComponent(['--Badge-borderColor-ghost']) ??
            (ghostStrokeHex != null ? oneUiHexColor(ghostStrokeHex) : null),
        borderWidth: borderW,
        slotIconColor: oneUiHexColor(role.content['tintedA11y']!),
      );
    case 'bold':
    default:
      final materialText = fromComponent(['--Badge-roleMaterialText']);
      final boldText = fromComponent(['--Badge-textColor-bold']);
      final roleBoldText = oneUiHexColor(
        role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!,
      );
      return BadgeResolvedColors(
        background: fromComponent(['--Badge-backgroundColor-bold']) ??
            oneUiHexColor(role.surfaces[kSurfaceBold]!),
        foreground: materialText ?? boldText ?? roleBoldText,
        slotIconColor: materialText ??
            boldText ??
            oneUiHexColor(
              role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!,
            ),
      );
  }
}

/// Legacy helper — prefer [resolveCounterBadgeColors] / [resolveIndicatorBadgeColors].
@Deprecated('Use resolveCounterBadgeColors or resolveIndicatorBadgeColors')
BadgeResolvedColors resolveCounterIndicatorBadgeColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
}) {
  return resolveBadgeColors(
    context,
    ds,
    variant: 'bold',
    appearance: appearance,
  );
}
