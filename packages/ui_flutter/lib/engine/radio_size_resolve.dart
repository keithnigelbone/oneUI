import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_radio_types.dart';
import 'native_design_system_payload.dart';

class RadioResolvedMetrics {
  const RadioResolvedMetrics({
    required this.boxSize,
    required this.dotSize,
    required this.boxBorderRadius,
    required this.dotBorderRadius,
    required this.borderWidth,
    required this.labelGap,
    required this.groupVerticalGap,
    required this.groupHorizontalGap,
  });

  final double boxSize;
  final double dotSize;
  final double boxBorderRadius;
  final double dotBorderRadius;
  final double borderWidth;
  final double labelGap;
  final double groupVerticalGap;
  final double groupHorizontalGap;
}

const Map<OneUiRadioSize, double> _fallbackBox = {'s': 16, 'm': 20, 'l': 24};
const Map<OneUiRadioSize, double> _fallbackDot = {'s': 8, 'm': 10, 'l': 12};

double _dotRadiusFromBox(double boxRadius, double boxSize, double dotSize) {
  if (boxRadius >= 9999) return 9999;
  return (boxRadius - (boxSize - dotSize) / 2).clamp(0, double.infinity);
}

RadioResolvedMetrics resolveRadioMetrics(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiRadioSize size,
}) {
  final scope = OneUiScope.of(context);
  final gaps = <String>[];

  double? px(Iterable<String> keys, {double? relativeToPx}) =>
      ds.resolveComponentLengthPxCascade(
        keys,
        gaps: gaps,
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: OneUiScope.nativeTypographyOf(context),
        relativeToPx: relativeToPx,
      );

  final box = px([
    '--Radio-boxSize-$size',
    '--Radio-boxSize',
    '--Spacing-${_spacingTailForBox(size)}',
  ]);
  final dot = px([
    '--Radio-dotSize-$size',
    '--Radio-dotSize',
    '--Spacing-${_spacingTailForDot(size)}',
  ]);
  final boxRadius = px([
    '--Radio-borderRadius-$size',
    '--Radio-borderRadius',
    '--Shape-Pill',
  ]);
  final dotRadiusPx = px([
    '--Radio-dotBorderRadius-$size',
    '--Radio-dotBorderRadius',
  ]);

  final strokeM = px(['--Stroke-M']) ?? 1;
  final labelGap = px([
    '--Radio-labelGap-$size',
    '--Radio-labelGap',
    '--Spacing-${_spacingTailForLabelGap(size)}',
  ]) ??
      switch (size) {
        's' => 6,
        'l' => 10,
        _ => 8,
      };
  final vGap = px(['--RadioGroup-verticalGap', '--Spacing-3-5']) ?? 14;
  final hGap = px(['--RadioGroup-horizontalGap', '--Spacing-4']) ?? 16;

  final boxSize = box ?? _fallbackBox[size]!;
  final dotSize = dot ?? _fallbackDot[size]!;
  final resolvedBoxRadius = boxRadius ?? 9999;
  final derivedDotRadius =
      _dotRadiusFromBox(resolvedBoxRadius, boxSize, dotSize);
  // Web: nested `dotBorderRadius` from box radius — avoid Pill inner dot on square boxes (Reliance).
  final resolvedDotRadius = resolvedBoxRadius >= 9998
      ? (dotRadiusPx ?? derivedDotRadius)
      : derivedDotRadius;

  return RadioResolvedMetrics(
    boxSize: boxSize,
    dotSize: dotSize,
    boxBorderRadius: resolvedBoxRadius,
    dotBorderRadius: resolvedDotRadius,
    borderWidth: strokeM,
    labelGap: labelGap,
    groupVerticalGap: vGap,
    groupHorizontalGap: hGap,
  );
}

String _spacingTailForBox(OneUiRadioSize size) => switch (size) {
      's' => '4',
      'l' => '6',
      _ => '5',
    };

String _spacingTailForDot(OneUiRadioSize size) => switch (size) {
      's' => '2',
      'l' => '3',
      _ => '2-5',
    };

String _spacingTailForLabelGap(OneUiRadioSize size) => switch (size) {
      's' => '1-5',
      'l' => '2-5',
      _ => '2',
    };

/// Web `RadioField.module.css` `.singleGrid[data-size]` column-gap fallbacks.
String radioFieldSingleColumnGapSpacingTail(OneUiRadioSize size) =>
    _spacingTailForLabelGap(size);

double radioFieldSingleColumnGapFallbackPx(OneUiRadioSize size) =>
    switch (size) {
      's' => 6,
      'l' => 10,
      _ => 8,
    };
