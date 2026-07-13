import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_divider_types.dart';
import 'native_design_system_payload.dart';

/// Resolved geometry — web `--_div-stroke`, `--Divider-contentGap`, `--Divider-iconSize`.
class DividerResolvedLayout {
  const DividerResolvedLayout({
    required this.strokePx,
    required this.contentGapPx,
    required this.iconSizePx,
    required this.roundCapRadiusPx,
  });

  final double strokePx;
  final double contentGapPx;
  final double iconSizePx;
  final double roundCapRadiusPx;
}

/// Web `Divider.module.css` `[data-size]` → `var(--Stroke-S|M|L)` (not `--Divider-strokeWidth-*`).
List<String> _strokeKeysForSize(OneUiDividerSize size) {
  return switch (size) {
    kOneUiDividerSizeS => ['--Stroke-S'],
    kOneUiDividerSizeL => ['--Stroke-L'],
    _ => ['--Stroke-M'],
  };
}

DividerResolvedLayout resolveDividerLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiDividerSize size,
  required bool roundCaps,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);

  final strokeRaw = ds.resolveComponentLengthPxCascade(
        _strokeKeysForSize(size),
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      ) ??
      (size == kOneUiDividerSizeS
          ? 0.5
          : size == kOneUiDividerSizeL
              ? 1.5
              : 1.0);

  final gapRaw = ds.resolveComponentLengthPxCascade(
        ['--Divider-contentGap', '--Spacing-3-5'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      ) ??
      14.0;

  final iconRaw = ds.resolveComponentLengthPxCascade(
        ['--Divider-iconSize', '--Spacing-4'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      ) ??
      16.0;

  final pillRaw = ds.resolveComponentLengthPxCascade(
        ['--Shape-Pill'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      ) ??
      9999.0;

  return DividerResolvedLayout(
    // CSS `height: var(--_div-stroke)` uses logical px (0.5 / 1 / 1.5) — no DPR hairline clamp.
    strokePx: strokeRaw > 0 ? strokeRaw : 0,
    contentGapPx: gapRaw,
    iconSizePx: iconRaw,
    roundCapRadiusPx: roundCaps ? pillRaw : 0,
  );
}
