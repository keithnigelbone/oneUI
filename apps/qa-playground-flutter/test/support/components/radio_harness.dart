/// Radio + RadioField harness for QA playground widget tests.
///
/// Two rendering modes (mirrors checkbox_harness.dart):
///   - [pumpRadioQaHarness] / [qaRadioTestDesignSystem] — synthetic measurement
///     DS with `--Radio-*` tokens pinned to fixed px (s=16 / m=20 / l=24 box,
///     s=8 / m=10 / l=12 dot), fully offline. Use for geometry + semantics +
///     interaction (size reads are deterministic and non-circular).
///   - [pumpRadioJioHarness] / [pumpRadioJioHarnessSettled] — real Jio Convex
///     fixture (production token resolution). Use for golden / dark / surface
///     captures and any test that inspects role colours (fill / border).
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/touch_target_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart';
import '../semantics_helpers.dart';

export '../pump_one_ui_app.dart'
    show
        qaInputFieldTestDesignSystem,
        pumpOneUiQaApp,
        pumpOneUiQaHarness,
        kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

// ===========================================================================
// Pinned size tokens — keep in sync with the assertions in the figma suite.
// ===========================================================================

const double kQaRadioBoxSPx = 16;
const double kQaRadioBoxMPx = 20;
const double kQaRadioBoxLPx = 24;
const Map<String, double> kQaRadioBoxPx = {
  's': kQaRadioBoxSPx,
  'm': kQaRadioBoxMPx,
  'l': kQaRadioBoxLPx,
};

const double kQaRadioDotSPx = 8;
const double kQaRadioDotMPx = 10;
const double kQaRadioDotLPx = 12;
const Map<String, double> kQaRadioDotPx = {
  's': kQaRadioDotSPx,
  'm': kQaRadioDotMPx,
  'l': kQaRadioDotLPx,
};

/// `--Disabled-Opacity` in the synthetic DS (see [qaInputFieldTestDesignSystem]).
const double kQaRadioDisabledOpacity = 0.38;

/// Synthetic measurement DS: pins every `--Radio-*` / `--RadioField-*` token so
/// box/dot geometry is deterministic and the size assertions are non-circular.
NativeDesignSystemPayload qaRadioTestDesignSystem() {
  final base = qaInputFieldTestDesignSystem();
  final merged = Map<String, dynamic>.from(base.componentCustomProperties)
    ..addAll({
      '--Radio-boxSize-s': '16px',
      '--Radio-boxSize-m': '20px',
      '--Radio-boxSize-l': '24px',
      '--Radio-dotSize-s': '8px',
      '--Radio-dotSize-m': '10px',
      '--Radio-dotSize-l': '12px',
      '--Radio-borderRadius-s': '9999px',
      '--Radio-borderRadius-m': '9999px',
      '--Radio-borderRadius-l': '9999px',
      '--RadioGroup-verticalGap': '14px',
      '--RadioGroup-horizontalGap': '16px',
      '--RadioField-gap': '6px',
      '--RadioField-singleColumnGap': '4px',
      '--RadioField-singleRowGap': '4px',
      '--Radio-roleBold': 'var(--Secondary-Bold)',
      '--Radio-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Radio-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
    });
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': merged,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

Future<void> pumpRadioQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpOneUiQaApp(
      child,
      designSystem: designSystem ?? qaRadioTestDesignSystem(),
    ),
  );
  await tester.pumpAndSettle();
}

// ===========================================================================
// Jio-fixture golden harness — byte-identical to the qa-playground:flutter web
// app (real Convex Jio palette/surfaces/sizing). Mirrors checkbox_harness.dart.
// ===========================================================================

const int _kRadioDarkRootStep = 100;

Widget pumpRadioJioApp(
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
      : (effectiveDark ? _kRadioDarkRootStep : 2500);

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
              child: inner,
            ),
          ),
        ),
      ),
    ),
  );
}

/// Pump using the real Jio fixture, one extra 16ms tick (motion settle without
/// hanging on infinite animations).
Future<void> pumpRadioJioHarness(
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
  await tester.pumpWidget(pumpRadioJioApp(
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
Future<void> pumpRadioJioHarnessSettled(
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
  await tester.pumpWidget(pumpRadioJioApp(
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

// ===========================================================================
// Finders + real-value readers (never re-parse tokens → no circular asserts).
// ===========================================================================

Finder radioRootFinder() => find.byType(OneUiRadio);
Finder radioFieldRootFinder() => find.byType(OneUiRadioField);
Finder radioGroupFinder() => find.byType(OneUiRadioGroup);

/// The interactive box ([AnimatedContainer] with `width == height`) inside the
/// first Radio. The inner dot is also an AnimatedContainer, so we filter on the
/// square outer box (height == resolved boxSize, and it carries a border).
Finder radioBoxFinder({Finder? within}) => find.descendant(
      of: within ?? radioRootFinder().first,
      matching: find.byWidgetPredicate((w) {
        if (w is! AnimatedContainer) return false;
        final d = w.decoration;
        return d is BoxDecoration && d.border != null;
      }),
    );

/// Touch-expanded hit area on mobile — parent [SizedBox] around [radioBoxFinder]
/// when the visual box is below `--Touch-Target-Min` (WCAG 2.5.5).
Finder radioControlTouchTargetFinder({Finder? within}) => find.ancestor(
      of: radioBoxFinder(within: within),
      matching: find.byWidgetPredicate((w) {
        if (w is! SizedBox) return false;
        final h = w.height;
        final wd = w.width;
        return h != null &&
            wd != null &&
            h == wd &&
            h >= kOneUiWcagTouchTargetMinPx;
      }),
    );

/// Real rendered box size (px) read straight from the laid-out widget.
double radioBoxSizePx(WidgetTester tester, {Finder? within}) =>
    tester.getSize(radioBoxFinder(within: within).first).width;

/// Real [BoxDecoration] painted on the radio box (fill + border + shadows).
BoxDecoration radioBoxDecoration(WidgetTester tester, {Finder? within}) {
  final container =
      tester.widget<AnimatedContainer>(radioBoxFinder(within: within).first);
  return container.decoration! as BoxDecoration;
}

/// Border colour of the radio box.
Color radioBorderColor(WidgetTester tester, {Finder? within}) =>
    (radioBoxDecoration(tester, within: within).border! as Border).top.color;

/// Whether an inner dot ([_RadioKnobIndicator]'s AnimatedContainer, the one with
/// NO border) is currently rendered inside the radio.
bool radioHasInnerDot(WidgetTester tester, {Finder? within}) {
  final dots = find.descendant(
    of: within ?? radioRootFinder().first,
    matching: find.byWidgetPredicate((w) {
      if (w is! AnimatedContainer) return false;
      final d = w.decoration;
      return d is BoxDecoration && d.border == null && d.color != null;
    }),
  );
  return dots.evaluate().isNotEmpty;
}

/// The outermost [Opacity] wrapping the Radio (disabled dimming).
double radioOpacity(WidgetTester tester, {Finder? within}) {
  final op = tester.widget<Opacity>(find
      .descendant(of: within ?? radioRootFinder().first, matching: find.byType(Opacity))
      .first);
  return op.opacity;
}

/// The outermost [Opacity] wrapping the RadioField.
double radioFieldOpacity(WidgetTester tester) {
  final op = tester.widget<Opacity>(find
      .descendant(of: radioFieldRootFinder(), matching: find.byType(Opacity))
      .first);
  return op.opacity;
}

// ===========================================================================
// Semantics — the radio control exposes hasCheckedState + isInMutuallyExclusive
// group (the radio role). Read merged SemanticsData, never a bare findsOneWidget.
// ===========================================================================

/// The radio control Semantics node (has a checked state) carrying [label].
Finder radioSemanticsFinder(String label) {
  return find.descendant(
    of: radioRootFinder(),
    matching: find.byWidgetPredicate((w) {
      if (w is! Semantics) return false;
      final p = w.properties;
      return p.checked != null && p.label == label;
    }),
  );
}

SemanticsData radioSemanticsData(
  WidgetTester tester,
  String label, {
  bool? checked,
}) {
  final scoped = radioSemanticsFinder(label);
  expect(scoped, findsWidgets, reason: 'no radio Semantics for "$label"');
  for (var i = 0; i < scoped.evaluate().length; i++) {
    final data = tester.getSemantics(scoped.at(i)).getSemanticsData();
    if (checked == null) return data;
    if (!data.hasFlag(SemanticsFlag.hasCheckedState)) continue;
    if (data.hasFlag(SemanticsFlag.isChecked) == checked) return data;
  }
  fail('No radio semantics for "$label" with checked=$checked');
}

void expectRadioChecked(
  WidgetTester tester,
  String label, {
  required bool checked,
}) {
  withSemanticsHandle(tester, () {
    final data = radioSemanticsData(tester, label, checked: checked);
    expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isChecked), checked);
  });
}

void expectRadioDisabled(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = radioSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
  });
}

void expectRadioEnabled(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = radioSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
  });
}

/// Convenience for building a single radio inside a minimal group (Radio
/// selection is owned by [OneUiRadioGroup]).
Widget radioInGroup(
  List<OneUiRadio> options, {
  String? value,
  String? defaultValue,
  ValueChanged<String>? onValueChange,
  bool disabled = false,
  bool readOnly = false,
  String orientation = 'vertical',
  String? appearance,
  String? size,
}) {
  return OneUiRadioGroup(
    value: value,
    defaultValue: defaultValue,
    onValueChange: onValueChange,
    disabled: disabled,
    readOnly: readOnly,
    orientation: orientation,
    appearance: appearance,
    size: size,
    children: options,
  );
}
