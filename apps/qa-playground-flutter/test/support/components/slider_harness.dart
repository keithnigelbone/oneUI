/// Slider harness for QA playground widget tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/slider_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_slider_active_track.dart';
import 'package:ui_flutter/widgets/one_ui_slider_steps.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_knob.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestTypography, pumpOneUiQaApp;

export '../pump_one_ui_app.dart'
    show kOneUiQaTestPlatforms, pumpOneUiQaApp, pumpOneUiQaHarness;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Synthetic measurement DS — deterministic spacing for layout assertions.
NativeDesignSystemPayload qaSliderTestDesignSystem() {
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
        '--Spacing-0-5': '2px',
        '--Spacing-1': '4px',
        '--Spacing-1-5': '6px',
        '--Spacing-2': '8px',
        '--Spacing-2-5': '10px',
        '--Spacing-3': '12px',
        '--Spacing-4': '16px',
        '--Spacing-4-5': '18px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-9': '36px',
        '--Spacing-12': '48px',
        '--Spacing-40': '160px',
        '--Stroke-XL': '2px',
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

ThemeConfig qaSliderTestThemeConfig() {
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

Future<void> pumpSliderQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  final ds = designSystem ?? qaSliderTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: qaSliderTestThemeConfig(),
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
              child: SizedBox(
                width: 360,
                child: child,
              ),
            ),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

const int _kSliderDarkRootStep = 100;

Widget pumpSliderJioApp(
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
      : (effectiveDark ? _kSliderDarkRootStep : 2500);

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

Future<void> pumpSliderJioHarness(
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
  await tester.pumpWidget(pumpSliderJioApp(
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

Future<void> pumpSliderJioHarnessSettled(
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
  await tester.pumpWidget(pumpSliderJioApp(
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
Future<void> pumpSliderJioHarnessE2e(
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
  await pumpSliderJioHarness(
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

Future<void> pumpSliderE2eSettle(
  WidgetTester tester, {
  Duration timeout = const Duration(seconds: 5),
}) async {
  await tester.pumpAndSettle(
    const Duration(milliseconds: 50),
    EnginePhase.sendSemanticsUpdate,
    timeout,
  );
}

Finder sliderRootFinder() => find.byType(OneUiSlider);

Finder sliderKnobHitFinder({int index = 0}) {
  return find.descendant(
    of: find.byType(OneUiSliderKnob),
    matching: find.byType(GestureDetector),
  ).at(index);
}

Finder sliderSemanticsFinder(String label) => find.bySemanticsLabel(label);

SemanticsData sliderSemanticsData(WidgetTester tester, String label) {
  final finder = sliderSemanticsFinder(label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

double sliderContainerWidthPx(WidgetTester tester) =>
    resolveSliderLayout(
      tester.element(sliderRootFinder()),
      qaSliderTestDesignSystem(),
    ).containerWidthPx;

SliderResolvedLayout sliderResolvedLayout(
  WidgetTester tester, {
  String size = 'm',
}) {
  return resolveSliderLayout(
    tester.element(sliderRootFinder()),
    qaSliderTestDesignSystem(),
    size: size,
  );
}

Finder sliderTooltipFinder() =>
    find.byKey(const ValueKey('oneui-slider-tooltip'));

/// Inner step ticks skip first/last edge — same as React `SliderSteps`.
int sliderInnerStepTickCount(WidgetTester tester) {
  final steps = find.byType(OneUiSliderSteps);
  if (steps.evaluate().isEmpty) return 0;
  return find
      .descendant(
        of: steps,
        matching: find.byWidgetPredicate(
          (w) =>
              w is Container &&
              w.decoration is BoxDecoration &&
              (w.decoration! as BoxDecoration).shape == BoxShape.circle,
        ),
      )
      .evaluate()
      .length;
}

double? sliderActiveTrackSpanPx(WidgetTester tester) {
  final track = find.byType(OneUiSliderActiveTrack);
  if (track.evaluate().isEmpty) return null;
  final positioned = find.descendant(
    of: track,
    matching: find.byType(Positioned),
  );
  if (positioned.evaluate().isEmpty) return null;
  final box = tester.renderObject<RenderBox>(positioned.first);
  return box.hasSize ? box.size.width : null;
}

/// Request focus on a slider thumb so keyboard events route to [OneUiSlider].
Future<void> focusSliderThumb(WidgetTester tester, {int index = 0}) async {
  final nodes = find.descendant(
    of: sliderRootFinder(),
    matching: find.byType(Focus),
  );
  expect(nodes, findsWidgets);
  final focus = tester.widget<Focus>(nodes.at(index));
  focus.focusNode!.requestFocus();
  await tester.pump();
}
