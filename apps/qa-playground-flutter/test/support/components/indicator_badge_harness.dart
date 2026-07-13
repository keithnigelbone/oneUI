/// IndicatorBadge harness for QA playground widget tests.
///
/// Mirrors [badge_harness.dart]: production-grade Jio Convex fixture renders
/// the `OneUiIndicatorBadge` byte-identical to what users see in
/// `qa-playground:flutter`. No synthetic palette, no algorithmic drift,
/// no false confidence.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_overlay.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

export '../pump_one_ui_app.dart' show pumpOneUiQaApp, pumpOneUiQaHarness, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Captures [debugPrint] output during [body] — for asserting dev warnings.
Future<List<String>> captureIndicatorBadgeDebugPrints(
  Future<void> Function() body,
) async {
  final captured = <String>[];
  final previous = debugPrint;
  debugPrint = (String? message, {int? wrapWidth}) {
    if (message != null) captured.add(message);
  };
  try {
    await body();
  } finally {
    debugPrint = previous;
  }
  return captured;
}

/// Synthetic IndicatorBadge token payload — only used by fallback / token-warning
/// tests where the production Jio config is intentionally NOT loaded.
NativeDesignSystemPayload qaIndicatorBadgeTestDesignSystem() {
  final props = <String, dynamic>{
    '--IndicatorBadge-borderRadius': '9999px',
  };

  // Distinct sizes per Figma matrix: xs=4 / s=6 / m=8 / l=10 / xl=12.
  const sizeBy = {'xs': 4, 's': 6, 'm': 8, 'l': 10, 'xl': 12};
  for (final size in ['xs', 's', 'm', 'l', 'xl']) {
    props['--IndicatorBadge-size-$size'] = '${sizeBy[size]}px';
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

NativeTypographySnapshot qaIndicatorBadgeTestTypography() {
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

const int _kDarkRootStep = 100;

Widget pumpIndicatorBadgeQaApp(
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
        nativeTypography: fx.nativeTypography ?? qaIndicatorBadgeTestTypography(),
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpIndicatorBadgeQaHarness(
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
  await tester.pumpWidget(pumpIndicatorBadgeQaApp(
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

Future<void> pumpIndicatorBadgeQaHarnessSettled(
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
  await tester.pumpWidget(pumpIndicatorBadgeQaApp(
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

Finder indicatorBadgeRootFinder() => find.byType(OneUiIndicatorBadge);

/// Painted dot fill/stroke on [OneUiIndicatorBadge] (excludes overlay host chrome).
Finder indicatorBadgeDotDecoratedBoxFinder() => find.descendant(
      of: indicatorBadgeRootFinder(),
      matching: find.byType(DecoratedBox),
    );

BoxDecoration indicatorBadgeDotDecoration(WidgetTester tester) {
  return tester.widget<DecoratedBox>(indicatorBadgeDotDecoratedBoxFinder())
      .decoration as BoxDecoration;
}

/// Outward surface ring on [OneUiIndicatorBadgeOverlay] bottomEnd (circle fill, not border).
Finder indicatorBadgeOverlaySurfaceRingFinder() => find.descendant(
      of: find.byType(OneUiIndicatorBadgeOverlay),
      matching: find.byWidgetPredicate((w) {
        if (w is! DecoratedBox) return false;
        final dec = w.decoration;
        return dec is BoxDecoration &&
            dec.shape == BoxShape.circle &&
            dec.color != null &&
            dec.border == null;
      }),
    );

SemanticsData indicatorBadgeSemanticsData(WidgetTester tester, {String? semanticsLabel}) {
  final finder = semanticsLabel != null
      ? find.bySemanticsLabel(semanticsLabel)
      : indicatorBadgeRootFinder();
  return tester.getSemantics(finder).getSemanticsData();
}

/// Token-table values mirrored from [qaIndicatorBadgeTestDesignSystem].
const Map<String, double> kQaIndicatorBadgeSizeBy = {
  'xs': 4,
  's': 6,
  'm': 8,
  'l': 10,
  'xl': 12,
};
