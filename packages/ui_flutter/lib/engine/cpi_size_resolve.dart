import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_circular_progress_indicator_types.dart';
import '../widgets/one_ui_icon_types.dart';
import 'icon_size_resolve.dart';
import 'native_design_system_payload.dart';

class CpiResolvedLayout {
  const CpiResolvedLayout({
    required this.diameterPx,
    required this.strokeWidthViewBox,
    required this.radiusViewBox,
    required this.circumferenceViewBox,
    required this.dashOffsetViewBox,
  });

  final double diameterPx;
  final double strokeWidthViewBox;
  final double radiusViewBox;
  final double circumferenceViewBox;
  final double dashOffsetViewBox;
}

CpiResolvedLayout resolveCpiLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiCircularProgressIndicatorSize size,
  required OneUiCircularProgressIndicatorState state,
}) {
  final scope = OneUiScope.of(context);
  final spacingName = kCpiSizeToSpacingName[size]!;
  final diameterPx = resolveSpacingPx(
    designSystem: ds,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: spacingName,
  );

  return CpiResolvedLayout(
    diameterPx: diameterPx,
    strokeWidthViewBox: state.strokeWidth,
    radiusViewBox: state.radius,
    circumferenceViewBox: state.circumference,
    dashOffsetViewBox: state.dashOffset,
  );
}

/// Inner ring diameter (px) available for centre text/icon.
double resolveCpiInnerContentDiameterPx(
  CpiResolvedLayout layout, {
  double strokeScale = 1,
}) {
  final scale = layout.diameterPx / kCpiViewBox;
  final strokePx = layout.strokeWidthViewBox * scale * strokeScale;
  return (layout.diameterPx - 2 * strokePx).clamp(0.0, layout.diameterPx);
}

/// Resolved centre-icon slot px — web CSS override at 2XS/XS/S, else Icon size.
double resolveCpiCenterIconSlotPx(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiCircularProgressIndicatorSize size,
}) {
  final scope = OneUiScope.of(context);
  final slotSpacing = kCpiSizeToCenterIconSlotSpacing[size];
  if (slotSpacing != null) {
    return resolveSpacingPx(
      designSystem: ds,
      platformsConfig: scope.platformsFoundationConfig,
      platformId: scope.platformId,
      density: scope.density,
      spacingName: slotSpacing,
    );
  }
  return resolveOneUiIconSizePx(context, kCpiSizeToIconSize[size]!);
}

/// Scales label typography so percentage text fits the inner ring (2XS–M).
double resolveCpiCenterLabelFontSizePx({
  required double innerPx,
  required int percentage,
}) {
  final digits = percentage.abs().toString().length;
  final digitFactor = digits <= 1 ? 0.85 : (digits == 2 ? 0.42 : 0.3);
  return innerPx * digitFactor;
}
