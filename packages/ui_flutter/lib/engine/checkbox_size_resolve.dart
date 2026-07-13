import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_checkbox_types.dart';
import 'native_design_system_payload.dart';

class CheckboxResolvedMetrics {
  const CheckboxResolvedMetrics({
    required this.boxSize,
    required this.iconSize,
    required this.boxBorderRadius,
    required this.borderWidth,
    required this.labelGap,
    required this.groupVerticalGap,
  });

  final double boxSize;
  final double iconSize;
  final double boxBorderRadius;
  final double borderWidth;
  final double labelGap;
  final double groupVerticalGap;
}

const Map<OneUiCheckboxSize, double> _fallbackBox = {'s': 16, 'm': 20, 'l': 24};
const Map<OneUiCheckboxSize, double> _fallbackIcon = {
  's': 12,
  'm': 16,
  'l': 18
};
const Map<OneUiCheckboxSize, double> _fallbackRadius = {'s': 4, 'm': 6, 'l': 8};

CheckboxResolvedMetrics resolveCheckboxMetrics(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiCheckboxSize size,
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
    '--Checkbox-boxSize-$size',
    '--Checkbox-boxSize',
    '--Spacing-${_spacingTailForBox(size)}',
  ]);
  final icon = px([
    '--Checkbox-iconSize-$size',
    '--Checkbox-iconSize',
    '--Spacing-${_spacingTailForIcon(size)}',
  ]);
  final boxRadius = px([
    '--Checkbox-borderRadius-$size',
    '--Checkbox-borderRadius',
    '--Shape-${_shapeTailForSize(size)}',
  ]);

  final strokeM = px(['--Stroke-M']) ?? 1;
  final labelGap = px([
    '--Checkbox-labelGap-$size',
    '--Checkbox-labelGap',
    '--Spacing-${_spacingTailForLabelGap(size)}',
  ]) ??
      switch (size) {
        's' => 6,
        'l' => 10,
        _ => 8,
      };
  final vGap = px(['--CheckboxGroup-verticalGap', '--Spacing-1-5']) ?? 6;

  return CheckboxResolvedMetrics(
    boxSize: box ?? _fallbackBox[size]!,
    iconSize: icon ?? _fallbackIcon[size]!,
    boxBorderRadius: boxRadius ?? _fallbackRadius[size]!,
    borderWidth: strokeM,
    labelGap: labelGap,
    groupVerticalGap: vGap,
  );
}

String _spacingTailForBox(OneUiCheckboxSize size) => switch (size) {
      's' => '4',
      'l' => '6',
      _ => '5',
    };

String _spacingTailForIcon(OneUiCheckboxSize size) => switch (size) {
      's' => '3',
      'l' => '4-5',
      _ => '4',
    };

String _shapeTailForSize(OneUiCheckboxSize size) => switch (size) {
      's' => '1',
      'l' => '2',
      _ => '1-5',
    };

String _spacingTailForLabelGap(OneUiCheckboxSize size) => switch (size) {
      's' => '1-5',
      'l' => '2-5',
      _ => '2',
    };
