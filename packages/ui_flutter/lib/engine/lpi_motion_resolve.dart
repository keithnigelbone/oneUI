import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import 'motion_css_static.dart';
import 'motion_resolve.dart';
import 'native_design_system_payload.dart';

/// Indeterminate slide keyframes — web `@keyframes lpi-indeterminate`.
class LpiIndeterminateMotion {
  const LpiIndeterminateMotion();

  /// `translateX(-100%)` of bar width at t=0.
  static const startTranslateFactor = -1.0;

  /// `translateX(250%)` of bar width at t=1.
  static const endTranslateFactor = 2.5;

  /// `prefers-reduced-motion: reduce` static position.
  static const reducedMotionTranslateFactor = 0.75;

  static double translateFactorForProgress(double t, {required bool reducedMotion}) {
    if (reducedMotion) return reducedMotionTranslateFactor;
    return startTranslateFactor + t * (endTranslateFactor - startTranslateFactor);
  }
}

class LpiValueTransitionMotionSpec {
  const LpiValueTransitionMotionSpec({
    required this.durationMs,
    required this.curve,
  });

  final int durationMs;
  final Curve curve;

  static const LpiValueTransitionMotionSpec defaults =
      LpiValueTransitionMotionSpec(
    durationMs: 300,
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
    LpiValueTransitionMotionSpec.defaults.curve,
  );
}

Curve resolveLpiIndeterminateEasing(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final scope = OneUiScope.maybeOf(context);
  final plat = scope?.platformId ?? '';
  final den = scope?.density ?? '';
  final pc = scope?.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);
  final easeRaw = ds.rawComponentCascade([
    '--LinearProgressIndicator-indeterminateEasing',
    '--Motion-Easing-Transition-Moderate',
  ]);
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
    LpiValueTransitionMotionSpec.defaults.curve,
  );
}

LpiValueTransitionMotionSpec resolveLpiValueTransitionMotion(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final componentOverride = ds.rawComponentCascade([
    '--LinearProgressIndicator-valueTransitionDuration',
  ]);
  final fromComponent = componentOverride != null
      ? durationMsFromConcreteCss(componentOverride)
      : null;
  final duration = fromComponent ??
      _resolveMotionDurationMs(context, ds, ['--Motion-Duration-M']) ??
      LpiValueTransitionMotionSpec.defaults.durationMs;
  return LpiValueTransitionMotionSpec(
    durationMs: duration,
    curve: _resolveTransitionModerateCurve(context, ds),
  );
}

int resolveLpiIndeterminateDurationMs(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final componentOverride = ds.rawComponentCascade([
    '--LinearProgressIndicator-indeterminateDuration',
  ]);
  final fromComponent = componentOverride != null
      ? durationMsFromConcreteCss(componentOverride)
      : null;
  return fromComponent ??
      _resolveMotionDurationMs(context, ds, ['--Motion-Duration-3XL']) ??
      1015;
}
