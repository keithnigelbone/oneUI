/// Shared harness for LinearProgressIndicator tests (Android, iOS, desktop/web).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_layout.dart';

const List<TargetPlatform> kLpiTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

NativeDesignSystemPayload lpiTestDesignSystem() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Motion-Duration-M': '300ms',
      '--Motion-Duration-3XL': '1015ms',
      '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-1-5': '6px',
        '--Spacing-2-5': '10px',
        '--Spacing-3-5': '14px',
        '--Spacing-40': '160px',
      '--Shape-Pill': '9999px',
      '--Shape-0': '0px',
      '--LinearProgressIndicator-borderRadius-round': 'var(--Shape-Pill)',
      '--LinearProgressIndicator-borderRadius-flat': 'var(--Shape-0)',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

Widget pumpLpiApp(Widget child) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: lpiTestDesignSystem(),
        child: Scaffold(
          body: Center(
            child: SizedBox(width: 200, child: child),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpLpiLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kLpiTestPlatforms) {
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

Finder lpiSemanticsFinder(String label) => find.bySemanticsLabel(label);

SemanticsData lpiSemanticsData(WidgetTester tester, String label) {
  final finder = lpiSemanticsFinder(label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

Finder lpiSemanticsByIdentifier(String identifier) => find.byWidgetPredicate(
      (widget) =>
          widget is Semantics && widget.properties.identifier == identifier,
    );

SemanticsData lpiSemanticsDataByIdentifier(
  WidgetTester tester,
  String identifier,
) {
  final finder = lpiSemanticsByIdentifier(identifier);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

Finder lpiRootFinder() => find.byType(OneUiLinearProgressIndicator);

SemanticsData lpiProgressBarSemanticsData(WidgetTester tester) {
  return tester.getSemantics(lpiRootFinder()).getSemanticsData();
}

Finder lpiLayoutFinder() => find.byType(OneUiLinearProgressIndicatorLayout);

OneUiLinearProgressIndicatorLayout lpiLayoutWidget(WidgetTester tester) {
  return tester.widget(lpiLayoutFinder().first);
}

double lpiTrackHeightPx(WidgetTester tester) =>
    tester.getSize(lpiLayoutFinder().first).height;

double lpiFillFraction(WidgetTester tester) =>
    lpiLayoutWidget(tester).layout.fillFraction;

bool lpiIsIndeterminate(WidgetTester tester) =>
    lpiLayoutWidget(tester).isIndeterminate;

Color lpiIndicatorColor(WidgetTester tester) =>
    lpiLayoutWidget(tester).colors.indicator;

Color lpiTrackColor(WidgetTester tester) =>
    lpiLayoutWidget(tester).colors.track;
