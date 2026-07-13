/// Divider harness for QA playground widget tests.
///
/// Mirrors [chip_harness.dart] / [circular_progress_indicator_harness.dart]:
///   - [qaDividerTestDesignSystem] — synthetic measurement DS. Stroke widths
///     (S=0.5 / M=1 / L=1.5px), content gap (Spacing-3-5=14px), icon box
///     (Spacing-4=16px), and `--Shape-Pill` resolve to fixed px so geometry
///     assertions read deterministic values WITHOUT re-parsing the brand network.
///   - [pumpDividerQaHarness] — synthetic-DS pump for fast functional/a11y/figma
///     tests (offline).
///   - [pumpDividerJioHarness] — real Jio Convex fixture (production-parity) for
///     goldens + real token resolution, with `darkMode` + `surfaceMode`.
///   - Finders / accessors that read REAL rendered values (stroke px via
///     `getSize`, the real line `BoxDecoration`, `SemanticsData`) so behavioural
///     assertions are never circular.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestTypography;

export '../pump_one_ui_app.dart' show kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Canonical stroke px from the synthetic DS — assertions read these constants
/// so they never re-parse the token they validate. Mirrors `--Stroke-*` below.
const Map<String, double> kQaDividerStrokePx = {'s': 0.5, 'm': 1.0, 'l': 1.5};

/// Content gap (Spacing-3-5) and centre icon box (Spacing-4) in px.
const double kQaDividerContentGapPx = 14;
const double kQaDividerIconBoxPx = 16;

NativeDesignSystemPayload qaDividerTestDesignSystem() {
  final props = <String, String>{
    for (final n in ['2', '3', '3-5', '4', '5', '6', '7', '9', '14', '16', '18'])
      '--Spacing-$n': switch (n) {
        '2' => '8px',
        '3' => '12px',
        '3-5' => '14px',
        '4' => '16px',
        '5' => '20px',
        '6' => '24px',
        '7' => '28px',
        '9' => '36px',
        '14' => '56px',
        '16' => '64px',
        '18' => '72px',
        _ => '8px',
      },
    '--Stroke-S': '0.5px',
    '--Stroke-M': '1px',
    '--Stroke-L': '1.5px',
    '--Shape-Pill': '9999px',
  };
  return NativeDesignSystemPayload(
    componentCustomProperties: props,
    dimensionContexts: const [],
    activeDimensionKey: 'L:default',
  );
}

/// Synthetic-DS pump (offline). `width`/`height` bound the host so a horizontal
/// divider has a finite width and a vertical divider a finite height.
Future<void> pumpDividerQaHarness(
  WidgetTester tester,
  Widget child, {
  double width = 320,
  double height = 160,
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      home: OneUiSurfaceBootstrap(
        themeConfig: buildStorybookDemoThemeConfig(),
        darkMode: false,
        child: OneUiScope(
          platformId: 'L',
          density: 'default',
          nativeTypography: qaInputFieldTestTypography(),
          designSystem: designSystem ?? qaDividerTestDesignSystem(),
          child: Scaffold(
            body: Center(
              // Align passes LOOSE constraints so a horizontal divider keeps its
              // natural stroke height (not the host height), while a vertical
              // divider can still expand up to `height`.
              child: SizedBox(
                width: width,
                height: height,
                child: Align(alignment: Alignment.center, child: child),
              ),
            ),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

// ===========================================================================
// Jio-fixture golden harness — production token resolution.
// ===========================================================================

const int _kDividerDarkRootStep = 100;

Widget pumpDividerJioApp(
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  double width = 320,
  double height = 160,
  String platformId = 'S',
  String density = 'default',
}) {
  final fx = jioFixture;
  final effectiveDark = darkMode ?? fx.darkMode;
  final effectiveStep = darkMode == null
      ? fx.rootParentStep
      : (effectiveDark ? _kDividerDarkRootStep : 2500);

  // Align passes LOOSE constraints so a horizontal divider keeps its natural
  // stroke height (not the host height), while a vertical divider can still
  // expand up to `height`. Mirrors pumpDividerQaHarness.
  Widget inner = SizedBox(
    width: width,
    height: height,
    child: Align(alignment: Alignment.center, child: child),
  );
  if (surfaceMode != null) {
    inner = OneUiSurface(mode: surfaceMode, appearance: surfaceAppearance, child: inner);
  }

  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography,
        designSystem: fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: Padding(padding: const EdgeInsets.all(12), child: inner)),
        ),
      ),
    ),
  );
}

Future<void> pumpDividerJioHarness(
  WidgetTester tester,
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  double width = 320,
  double height = 160,
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpDividerJioApp(
    child,
    darkMode: darkMode,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    width: width,
    height: height,
  ));
  await tester.pumpAndSettle();
}

// ---------------------------------------------------------------------------
// Finders + real-value accessors.
// ---------------------------------------------------------------------------

Finder dividerRootFinder() => find.byType(OneUiDivider);

/// QA payload [KeyedSubtree] — mirrors web `data-*` on the separator root.
Finder dividerPayloadSubtreeFinder() => find.byWidgetPredicate(
      (w) =>
          w is KeyedSubtree &&
          w.key is ValueKey<String> &&
          (w.key! as ValueKey<String>).value.startsWith('oneui-divider'),
    );

/// Root divider landmark — web `role="separator"` (Flutter uses container
/// semantics; the framework has no SemanticsRole.divider in 3.44).
Finder dividerSeparatorFinder() => find.descendant(
      of: dividerPayloadSubtreeFinder(),
      matching: find.byWidgetPredicate((w) => w is Semantics && w.container),
    );

SemanticsData dividerSeparatorSemantics(WidgetTester tester) {
  final finder = dividerSeparatorFinder();
  expect(finder, findsWidgets);
  return tester.getSemantics(finder.first).getSemanticsData();
}

/// The painted line(s). For a bare divider this is the single stroke; with
/// content there is one segment per visible side.
Finder dividerLineFinder() => find.descendant(
      of: dividerRootFinder(),
      matching: find.byType(DecoratedBox),
    );

/// Real `BoxDecoration` on the first line segment.
BoxDecoration dividerLineDecoration(WidgetTester tester) {
  final box = tester.widget<DecoratedBox>(dividerLineFinder().first);
  return box.decoration as BoxDecoration;
}

Color? dividerLineColor(WidgetTester tester) => dividerLineDecoration(tester).color;

/// True when the stroke renders pill-rounded ends (roundCaps).
bool dividerLineIsRounded(WidgetTester tester) {
  final r = dividerLineDecoration(tester).borderRadius;
  return r != null && r != BorderRadius.zero;
}

/// Real rendered stroke thickness (px) of the first line segment — the cross
/// dimension (height for horizontal, width for vertical).
double dividerStrokePx(WidgetTester tester, {required bool horizontal}) {
  final size = tester.getSize(dividerLineFinder().first);
  return horizontal ? size.height : size.width;
}

/// Decorative line segments wrapped in [ExcludeSemantics] (web `aria-hidden`).
int dividerHiddenLineSegmentCount(WidgetTester tester) => find
    .descendant(of: dividerSeparatorFinder(), matching: find.byType(ExcludeSemantics))
    .evaluate()
    .length;
