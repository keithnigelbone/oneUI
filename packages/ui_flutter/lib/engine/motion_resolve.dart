import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import 'motion_css_static.dart';
import 'native_design_system_payload.dart';

/// Press-scale interaction — parity with web `Button.module.css` tap scale over time:
/// `transform: scale(calc(1 - var(--_tap-scale)/100))` timed with `--Motion-Duration-*` / easing.
///
/// Duration + easing cascades mirror component overrides where present.
///
/// Convex reads `--Button-*` only (Flutter does not ship `LinkButton`).
class OneUiTapMotionSpec {
  const OneUiTapMotionSpec({
    required this.pressedScale,
    required this.durationMs,
    required this.curve,
  });

  /// Resolved scale multiplier while pressed (≤ 1.0).
  final double pressedScale;

  final int durationMs;

  final Curve curve;

  bool useDiscreteAnimation(MediaQueryData? mq) {
    if (durationMs <= 0) return false;
    return !(mq?.disableAnimations ?? false);
  }

  bool get materiallyShrinks =>
      pressedScale < 1.0 - 1e-6; // excludes float noise at 1.0

  static const Curve _defaultEase = Cubic(0.5, 0, 0.3, 1);

  static const OneUiTapMotionSpec defaults = OneUiTapMotionSpec(
    pressedScale: 0.97,
    durationMs: 200,
    curve: _defaultEase,
  );
}

Curve curveFromMotionCss(String resolved, Curve fallback) {
  final tl = resolved.trim().toLowerCase();
  if (tl == 'linear') return Curves.linear;
  final match = RegExp(
    r'cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)',
    caseSensitive: false,
  ).firstMatch(resolved.trim());
  if (match == null) return fallback;
  final a = double.tryParse(match.group(1)!);
  final b = double.tryParse(match.group(2)!);
  final c = double.tryParse(match.group(3)!);
  final d = double.tryParse(match.group(4)!);
  if (a == null || b == null || c == null || d == null) return fallback;
  return Cubic(a, b, c, d);
}

int? durationMsFromConcreteCss(String resolved) {
  final t = resolved.trim().toLowerCase();
  if (t.endsWith('ms')) {
    final n = double.tryParse(t.substring(0, t.length - 2).trim());
    if (n == null || n < 0) return null;
    return n.round();
  }
  if (t.endsWith('s')) {
    final n = double.tryParse(t.substring(0, t.length - 1).trim());
    if (n == null || n < 0) return null;
    return (n * 1000).round();
  }
  return null;
}

/// Web `--_tap-scale` `%` shrunk as whole number (`3` ⇒ `scale(0.97)`).
/// Alternate payloads may use direct multiplier (`0.97`).
double? multiplierFromConcreteTapCSSValue(String resolved) {
  final t = resolved.trim().toLowerCase();
  final withoutPct = t.endsWith('%') ? t.substring(0, t.length - 1).trim() : t;
  final v = double.tryParse(withoutPct.trim());
  if (v == null || v <= 0) return null;

  final isWhole = (v - v.roundToDouble()).abs() < 1e-9;
  if (isWhole && v >= 0 && v <= 60) {
    return (1.0 - v / 100.0).clamp(0.82, 1.0);
  }
  if (v <= 1.0 && v > 0) {
    return v.clamp(0.82, 1.0);
  }
  return null;
}

String? _firstRaw(List<String> keys, NativeDesignSystemPayload ds) {
  for (final k in keys) {
    final nk = ds.rawComponentCascade([k]);
    if (nk != null && nk.trim().isNotEmpty) {
      return nk.trim();
    }
  }
  return null;
}

OneUiTapMotionSpec resolveOneUiTapMotionSpec(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool sizeIsXs,
  required bool fullWidthTapScale,
  List<String> durationKeys = const [
    '--Button-transitionDuration',
    '--Motion-Duration-M',
  ],
  List<String> easeKeys = const [
    '--Button-transitionEasing',
    '--Motion-Easing-Transition-Moderate',
  ],
}) {
  final scope = OneUiScope.maybeOf(context);
  final plat = scope?.platformId ?? '';
  final den = scope?.density ?? '';
  final pc = scope?.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  if (plat.isEmpty || den.isEmpty) {
    return OneUiTapMotionSpec.defaults;
  }

  final tapKeys = fullWidthTapScale
      ? <String>['--Motion-Tap-Scale-FullWidth']
      : sizeIsXs
          ? <String>['--Motion-Tap-Scale-XS', '--Motion-Tap-Scale-Up']
          : <String>['--Motion-Tap-Scale-Default'];

  String tapConcreteStr = '';
  for (final k in tapKeys) {
    final r = ds.resolveCSSValue('var($k)',
        platformId: plat, density: den, platformsConfig: pc);
    if (r != null && NativeDesignSystemPayload.isConcreteCssValue(r)) {
      tapConcreteStr = r;
      break;
    }
  }
  if (tapConcreteStr.isEmpty) {
    tapConcreteStr = convexMotionCSSValue(tapKeys.first) ??
        convexMotionCSSValue('--Motion-Tap-Scale-Default') ??
        '3';
  }

  final pressedMult = multiplierFromConcreteTapCSSValue(tapConcreteStr) ??
      OneUiTapMotionSpec.defaults.pressedScale;

  final durRaw = _firstRaw(durationKeys, ds);
  final durSynthetic = durRaw ?? 'var(--Motion-Duration-M)';
  final concreteDur = ds.resolveCSSValue(
        durSynthetic,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      ) ??
      convexMotionCSSValue('--Motion-Duration-M') ??
      '';

  final easeRaw = _firstRaw(easeKeys, ds);
  final easeSynthetic = easeRaw ?? 'var(--Motion-Easing-Transition-Moderate)';
  final concreteEase = ds.resolveCSSValue(
        easeSynthetic,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      ) ??
      convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
      convexMotionCSSValue('--Motion-Easing-Standard') ??
      '';

  final curve =
      curveFromMotionCss(concreteEase, OneUiTapMotionSpec.defaults.curve);

  final fbDur = convexMotionCSSValue('--Motion-Duration-M');

  final durationMs = durationMsFromConcreteCss(concreteDur) ??
      durationMsFromConcreteCss(fbDur ?? '') ??
      OneUiTapMotionSpec.defaults.durationMs;

  return OneUiTapMotionSpec(
    pressedScale: pressedMult,
    durationMs: durationMs,
    curve: curve,
  );
}

/// IconButton `:active` transform — scale **up** on square 1:1, scale **down** on 3:2 / full-width.
class IconButtonPressScaleSpec {
  const IconButtonPressScaleSpec({
    required this.pressedMultiplier,
    required this.durationMs,
    required this.curve,
  });

  /// End scale while pressed (`1.07` scale-up or `0.97` scale-down).
  final double pressedMultiplier;
  final int durationMs;
  final Curve curve;
}

IconButtonPressScaleSpec resolveIconButtonPressScaleSpec(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool layoutWide,
  required bool fullWidth,
}) {
  final scope = OneUiScope.maybeOf(context);
  final plat = scope?.platformId ?? '';
  final den = scope?.density ?? '';
  final pc = scope?.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  final scaleUp = !layoutWide && !fullWidth;
  final tapKeys = fullWidth
      ? ['--Motion-Tap-Scale-FullWidth']
      : layoutWide
          ? ['--Motion-Tap-Scale-Default']
          : ['--Motion-Tap-Scale-Up'];

  String tapConcreteStr = '';
  if (plat.isNotEmpty && den.isNotEmpty) {
    for (final k in tapKeys) {
      final r = ds.resolveCSSValue('var($k)',
          platformId: plat, density: den, platformsConfig: pc);
      if (r != null && NativeDesignSystemPayload.isConcreteCssValue(r)) {
        tapConcreteStr = r;
        break;
      }
    }
  }
  if (tapConcreteStr.isEmpty) {
    tapConcreteStr =
        convexMotionCSSValue(tapKeys.first) ?? (scaleUp ? '7' : '3');
  }

  final pct = double.tryParse(
        tapConcreteStr.replaceAll('%', '').trim(),
      ) ??
      (scaleUp ? 7.0 : 3.0);
  final pressedMultiplier = scaleUp ? (1.0 + pct / 100.0) : (1.0 - pct / 100.0);

  const easeKeys = ['--Motion-Easing-Transition-Moderate'];
  final easeRaw = _firstRaw(easeKeys, ds);
  final concreteEase = (plat.isNotEmpty && den.isNotEmpty)
      ? ds.resolveCSSValue(
          easeRaw ?? 'var(--Motion-Easing-Transition-Moderate)',
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        )
      : null;

  final curve = curveFromMotionCss(
    concreteEase ??
        convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
        '',
    OneUiTapMotionSpec.defaults.curve,
  );

  final durationMs = durationMsFromConcreteCss(
        convexMotionCSSValue('--Motion-Duration-M') ?? '',
      ) ??
      OneUiTapMotionSpec.defaults.durationMs;

  return IconButtonPressScaleSpec(
    pressedMultiplier: pressedMultiplier.clamp(0.82, 1.12),
    durationMs: durationMs,
    curve: curve,
  );
}

/// Increment pulse — `CounterBadge.stories.tsx` `counter-pulse-active` keyframes.
///
/// Scale 1 → 1.2 over `--Motion-Duration-S`, then 1.2 → 1 over `--Motion-Duration-M`
/// (second leg delayed by S). Display value updates at `--Motion-Offset-L`.
class CounterBadgeIncrementMotionSpec {
  const CounterBadgeIncrementMotionSpec({
    required this.scaleUpDurationMs,
    required this.scaleDownDurationMs,
    required this.numberChangeDelayMs,
    required this.curve,
    this.peakScale = 1.2,
  });

  final int scaleUpDurationMs;
  final int scaleDownDurationMs;
  final int numberChangeDelayMs;
  final Curve curve;
  final double peakScale;

  int get totalDurationMs => scaleUpDurationMs + scaleDownDurationMs;

  static const CounterBadgeIncrementMotionSpec defaults =
      CounterBadgeIncrementMotionSpec(
    scaleUpDurationMs: 135,
    scaleDownDurationMs: 200,
    numberChangeDelayMs: 90,
    curve: Cubic(0.5, 0, 0.3, 1),
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

CounterBadgeIncrementMotionSpec resolveCounterBadgeIncrementMotion(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final scaleUp =
      _resolveMotionDurationMs(context, ds, ['--Motion-Duration-S']) ??
          CounterBadgeIncrementMotionSpec.defaults.scaleUpDurationMs;
  final scaleDown =
      _resolveMotionDurationMs(context, ds, ['--Motion-Duration-M']) ??
          CounterBadgeIncrementMotionSpec.defaults.scaleDownDurationMs;
  final offsetL =
      _resolveMotionDurationMs(context, ds, ['--Motion-Offset-L']) ??
          CounterBadgeIncrementMotionSpec.defaults.numberChangeDelayMs;

  final easeRaw =
      ds.rawComponentCascade(['--Motion-Easing-Transition-Moderate']);
  final scope = OneUiScope.maybeOf(context);
  final plat = scope?.platformId ?? '';
  final den = scope?.density ?? '';
  final pc = scope?.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);
  final concreteEase = (plat.isNotEmpty && den.isNotEmpty)
      ? ds.resolveCSSValue(
          easeRaw ?? 'var(--Motion-Easing-Transition-Moderate)',
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        )
      : null;

  final curve = curveFromMotionCss(
    concreteEase ??
        convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
        '',
    CounterBadgeIncrementMotionSpec.defaults.curve,
  );

  return CounterBadgeIncrementMotionSpec(
    scaleUpDurationMs: scaleUp,
    scaleDownDurationMs: scaleDown,
    numberChangeDelayMs: offsetL,
    curve: curve,
  );
}

/// Hover / selection fill transition — web `.selectableButton` color tokens.
({int durationMs, Curve curve}) resolveSelectableButtonColorTransition(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final spec = resolveOneUiTapMotionSpec(
    context,
    ds,
    sizeIsXs: false,
    fullWidthTapScale: false,
    durationKeys: const [
      '--SelectableButton-transitionDuration',
      '--Motion-Duration-M',
    ],
    easeKeys: const [
      '--SelectableButton-transitionEasing',
      '--Motion-Easing-Transition-Moderate',
    ],
  );
  return (durationMs: spec.durationMs, curve: spec.curve);
}

/// Hover fill transition — web `.singleTextButton` `transition-duration` / `easing`.
({int durationMs, Curve curve}) resolveSingleTextButtonColorTransition(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final spec = resolveOneUiTapMotionSpec(
    context,
    ds,
    sizeIsXs: false,
    fullWidthTapScale: false,
    durationKeys: const [
      '--SingleTextButton-transitionDuration',
      '--Motion-Duration-M',
    ],
    easeKeys: const [
      '--SingleTextButton-transitionEasing',
      '--Motion-Easing-Transition-Moderate',
    ],
  );
  return (durationMs: spec.durationMs, curve: spec.curve);
}

OneUiTapMotionSpec resolveSingleTextButtonTapMotionSpec(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool sizeIsXs,
  required bool fullWidth,
}) {
  return resolveOneUiTapMotionSpec(
    context,
    ds,
    sizeIsXs: sizeIsXs,
    fullWidthTapScale: fullWidth,
    durationKeys: const [
      '--SingleTextButton-transitionDuration',
      '--Motion-Duration-M',
    ],
    easeKeys: const [
      '--SingleTextButton-transitionEasing',
      '--Motion-Easing-Transition-Moderate',
    ],
  );
}
