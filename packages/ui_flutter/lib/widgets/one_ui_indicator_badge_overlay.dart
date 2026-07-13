import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/indicator_badge_size_resolve.dart';
import '../engine/role_root_surface_fill.dart';
import '../engine/surface_engine.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'one_ui_indicator_badge_types.dart';

/// Anchor for [OneUiIndicatorBadgeOverlay] — mirrors web absolute positioning
/// (`top`/`bottom` + `left`/`right`) via [PositionedDirectional] for RTL.
enum OneUiIndicatorBadgeOverlayAnchor {
  /// Host tile top-leading corner — no surface ring.
  topStart,

  /// Notification icon tile — top-trailing corner, no surface ring.
  topEnd,

  /// Avatar tile — bottom-leading corner + optional surface ring border.
  bottomStart,

  /// Avatar tile — bottom-trailing corner + optional surface ring border.
  bottomEnd,
}

Color _resolveOverlaySurfaceRingColor(BuildContext context) {
  // Web `var(--Surface-Default)` — remaps with [data-surface] / dark mode.
  return resolveSurfaceHaloGapFromScope(context) ??
      rootOnlyRoleSurfaceFill(
        context,
        appearance: 'primary',
        mode: kSurfaceDefault,
      ) ??
      _resolveOverlaySurfaceRingColorFromScopedRole(context);
}

Color _resolveOverlaySurfaceRingColorFromScopedRole(BuildContext context) {
  for (final appearance in ['primary', 'secondary', 'neutral']) {
    final hex = OneUiSurfaceScope.tokensForAppearance(context, appearance)
        .surfaces[kSurfaceDefault];
    if (hex != null) return oneUiHexColor(hex);
  }
  assert(() {
    debugPrint(
      'OneUiIndicatorBadgeOverlay: no $kSurfaceDefault token for page surface ring.',
    );
    return true;
  }());
  return Theme.of(context).colorScheme.surface;
}

double _resolveOverlaySurfaceRingWidth(BuildContext context) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '0-5',
  );
}

/// Outward surface ring — web `border: var(--Spacing-0-5) solid var(--Surface-Default)`.
Widget _wrapSurfaceRing({
  required Widget indicator,
  required double indicatorSide,
  required Color ringColor,
  required double ringWidth,
}) {
  if (ringWidth <= 0) return indicator;
  final outer = indicatorSide + ringWidth * 2;
  return SizedBox(
    width: outer,
    height: outer,
    child: Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: ringColor,
          ),
          child: const SizedBox.expand(),
        ),
        SizedBox(
          width: indicatorSide,
          height: indicatorSide,
          child: indicator,
        ),
      ],
    ),
  );
}

/// Overlays [indicator] on a square [host] — React `position: relative` + absolute wrapper.
///
/// Web reference (`IndicatorBadge.stories.tsx` → WithComponents):
/// - icon tile: `position: absolute; top: 0; right: 0`
/// - avatar tile: `position: absolute; bottom: 0; right: 0` (+ surface ring)
class OneUiIndicatorBadgeOverlay extends StatelessWidget {
  const OneUiIndicatorBadgeOverlay({
    super.key,
    required this.hostSide,
    required this.host,
    required this.indicator,
    required this.anchor,
    required this.indicatorSize,
    this.surfaceRingColor,
    this.surfaceRingWidth,
    this.indicatorSide,
  });

  final double hostSide;
  final Widget host;
  final Widget indicator;
  final OneUiIndicatorBadgeOverlayAnchor anchor;
  final OneUiIndicatorBadgeSize indicatorSize;

  /// When null on bottom anchors, resolves page surface.
  final Color? surfaceRingColor;

  /// When null on bottom anchors, resolves `--Spacing-0-5`.
  final double? surfaceRingWidth;

  /// Measured dot diameter for ring layout; when null, resolved from [indicatorSize].
  final double? indicatorSide;

  @override
  Widget build(BuildContext context) {
    Widget badge = indicator;

    if (anchor == OneUiIndicatorBadgeOverlayAnchor.bottomEnd ||
        anchor == OneUiIndicatorBadgeOverlayAnchor.bottomStart) {
      final ringColor =
          surfaceRingColor ?? _resolveOverlaySurfaceRingColor(context);
      final ringWidth =
          surfaceRingWidth ?? _resolveOverlaySurfaceRingWidth(context);
      final side = indicatorSide ??
          resolveSpacingPx(
            designSystem: OneUiScope.of(context).designSystem,
            platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
            platformId: OneUiScope.of(context).platformId,
            density: OneUiScope.of(context).density,
            spacingName:
                kIndicatorBadgeSizeSpacingFallback[indicatorSize] ?? '2-5',
          );
      badge = _wrapSurfaceRing(
        indicator: indicator,
        indicatorSide: side,
        ringColor: ringColor,
        ringWidth: ringWidth,
      );
    }

    final positioned = switch (anchor) {
      OneUiIndicatorBadgeOverlayAnchor.topStart => PositionedDirectional(
          top: 0,
          start: 0,
          child: badge,
        ),
      OneUiIndicatorBadgeOverlayAnchor.topEnd => PositionedDirectional(
          top: 0,
          end: 0,
          child: badge,
        ),
      OneUiIndicatorBadgeOverlayAnchor.bottomStart => PositionedDirectional(
          bottom: 0,
          start: 0,
          child: badge,
        ),
      OneUiIndicatorBadgeOverlayAnchor.bottomEnd => PositionedDirectional(
          bottom: 0,
          end: 0,
          child: badge,
        ),
    };

    return SizedBox(
      width: hostSide,
      height: hostSide,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(child: host),
          positioned,
        ],
      ),
    );
  }
}
