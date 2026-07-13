import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import 'motion_css_static.dart';
import 'motion_resolve.dart';
import 'native_design_system_payload.dart';

/// Knob check/uncheck — mirrors `Radio.module.css` `.indicator` transitions.
class RadioIndicatorMotionSpec {
  const RadioIndicatorMotionSpec({
    required this.scaleDurationMs,
    required this.opacityDurationMs,
    required this.opacityDelayMs,
    required this.curve,
    required this.reduceMotion,
  });

  final int scaleDurationMs;
  final int opacityDurationMs;
  final int opacityDelayMs;
  final Curve curve;
  final bool reduceMotion;
}

RadioIndicatorMotionSpec resolveRadioIndicatorMotion(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final mq = MediaQuery.maybeOf(context);
  final reduce = mq?.disableAnimations ?? false;

  final scaleMs = durationMsFromConcreteCss(
        ds.resolveCSSValue(
              'var(--Motion-Duration-L)',
              platformId: OneUiScope.of(context).platformId,
              density: OneUiScope.of(context).density,
              platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
            ) ??
            '',
      ) ??
      durationMsFromConcreteCss(
          convexMotionCSSValue('--Motion-Duration-L') ?? '') ??
      450;

  final opacityMs = durationMsFromConcreteCss(
        ds.resolveCSSValue(
              'var(--Motion-Duration-S)',
              platformId: OneUiScope.of(context).platformId,
              density: OneUiScope.of(context).density,
              platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
            ) ??
            '',
      ) ??
      durationMsFromConcreteCss(
          convexMotionCSSValue('--Motion-Duration-S') ?? '') ??
      135;

  final offsetMs = durationMsFromConcreteCss(
        ds.resolveCSSValue(
              'var(--Motion-Offset-L)',
              platformId: OneUiScope.of(context).platformId,
              density: OneUiScope.of(context).density,
              platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
            ) ??
            '',
      ) ??
      durationMsFromConcreteCss(
          convexMotionCSSValue('--Motion-Offset-L') ?? '') ??
      90;

  final easing = ds.resolveCSSValue(
        'var(--Motion-Easing-Transition-Moderate)',
        platformId: OneUiScope.of(context).platformId,
        density: OneUiScope.of(context).density,
        platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
      ) ??
      convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
      '';

  return RadioIndicatorMotionSpec(
    scaleDurationMs: scaleMs,
    opacityDurationMs: opacityMs,
    opacityDelayMs: offsetMs,
    curve: curveFromMotionCss(easing, Curves.easeOutCubic),
    reduceMotion: reduce,
  );
}
