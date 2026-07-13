/// Badge harness for QA playground widget tests.
///
/// Mirrors [button_harness.dart]: production-grade Jio Convex fixture renders
/// the `OneUiBadge` byte-identical to what users see in `qa-playground:flutter`.
/// No synthetic palette, no algorithmic drift, no false confidence.
library;

import '../pump_one_ui_app.dart';
import '../semantics_helpers.dart';
import '../test_widgets_all_platforms.dart';

export '../pump_one_ui_app.dart' show pumpOneUiQaApp, pumpOneUiQaHarness, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

/// Synthetic Badge token payload — only used by fallback / token-warning tests
/// where the production Jio config is intentionally NOT loaded. The numbers
/// below mirror the Figma matrix (5 sizes × 3 attentions). They are
/// deliberately distinct so size/attention assertions fail loudly when a prop
/// is silently ignored.
NativeDesignSystemPayload qaBadgeTestDesignSystem() {
  final props = <String, dynamic>{
    '--Badge-fontWeight': '500',
    '--Badge-borderRadius': '6px',
    '--Badge-gap': '4px',
  };

  // Distinct heights per size so size assertions are not tautological.
  // xs=14 / s=16 / m=20 / l=24 / xl=28 mirrors `--Badge-height-*` in the
  // production Jio config.
  const heightBySize = {'xs': 14, 's': 16, 'm': 20, 'l': 24, 'xl': 28};
  const padHBySize = {'xs': 4, 's': 5, 'm': 6, 'l': 8, 'xl': 10};
  const fontSizeBySize = {'xs': 9, 's': 10, 'm': 11, 'l': 12, 'xl': 13};

  for (final size in ['xs', 's', 'm', 'l', 'xl']) {
    props['--Badge-height-$size'] = '${heightBySize[size]}px';
    props['--Badge-paddingHorizontal-$size'] = '${padHBySize[size]}px';
    props['--Badge-gap-$size'] = '4px';
    props['--Badge-borderRadius-$size'] = '6px';
    props['--Badge-fontSize-$size'] = '${fontSizeBySize[size]}px';
    props['--Badge-lineHeight-$size'] = '${(fontSizeBySize[size]! * 1.4).round()}px';
  }

  // Nested CounterBadge / IndicatorBadge tokens — populated so badge_slot
  // tests render without engine warnings.
  for (final size in ['xs', 's', 'm', 'l']) {
    props['--CounterBadge-height-$size'] = '12px';
    props['--CounterBadge-paddingHorizontal-$size'] = '3px';
    props['--CounterBadge-fontSize-$size'] = '10px';
    props['--CounterBadge-lineHeight-$size'] = '12px';
    props['--CounterBadge-borderRadius-$size'] = '9999px';
  }
  for (final size in ['xs', 's', 'm', 'l', 'xl']) {
    props['--IndicatorBadge-size-$size'] = '8px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-1': '4px',
        '--Spacing-1-5': '6px',
        '--Stroke-XL': '2px',
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

NativeTypographySnapshot qaBadgeTestTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        '3XS': {'fontSize': 9, 'lineHeight': 12},
        '2XS': {'fontSize': 10, 'lineHeight': 14},
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

/// Web's `--Surface-Main` (page 2500) light step. Dark mode flips to step 100.
const int _kDarkRootStep = 100;

Widget pumpBadgeQaApp(
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
      : (effectiveDark ? _kDarkRootStep : 2500);

  Widget inner = child;
  if (surfaceMode != null) {
    inner = OneUiSurface(
      mode: surfaceMode,
      appearance: surfaceAppearance,
      child: inner,
    );
  }

  // Use `OneUiSurfaceBootstrap` (NOT a bare `OneUiSurfaceScope`) so the
  // outer `OneUiRootSurfaceScope` is also provided. Nested slot widgets like
  // `OneUiCounterBadge` / `OneUiIndicatorBadge` call `OneUiRootSurfaceScope.of`
  // (via `BadgeSurfaceImmuneScope`) to reset to page-root tokens; without it
  // they hard-assert and the parent Badge's Row overflows.
  //
  // Also required for `appearance="auto"`: without bootstrap,
  // `OneUiSurfaceScope.isAppearanceConfigured` returns false and badges log a
  // dev warning before falling back to neutral.
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography ?? qaBadgeTestTypography(),
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpBadgeQaHarness(
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
  await tester.pumpWidget(pumpBadgeQaApp(
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

/// First frame after [pumpWidget] + one [Tester.pump] — semantics are
/// generated but [pumpAndSettle] has not run (avoids waiting on animations).
Future<void> pumpBadgeQaHarnessFirstFrame(
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
  await tester.pumpWidget(pumpBadgeQaApp(
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
}

Future<void> pumpBadgeQaHarnessSettled(
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
  await tester.pumpWidget(pumpBadgeQaApp(
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

Finder badgeRootFinder() => find.byType(OneUiBadge);

SemanticsData badgeSemanticsData(WidgetTester tester, {String? semanticsLabel}) {
  final finder = semanticsLabel != null
      ? find.bySemanticsLabel(semanticsLabel)
      : badgeRootFinder();
  return tester.getSemantics(finder).getSemanticsData();
}

/// [OneUiStatusSemantics] sets `liveRegion` on the widget node; merged
/// [SemanticsData] from [Tester.getSemantics] clears the flag after commit.
Finder liveRegionSemanticsForLabel(String label) {
  return find.byWidgetPredicate(
    (w) =>
        w is Semantics &&
        (w.properties.liveRegion ?? false) &&
        w.properties.label == label,
  );
}

/// Token-table values mirrored from [qaBadgeTestDesignSystem] so functional
/// tests can assert against the same numbers without re-parsing.
const Map<String, double> kQaBadgeHeightBySize = {
  'xs': 14,
  's': 16,
  'm': 20,
  'l': 24,
  'xl': 28,
};
