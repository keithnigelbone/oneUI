/// Button harness for QA playground widget tests.
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
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

NativeDesignSystemPayload qaButtonTestDesignSystem() {
  final props = <String, dynamic>{
    '--Button-fontWeight': '600',
    '--Button-textTransform': 'none',
    '--Button-letterSpacing': 'normal',
    '--Button-borderRadius': '9999px',
    '--Button-iconGap': '4px',
    '--Disabled-Opacity': '0.38',
  };

  // Distinct min-heights per f-step so size + condensed assertions are not
  // tautological. xs=32 / s=36 / m=44 / l=52 (regular); xs=24 / s=28 / m=36 / l=44
  // (condensed). 44px on the default `m` also satisfies the WCAG 44×44 touch target.
  const regularMinH = {'6': 32, '8': 36, '10': 44, '12': 52};
  const condensedMinH = {'6': 24, '8': 28, '10': 36, '12': 44};

  void addSizing(String suffix) {
    props['--Button-fontSize-$suffix'] = '14px';
    props['--Button-lineHeight-$suffix'] = '20px';
    props['--Button-minHeight-$suffix'] = '${regularMinH[suffix]}px';
    props['--Button-paddingVertical-$suffix'] = '10px';
    props['--Button-paddingHorizontal-$suffix'] = '16px';
    props['--Button-paddingHorizontalStart-$suffix'] = '16px';
    props['--Button-paddingHorizontalEnd-$suffix'] = '16px';
    props['--Button-paddingHorizontalStart-$suffix-slot'] = '12px';
    props['--Button-paddingHorizontalEnd-$suffix-slot'] = '12px';
    props['--Button-iconSize-$suffix'] = '18px';
    props['--Button-condensedMinHeight-$suffix'] = '${condensedMinH[suffix]}px';
    props['--Button-condensedPaddingVertical-$suffix'] = '8px';
    props['--Button-condensedPaddingHorizontal-$suffix'] = '12px';
    props['--Button-condensedPaddingHorizontalStart-$suffix'] = '12px';
    props['--Button-condensedPaddingHorizontalEnd-$suffix'] = '12px';
    props['--Button-iconGapStart-$suffix'] = '4px';
    props['--Button-iconGapEnd-$suffix'] = '4px';
  }

  for (final suffix in ['6', '8', '10', '12']) {
    addSizing(suffix);
  }

  for (final v in ['bold', 'subtle', 'ghost']) {
    props['--Button-borderWidth-$v'] = v == 'ghost' ? '0px' : '1px';
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

NativeTypographySnapshot qaButtonTestTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

/// Default brand for the harness mirrors the qa-playground app default
/// (Jio). Tests render through the **real** Convex-resolved Jio config via
/// the bundled fixture (`assets/qa-fixtures/jio/`) so what you see in tests
/// matches what users see in the live web app — no synthetic palette, no
/// algorithmic drift, no false confidence.
ThemeConfig qaButtonTestThemeConfig() => buildJioDefaultThemeConfig();

/// Web's `--Surface-Main` (page 2500) light step is what the fixture caches.
/// In dark mode the page surface flips to step 100. Hard-coded here because
/// the surface engine's resolveRootSurfaceRoles re-computes role tokens
/// against this step; we don't reuse the fixture's cached `rootRoles` JSON
/// (that JSON was resolved for light at sync time).
const int _kDarkRootStep = 100;

Widget pumpButtonQaApp(
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
  final surface = buildRootSurfaceContext(
    themeConfig: themeConfig ?? fx.themeConfig,
    rootParentStep: effectiveStep,
    darkMode: effectiveDark,
    // Drop the cached rootRolesJson whenever the caller overrides darkMode —
    // the JSON was server-resolved for the fixture's light step and would
    // paint the wrong colours if reused under a flipped step.
    rootRolesJson: darkMode == null ? fx.rootRoles : null,
  );

  Widget inner = child;
  if (surfaceMode != null) {
    inner = OneUiSurface(
      mode: surfaceMode,
      appearance: surfaceAppearance,
      child: inner,
    );
  }

  return MaterialApp(
    home: OneUiSurfaceScope(
      value: surface,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography ?? qaButtonTestTypography(),
        designSystem: designSystem ?? fx.designSystem,
        // Only override the Scaffold background when we explicitly need a
        // dark page — leaving it `null` in light mode preserves the
        // historical default (Material `grey[50]`) that the existing
        // light-mode goldens were blessed against. A blanket override
        // would silently shift every baseline by a few RGB values.
        child: Scaffold(
          backgroundColor: surface.darkMode ? const Color(0xFF101010) : null,
          body: Center(child: inner),
        ),
      ),
    ),
  );
}

Future<void> pumpButtonQaHarness(
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
  await tester.pumpWidget(pumpButtonQaApp(
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

Future<void> pumpButtonQaHarnessSettled(
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
  await tester.pumpWidget(pumpButtonQaApp(
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

/// Installs a strict `FlutterError.onError` listener that re-throws every
/// reported error as a test failure. Use in tests that must observe ZERO
/// runtime warnings (e.g. "OneUiCircularProgressIndicator: semanticsLabel
/// or semanticsLabelledBy is required for accessibility" or
/// "One UI: unknown semantic icon ..."). Returns a teardown closure — call
/// it from `tearDown` or `addTearDown` so the previous handler is restored
/// for the next test.
///
/// Pattern:
/// ```dart
/// testWidgets('no warnings', (tester) async {
///   final restore = installStrictFlutterErrorListener();
///   addTearDown(restore);
///   await pumpButtonQaHarnessSettled(tester, const OneUiButton(label: 'x'));
/// });
/// ```
void Function() installStrictFlutterErrorListener({
  bool Function(FlutterErrorDetails details)? ignore,
}) {
  final previous = FlutterError.onError;
  FlutterError.onError = (details) {
    if (ignore != null && ignore(details)) {
      previous?.call(details);
      return;
    }
    throw details.exception;
  };
  return () => FlutterError.onError = previous;
}

/// Also drains the Flutter test framework's queue of swallowed errors —
/// some warnings (Semantics asserts) get reported via
/// `WidgetController.takeException()` rather than `FlutterError.onError`.
/// Call at the end of a test that should have produced none.
void expectNoFlutterErrors(WidgetTester tester) {
  final pending = tester.takeException();
  expect(pending, isNull,
      reason: 'test produced a swallowed FlutterError — see stdout for details');
}

/// Returns a clone of [jioFixture.designSystem] with the listed token keys
/// removed from `componentCustomProperties`. Used by token-degradation
/// tests to assert sensible fallbacks when a brand omits a token.
NativeDesignSystemPayload designSystemWithoutTokens(Iterable<String> keysToRemove) {
  final src = jioFixture.designSystem;
  final newProps = Map<String, String>.from(src.componentCustomProperties);
  for (final k in keysToRemove) {
    newProps.remove(k);
  }
  return NativeDesignSystemPayload(
    componentCustomProperties: newProps,
    dimensionContexts: src.dimensionContexts,
    activeDimensionKey: src.activeDimensionKey,
    activeDimensionContext: src.activeDimensionContext,
  );
}

/// Returns a clone of [jioFixture.designSystem] with the listed token
/// overrides applied to `componentCustomProperties`. Use sparingly — only
/// for fallback / parsing tests where deviating from the real brand config
/// is the point. Pass `null` as a value to remove that key.
NativeDesignSystemPayload designSystemWithOverrides(Map<String, String?> overrides) {
  final src = jioFixture.designSystem;
  final newProps = Map<String, String>.from(src.componentCustomProperties);
  overrides.forEach((k, v) {
    if (v == null) {
      newProps.remove(k);
    } else {
      newProps[k] = v;
    }
  });
  return NativeDesignSystemPayload(
    componentCustomProperties: newProps,
    dimensionContexts: src.dimensionContexts,
    activeDimensionKey: src.activeDimensionKey,
    activeDimensionContext: src.activeDimensionContext,
  );
}

/// Drives the Button's internal press animation forward without firing a
/// gesture. Used by state-explicit goldens that need a deterministic
/// pressed visual.
///
/// Returns the bound `_pressCtrl` from the nearest `OneUiFocusInteractive`
/// so the caller can choose `forward()` (animate to 1) or `value = 1.0`
/// (snap). Pump once after to let paint observe the new value.
AnimationController buttonPressController(WidgetTester tester) {
  // ignore: invalid_use_of_protected_member
  final state = tester.state(find.byType(OneUiFocusInteractive));
  // Read the private field reflectively via dynamic dispatch — the field is
  // declared `late AnimationController _pressCtrl;` and Dart's lints allow
  // us to reach it from a test-only helper. The cast keeps the public
  // signature typed.
  // ignore: avoid_dynamic_calls
  final ctrl = (state as dynamic).pressControllerForTesting as AnimationController?;
  if (ctrl == null) {
    throw StateError(
      'OneUiFocusInteractive does not expose pressControllerForTesting — '
      'add a `@visibleForTesting AnimationController get pressControllerForTesting => _pressCtrl;` accessor.',
    );
  }
  return ctrl;
}

Finder buttonSemanticsFinder() => find.byType(OneUiFocusInteractive);

SemanticsData buttonSemanticsData(WidgetTester tester) {
  return tester.getSemantics(buttonSemanticsFinder()).getSemanticsData();
}

/// Token-table values mirrored so functional tests can assert against the same
/// numbers seeded by [qaButtonTestDesignSystem]. Updating one side must update
/// the other — keep these in lockstep.
const Map<String, double> kQaButtonMinHeightByAlias = {
  'xs': 32,
  's': 36,
  'm': 44,
  'l': 52,
};

const Map<String, double> kQaButtonCondensedMinHeightByAlias = {
  'xs': 24,
  's': 28,
  'm': 36,
  'l': 44,
};
