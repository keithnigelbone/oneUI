/// Avatar harness for QA playground widget tests.
///
/// Mirrors [icon_contained_harness.dart]: production-grade Jio Convex fixture
/// renders `OneUiAvatar` byte-identical to what users see in
/// `qa-playground:flutter`. No synthetic palette, no algorithmic drift.
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
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

export '../pump_one_ui_app.dart' show pumpOneUiQaApp, pumpOneUiQaHarness, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Synthetic Avatar token payload — only used by fallback / token-warning tests
/// where the production Jio config is intentionally NOT loaded.
///
/// Sizes mirror the Figma matrix (2xs/xs/s/m/l/xl/2xl) using fixed px so test
/// assertions can compare without re-parsing the dimension scale.
NativeDesignSystemPayload qaAvatarTestDesignSystem() {
  const containerBySize = {
    '2xs': 16,
    'xs': 20,
    's': 32,
    'm': 40,
    'l': 48,
    'xl': 64,
    '2xl': 80,
  };
  const iconBySize = {
    '2xs': 16,
    'xs': 12,
    's': 16,
    'm': 20,
    'l': 24,
    'xl': 32,
    '2xl': 40,
  };

  final props = <String, dynamic>{
    '--Avatar-borderRadius': '9999px',
  };
  for (final size in containerBySize.keys) {
    props['--Avatar-size-$size'] = '${containerBySize[size]}px';
    props['--Avatar-iconSize-$size'] = '${iconBySize[size]}px';
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
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Shape-Pill': '9999px',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

NativeTypographySnapshot qaAvatarTestTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        '3XS': {'fontSize': 10, 'lineHeight': 14},
        '2XS': {'fontSize': 12, 'lineHeight': 16},
        'XS': {'fontSize': 13, 'lineHeight': 18},
        'S': {'fontSize': 14, 'lineHeight': 20},
        'M': {'fontSize': 16, 'lineHeight': 22},
        'L': {'fontSize': 18, 'lineHeight': 24},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

const int _kDarkRootStep = 100;

Widget pumpAvatarQaApp(
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
        nativeTypography: fx.nativeTypography ?? qaAvatarTestTypography(),
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpAvatarQaHarness(
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
  await tester.pumpWidget(pumpAvatarQaApp(
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

Future<void> pumpAvatarQaHarnessSettled(
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
  await tester.pumpWidget(pumpAvatarQaApp(
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

Finder avatarRootFinder() => find.byType(OneUiAvatar);

SemanticsData avatarSemanticsData(WidgetTester tester, {String? semanticsLabel}) {
  final finder = semanticsLabel != null
      ? find.bySemanticsLabel(semanticsLabel)
      : avatarRootFinder();
  return tester.getSemantics(finder).getSemanticsData();
}

/// Canonical container px from the synthetic Avatar design system. Used by
/// assertions that must NOT re-parse tokens (otherwise the test is circular).
const Map<String, double> kQaAvatarContainerPx = {
  '2xs': 16,
  'xs': 20,
  's': 32,
  'm': 40,
  'l': 48,
  'xl': 64,
  '2xl': 80,
};

/// Canonical icon px per size from the synthetic Avatar design system.
const Map<String, double> kQaAvatarIconPx = {
  '2xs': 16,
  'xs': 12,
  's': 16,
  'm': 20,
  'l': 24,
  'xl': 32,
  '2xl': 40,
};
