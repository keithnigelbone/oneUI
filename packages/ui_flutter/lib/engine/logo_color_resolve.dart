import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

Color? _resolveLogoColorFromDesignSystem(
    BuildContext context, NativeDesignSystemPayload ds) {
  final fromComponent = resolveColorFromComponentPropertyKeys(
    context,
    ds,
    keys: const ['--Logo-color'],
    appearance: 'primary',
  );
  if (fromComponent != null) return fromComponent;

  final scope = OneUiScope.of(context);
  final peeled = ds.resolveCSSValue(
    'var(--Logo-color, var(--Primary-Bold))',
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
  if (peeled == null) return null;

  final token =
      NativeDesignSystemPayload.peelLeadingVar(peeled.trim()) ?? peeled.trim();
  if (token.startsWith('#')) return oneUiHexColor(token);
  final parsed = parseSurfaceTokenVar(
    token,
    OneUiSurfaceScope.of(context).themeConfig.appearances.keys,
  );
  if (parsed == null) return null;
  return resolveButtonTokenColor(
    context,
    ds,
    token,
    appearance: parsed.$1,
  );
}

/// Logo `currentColor` — web `Logo.module.css` `--Logo-color` → `--Primary-Bold`.
///
/// On nested [OneUiSurface] containers, `--Primary-Bold` is a **fill** token that
/// often matches the painted surface background. Use branded **content** tokens
/// (`--Primary-TintedA11y`) so marks stay visible on bold/minimal/subtle tints.
Color resolveOneUiLogoColor(BuildContext context) {
  final ds = OneUiScope.designSystemOf(context);
  if (ds != null) {
    final fromDs = _resolveLogoColorFromDesignSystem(context, ds);
    if (fromDs != null && !oneUiInsideNestedSurface(context)) return fromDs;
  }

  final role = OneUiSurfaceScope.tokensForAppearance(context, 'primary');

  if (oneUiInsideNestedSurface(context)) {
    final scope = OneUiSurfaceScope.of(context);
    // Children on a bold accent fill need on-bold content (white on One UI Theme),
    // not default `content.high` which can match the dark fill (#000 on #080900).
    if (scope.parentMode == kSurfaceBold) {
      final onBold =
          role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high'];
      if (onBold != null) return oneUiHexColor(onBold);
    }
    // Tinted / minimal / subtle surfaces — remapped content tokens.
    final high = role.content['high'];
    if (high != null) return oneUiHexColor(high);
    final tinted = role.content['tintedA11y'] ?? role.content['tinted'];
    if (tinted != null) return oneUiHexColor(tinted);
  }

  if (ds != null) {
    final fromDs = _resolveLogoColorFromDesignSystem(context, ds);
    if (fromDs != null) return fromDs;
  }

  final bold = role.surfaces[kSurfaceBold];
  if (bold != null) return oneUiHexColor(bold);

  return Theme.of(context).colorScheme.primary;
}

/// Painted fill behind the logo when inside a nested [OneUiSurface] — used to detect
/// monochrome baked marks that would disappear on bold/minimal tints (Tira on bold).
String? resolveLogoNestedSurfaceBackgroundHex(BuildContext context) {
  if (!oneUiInsideNestedSurface(context)) return null;
  final scope = OneUiSurfaceScope.of(context);
  final scale = scope.themeConfig.appearances[scope.parentAppearance];
  if (scale == null) return null;
  return scale.palette[scope.parentStep];
}

/// Fallback slot colour — web `.fallback { color: var(--Neutral-Low); }`.
Color resolveOneUiLogoFallbackColor(BuildContext context) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');
  final low = role.content['low'];
  if (low != null) return oneUiHexColor(low);
  return Theme.of(context).colorScheme.onSurfaceVariant;
}
