/// CircularProgressIndicator harness for QA playground widget tests.
///
/// Mirrors [chip_harness.dart] / [avatar_harness.dart]:
///   - [qaCpiTestDesignSystem] — synthetic measurement DS. Diameters resolve
///     from `--Spacing-*` (CPI maps size→spacing index) so size/layout
///     assertions read deterministic px WITHOUT re-parsing the brand network.
///   - [pumpCpiQaHarness] — synthetic-DS pump for fast functional/a11y/figma
///     tests. `settle:false` for indeterminate (infinite ticker never settles).
///   - [pumpCpiJioHarness] / [pumpCpiJioHarnessSettled] — real Jio Convex fixture
///     (production-parity) for goldens + real token resolution. Supports
///     `darkMode` + `surfaceMode` + `surfaceAppearance`.
///   - Finders / accessors that read REAL rendered values (diameter via
///     `getSize`, the real `CustomPainter` fields, `SemanticsData`) so
///     behavioural assertions are never circular.
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
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_painter.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestTypography;

export '../pump_one_ui_app.dart' show kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// CPI size (canonical t-shirt) → resolved diameter px under
/// [qaCpiTestDesignSystem]. CPI maps each size to a `--Spacing-*` index
/// (`kCpiSizeToSpacingName`); these are the px those spacing tokens carry in the
/// synthetic DS below. Assertions read THESE constants, never re-derive them
/// from the token they are validating (no circular proof).
const Map<String, double> kQaCpiDiameterPx = {
  '2XS': 8,
  'XS': 12,
  'S': 16,
  'M': 20,
  'L': 24,
  'XL': 32,
  '2XL': 40,
  '3XL': 48,
  '4XL': 56,
  '5XL': 64,
};

/// Synthetic measurement design system. CPI diameters come from `--Spacing-*`
/// in the active dimension context; motion tokens keep entry/exit + trim/rotate
/// resolution deterministic (and finite) for the offline suites.
NativeDesignSystemPayload qaCpiTestDesignSystem() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Motion-Duration-XL': '450ms',
      '--Motion-Duration-3XL': '1015ms',
      '--CircularProgressIndicator-trimDuration': '1500ms',
      '--CircularProgressIndicator-rotateDuration': '6000ms',
      '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-2': '8px', // 2XS
        '--Spacing-3': '12px', // XS
        '--Spacing-4': '16px', // S
        '--Spacing-5': '20px', // M
        '--Spacing-6': '24px', // L
        '--Spacing-8': '32px', // XL
        '--Spacing-10': '40px', // 2XL
        '--Spacing-12': '48px', // 3XL
        '--Spacing-14': '56px', // 4XL
        '--Spacing-16': '64px', // 5XL
        '--Stroke-M': '1px',
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
        '--Focus-Outline': '#0000aa',
        '--Surface-Halo-Gap': '#ffffff',
        '--Surface-Main': '#ffffff',
        '--Shape-Pill': '9999px',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

/// Synthetic-DS pump. Indeterminate variants spin forever — pass `settle:false`
/// so the test does not hang on `pumpAndSettle`.
Future<void> pumpCpiQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  bool settle = true,
}) async {
  final ds = designSystem ?? qaCpiTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: qaCpiTestThemeConfig(),
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
          home: Scaffold(body: Center(child: child)),
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

ThemeConfig qaCpiTestThemeConfig() {
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

// ===========================================================================
// Jio-fixture golden harness — production token resolution (real palette /
// surfaces / spacing). Use for golden / dark / surface visual-regression
// captures. Mirrors chip_harness.dart.
// ===========================================================================

const int _kCpiDarkRootStep = 100;

Widget pumpCpiJioApp(
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
      : (effectiveDark ? _kCpiDarkRootStep : 2500);

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
              child: inner,
            ),
          ),
        ),
      ),
    ),
  );
}

/// Pump with the real Jio fixture, one extra 16ms tick (motion settle without
/// hanging on infinite indeterminate tickers).
Future<void> pumpCpiJioHarness(
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
  await tester.pumpWidget(pumpCpiJioApp(
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

/// Settled variant — waits for transitions to finish before capture. Only safe
/// for DETERMINATE variants (indeterminate spins forever).
Future<void> pumpCpiJioHarnessSettled(
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
  await tester.pumpWidget(pumpCpiJioApp(
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

// ---------------------------------------------------------------------------
// Finders + real-value accessors.
// ---------------------------------------------------------------------------

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

/// The ring `CustomPaint` carrying the real [OneUiCircularProgressIndicatorPainter]
/// (Material adds other CustomPaints — predicate-match the CPI one only).
Finder cpiPaintFinder() => find.byWidgetPredicate(
      (w) => w is CustomPaint && w.painter is OneUiCircularProgressIndicatorPainter,
    );

/// Real rendered ring diameter px — reads `getSize`, never re-parses tokens.
double cpiDiameterPx(WidgetTester tester) =>
    tester.getSize(cpiPaintFinder().first).width;

/// The real painter instance — read indicator/track colour, sweep fraction,
/// indeterminate flag, stroke etc. directly from what is painted.
OneUiCircularProgressIndicatorPainter cpiPainter(WidgetTester tester) {
  final paint = tester.widget<CustomPaint>(cpiPaintFinder().first);
  return paint.painter! as OneUiCircularProgressIndicatorPainter;
}

Finder cpiSemanticsFinder(String label) => find.bySemanticsLabel(label);

/// Real [SemanticsData] for the CPI progressbar node (by accessible name).
SemanticsData cpiSemanticsData(WidgetTester tester, String label) {
  final finder = cpiSemanticsFinder(label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

Finder cpiSemanticsWithLiveRegionFinder() => find.byWidgetPredicate(
      (w) => w is Semantics && (w.properties.liveRegion ?? false),
    );

// ---------------------------------------------------------------------------
// Visual-regression helpers — mirror web paint/layout contracts for RED tests.
// ---------------------------------------------------------------------------

const double _kCpiViewBox = 100;

/// Inner ring diameter (px) available for centre text/icon.
double cpiInnerContentDiameterPxHarness(WidgetTester tester) {
  final diameter = cpiDiameterPx(tester);
  final painter = cpiPainter(tester);
  final scale = diameter / _kCpiViewBox;
  final strokePx = painter.strokeWidthViewBox * scale * painter.strokeScale;
  return (diameter - 2 * strokePx).clamp(0.0, diameter);
}

/// Web `CircularProgressIndicator.module.css` centre-icon slot at S-360.
const Map<String, double> kQaCpiWebCenterIconSlotPx = {
  '2XS': 4,
  'XS': 6,
  'S': 6,
};

/// Asserts centre content box fits inside the ring (not clipped by stroke).
void expectCpiCentreContentFitsInnerRing(
  WidgetTester tester,
  Finder content, {
  required String size,
}) {
  final inner = cpiInnerContentDiameterPxHarness(tester);
  final box = tester.getSize(content);
  expect(
    box.width,
    lessThanOrEqualTo(inner + 0.01),
    reason:
        'Centre content width must fit inside the $size CPI inner ring '
        '(inner=${inner.toStringAsFixed(1)}px, got ${box.width.toStringAsFixed(1)}px).',
  );
  expect(
    box.height,
    lessThanOrEqualTo(inner + 0.01),
    reason:
        'Centre content height must fit inside the $size CPI inner ring '
        '(inner=${inner.toStringAsFixed(1)}px, got ${box.height.toStringAsFixed(1)}px).',
  );
}
