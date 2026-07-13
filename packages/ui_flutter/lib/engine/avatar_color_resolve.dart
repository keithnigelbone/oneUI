import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_avatar_types.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved paint for avatar shell — `Avatar.module.css` + RN `paintFor`.
class AvatarResolvedColors {
  const AvatarResolvedColors({
    required this.background,
    required this.iconColor,
    required this.textColor,
  });

  final Color background;
  final Color iconColor;
  final Color textColor;
}

AvatarResolvedColors resolveAvatarColors(
  BuildContext context, {
  required String appearance,
  required OneUiAvatarAttention attention,
  required bool showingImage,
}) {
  if (showingImage) {
    return const AvatarResolvedColors(
      background: Color(0x00000000),
      iconColor: Color(0xFF000000),
      textColor: Color(0xFF000000),
    );
  }

  // Without [OneUiSurfaceScope], skip ds `--Avatar-*` overrides and use the
  // neutral hex floor only — mounted scope is the source of truth for paint.
  if (OneUiSurfaceScope.maybeOf(context) == null) {
    assert(() {
      debugPrint(
        'OneUiAvatar: OneUiSurfaceScope missing — wrap MaterialApp with '
        'OneUiSurfaceBootstrap / OneUiBrandProvider.',
      );
      return true;
    }());
    return _neutralFallbackColors(attention);
  }

  // RN `useSurfaceTokens` parity — on-demand role recompute, not strict cache hit.
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);

  final ds = OneUiScope.designSystemOf(context);
  if (ds != null) {
    final bg = _fromComponent(ds, context, appearance, attention,
        isText: false, forBg: true);
    final icon = _fromComponent(ds, context, appearance, attention,
        isText: false, forBg: false);
    final text = _fromComponent(ds, context, appearance, attention,
        isText: true, forBg: false);
    if (bg != null && icon != null && text != null) {
      return AvatarResolvedColors(
          background: bg, iconColor: icon, textColor: text);
    }
  }

  return AvatarResolvedColors(
    background: _bgFromRole(attention, role),
    iconColor: _iconFromRole(attention, role),
    textColor: _textFromRole(attention, role),
  );
}

/// RN `resolveAvatarIconSlotColor` — icon glyphs paint with the text on-colour
/// token so initials and icons match on the same bold/subtle fill.
Color resolveAvatarIconSlotColor(AvatarResolvedColors colors) => colors.textColor;

/// Hardcoded hex floor when [OneUiSurfaceScope] is absent — never
/// [ColorScheme.primary] / [ColorScheme.onPrimary].
///
/// Call site guarantees scope is null; role-token resolution is unreachable here.
AvatarResolvedColors _neutralFallbackColors(OneUiAvatarAttention attention) {
  return AvatarResolvedColors(
    background: attention == OneUiAvatarAttention.low
        ? const Color(0x00000000)
        : oneUiHexColor(_kSurfaceFallbackHex),
    iconColor: oneUiHexColor(
      attention == OneUiAvatarAttention.high
          ? _kOnBoldFallbackHex
          : _kOnContentFallbackHex,
    ),
    textColor: oneUiHexColor(
      attention == OneUiAvatarAttention.high
          ? _kOnBoldFallbackHex
          : _kOnContentFallbackHex,
    ),
  );
}

/// Safe lookup across the role's content/surface maps. Walks `keys` in order,
/// returns the first non-null/non-empty hex, and falls back to `terminal` if
/// every candidate is missing. Replaces the pre-fix null-bang `!` operators
/// that crashed the Avatar surface for brands shipping with incomplete role
/// payloads (see docs/avatar-audit-report.md — AVT-VIS-001 elevated).
String _pickHex(
    Map<String, String> tokens, List<String> keys, String terminal) {
  for (final k in keys) {
    final v = tokens[k];
    if (v != null && v.isNotEmpty) return v;
  }
  return terminal;
}

// Terminal fallbacks mirror the surface engine's `'#808080'` palette-miss
// convention. `_kOnBoldFallback` is white (high contrast against the bold
// fill); `_kOnContentFallback` is black (high contrast against a light page).
const String _kSurfaceFallbackHex = '#808080';
const String _kOnBoldFallbackHex = '#ffffff';
const String _kOnContentFallbackHex = '#000000';

Color _bgFromRole(OneUiAvatarAttention attention, FlatRoleTokens role) {
  return switch (attention) {
    OneUiAvatarAttention.high => oneUiHexColor(
        _pickHex(role.surfaces, const [kSurfaceBold], _kSurfaceFallbackHex)),
    OneUiAvatarAttention.medium => oneUiHexColor(
        _pickHex(role.surfaces, const [kSurfaceSubtle], _kSurfaceFallbackHex)),
    OneUiAvatarAttention.low => const Color(0x00000000),
  };
}

Color _iconFromRole(OneUiAvatarAttention attention, FlatRoleTokens role) {
  return switch (attention) {
    OneUiAvatarAttention.high => oneUiHexColor(_pickHex(
        role.onBoldContent,
        const ['tinted', 'tintedA11y', 'high'],
        _kOnBoldFallbackHex,
      )),
    OneUiAvatarAttention.medium => oneUiHexColor(_pickHex(
        role.content,
        const ['tinted', 'tintedA11y', 'high'],
        _kOnContentFallbackHex,
      )),
    OneUiAvatarAttention.low => oneUiHexColor(_pickHex(
        role.content,
        const ['tinted', 'tintedA11y', 'high'],
        _kOnContentFallbackHex,
      )),
  };
}

Color _textFromRole(OneUiAvatarAttention attention, FlatRoleTokens role) {
  return switch (attention) {
    OneUiAvatarAttention.high => oneUiHexColor(_pickHex(
        role.onBoldContent,
        const ['tintedA11y', 'high', 'tinted'],
        _kOnBoldFallbackHex,
      )),
    OneUiAvatarAttention.medium => oneUiHexColor(_pickHex(
        role.content,
        const ['tintedA11y', 'high', 'tinted'],
        _kOnContentFallbackHex,
      )),
    OneUiAvatarAttention.low => oneUiHexColor(_pickHex(
        role.content,
        const ['tintedA11y', 'high', 'tinted'],
        _kOnContentFallbackHex,
      )),
  };
}

Color? _fromComponent(
  NativeDesignSystemPayload ds,
  BuildContext context,
  String appearance,
  OneUiAvatarAttention attention, {
  required bool isText,
  required bool forBg,
}) {
  final att = attention.name;
  if (forBg) {
    if (attention == OneUiAvatarAttention.low) return const Color(0x00000000);
    return resolveColorFromComponentPropertyKeys(
      context,
      ds,
      keys: [
        '--Avatar-backgroundColor-$att',
        '--Avatar-backgroundColor',
      ],
      appearance: appearance,
    );
  }

  final keys = isText
      ? ['--Avatar-textColor-$att', '--Avatar-textColor']
      : ['--Avatar-iconColor-$att', '--Avatar-iconColor'];
  return resolveColorFromComponentPropertyKeys(
    context,
    ds,
    keys: keys,
    appearance: appearance,
  );
}

double resolveAvatarDisabledOpacity(BuildContext context) {
  final ds = OneUiScope.designSystemOf(context);
  if (ds == null) return 0.5;
  final scope = OneUiScope.of(context);
  for (final key in [
    '--Avatar-disabledOpacity',
    '--Disabled-Opacity',
  ]) {
    final raw =
        ds.rawComponentCascade([key]) ?? ds.componentCustomProperties[key];
    if (raw == null) continue;
    final resolved = ds.resolveCSSValue(
      raw,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
    final v = double.tryParse(resolved?.trim() ?? '');
    if (v != null) return v.clamp(0.0, 1.0);
  }
  return 0.5;
}
