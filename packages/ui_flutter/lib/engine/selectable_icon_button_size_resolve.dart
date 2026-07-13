import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/platform_foundation_config.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';

/// Container + icon box — `SelectableIconButton.module.css` `[data-size]`.
class SelectableIconButtonSizeMetrics {
  const SelectableIconButtonSizeMetrics({
    required this.containerPx,
    required this.iconPx,
  });

  final double containerPx;
  final double iconPx;
}

const Map<int, ({String normal, String condensed})> _kContainerSpacingKeys = {
  4: (normal: '5', condensed: '4'),
  6: (normal: '6', condensed: '4-5'),
  8: (normal: '8', condensed: '6'),
  10: (normal: '10', condensed: '8'),
  12: (normal: '12', condensed: '10'),
  14: (normal: '14', condensed: '12'),
};

const Map<int, String> _kIconSpacingKeys = {
  4: '2-5',
  6: '3',
  8: '4',
  10: '5',
  12: '6',
  14: '7',
};

double? _spacingPx(
  NativeDesignSystemPayload ds, {
  required String spacingTail,
  required String platformId,
  required String density,
  required PlatformsFoundationConfig? platformsConfig,
  required NativeTypographySnapshot? nativeTypography,
  List<String>? gaps,
}) {
  return ds.resolveComponentLengthPxCascade(
    ['--Spacing-$spacingTail', '--Spacing-M'],
    gaps: gaps,
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
}

SelectableIconButtonSizeMetrics? resolveSelectableIconButtonSizeMetrics(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required int numericSize,
  required bool condensed,
  List<String>? gaps,
}) {
  final row = _kContainerSpacingKeys[numericSize];
  final iconKey = _kIconSpacingKeys[numericSize];
  if (row == null || iconKey == null) return null;

  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);
  final sz = '$numericSize';

  // Condensed cascade tries both key shapes: React CSS reads
  // `containerSize-{sz}-condensed`; Convex manifest emits `condensedContainerSize-{sz}`.
  // Defaults match; brand overrides on the manifest token affect Flutter only until
  // the shared manifest aligns naming across platforms.
  final container = ds.resolveComponentLengthPxCascade(
    condensed
        ? [
            '--SelectableIconButton-containerSize-$sz-condensed',
            '--SelectableIconButton-condensedContainerSize-$sz',
            '--SelectableIconButton-condensedContainerSize',
            '--SelectableIconButton-containerSize-$sz',
            '--SelectableIconButton-containerSize',
          ]
        : [
            '--SelectableIconButton-containerSize-$sz',
            '--SelectableIconButton-containerSize',
          ],
    gaps: gaps,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );

  final icon = ds.resolveComponentLengthPxCascade(
    [
      '--SelectableIconButton-iconSize-$sz',
      '--SelectableIconButton-iconSize',
    ],
    gaps: gaps,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );

  final containerFallback = _spacingPx(
    ds,
    spacingTail: condensed ? row.condensed : row.normal,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
    gaps: gaps,
  );
  final iconFallback = _spacingPx(
    ds,
    spacingTail: iconKey,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
    gaps: gaps,
  );

  final c = container ?? containerFallback;
  final i = icon ?? iconFallback;
  if (c == null || i == null) return null;
  return SelectableIconButtonSizeMetrics(containerPx: c, iconPx: i);
}
