import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_indicator_badge_types.dart';
import 'badge_slot_context.dart';
import 'native_design_system_payload.dart';

class IndicatorBadgeResolvedLayout {
  const IndicatorBadgeResolvedLayout({
    required this.side,
    required this.borderRadius,
  });

  final double side;
  final double borderRadius;
}

/// Spacing f-step fallbacks when `--IndicatorBadge-size-*` tokens are absent.
///
/// Must match [default_component_properties_map] and web
/// `IndicatorBadge.module.css` (`--Spacing-1-5` … `--Spacing-3-5`).
/// Must match [default_component_properties_map] and web
/// `IndicatorBadge.module.css` (`--Spacing-1-5` … `--Spacing-3-5`).
/// Badge-slot geometry uses [kBadgeSlotSizes].indicatorSpacing instead.
const Map<OneUiIndicatorBadgeSize, String> kIndicatorBadgeSizeSpacingFallback = {
  'xs': '1-5',
  's': '2',
  'm': '2-5',
  'l': '3',
  'xl': '3-5',
};

double _indicatorSideFromSpacing(BuildContext context, String spacingName) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: spacingName,
  );
}

IndicatorBadgeResolvedLayout resolveIndicatorBadgeLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiIndicatorBadgeSize size,
  bool inheritSlotGeometry = false,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final slot = inheritSlotGeometry ? BadgeSlotSizeScope.maybeOf(context) : null;

  final side = (slot != null
          ? _indicatorSideFromSpacing(context, slot.indicatorSpacing)
          : null) ??
      ds.resolveComponentLengthPxCascade(
        ['--IndicatorBadge-size-$size', '--IndicatorBadge-size-m'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      ) ??
      _indicatorSideFromSpacing(
        context,
        kIndicatorBadgeSizeSpacingFallback[size] ?? '2-5',
      );

  final borderRadius = ds.resolveComponentLengthPxCascade(
        ['--IndicatorBadge-borderRadius', '--Shape-Pill'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      ) ??
      side;

  return IndicatorBadgeResolvedLayout(side: side, borderRadius: borderRadius);
}
