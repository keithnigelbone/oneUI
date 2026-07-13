import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../foundations/surface_palettes.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_icon_contained_types.dart';
import 'button_color_resolve.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Fill + glyph colours — `IconContained.module.css` `--_ic-*` cascade.
class IconContainedResolvedColors {
  const IconContainedResolvedColors({
    required this.background,
    required this.foreground,
  });

  final Color background;
  final Color foreground;
}

String? _firstRoleHex(Map<String, String> map, List<String> keys) {
  for (final key in keys) {
    final hex = map[key];
    if (hex != null && hex.isNotEmpty) return hex;
  }
  return null;
}

Color _resolveIconContainedMediumForeground(
  BuildContext context,
  FlatRoleTokens role,
) {
  final tinted = role.content['tinted'];
  if (tinted != null) return oneUiHexColor(tinted);

  // Web `--_ic-default-accent: var(--{Role}-Tinted, var(--Text-High))`.
  final textHigh =
      OneUiSurfaceScope.tokensForAppearance(context, 'neutral').content['high'];
  if (textHigh != null) return oneUiHexColor(textHigh);

  final roleHigh = role.content['high'];
  if (roleHigh != null) return oneUiHexColor(roleHigh);

  return Theme.of(context).colorScheme.onSurface;
}

Color _resolveIconContainedHighForeground(
  BuildContext context,
  FlatRoleTokens role,
) {
  final tintedA11y = role.onBoldContent['tintedA11y'];
  if (tintedA11y != null) return oneUiHexColor(tintedA11y);

  final boldHigh = role.onBoldContent['high'];
  if (boldHigh != null) return oneUiHexColor(boldHigh);

  // Web `--_ic-bold-high: … var(--Text-OnBold-High)`.
  final page = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');
  final onBold = page.onBoldContent['tintedA11y'] ?? page.onBoldContent['high'];
  if (onBold != null) return oneUiHexColor(onBold);

  return Theme.of(context).colorScheme.onPrimary;
}

/// Role-token fallback when component/CSS token paths miss — never force-unwraps.
IconContainedResolvedColors _colorsFromRoleTokens(
  BuildContext context,
  FlatRoleTokens role,
  OneUiIconContainedAttention attention,
) {
  final backgroundHex = attention == OneUiIconContainedAttention.high
      ? _firstRoleHex(role.surfaces, [
          kSurfaceBold,
          kSurfaceModerate,
          kSurfaceDefault,
        ])
      : _firstRoleHex(role.surfaces, [
          kSurfaceSubtle,
          kSurfaceMinimal,
          kSurfaceDefault,
        ]);

  final background = backgroundHex != null
      ? oneUiHexColor(backgroundHex)
      : Theme.of(context).colorScheme.surfaceContainerHighest;

  return IconContainedResolvedColors(
    background: background,
    foreground: attention == OneUiIconContainedAttention.high
        ? _resolveIconContainedHighForeground(context, role)
        : _resolveIconContainedMediumForeground(context, role),
  );
}

IconContainedResolvedColors resolveIconContainedColors(
  BuildContext context, {
  required String appearance,
  required OneUiIconContainedAttention attention,
}) {
  if (OneUiSurfaceScope.maybeOf(context) == null) {
    assert(() {
      FlutterError.reportError(
        FlutterErrorDetails(
          exception: FlutterError(
            'OneUiIconContained: OneUiSurfaceScope missing — wrap MaterialApp '
            'with OneUiSurfaceBootstrap.',
          ),
          library: 'ui_flutter',
          context: ErrorDescription(
            'while resolving OneUiIconContained colors',
          ),
        ),
      );
      return true;
    }());
    return _neutralFallbackColors(attention);
  }

  // Surface-step tokens first — web `[data-surface-step]` before brand overrides.
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);

  final ds = OneUiScope.designSystemOf(context);
  final suffix = attention.name;

  if (ds != null) {
    final bg = resolveColorFromComponentPropertyKeys(
      context,
      ds,
      keys: [
        '--IconContained-backgroundColor-$suffix',
        '--IconContained-backgroundColor',
      ],
      appearance: appearance,
    );
    final fg = resolveColorFromComponentPropertyKeys(
      context,
      ds,
      keys: [
        '--IconContained-iconColor-$suffix',
        '--IconContained-iconColor',
      ],
      appearance: appearance,
    );
    if (bg != null && fg != null) {
      return IconContainedResolvedColors(background: bg, foreground: fg);
    }
  }

  if (ds != null) {
    final label = oneUiAppearanceCssLabel(appearance);
    final bgToken = attention == OneUiIconContainedAttention.high
        ? '--$label-Bold'
        : '--$label-Subtle';
    final fgToken = attention == OneUiIconContainedAttention.high
        ? '--$label-Bold-TintedA11y'
        : '--$label-Tinted';
    final bg =
        resolveButtonTokenColor(context, ds, bgToken, appearance: appearance);
    final fg =
        resolveButtonTokenColor(context, ds, fgToken, appearance: appearance);
    if (bg != null && fg != null) {
      return IconContainedResolvedColors(background: bg, foreground: fg);
    }
  }

  return _colorsFromRoleTokens(context, role, attention);
}

// Terminal fallbacks when role maps are incomplete — never Material colorScheme.
const String _kSurfaceFallbackHex = '#808080';
const String _kOnBoldFallbackHex = '#ffffff';
const String _kOnContentFallbackHex = '#000000';

/// Token-derived neutral floor when [OneUiSurfaceScope] is absent — mirrors
/// Avatar `_neutralFallbackColors` (never `ColorScheme.primary`).
IconContainedResolvedColors _neutralFallbackColors(
  OneUiIconContainedAttention attention,
) {
  final root = buildRootSurfaceContext(
    themeConfig: buildStorybookDemoThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  final role = root.resolvedRoles['neutral'] ?? root.resolvedRoles['primary']!;

  final backgroundHex = attention == OneUiIconContainedAttention.high
      ? _firstRoleHex(role.surfaces, [
          kSurfaceBold,
          kSurfaceModerate,
          kSurfaceDefault,
        ])
      : _firstRoleHex(role.surfaces, [
          kSurfaceSubtle,
          kSurfaceMinimal,
          kSurfaceDefault,
        ]);

  final foregroundHex = attention == OneUiIconContainedAttention.high
      ? _firstRoleHex(role.onBoldContent, const [
          'tintedA11y',
          'high',
        ])
      : _firstRoleHex(role.content, const [
          'tinted',
          'tintedA11y',
          'high',
        ]);

  return IconContainedResolvedColors(
    background: oneUiHexColor(backgroundHex ?? _kSurfaceFallbackHex),
    foreground: oneUiHexColor(
      foregroundHex ??
          (attention == OneUiIconContainedAttention.high
              ? _kOnBoldFallbackHex
              : _kOnContentFallbackHex),
    ),
  );
}

/// Test hook for role-token foreground fallback chain (web `--Text-High` terminal).
@visibleForTesting
IconContainedResolvedColors resolveIconContainedColorsFromRoleTokens(
  BuildContext context,
  FlatRoleTokens role,
  OneUiIconContainedAttention attention,
) =>
    _colorsFromRoleTokens(context, role, attention);

double resolveIconContainedDisabledOpacity(BuildContext context) {
  final ds = OneUiScope.designSystemOf(context);
  if (ds != null) {
    final scope = OneUiScope.of(context);
    for (final key in [
      '--IconContained-disabledOpacity',
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
      );
      final v = double.tryParse(resolved?.trim() ?? '');
      if (v != null) return v.clamp(0.0, 1.0);
    }
  }
  return 0.5; // RN `DISABLED_OPACITY` — non-interactive status needs ≥0.5 (WCAG 1.4.11).
}
