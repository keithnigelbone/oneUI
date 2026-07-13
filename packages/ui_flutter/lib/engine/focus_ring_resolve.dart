import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/platform_foundation_config.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_typography_snapshot.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

/// Web `:focus-visible` halo — shadows ordered **outside → gap** (`Button.module.css`
/// parity; omit inset halo when BW=0).
class OneUiFocusRingSpec {
  const OneUiFocusRingSpec({
    required this.strokeXlPx,
    required this.outlineWidthPx,
    required this.outerShadowSpreadPx,
    required this.outerShadowColor,
    required this.innerGapShadowSpreadPx,
    required this.innerGapShadowColor,
  });

  /// `--Stroke-XL`
  final double strokeXlPx;

  /// `--Focus-Outline-Width`
  final double outlineWidthPx;

  /// `strokeXlPx + outlineWidthPx` (`calc(var(--Stroke-XL) + var(--Focus-Outline-Width))`).
  final double outerShadowSpreadPx;

  /// `--Focus-Outline` (resolved semantic / hex).
  final Color outerShadowColor;

  /// `--Stroke-XL` spread for halo gap ring.
  final double innerGapShadowSpreadPx;

  /// `--Surface-Halo-Gap` with `--Surface-Main` fallback.
  final Color innerGapShadowColor;

  /// CSS: inner halo listed first (top), outer focus second. Flutter paints the
  /// first list entry at the bottom — outer (larger spread) first, inner on top.
  List<BoxShadow> get boxShadows => [
        BoxShadow(
          color: outerShadowColor,
          spreadRadius: outerShadowSpreadPx,
          blurRadius: 0,
          offset: Offset.zero,
        ),
        BoxShadow(
          color: innerGapShadowColor,
          spreadRadius: innerGapShadowSpreadPx,
          blurRadius: 0,
          offset: Offset.zero,
        ),
      ];
}

String _deepResolvePaintString(
  NativeDesignSystemPayload ds, {
  required String seed,
  required String platformId,
  required String density,
  required PlatformsFoundationConfig? platformsConfig,
  NativeTypographySnapshot? typo,
}) {
  var cur = seed.trim();
  if (cur.isEmpty) return cur;
  for (var depth = 0; depth < 32; depth++) {
    final candidate = cur.startsWith('--') ? 'var($cur)' : cur;
    final next = ds
            .resolveCSSValue(
              candidate,
              platformId: platformId,
              density: density,
              platformsConfig: platformsConfig,
              nativeTypography: typo,
            )
            ?.trim() ??
        '';
    if (next.isEmpty) break;
    if (NativeDesignSystemPayload.isConcreteCssValue(next)) {
      return next;
    }
    if (next == cur) break;
    cur = next;
  }
  return cur;
}

/// Web `[data-surface]` remaps `--Surface-Halo-Gap` to the visible container fill
/// (`cssGenNew.ts` → `var(--Surface-Fill-{Mode})`). Flutter has no injected CSS
/// blocks, so derive the same colour from [OneUiSurfaceScope] + palette step.
Color? resolveSurfaceHaloGapFromScope(BuildContext context) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface == null) return null;

  if (surface.surfaceDepth == 0) {
    final role =
        OneUiSurfaceScope.tokensMaybe(context, surface.parentAppearance) ??
            OneUiSurfaceScope.tokensMaybe(context, 'primary');
    final hex = role?.surfaces[kSurfaceDefault];
    return hex != null ? oneUiHexColor(hex) : null;
  }

  final appearance = surface.parentAppearance;
  final scale = surface.themeConfig.appearances[appearance] ??
      surface.themeConfig.appearances['primary'] ??
      surface.themeConfig.appearances['neutral'];
  if (scale == null) return null;

  final containerHex = scale.palette[surface.parentStep];
  if (containerHex != null) return oneUiHexColor(containerHex);

  final mode = surface.parentMode ?? kSurfaceDefault;
  final role =
      surface.resolvedRoles[appearance] ?? surface.resolvedRoles['primary'];
  final fallbackHex = role?.surfaces[mode] ?? role?.surfaces[kSurfaceDefault];
  return fallbackHex != null ? oneUiHexColor(fallbackHex) : null;
}

/// Mirrors web `cssGenNew` — informative → primary → neutral `TintedA11y`.
Color? _focusOutlineFromSurfaceRoles(BuildContext context) {
  for (final role in ['informative', 'primary', 'neutral']) {
    final t = OneUiSurfaceScope.tokensMaybe(context, role);
    final hex = t?.content['tintedA11y'];
    if (hex != null && hex.isNotEmpty) {
      return oneUiHexColor(hex);
    }
  }
  return null;
}

Color? _colorFromCss(
  BuildContext context,
  NativeDesignSystemPayload ds,
  String resolvedConcrete, {
  required String fallbackAppearanceForSurfaceTokens,
}) {
  final r = resolvedConcrete.trim();
  final rl = r.toLowerCase();
  if (rl == 'transparent') return Colors.transparent;
  if (r.startsWith('#') && (r.length == 7 || r.length == 9)) {
    return oneUiHexColor(r);
  }

  final paint = resolveButtonTokenColor(
    context,
    ds,
    r,
    appearance: fallbackAppearanceForSurfaceTokens,
  );
  return paint;
}

OneUiFocusRingSpec? resolveOneUiFocusRingSpec(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String semanticAppearanceFallback,

  /// When set, inner halo gap matches chip/button fill (web `--Surface-Halo-Gap`
  /// on the control; unselected chip uses minimal fill for visible contrast).
  Color? innerGapColorOverride,
}) {
  final scope = OneUiScope.maybeOf(context);
  if (scope == null) return null;
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  final sx = ds.resolveComponentLengthPxCascade(
    ['--Stroke-XL'],
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );
  final ow = ds.resolveComponentLengthPxCascade(
    ['--Focus-Outline-Width'],
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );
  if (sx == null || ow == null) return null;
  final outerSpread = sx + ow;

  final haloSeed = ds.resolveCSSValue(
        'var(--Surface-Halo-Gap, var(--Surface-Main))',
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      ) ??
      'var(--Surface-Halo-Gap, var(--Surface-Main))';

  final haloFlat = _deepResolvePaintString(
    ds,
    seed: haloSeed,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    typo: typo,
  );

  Color? haloCol = resolveSurfaceHaloGapFromScope(context);

  if (haloCol == null && haloFlat.isNotEmpty) {
    haloCol = _colorFromCss(
      context,
      ds,
      haloFlat,
      fallbackAppearanceForSurfaceTokens: semanticAppearanceFallback,
    );
  }

  if (haloCol == null) {
    final t =
        OneUiSurfaceScope.tokensMaybe(context, semanticAppearanceFallback);
    final hexMain = t?.surfaces[kSurfaceDefault];
    if (hexMain != null) haloCol = oneUiHexColor(hexMain);
  }
  if (haloCol == null) return null;
  final gapCol = innerGapColorOverride ?? haloCol;

  final outlineSeed = ds.resolveCSSValue(
        'var(--Focus-Outline)',
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      ) ??
      'var(--Focus-Outline)';

  final outlineFlat = _deepResolvePaintString(
    ds,
    seed: outlineSeed,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    typo: typo,
  );

  Color? outlineCol = outlineFlat.isEmpty
      ? null
      : _colorFromCss(
          context,
          ds,
          outlineFlat,
          fallbackAppearanceForSurfaceTokens: semanticAppearanceFallback,
        );
  if (outlineCol == null &&
      outlineFlat.isNotEmpty &&
      OneUiSurfaceScope.tokensMaybe(context, 'informative') != null &&
      semanticAppearanceFallback != 'informative') {
    outlineCol = _colorFromCss(
      context,
      ds,
      outlineFlat,
      fallbackAppearanceForSurfaceTokens: 'informative',
    );
  }
  outlineCol ??= _focusOutlineFromSurfaceRoles(context);
  if (outlineCol == null) return null;

  return OneUiFocusRingSpec(
    strokeXlPx: sx,
    outlineWidthPx: ow,
    outerShadowSpreadPx: outerSpread,
    outerShadowColor: outlineCol,
    innerGapShadowSpreadPx: sx,
    innerGapShadowColor: gapCol,
  );
}
