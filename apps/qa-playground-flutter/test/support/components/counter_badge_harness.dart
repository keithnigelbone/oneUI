/// CounterBadge harness for QA playground widget tests.
///
/// Mirrors [badge_harness.dart]: production-grade Jio Convex fixture renders
/// the `OneUiCounterBadge` byte-identical to what users see in
/// `qa-playground:flutter`. No synthetic palette, no algorithmic drift,
/// no false confidence.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

export '../pump_one_ui_app.dart' show pumpOneUiQaApp, pumpOneUiQaHarness, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Synthetic CounterBadge token payload — only used by fallback / token-warning
/// tests where the production Jio config is intentionally NOT loaded. Mirrors
/// the Figma matrix (5 sizes × 3 attentions). Distinct so size/attention
/// assertions fail loudly when a prop is silently ignored.
NativeDesignSystemPayload qaCounterBadgeTestDesignSystem() {
  final props = <String, dynamic>{
    '--CounterBadge-fontWeight': '500',
    '--CounterBadge-borderRadius': '9999px',
  };

  // Distinct heights per size mirror `--CounterBadge-height-*` production Jio.
  const heightBySize = {'xs': 12, 's': 14, 'm': 16, 'l': 20, 'xl': 24};
  const padHBySize = {'xs': 2, 's': 3, 'm': 4, 'l': 5, 'xl': 6};
  const fontSizeBySize = {'xs': 9, 's': 10, 'm': 11, 'l': 12, 'xl': 13};

  for (final size in ['xs', 's', 'm', 'l', 'xl']) {
    props['--CounterBadge-height-$size'] = '${heightBySize[size]}px';
    props['--CounterBadge-paddingHorizontal-$size'] = '${padHBySize[size]}px';
    props['--CounterBadge-fontSize-$size'] = '${fontSizeBySize[size]}px';
    props['--CounterBadge-lineHeight-$size'] = '${(fontSizeBySize[size]! * 1.4).round()}px';
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
        '--Stroke-M': '1px',
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

NativeTypographySnapshot qaCounterBadgeTestTypography() {
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

Widget pumpCounterBadgeQaApp(
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

  // Use `OneUiSurfaceBootstrap` (NOT a bare `OneUiSurfaceScope`) so the outer
  // `OneUiRootSurfaceScope` is also provided. Production parity with Badge
  // harness — see `apps/qa-playground-flutter/test/support/components/badge_harness.dart`.
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography ?? qaCounterBadgeTestTypography(),
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpCounterBadgeQaHarness(
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
  await tester.pumpWidget(pumpCounterBadgeQaApp(
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

Future<void> pumpCounterBadgeQaHarnessSettled(
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
  await tester.pumpWidget(pumpCounterBadgeQaApp(
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

Finder counterBadgeRootFinder() => find.byType(OneUiCounterBadge);

/// Inner [DecoratedBox] fill for the counter chip (bold/subtle/ghost shell).
BoxDecoration counterBadgeBoxDecoration(WidgetTester tester) {
  final decoratedBox = tester.widget<DecoratedBox>(find.descendant(
    of: counterBadgeRootFinder(),
    matching: find.byType(DecoratedBox),
  ));
  return decoratedBox.decoration as BoxDecoration;
}

SemanticsData counterBadgeSemanticsData(WidgetTester tester, {String? semanticsLabel}) {
  final finder = semanticsLabel != null
      ? find.bySemanticsLabel(semanticsLabel)
      : counterBadgeRootFinder();
  return tester.getSemantics(finder).getSemanticsData();
}

/// Token-table values mirrored from [qaCounterBadgeTestDesignSystem] so
/// functional tests can assert against the same numbers without re-parsing.
const Map<String, double> kQaCounterBadgeHeightBySize = {
  'xs': 12,
  's': 14,
  'm': 16,
  'l': 20,
  'xl': 24,
};
