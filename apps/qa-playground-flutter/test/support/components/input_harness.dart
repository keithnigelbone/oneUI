/// Input harness for QA playground widget tests.
///
/// Mirrors [icon_button_harness.dart]:
///   - [qaInputTestDesignSystem] — synthetic DS with distinct container heights
///     per f-step so size assertions are not circular.
///   - [pumpInputQaHarness] — offline synthetic pump.
///   - [pumpInputJioHarnessSettled] — Jio fixture for goldens + E2E.
///   - Real-value accessors (shell height, decoration, TextField, Semantics).
library;

import '../semantics_helpers.dart';

export '../pump_one_ui_app.dart'
    show
        qaInputFieldTestDesignSystem,
        pumpOneUiQaApp,
        pumpOneUiQaHarness,
        kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/touch_target_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestDesignSystem, pumpOneUiQaApp;

/// Container minHeight per numeric f-step — locked to [qaInputTestDesignSystem].
const Map<int, double> kQaInputContainerHeightPx = {
  6: 28,
  8: 32,
  10: 40,
  12: 48,
};

/// Expected shell minHeight — token f-step height clamped to WCAG touch floor on
/// touch-first platforms (mirrors [enforceButtonTouchMinHeight] in [OneUiInput]).
double expectedInputShellHeightPx(
  int numericSize, {
  String platformId = 'S-360',
}) {
  final tokenHeight = kQaInputContainerHeightPx[numericSize]!;
  if (!isTouchFirstV2PlatformId(platformId)) {
    return tokenHeight;
  }
  return math.max(tokenHeight, kOneUiWcagTouchTargetMinPx);
}

NativeDesignSystemPayload qaInputTestDesignSystem() {
  final base = qaInputFieldTestDesignSystem();
  final props = Map<String, dynamic>.from(base.componentCustomProperties);

  const heights = {
    '6': 28.0,
    '8': 32.0,
    '10': 40.0,
    '12': 48.0,
  };
  for (final entry in heights.entries) {
    props['--Input-height-${entry.key}'] = '${entry.value.toInt()}px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

Future<void> ensureInputIconsLoaded() async {
  TestWidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();
}

Future<void> pumpInputQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  bool settle = true,
}) async {
  await ensureInputIconsLoaded();
  await tester.pumpWidget(
    pumpOneUiQaApp(
      child,
      designSystem: designSystem ?? qaInputTestDesignSystem(),
    ),
  );
  if (settle) {
    await tester.pumpAndSettle();
  } else {
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 16));
  }
}

const int _kInputDarkRootStep = 100;

Widget pumpInputJioApp(
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
      : (effectiveDark ? _kInputDarkRootStep : 2500);

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
              child: SizedBox(width: 348, child: inner),
            ),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpInputJioHarness(
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
  await ensureInputIconsLoaded();
  await tester.pumpWidget(pumpInputJioApp(
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

Future<void> pumpInputJioHarnessSettled(
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
  await ensureInputIconsLoaded();
  await tester.pumpWidget(pumpInputJioApp(
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

Finder inputRootFinder() => find.byType(OneUiInput);

Finder inputTextFieldFinder() => find.descendant(
      of: inputRootFinder(),
      matching: find.byType(TextField),
    );

TextField inputTextField(WidgetTester tester) =>
    tester.widget<TextField>(inputTextFieldFinder().first);

/// Bordered shell: `AnimatedContainer` with `BoxDecoration` inside [OneUiInput].
Finder inputShellFinder({Finder? within}) => find.descendant(
      of: within ?? inputRootFinder(),
      matching: find.byWidgetPredicate((w) {
        if (w is! AnimatedContainer) return false;
        final dec = w.decoration;
        return dec is BoxDecoration && dec.border != null;
      }),
    );

double inputShellHeightPx(WidgetTester tester, {Finder? within}) {
  final shell = tester.widget<AnimatedContainer>(
    inputShellFinder(within: within).first,
  );
  return shell.constraints?.minHeight ?? tester.getSize(inputShellFinder(within: within).first).height;
}

BoxDecoration inputShellDecoration(WidgetTester tester, {Finder? within}) {
  final shell = tester.widget<AnimatedContainer>(
    inputShellFinder(within: within).first,
  );
  return shell.decoration! as BoxDecoration;
}

SemanticsData inputControlSemanticsData(WidgetTester tester) {
  final finder = find.descendant(
    of: inputRootFinder(),
    matching: find.byWidgetPredicate(
      (w) => w is Semantics && (w.properties.textField ?? false),
    ),
  );
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

TextStyle? inputControlTextStyle(WidgetTester tester) =>
    inputTextField(tester).style;
