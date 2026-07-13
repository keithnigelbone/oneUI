/// IconContained harness for QA playground widget tests.
///
/// Mirrors [badge_harness.dart]: production-grade Jio Convex fixture renders
/// `OneUiIconContained` byte-identical to what users see in
/// `qa-playground:flutter`.
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
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

export '../pump_one_ui_app.dart' show pumpOneUiQaApp, pumpOneUiQaHarness, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Synthetic IconContained token payload — only used by fallback tests where
/// the production Jio config is intentionally NOT loaded.
NativeDesignSystemPayload qaIconContainedTestDesignSystem() {
  // Distinct sizes per Figma matrix.
  const containerBySize = {'xs': 24, 's': 32, 'm': 40, 'l': 48, 'xl': 64};
  const iconBySize = {'xs': 12, 's': 16, 'm': 20, 'l': 24, 'xl': 32};

  final props = <String, dynamic>{
    '--IconContained-borderRadius': '9999px',
  };
  for (final size in ['xs', 's', 'm', 'l', 'xl']) {
    props['--IconContained-size-$size'] = '${containerBySize[size]}px';
    props['--IconContained-iconSize-$size'] = '${iconBySize[size]}px';
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
        '--Spacing-4': '16px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Shape-Pill': '9999px',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

NativeTypographySnapshot qaIconContainedTestTypography() {
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

Widget pumpIconContainedQaApp(
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
        nativeTypography: fx.nativeTypography ?? qaIconContainedTestTypography(),
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpIconContainedQaHarness(
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
  await tester.pumpWidget(pumpIconContainedQaApp(
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

Future<void> pumpIconContainedQaHarnessSettled(
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
  await tester.pumpWidget(pumpIconContainedQaApp(
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

Finder iconContainedRootFinder() => find.byType(OneUiIconContained);

SemanticsData iconContainedSemanticsData(WidgetTester tester, {String? semanticsLabel}) {
  final finder = semanticsLabel != null
      ? find.bySemanticsLabel(semanticsLabel)
      : iconContainedRootFinder();
  return tester.getSemantics(finder).getSemanticsData();
}

/// Container + glyph px from the synthetic IconContained test design system.
const Map<String, ({double containerPx, double iconPx})> kQaIconContainedSizes = {
  'xs': (containerPx: 24, iconPx: 12),
  's': (containerPx: 32, iconPx: 16),
  'm': (containerPx: 40, iconPx: 20),
  'l': (containerPx: 48, iconPx: 24),
  'xl': (containerPx: 64, iconPx: 32),
};

/// Brand recipe corner radius baked as `--IconContained-borderRadius` (non-pill).
NativeDesignSystemPayload qaIconContainedSmallRadiusDesignSystem() {
  const containerBySize = {'xs': 24, 's': 32, 'm': 40, 'l': 48, 'xl': 64};
  const iconBySize = {'xs': 12, 's': 16, 'm': 20, 'l': 24, 'xl': 32};
  const recipeRadiusPx = 8;

  final props = <String, dynamic>{
    '--IconContained-borderRadius': '${recipeRadiusPx}px',
  };
  for (final size in ['xs', 's', 'm', 'l', 'xl']) {
    props['--IconContained-size-$size'] = '${containerBySize[size]}px';
    props['--IconContained-iconSize-$size'] = '${iconBySize[size]}px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S-360:default',
    'activeDimensionContext': {
      'platformId': 'S-360',
      'density': 'default',
      'dimensions': {
        '--Spacing-2': '8px',
        '--Spacing-2-5': '10px',
        '--Spacing-3': '12px',
        '--Spacing-4': '16px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Shape-Pill': '9999px',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

/// Design system with sizes but no border-radius or Shape-Pill tokens (fallback path).
NativeDesignSystemPayload qaIconContainedNoRadiusTokenDesignSystem() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': {
      for (final e in kQaIconContainedSizes.entries)
        '--IconContained-size-${e.key}': '${e.value.containerPx}px',
      for (final e in kQaIconContainedSizes.entries)
        '--IconContained-iconSize-${e.key}': '${e.value.iconPx}px',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S-360:default',
    'activeDimensionContext': {
      'platformId': 'S-360',
      'density': 'default',
      'dimensions': {
        '--Spacing-5': '40px',
        '--Spacing-3': '20px',
      },
    },
  })!;
}

/// Top-left corner radius (logical px) from the IconContained shell [DecoratedBox].
double iconContainedShellBorderRadiusPx(WidgetTester tester) {
  final decorated = tester.widget<DecoratedBox>(
    find
        .descendant(
          of: iconContainedRootFinder(),
          matching: find.byType(DecoratedBox),
        )
        .first,
  );
  final decoration = decorated.decoration;
  if (decoration is! BoxDecoration) {
    fail('IconContained shell must use BoxDecoration');
  }
  final borderRadius = decoration.borderRadius;
  if (borderRadius is! BorderRadius) {
    fail('IconContained shell must use BorderRadius');
  }
  return borderRadius.topLeft.x;
}
