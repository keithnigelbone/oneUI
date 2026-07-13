import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import 'motion_css_static.dart';
import 'motion_resolve.dart';
import 'native_design_system_payload.dart';

/// Indeterminate trim keyframe segments — web/RN `CPI_HEAD_SEGMENTS` / `CPI_TAIL_SEGMENTS`.
class CpiIndeterminateSegments {
  const CpiIndeterminateSegments();

  static const headStart = 2.0;
  static const headSegment1To = 100.0;
  static const headSegment1DurationMs = 1150;
  static const headSegment2To = 102.0;
  static const headSegment2DurationMs = 350;

  static const tailStart = 0.0;
  static const tailHoldMs = 650;
  static const tailSegment2To = 100.0;
  static const tailSegment2DurationMs = 850;

  static const trimCycleMs = 1500;
  static const rotateCycleMs = 6000;

  /// Keyframe breakpoints for a resolved trim cycle length (ms).
  double headBreakForTrimMs(int trimMs) => headSegment1DurationMs / trimMs;
  double tailBreakForTrimMs(int trimMs) => tailHoldMs / trimMs;
  double get headS1Span => headSegment1To - headStart;
  double get headS2Span => headSegment2To - headSegment1To;
  double get tailS2Span => tailSegment2To - tailStart;
}

/// Entry / exit motion — web `cpi-enter` / `cpi-exit`.
class CpiEntryExitMotionSpec {
  const CpiEntryExitMotionSpec({
    required this.durationMs,
    required this.curve,
    this.scaleFrom = 0.93,
    this.scaleTo = 1.0,
  });

  final int durationMs;
  final Curve curve;
  final double scaleFrom;
  final double scaleTo;

  static const CpiEntryExitMotionSpec defaults = CpiEntryExitMotionSpec(
    durationMs: 450,
    curve: Cubic(0.4, 0, 0.2, 1),
  );
}

class CpiValueTransitionMotionSpec {
  const CpiValueTransitionMotionSpec({
    required this.durationMs,
    required this.curve,
  });

  final int durationMs;
  final Curve curve;

  static const CpiValueTransitionMotionSpec defaults =
      CpiValueTransitionMotionSpec(
    durationMs: 1015,
    curve: Cubic(0.4, 0, 0.2, 1),
  );
}

int? _resolveMotionDurationMs(
  BuildContext context,
  NativeDesignSystemPayload ds,
  List<String> keys,
) {
  final scope = OneUiScope.maybeOf(context);
  final plat = scope?.platformId ?? '';
  final den = scope?.density ?? '';
  final pc = scope?.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  for (final key in keys) {
    final raw = ds.rawComponentCascade([key]);
    final synthetic = raw ?? 'var($key)';
    final resolved = (plat.isNotEmpty && den.isNotEmpty)
        ? ds.resolveCSSValue(
            synthetic,
            platformId: plat,
            density: den,
            platformsConfig: pc,
            nativeTypography: typo,
          )
        : null;
    final ms =
        durationMsFromConcreteCss(resolved ?? convexMotionCSSValue(key) ?? '');
    if (ms != null) return ms;
  }
  return null;
}

Curve _resolveTransitionModerateCurve(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final scope = OneUiScope.maybeOf(context);
  final plat = scope?.platformId ?? '';
  final den = scope?.density ?? '';
  final pc = scope?.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);
  final easeRaw =
      ds.rawComponentCascade(['--Motion-Easing-Transition-Moderate']);
  final concreteEase = (plat.isNotEmpty && den.isNotEmpty)
      ? ds.resolveCSSValue(
          easeRaw ?? 'var(--Motion-Easing-Transition-Moderate)',
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        )
      : null;
  return curveFromMotionCss(
    concreteEase ??
        convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
        '',
    CpiValueTransitionMotionSpec.defaults.curve,
  );
}

CpiEntryExitMotionSpec resolveCpiEntryExitMotion(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final duration =
      _resolveMotionDurationMs(context, ds, ['--Motion-Duration-XL']) ??
          CpiEntryExitMotionSpec.defaults.durationMs;
  return CpiEntryExitMotionSpec(
    durationMs: duration,
    curve: _resolveTransitionModerateCurve(context, ds),
  );
}

CpiValueTransitionMotionSpec resolveCpiValueTransitionMotion(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  int? overrideDurationMs,
}) {
  if (overrideDurationMs != null) {
    return CpiValueTransitionMotionSpec(
      durationMs: overrideDurationMs,
      curve: _resolveTransitionModerateCurve(context, ds),
    );
  }
  final componentOverride = ds.rawComponentCascade([
    '--CircularProgressIndicator-valueTransitionDuration',
  ]);
  final fromComponent = componentOverride != null
      ? durationMsFromConcreteCss(componentOverride)
      : null;
  final duration = fromComponent ??
      _resolveMotionDurationMs(context, ds, ['--Motion-Duration-3XL']) ??
      CpiValueTransitionMotionSpec.defaults.durationMs;
  return CpiValueTransitionMotionSpec(
    durationMs: duration,
    curve: _resolveTransitionModerateCurve(context, ds),
  );
}

int resolveCpiIndeterminateTrimMs(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  return _resolveMotionDurationMs(
        context,
        ds,
        ['--CircularProgressIndicator-trimDuration'],
      ) ??
      CpiIndeterminateSegments.trimCycleMs;
}

int resolveCpiIndeterminateRotateMs(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  return _resolveMotionDurationMs(
        context,
        ds,
        ['--CircularProgressIndicator-rotateDuration'],
      ) ??
      CpiIndeterminateSegments.rotateCycleMs;
}
