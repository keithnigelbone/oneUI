/// Checkbox harness for QA playground widget tests.
library;

import '../pump_one_ui_app.dart';
import '../semantics_helpers.dart';
import '../test_widgets_all_platforms.dart';

export '../pump_one_ui_app.dart'
    show
        qaInputFieldTestDesignSystem,
        pumpOneUiQaApp,
        pumpOneUiQaHarness,
        kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestDesignSystem, pumpOneUiQaApp;

NativeDesignSystemPayload qaCheckboxTestDesignSystem() {
  final base = qaInputFieldTestDesignSystem();
  final merged = Map<String, dynamic>.from(base.componentCustomProperties)
    ..addAll({
      '--Checkbox-boxSize-s': '16px',
      '--Checkbox-boxSize-m': '20px',
      '--Checkbox-boxSize-l': '24px',
      '--Checkbox-iconSize-s': '12px',
      '--Checkbox-iconSize-m': '16px',
      '--Checkbox-iconSize-l': '18px',
      '--Checkbox-borderRadius-s': '4px',
      '--Checkbox-borderRadius-m': '6px',
      '--Checkbox-borderRadius-l': '8px',
      '--CheckboxField-gap': '6px',
      '--CheckboxField-singleColumnGap': '4px',
      '--CheckboxField-singleRowGap': '4px',
      '--Checkbox-roleBold': 'var(--Secondary-Bold)',
      '--Checkbox-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Checkbox-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
    });
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': merged,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

Future<void> pumpCheckboxQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpOneUiQaApp(
      child,
      designSystem: designSystem ?? qaCheckboxTestDesignSystem(),
    ),
  );
  await tester.pumpAndSettle();
}

// ===========================================================================
// Jio-fixture golden harness — renders byte-identical to the qa-playground:
// flutter web app using the real Convex-resolved Jio palette/surfaces/sizing.
// Use these for golden / dark / surface visual-regression captures and any
// test that needs real token resolution (NOT the synthetic measurement DS).
//
// Mirrors avatar_harness.dart: jioFixture + darkMode + surfaceMode params.
// ===========================================================================

const int _kCheckboxDarkRootStep = 100;

Widget pumpCheckboxJioApp(
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
      : (effectiveDark ? _kCheckboxDarkRootStep : 2500);

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
          body: Center(child: Padding(
            padding: const EdgeInsets.all(12),
            child: inner,
          )),
        ),
      ),
    ),
  );
}

/// Pump using the real Jio fixture, one extra 16ms tick (motion settle without
/// hanging on infinite animations).
Future<void> pumpCheckboxJioHarness(
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
  await tester.pumpWidget(pumpCheckboxJioApp(
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

/// Settled variant — waits for all transitions to finish before capture.
Future<void> pumpCheckboxJioHarnessSettled(
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
  await tester.pumpWidget(pumpCheckboxJioApp(
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

Finder checkboxRootFinder() => find.byType(OneUiCheckbox);

/// The interactive box (AnimatedContainer) inside the first checkbox. Used by
/// measurement / paint inspection tests.
Finder checkboxBoxFinder({Finder? within}) => find.descendant(
      of: within ?? checkboxRootFinder().first,
      matching: find.byType(AnimatedContainer),
    );

/// Real rendered box size (px) — never re-parses tokens, so the assertion is
/// not circular.
double checkboxBoxSizePx(WidgetTester tester, {Finder? within}) =>
    tester.getSize(checkboxBoxFinder(within: within).first).width;

/// Real BoxDecoration painted on the checkbox box.
BoxDecoration checkboxBoxDecoration(WidgetTester tester, {Finder? within}) {
  final container =
      tester.widget<AnimatedContainer>(checkboxBoxFinder(within: within).first);
  return container.decoration! as BoxDecoration;
}

Finder checkboxSemanticsLabel(String label) {
  return find.descendant(
    of: find.byType(OneUiCheckbox),
    matching: find.byWidgetPredicate((widget) {
      if (widget is! Semantics) return false;
      final props = widget.properties;
      final isCheckbox = props.checked != null || props.mixed == true;
      return isCheckbox && props.label == label;
    }),
  );
}

Finder _checkboxControlSemanticsFinder({String? label}) {
  return find.descendant(
    of: find.byType(OneUiCheckbox),
    matching: find.byWidgetPredicate((widget) {
      if (widget is! Semantics) return false;
      final props = widget.properties;
      final isCheckbox = props.checked != null || props.mixed == true;
      if (!isCheckbox) return false;
      if (label == null) return true;
      return props.label == label;
    }),
  );
}

SemanticsData checkboxSemanticsData(
  WidgetTester tester,
  String label, {
  bool? checked,
}) {
  final scoped = checkboxSemanticsLabel(label);
  final candidates = scoped.evaluate().isNotEmpty
      ? scoped
      : _checkboxControlSemanticsFinder(label: label);
  expect(candidates, findsWidgets);

  for (var i = 0; i < candidates.evaluate().length; i++) {
    final data = tester.getSemantics(candidates.at(i)).getSemanticsData();
    if (checked == null) return data;
    if (!data.hasFlag(SemanticsFlag.hasCheckedState)) continue;
    if (data.hasFlag(SemanticsFlag.isChecked) == checked) return data;
  }
  fail('No checkbox semantics for "$label" with checked=$checked');
}

void expectCheckboxChecked(
  WidgetTester tester,
  String label, {
  required bool checked,
}) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label, checked: checked);
    expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isChecked), checked);
    expect(data.hasFlag(SemanticsFlag.isCheckStateMixed), isFalse);
  });
}

void expectCheckboxMixed(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isChecked), isFalse);
    expect(data.hasFlag(SemanticsFlag.isCheckStateMixed), isTrue);
  });
}

void expectCheckboxDisabled(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
  });
}

void expectCheckboxReadOnlyEnabled(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
  });
}
