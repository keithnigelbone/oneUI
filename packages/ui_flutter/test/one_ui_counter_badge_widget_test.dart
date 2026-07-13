import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';

Widget _counterBadgeHarness({required Widget child}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: NativeDesignSystemPayload(
          componentCustomProperties: const {
            '--CounterBadge-height-m': '20px',
            '--CounterBadge-height-xs': '12px',
            '--CounterBadge-paddingHorizontal-m': '4px',
          },
          dimensionContexts: const [],
          activeDimensionKey: 'L:default',
        ),
        child: Center(child: child),
      ),
    ),
  );
}

void main() {
  testWidgets('missing designSystem avoids CounterBadge payload in release', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: const OneUiScope(
            platformId: 'L',
            density: 'default',
            child: OneUiCounterBadge(value: 3, semanticsLabel: '3'),
          ),
        ),
      ),
    );
    if (kDebugMode) {
      expect(find.byType(ConvexGapCard), findsOneWidget);
    } else {
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiCounterBadge), findsNothing);
    }
  });

  testWidgets('default payload encodes m high bold primary', (tester) async {
    await tester.pumpWidget(
      _counterBadgeHarness(
        child: const OneUiCounterBadge(value: 5),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-counter-badge|data-size=m|data-variant=bold|data-attention=high|data-appearance=primary',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('invalid appearance encodes neutral in payload', (tester) async {
    await tester.pumpWidget(
      _counterBadgeHarness(
        child: const OneUiCounterBadge(
          value: 5,
          appearance: 'primry',
          semanticsLabel: '5 notifications',
        ),
      ),
    );
    expect(tester.takeException(), isA<FlutterError>());
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-counter-badge|data-size=m|data-variant=bold|data-attention=high|data-appearance=neutral',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('xs high shows numerals (web/RN parity)', (tester) async {
    await tester.pumpWidget(
      _counterBadgeHarness(
        child: const OneUiCounterBadge(
          value: 8,
          size: 'xs',
          attention: 'high',
        ),
      ),
    );
    expect(find.text('8'), findsOneWidget);
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-counter-badge|data-size=xs|data-variant=bold|data-attention=high|data-appearance=primary',
        ),
      ),
      findsOneWidget,
    );
    final handle = tester.ensureSemantics();
    try {
      expect(find.bySemanticsLabel('8'), findsOneWidget);
    } finally {
      handle.dispose();
    }
  });

  testWidgets('attention medium encodes subtle in payload', (tester) async {
    await tester.pumpWidget(
      _counterBadgeHarness(
        child: const OneUiCounterBadge(
          value: 3,
          attention: 'medium',
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-counter-badge|data-size=m|data-variant=subtle|data-attention=medium|data-appearance=primary',
        ),
      ),
      findsOneWidget,
    );
    expect(find.text('3'), findsOneWidget);
  });

  testWidgets('counter badge height grows at 2x text scale (WCAG 1.4.4)',
      (tester) async {
    Future<double> counterHeight({required TextScaler scaler}) async {
      await tester.pumpWidget(
        MediaQuery(
          data: MediaQueryData(textScaler: scaler),
          child: _counterBadgeHarness(
            child: const OneUiCounterBadge(
              value: 5,
              semanticsLabel: '5 notifications',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      return tester.getSize(find.byType(OneUiCounterBadge)).height;
    }

    final base = await counterHeight(scaler: TextScaler.noScaling);
    final scaled = await counterHeight(scaler: const TextScaler.linear(2.0));
    expect(scaled, greaterThan(base));
  });
}
