/// Shared harness for CircularProgressIndicator tests (Android, iOS, desktop/web).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

const List<TargetPlatform> kCpiTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

NativeDesignSystemPayload cpiTestDesignSystem() {
  final props = <String, String>{
    for (final n in ['2', '3', '4', '5', '6', '8', '10', '12', '14', '16'])
      '--Spacing-$n': '${n == "2" ? 8 : int.parse(n) * 4}px',
    '--Motion-Duration-3XL': '1015ms',
    '--Motion-Duration-XL': '450ms',
    '--CircularProgressIndicator-trimDuration': '1500ms',
    '--CircularProgressIndicator-rotateDuration': '6000ms',
    '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.4, 0, 0.2, 1)',
  };
  return NativeDesignSystemPayload(
    componentCustomProperties: props,
    dimensionContexts: const [],
    activeDimensionKey: 'L:default',
  );
}

Widget pumpCpiApp(Widget child) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: cpiTestDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

/// Settles layout without waiting on infinite indeterminate tickers.
Future<void> pumpCpiLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kCpiTestPlatforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}

Finder cpiSemanticsFinder(String label) => find.bySemanticsLabel(label);

SemanticsData cpiSemanticsData(WidgetTester tester, String label) {
  final finder = cpiSemanticsFinder(label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

Finder cpiSemanticsWithLiveRegionFinder() {
  return find.byWidgetPredicate(
    (w) => w is Semantics && (w.properties.liveRegion ?? false),
  );
}

Finder cpiRootFinder() => find.byType(OneUiCircularProgressIndicator);

SemanticsData cpiProgressBarSemanticsData(WidgetTester tester) {
  return tester.getSemantics(cpiRootFinder()).getSemanticsData();
}

Finder cpiSemanticsByIdentifier(String identifier) => find.byWidgetPredicate(
      (widget) =>
          widget is Semantics && widget.properties.identifier == identifier,
    );

SemanticsData cpiSemanticsDataByIdentifier(
  WidgetTester tester,
  String identifier,
) {
  final finder = cpiSemanticsByIdentifier(identifier);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}
