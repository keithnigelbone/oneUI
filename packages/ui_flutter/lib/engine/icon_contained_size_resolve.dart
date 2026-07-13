import 'package:flutter/widgets.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import 'native_design_system_payload.dart';

/// Container + inner icon dimensions — `IconContained.module.css` size table.
class IconContainedResolvedSizes {
  const IconContainedResolvedSizes({
    required this.containerPx,
    required this.iconPx,
  });

  final double containerPx;
  final double iconPx;
}

const Map<String, (String containerSpacing, String iconSpacing)>
    _kDefaultSizeSpacing = {
  'xs': ('3', '2'),
  's': ('4', '2-5'),
  'm': ('5', '3'),
  'l': ('6', '4'),
  'xl': ('8', '5'),
};

double _spacingPx(
  BuildContext context,
  String tail,
) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: tail,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

double? _resolveComponentSizePx(
  BuildContext context,
  NativeDesignSystemPayload ds,
  List<String> keys,
  String defaultSpacingTail,
) {
  final scope = OneUiScope.of(context);
  for (final key in keys) {
    final raw = ds.rawComponentCascade([key]);
    if (raw == null) continue;
    final resolved = ds.resolveCSSValue(
      raw,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
    );
    if (resolved == null) continue;
    final peeled = NativeDesignSystemPayload.peelLeadingVar(resolved.trim());
    if (peeled != null && peeled.startsWith('--Spacing-')) {
      return _spacingPx(context, peeled.substring('--Spacing-'.length));
    }
    final px = _parseCssLengthPx(resolved);
    if (px != null) return px;
  }
  return _spacingPx(context, defaultSpacingTail);
}

double? _parseCssLengthPx(String raw) {
  final t = raw.trim().toLowerCase();
  if (t.endsWith('px')) {
    return double.tryParse(t.substring(0, t.length - 2));
  }
  return double.tryParse(t);
}

IconContainedResolvedSizes resolveIconContainedSizes(
  BuildContext context,
  String size,
) {
  final defaults = _kDefaultSizeSpacing[size] ?? _kDefaultSizeSpacing['m']!;
  final ds = OneUiScope.designSystemOf(context);

  if (ds != null) {
    final container = _resolveComponentSizePx(
      context,
      ds,
      [
        '--IconContained-size-$size',
        '--IconContained-size',
      ],
      defaults.$1,
    );
    final icon = _resolveComponentSizePx(
      context,
      ds,
      [
        '--IconContained-iconSize-$size',
        '--IconContained-iconSize',
      ],
      defaults.$2,
    );
    if (container != null && icon != null) {
      return IconContainedResolvedSizes(containerPx: container, iconPx: icon);
    }
  }

  return IconContainedResolvedSizes(
    containerPx: _spacingPx(context, defaults.$1),
    iconPx: _spacingPx(context, defaults.$2),
  );
}

double? _brandEmittedShapePillPx(
  NativeDesignSystemPayload ds, {
  required String platformId,
  required String density,
}) {
  final ctx = ds.sliceFor(platformId: platformId, density: density);
  final raw = ctx?.dimensions['--Shape-Pill'];
  if (raw == null) return null;
  return _parseCssLengthPx(raw.trim());
}

/// Geometric pill when brand tokens are absent — stadium radius for a square
/// container (RN `resolveShapeLanguageBorderRadius` / Avatar parity).
double iconContainedBorderRadiusFallbackPx(double containerPx) =>
    containerPx / 2;

/// Border radius — web `var(--IconContained-borderRadius, var(--Shape-Pill))`.
///
/// When both tokens are missing, falls back to [iconContainedBorderRadiusFallbackPx]
/// instead of a hardcoded literal (zero-literals rule).
double resolveIconContainedBorderRadiusPx(
  BuildContext context, {
  String size = 'm',
  double? containerPx,
}) {
  final scope = OneUiScope.of(context);
  final ds = OneUiScope.designSystemOf(context);
  if (ds != null) {
    final px = ds.resolveComponentLengthPxCascade(
      ['--IconContained-borderRadius'],
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
    );
    if (px != null) return px;

    final brandPill = _brandEmittedShapePillPx(
      ds,
      platformId: scope.platformId,
      density: scope.density,
    );
    if (brandPill != null) return brandPill;
  }
  final container =
      containerPx ?? resolveIconContainedSizes(context, size).containerPx;
  return iconContainedBorderRadiusFallbackPx(container);
}
