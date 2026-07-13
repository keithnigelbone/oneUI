import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/motion_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/counter_badge_showcase.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';

Widget _motionHarness({
  required Widget child,
  Map<String, String> motionTokens = const {},
}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: NativeDesignSystemPayload(
          componentCustomProperties: {
            '--CounterBadge-height-m': '20px',
            '--CounterBadge-fontSize-m': '12px',
            '--CounterBadge-paddingHorizontal-m': '4px',
            ...motionTokens,
          },
          dimensionContexts: const [],
          activeDimensionKey: 'L:default',
        ),
        child: MediaQuery(
          data: const MediaQueryData(disableAnimations: false),
          child: Center(child: child),
        ),
      ),
    ),
  );
}

void main() {
  testWidgets('resolveCounterBadgeIncrementMotion reads Convex motion tokens',
      (tester) async {
    late CounterBadgeIncrementMotionSpec spec;
    await tester.pumpWidget(
      _motionHarness(
        motionTokens: const {
          '--Motion-Duration-S': '135ms',
          '--Motion-Duration-M': '200ms',
          '--Motion-Offset-L': '90ms',
          '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.5, 0, 0.3, 1)',
        },
        child: Builder(
          builder: (context) {
            final ds = OneUiScope.designSystemOf(context)!;
            spec = resolveCounterBadgeIncrementMotion(context, ds);
            return const SizedBox.shrink();
          },
        ),
      ),
    );

    expect(spec.scaleUpDurationMs, 135);
    expect(spec.scaleDownDurationMs, 200);
    expect(spec.numberChangeDelayMs, 90);
    expect(spec.peakScale, 1.2);
  });

  testWidgets('increment delays number change then pulses scale',
      (tester) async {
    await tester.pumpWidget(
      _motionHarness(
        child: const CounterBadgeMotionDemo(initialValue: 5),
      ),
    );

    final badgeFinder = find.byType(OneUiCounterBadge).first;
    expect(find.text('5'), findsWidgets);

    await tester.tap(find.text('Increment'));
    await tester.pump();
    // During scale-up (135ms) and before offset-L (90ms) count stays 5.
    await tester.pump(const Duration(milliseconds: 70));
    expect(find.text('5'), findsWidgets);

    var pulsing = false;
    for (final element in find.byType(ScaleTransition).evaluate()) {
      final st = element.widget as ScaleTransition;
      if (st.animation.value > 1.01) pulsing = true;
    }
    expect(pulsing, isTrue);

    await tester.pump(const Duration(milliseconds: 30));
    expect(find.text('6'), findsWidgets);
  });
}
