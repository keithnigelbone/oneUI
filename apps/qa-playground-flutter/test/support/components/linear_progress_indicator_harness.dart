/// LinearProgressIndicator harness for QA playground widget tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_layout.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestTypography;

export '../pump_one_ui_app.dart' show kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// LPI size → resolved track height px under [qaLpiTestDesignSystem].
const Map<String, double> kQaLpiTrackHeightPx = {
  'S': 6,
  'M': 10,
  'L': 14,
};

NativeDesignSystemPayload qaLpiTestDesignSystem() {
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
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

Future<void> pumpLpiQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  bool settle = true,
  double barWidth = 200,
}) async {
  final ds = designSystem ?? qaLpiTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: qaLpiTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  await tester.pumpWidget(
    OneUiScope(
      platformId: 'S',
      density: 'default',
      nativeTypography: qaInputFieldTestTypography(),
      designSystem: ds,
      child: OneUiSurfaceScope(
        value: surface,
        child: MaterialApp(
          home: Scaffold(
            body: Center(
              child: SizedBox(width: barWidth, child: child),
            ),
          ),
        ),
      ),
    ),
  );
  if (settle) {
    await tester.pumpAndSettle();
  } else {
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 16));
  }
}

ThemeConfig qaLpiTestThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'negative',
        'positive',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

const int _kLpiDarkRootStep = 100;

Widget pumpLpiJioApp(
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
  double barWidth = 200,
}) {
  final fx = jioFixture;
  final effectiveDark = darkMode ?? fx.darkMode;
  final effectiveStep = darkMode == null
      ? fx.rootParentStep
      : (effectiveDark ? _kLpiDarkRootStep : 2500);

  Widget inner = SizedBox(width: barWidth, child: child);
  if (surfaceMode != null) {
    inner = OneUiSurface(
      mode: surfaceMode,
      appearance: surfaceAppearance,
      child: inner,
    );
  }

  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography,
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpLpiJioHarness(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
  double barWidth = 200,
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpLpiJioApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
    barWidth: barWidth,
  ));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Future<void> pumpLpiJioHarnessSettled(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
  double barWidth = 200,
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpLpiJioApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
    barWidth: barWidth,
  ));
  await tester.pumpAndSettle();
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

Finder lpiSemanticsWithLiveRegionFinder() => find.byWidgetPredicate(
      (w) => w is Semantics && (w.properties.liveRegion ?? false),
    );

double lpiBorderRadiusPx(WidgetTester tester) =>
    lpiLayoutWidget(tester).layout.trackBorderRadiusPx;

double lpiIndicatorBorderRadiusPx(WidgetTester tester) =>
    lpiLayoutWidget(tester).layout.indicatorBorderRadiusPx;
