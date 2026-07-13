/// Icon harness for QA playground widget tests.
///
/// Mirrors [badge_harness.dart]: production-grade Jio Convex fixture renders
/// `OneUiIcon` byte-identical to what users see in `qa-playground:flutter`.
/// No synthetic palette, no algorithmic drift.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

export '../pump_one_ui_app.dart' show pumpOneUiQaApp, pumpOneUiQaHarness, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Synthetic Icon token payload — used by fallback / token-warning tests
/// where the production Jio config is intentionally NOT loaded.
NativeDesignSystemPayload qaIconTestDesignSystem() {
  final props = <String, dynamic>{};

  // Per-size `--Icon-size-<tail>` aliases that point at `--Spacing-<tail>`
  // tokens so the size resolver hits the explicit cascade path. Tail is the
  // `.` → `-` rewrite (e.g. `--Icon-size-2-5`).
  for (final size in [
    '2', '2-5', '3', '3-5', '4', '4-5', '5', '6', '7', '8',
    '9', '10', '12', '14', '16', '18', '20', '24', '32', '40',
  ]) {
    props['--Icon-size-$size'] = 'var(--Spacing-$size)';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-2': '8px',
        '--Spacing-2-5': '10px',
        '--Spacing-3': '12px',
        '--Spacing-3-5': '14px',
        '--Spacing-4': '16px',
        '--Spacing-4-5': '18px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-7': '28px',
        '--Spacing-8': '32px',
        '--Spacing-9': '36px',
        '--Spacing-10': '40px',
        '--Spacing-12': '48px',
        '--Spacing-14': '56px',
        '--Spacing-16': '64px',
        '--Spacing-18': '72px',
        '--Spacing-20': '80px',
        '--Spacing-24': '96px',
        '--Spacing-32': '128px',
        '--Spacing-40': '160px',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

NativeTypographySnapshot qaIconTestTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'M': {'fontSize': 14, 'lineHeight': 20},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

const int _kDarkRootStep = 100;

Widget pumpIconQaApp(
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

  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography ?? qaIconTestTypography(),
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpIconQaHarness(
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
  await JioIconCatalog.instance.ensureLoaded();
  await tester.pumpWidget(pumpIconQaApp(
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

Future<void> pumpIconQaHarnessSettled(
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
  await JioIconCatalog.instance.ensureLoaded();
  await tester.pumpWidget(pumpIconQaApp(
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

Finder iconRootFinder() => find.byType(OneUiIcon);

SemanticsData iconSemanticsData(WidgetTester tester, {String? semanticsLabel}) {
  final finder = semanticsLabel != null
      ? find.bySemanticsLabel(semanticsLabel)
      : iconRootFinder();
  return tester.getSemantics(finder).getSemanticsData();
}

/// Sizes from the synthetic Icon test design system, in canonical Figma px.
/// Mirrors `qaIconTestDesignSystem` so assertions don't re-parse tokens.
const Map<String, double> kQaIconSizePx = {
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '4.5': 18,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '12': 48,
  '14': 56,
  '16': 64,
  '18': 72,
  '20': 80,
  '24': 96,
  '32': 128,
  '40': 160,
};
