import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_linear_progress_indicator_types.dart';
import 'native_design_system_payload.dart';

class LpiResolvedLayout {
  const LpiResolvedLayout({
    required this.trackHeightPx,
    required this.trackBorderRadiusPx,
    required this.indicatorBorderRadiusPx,
    required this.fillFraction,
    required this.indeterminateWidthFraction,
  });

  final double trackHeightPx;

  /// Track rail end caps — `roundCaps: true` → pill, `false` → square.
  final double trackBorderRadiusPx;

  /// Progress fill — same cap tokens as track (web + Figma `roundCaps`).
  final double indicatorBorderRadiusPx;
  final double fillFraction;
  final double indeterminateWidthFraction;

  /// @deprecated Use [trackBorderRadiusPx]. Kept for harness compatibility.
  double get borderRadiusPx => trackBorderRadiusPx;
}

LpiResolvedLayout resolveLpiLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiLinearProgressIndicatorSize size,
  required bool roundCaps,
  required double fillFraction,
  required double trackHeightPx,
}) {
  final borderRadiusPx = resolveLpiBorderRadiusPx(
    context,
    ds,
    roundCaps: roundCaps,
    trackHeightPx: trackHeightPx,
  );

  return LpiResolvedLayout(
    trackHeightPx: trackHeightPx,
    trackBorderRadiusPx: borderRadiusPx,
    indicatorBorderRadiusPx: borderRadiusPx,
    fillFraction: fillFraction,
    indeterminateWidthFraction: kLpiIndeterminateWidthFraction,
  );
}

/// Track + indicator caps — web `borderRadius-round` / `borderRadius-flat`.
double resolveLpiBorderRadiusPx(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool roundCaps,
  required double trackHeightPx,
}) {
  if (trackHeightPx <= 0) return 0;

  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final keys = roundCaps
      ? [
          '--LinearProgressIndicator-borderRadius-round',
          '--LinearProgressIndicator-borderRadiusRound',
          '--Shape-Pill',
        ]
      : [
          '--LinearProgressIndicator-borderRadius-flat',
          '--LinearProgressIndicator-borderRadiusFlat',
          '--Shape-0',
        ];

  final resolved = ds.resolveComponentLengthPxCascade(
    keys,
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: typo,
  );

  if (resolved != null) {
    if (!roundCaps) return resolved;
    // Shape-Pill (9999px) → stadium; brand overrides may be smaller.
    return resolved > trackHeightPx / 2 ? trackHeightPx / 2 : resolved;
  }

  if (!roundCaps) return 0;
  return trackHeightPx / 2;
}

/// @deprecated Use [resolveLpiBorderRadiusPx].
double resolveLpiTrackBorderRadiusPx({
  required bool roundCaps,
  required double trackHeightPx,
}) {
  if (!roundCaps || trackHeightPx <= 0) return 0;
  return trackHeightPx / 2;
}

/// @deprecated Use [resolveLpiBorderRadiusPx].
double resolveLpiIndicatorBorderRadiusPx({
  required double trackHeightPx,
}) {
  if (trackHeightPx <= 0) return 0;
  return trackHeightPx / 2;
}

double resolveLpiTrackHeightPx(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiLinearProgressIndicatorSize size,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final spacingName = kLpiSizeToSpacingName[size]!;
  final componentKey = kLpiSizeToTrackHeightTokenKey[size]!;

  return ds.resolveComponentLengthPxCascade(
        [componentKey, '--Spacing-$spacingName'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      ) ??
      resolveSpacingPx(
        designSystem: ds,
        platformsConfig: scope.platformsFoundationConfig,
        platformId: scope.platformId,
        density: scope.density,
        spacingName: spacingName,
      );
}
