/// TouchSlider harness for QA playground widget tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/engine/touch_slider_cap_ratio.dart';
import 'package:ui_flutter/engine/touch_slider_size_resolve.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestTypography;

export '../pump_one_ui_app.dart' show kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

NativeDesignSystemPayload qaTouchSliderTestDesignSystem() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Motion-Duration-Discreet-M': '200ms',
      '--Motion-Duration-Discreet-S': '150ms',
      '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-9': '36px',
        '--Dimension-f14': '328px',
        '--Shape-Pill': '9999px',
        '--Focus-Outline-Width': '2px',
        '--Focus-Outline': '#0000aa',
        '--Surface-Halo-Gap': '#ffffff',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

ThemeConfig qaTouchSliderTestThemeConfig() {
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
        'brand-bg',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Future<void> pumpTouchSliderQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  final ds = designSystem ?? qaTouchSliderTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: qaTouchSliderTestThemeConfig(),
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
              child: SizedBox(width: 360, child: child),
            ),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

const int _kTouchSliderDarkRootStep = 100;

Widget pumpTouchSliderJioApp(
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) {
  final fx = jioFixture;
  final effectiveDark = darkMode ?? fx.darkMode;
  final effectiveStep = darkMode == null
      ? fx.rootParentStep
      : (effectiveDark ? _kTouchSliderDarkRootStep : 2500);

  Widget inner = child;
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
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: SizedBox(width: 360, child: inner),
            ),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpTouchSliderJioHarness(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpTouchSliderJioApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  ));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Future<void> pumpTouchSliderJioHarnessSettled(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpTouchSliderJioApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  ));
  await tester.pumpAndSettle();
}

/// E2E-safe pump — bounded settle so perpetual motion tokens cannot hang the suite.
Future<void> pumpTouchSliderJioHarnessE2e(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
  Duration settleTimeout = const Duration(seconds: 5),
}) async {
  await pumpTouchSliderJioHarness(
    tester,
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  );
  await tester.pumpAndSettle(
    const Duration(milliseconds: 50),
    EnginePhase.sendSemanticsUpdate,
    settleTimeout,
  );
}

Future<void> pumpTouchSliderE2eSettle(
  WidgetTester tester, {
  Duration timeout = const Duration(seconds: 5),
}) async {
  await tester.pumpAndSettle(
    const Duration(milliseconds: 50),
    EnginePhase.sendSemanticsUpdate,
    timeout,
  );
}

Finder touchSliderRootFinder() => find.byType(OneUiTouchSlider);

/// Hit-test target for drag/tap — the painted track, not the outer Row flex.
Finder touchSliderTrackFinder() {
  return find.descendant(
    of: touchSliderRootFinder(),
    matching: find.byType(ClipRRect),
  );
}

/// Figma matrix cell — secondary, volume start icon, token width.
Widget goldenTouchSliderMatrixCell({
  double defaultValue = 50,
  String appearance = 'secondary',
  String progressStyle = 'rounded',
  String orientation = 'horizontal',
  bool withStartIcon = true,
}) {
  final slider = OneUiTouchSlider(
    defaultValue: defaultValue,
    appearance: appearance,
    progressStyle: progressStyle,
    orientation: orientation,
    start: withStartIcon
        ? const OneUiIcon(icon: 'volumeOn', size: '5')
        : null,
    ariaLabel: 'Volume',
  );
  if (orientation == 'vertical') {
    return SizedBox(
      width: 328,
      height: 240,
      child: Center(child: slider),
    );
  }
  return SizedBox(width: 328, child: slider);
}

/// Assert painted fill span matches [touchSliderFillExtentPx] resolver output.
void expectTouchSliderFillSpan(
  WidgetTester tester, {
  required double defaultValue,
  double min = 0,
  double max = 100,
  String progressStyle = 'rounded',
  String orientation = 'horizontal',
  bool withStartIcon = true,
  NativeDesignSystemPayload? designSystem,
}) {
  final ds = designSystem ?? qaTouchSliderTestDesignSystem();
  final element = tester.element(touchSliderRootFinder());
  final layout = resolveTouchSliderLayout(element, ds);
  final state = resolveOneUiTouchSliderState(
    value: defaultValue,
    min: min,
    max: max,
    appearance: 'secondary',
    orientation: orientation,
    progressStyle: progressStyle,
    disabled: false,
    readOnly: false,
  );
  final expected = touchSliderFillExtentPx(
    fillRatio: state.fillRatio,
    thickness: layout.thicknessPx,
    trackLength: layout.trackLengthPx,
    progressStyle: progressStyle,
    hasStartSlot: withStartIcon,
  );
  final vertical = orientation == 'vertical';
  final trackAxis = vertical
      ? tester.getSize(touchSliderTrackFinder()).height
      : tester.getSize(touchSliderTrackFinder()).width;
  final fill = touchSliderFillSpanPx(tester, vertical: vertical);
  expect(fill, isNotNull);
  expect(fill!, closeTo(expected, trackAxis * 0.1));
}

String touchSliderGoldenFileName({
  required String orientation,
  required String progressStyle,
  required double value,
}) {
  final axis = orientation == 'vertical' ? 'v' : 'h';
  final valueLabel = value.round().toString();
  return 'goldens/touch_slider_${axis}_${progressStyle}_$valueLabel.png';
}

/// Figma default — secondary, rounded, 50%, volume start icon.
Widget goldenTouchSliderWidget({
  double defaultValue = 50,
  String appearance = 'secondary',
  String progressStyle = 'rounded',
  bool withStartIcon = true,
}) {
  return goldenTouchSliderMatrixCell(
    defaultValue: defaultValue,
    appearance: appearance,
    progressStyle: progressStyle,
    withStartIcon: withStartIcon,
  );
}

Finder touchSliderSemanticsFinder(String label) => find.bySemanticsLabel(label);

SemanticsData touchSliderSemanticsData(WidgetTester tester, String label) {
  final finder = touchSliderSemanticsFinder(label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

double touchSliderTrackLengthPx(WidgetTester tester) =>
    resolveTouchSliderLayout(
      tester.element(touchSliderRootFinder()),
      qaTouchSliderTestDesignSystem(),
    ).trackLengthPx;

/// Request focus on the track so keyboard events route to [OneUiTouchSlider].
Future<void> focusTouchSlider(WidgetTester tester) async {
  final nodes = find.descendant(
    of: touchSliderRootFinder(),
    matching: find.byType(Focus),
  );
  expect(nodes, findsOneWidget);
  final focus = tester.widget<Focus>(nodes);
  focus.focusNode!.requestFocus();
  await tester.pump();
}

double? touchSliderFillSpanPx(WidgetTester tester, {bool vertical = false}) {
  final fill = find.byKey(const ValueKey<String>('touch-slider-fill'));
  if (fill.evaluate().isEmpty) return null;
  final box = tester.renderObject<RenderBox>(fill);
  return vertical ? box.size.height : box.size.width;
}
