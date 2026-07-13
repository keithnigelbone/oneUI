import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../engine/native_design_system_payload.dart';
import '../engine/native_typography_snapshot.dart';
import '../tokens/platform_foundation_config.dart';

/// WCAG 2.5.5 Level AAA floor — matches `@oneui/tokens` `touchTarget.min`.
const double kOneUiWcagTouchTargetMinPx = 44;

/// Mobile + tablet V2 platform ids (`S`, `M`, `L`).
bool isTouchFirstV2PlatformId(String platformId) {
  return switch (platformId) {
    'S' || 'M' || 'L' => true,
    _ => false,
  };
}

/// Resolves `--Touch-Target-Min` from the design-system payload.
double resolveTouchTargetMinPx(
  NativeDesignSystemPayload ds, {
  required String platformId,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeTypographySnapshot? nativeTypography,
}) {
  final tokenPx = ds.resolveComponentLengthPxCascade(
    ['--Touch-Target-Min'],
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
  final resolved = tokenPx ?? kOneUiWcagTouchTargetMinPx;
  if (isTouchFirstV2PlatformId(platformId)) {
    return math.max(resolved, kOneUiWcagTouchTargetMinPx);
  }
  return resolved;
}

/// Clamps token min-height on touch-first platforms — mirrors RN `touchTarget.min`
/// and web `min-width: var(--Touch-Target-Min)` on [Button].
double enforceButtonTouchMinHeight({
  required double tokenMinHeight,
  required double touchTargetMinPx,
  required String platformId,
}) {
  if (!isTouchFirstV2PlatformId(platformId)) {
    return tokenMinHeight;
  }
  return math.max(tokenMinHeight, touchTargetMinPx);
}

/// Layout side for checkbox/radio box controls — caps at parent constraints.
double resolveCheckboxControlLayoutSide({
  required BoxConstraints constraints,
  required double controlTouchSize,
  required double visualBoxSize,
}) {
  if (controlTouchSize <= visualBoxSize) return visualBoxSize;
  final maxW =
      constraints.hasBoundedWidth ? constraints.maxWidth : controlTouchSize;
  final maxH =
      constraints.hasBoundedHeight ? constraints.maxHeight : controlTouchSize;
  final layoutSide = math.min(
    controlTouchSize,
    math.min(
      maxW.isFinite ? maxW : controlTouchSize,
      maxH.isFinite ? maxH : controlTouchSize,
    ),
  );
  return layoutSide > visualBoxSize ? layoutSide : visualBoxSize;
}

/// Target touch floor for compact controls on touch-first platforms.
double resolveControlTouchTargetSizePx({
  required double visualSizePx,
  required double touchTargetMinPx,
  required String platformId,
}) {
  if (!isTouchFirstV2PlatformId(platformId)) {
    return visualSizePx;
  }
  return math.max(visualSizePx, touchTargetMinPx);
}

/// Minimum hit-test side per axis — mirrors RN `resolvePressableHitSlop`.
Size resolveIconButtonHitTestSize({
  required double visualWidth,
  required double visualHeight,
  required double touchTargetMinPx,
  required String platformId,
}) {
  if (!isTouchFirstV2PlatformId(platformId)) {
    return Size(visualWidth, visualHeight);
  }
  return Size(
    math.max(visualWidth, touchTargetMinPx),
    math.max(visualHeight, touchTargetMinPx),
  );
}

/// RN `resolvePressableHitSlop` — expand the pressable hit area without resizing
/// the painted chrome when the visual control is below [touchTargetMinPx].
EdgeInsets resolvePressableHitPaddingForControl({
  double? width,
  required double height,
  required double touchTargetMinPx,
  required String platformId,
}) {
  if (!isTouchFirstV2PlatformId(platformId)) {
    return EdgeInsets.zero;
  }
  final effectiveWidth = width ?? height;
  final padH = math.max(0.0, (touchTargetMinPx - effectiveWidth) / 2);
  final padV = math.max(0.0, (touchTargetMinPx - height) / 2);
  if (padH == 0 && padV == 0) {
    return EdgeInsets.zero;
  }
  return EdgeInsets.symmetric(horizontal: padH, vertical: padV);
}
