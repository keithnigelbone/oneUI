/// LPI motion token resolution — parity with web CSS + CPI motion tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/lpi_motion_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

import 'lpi_test_harness.dart';

void main() {
  group('[fn] resolveLpiValueTransitionMotion', () {
    testWidgets('[fn] defaults to Motion-Duration-M + Transition-Moderate', (
      tester,
    ) async {
      late LpiValueTransitionMotionSpec motion;
      await tester.pumpWidget(
        pumpLpiApp(
          Builder(
            builder: (context) {
              final ds = OneUiScope.of(context).designSystem!;
              motion = resolveLpiValueTransitionMotion(context, ds);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(motion.durationMs, 300);
      expect(motion.curve, isA<Cubic>());
    });

    testWidgets('[fn] component override wins for duration', (tester) async {
      late LpiValueTransitionMotionSpec motion;
      final base = lpiTestDesignSystem();
      await tester.pumpWidget(
        pumpLpiApp(
          Builder(
            builder: (context) {
              final ds = NativeDesignSystemPayload(
                componentCustomProperties: {
                  ...base.componentCustomProperties,
                  '--LinearProgressIndicator-valueTransitionDuration': '450ms',
                },
                dimensionContexts: base.dimensionContexts,
                activeDimensionKey: base.activeDimensionKey,
                activeDimensionContext: base.activeDimensionContext,
              );
              motion = resolveLpiValueTransitionMotion(context, ds);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(motion.durationMs, 450);
    });
  });

  group('[fn] resolveLpiIndeterminateDurationMs', () {
    testWidgets('[fn] defaults to Motion-Duration-3XL', (tester) async {
      late int durationMs;
      await tester.pumpWidget(
        pumpLpiApp(
          Builder(
            builder: (context) {
              final ds = OneUiScope.of(context).designSystem!;
              durationMs = resolveLpiIndeterminateDurationMs(context, ds);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(durationMs, 1015);
    });

    testWidgets('[fn] component override wins', (tester) async {
      late int durationMs;
      final base = lpiTestDesignSystem();
      await tester.pumpWidget(
        pumpLpiApp(
          Builder(
            builder: (context) {
              final ds = NativeDesignSystemPayload(
                componentCustomProperties: {
                  ...base.componentCustomProperties,
                  '--LinearProgressIndicator-indeterminateDuration': '800ms',
                },
                dimensionContexts: base.dimensionContexts,
                activeDimensionKey: base.activeDimensionKey,
                activeDimensionContext: base.activeDimensionContext,
              );
              durationMs = resolveLpiIndeterminateDurationMs(context, ds);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(durationMs, 800);
    });
  });

  group('[fn] resolveLpiIndeterminateEasing', () {
    testWidgets('[fn] resolves Transition-Moderate curve', (tester) async {
      late Curve curve;
      await tester.pumpWidget(
        pumpLpiApp(
          Builder(
            builder: (context) {
              final ds = OneUiScope.of(context).designSystem!;
              curve = resolveLpiIndeterminateEasing(context, ds);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(curve, isA<Cubic>());
    });
  });

  group('[fn] LpiIndeterminateMotion', () {
    test('[fn] translate endpoints match web keyframes', () {
      expect(
        LpiIndeterminateMotion.translateFactorForProgress(0, reducedMotion: false),
        -1,
      );
      expect(
        LpiIndeterminateMotion.translateFactorForProgress(1, reducedMotion: false),
        2.5,
      );
      expect(
        LpiIndeterminateMotion.translateFactorForProgress(0.5, reducedMotion: true),
        0.75,
      );
    });
  });
}
