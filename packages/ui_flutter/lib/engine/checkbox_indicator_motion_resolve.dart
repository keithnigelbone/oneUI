import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import 'motion_css_static.dart';
import 'motion_resolve.dart';
import 'native_design_system_payload.dart';

/// Check/minus glyph motion — mirrors `Checkbox.module.css` indicator transitions.
class CheckboxIndicatorMotionSpec {
  const CheckboxIndicatorMotionSpec({
    required this.scaleDurationMs,
    required this.opacityDurationMs,
    required this.opacityDelayMs,
    required this.rotationDurationMs,
    required this.curve,
    required this.reduceMotion,
  });

  final int scaleDurationMs;
  final int opacityDurationMs;
  final int opacityDelayMs;
  final int rotationDurationMs;
  final Curve curve;
  final bool reduceMotion;
}

CheckboxIndicatorMotionSpec resolveCheckboxIndicatorMotion(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final mq = MediaQuery.maybeOf(context);
  final reduce = mq?.disableAnimations ?? false;
  final scope = OneUiScope.of(context);

  int durationFor(String token, int fallback) {
    return durationMsFromConcreteCss(
          ds.resolveCSSValue(
                'var($token)',
                platformId: scope.platformId,
                density: scope.density,
                platformsConfig: scope.platformsFoundationConfig,
              ) ??
              '',
        ) ??
        durationMsFromConcreteCss(convexMotionCSSValue(token) ?? '') ??
        fallback;
  }

  final easing = ds.resolveCSSValue(
        'var(--Motion-Easing-Transition-Moderate)',
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
      ) ??
      convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
      '';

  return CheckboxIndicatorMotionSpec(
    scaleDurationMs: durationFor('--Motion-Duration-L', 450),
    opacityDurationMs: durationFor('--Motion-Duration-S', 135),
    opacityDelayMs: durationFor('--Motion-Offset-L', 90),
    rotationDurationMs: durationFor('--Motion-Duration-M', 250),
    curve: curveFromMotionCss(easing, Curves.easeOutCubic),
    reduceMotion: reduce,
  );
}
