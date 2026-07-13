import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import 'motion_css_static.dart';
import 'motion_resolve.dart';
import 'native_design_system_payload.dart';

class SliderMotionSpec {
  const SliderMotionSpec({
    required this.knobScaleDurationMs,
    required this.knobScaleCurve,
    required this.colorDurationMs,
    required this.colorCurve,
  });

  final int knobScaleDurationMs;
  final Curve knobScaleCurve;
  final int colorDurationMs;
  final Curve colorCurve;
}

int _motionMs(
  BuildContext context,
  NativeDesignSystemPayload ds,
  List<String> keys,
  int fallback,
) {
  final scope = OneUiScope.maybeOf(context);
  if (scope == null) return fallback;
  for (final key in keys) {
    final raw = ds.rawComponentCascade([key]);
    final resolved = ds.resolveCSSValue(
      raw ?? 'var($key)',
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
    final ms = durationMsFromConcreteCss(
      resolved ?? convexMotionCSSValue(key) ?? '',
    );
    if (ms != null) return ms;
  }
  return fallback;
}

Curve _motionEase(BuildContext context, NativeDesignSystemPayload ds) {
  final scope = OneUiScope.maybeOf(context);
  if (scope == null) return Curves.easeInOutCubic;
  final raw = ds.rawComponentCascade(['--Motion-Easing-Transition-Moderate']);
  final resolved = ds.resolveCSSValue(
    raw ?? 'var(--Motion-Easing-Transition-Moderate)',
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: OneUiScope.nativeTypographyOf(context),
  );
  return curveFromMotionCss(
    resolved ??
        convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
        '',
    Curves.easeInOutCubic,
  );
}

SliderMotionSpec resolveSliderMotion(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final ease = _motionEase(context, ds);
  return SliderMotionSpec(
    knobScaleDurationMs: _motionMs(
      context,
      ds,
      const ['--Motion-Duration-L'],
      250,
    ),
    knobScaleCurve: ease,
    colorDurationMs: _motionMs(
      context,
      ds,
      const ['--Motion-Duration-XS'],
      100,
    ),
    colorCurve: ease,
  );
}
