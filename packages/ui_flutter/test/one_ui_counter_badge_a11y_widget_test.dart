import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
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

SemanticsData _semanticsForLabel(WidgetTester tester, String label) {
  return tester.getSemantics(find.bySemanticsLabel(label)).getSemanticsData();
}

bool _isLiveRegion(SemanticsData data) =>
    data.hasFlag(SemanticsFlag.isLiveRegion);

Finder _liveRegionSemanticsForLabel(String label) {
  return find.byWidgetPredicate(
    (w) =>
        w is Semantics &&
        (w.properties.liveRegion ?? false) &&
        w.properties.label == label,
  );
}

void main() {
  testWidgets(
      'liveRegion announces once then stays quiet on identical rebuilds', (
    tester,
  ) async {
    await tester.pumpWidget(
      _counterBadgeHarness(
        child: StatefulBuilder(
          builder: (context, setState) {
            return Column(
              children: [
                const OneUiCounterBadge(value: 5),
                TextButton(
                  onPressed: () => setState(() {}),
                  child: const Text('rebuild'),
                ),
              ],
            );
          },
        ),
      ),
    );

    final handle = tester.ensureSemantics();
    try {
      expect(_liveRegionSemanticsForLabel('5'), findsOneWidget);

      await tester.pump();
      expect(_liveRegionSemanticsForLabel('5'), findsNothing);

      await tester.tap(find.text('rebuild'));
      await tester.pumpAndSettle();

      expect(_liveRegionSemanticsForLabel('5'), findsNothing);
    } finally {
      handle.dispose();
    }
  });

  testWidgets('liveRegion re-announces when count changes', (tester) async {
    var count = 5;
    await tester.pumpWidget(
      _counterBadgeHarness(
        child: StatefulBuilder(
          builder: (context, setState) {
            return Column(
              children: [
                OneUiCounterBadge(value: count),
                TextButton(
                  onPressed: () => setState(() => count = 6),
                  child: const Text('increment'),
                ),
              ],
            );
          },
        ),
      ),
    );

    final handle = tester.ensureSemantics();
    try {
      await tester.pumpAndSettle();
      await tester.tap(find.text('increment'));
      await tester.pump();
      expect(_liveRegionSemanticsForLabel('6'), findsOneWidget);
      await tester.pump();
      expect(_liveRegionSemanticsForLabel('6'), findsNothing);
    } finally {
      handle.dispose();
    }
  });

  testWidgets('visual text is excluded from semantics tree', (tester) async {
    await tester.pumpWidget(
      _counterBadgeHarness(
        child: const OneUiCounterBadge(value: 9, semanticsLabel: '9 items'),
      ),
    );

    final handle = tester.ensureSemantics();
    try {
      await tester.pumpAndSettle();
      expect(find.text('9'), findsOneWidget);
      expect(find.bySemanticsLabel('9'), findsNothing);
      expect(find.bySemanticsLabel('9 items'), findsOneWidget);
    } finally {
      handle.dispose();
    }
  });
}
