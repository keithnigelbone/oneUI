/// Chip harness for QA playground widget tests.
///
/// Mirrors [checkbox_harness.dart] / [avatar_harness.dart]:
///   - [qaChipTestDesignSystem] — synthetic measurement DS (fixed px Chip tokens)
///     for non-visual size/layout assertions that must NOT re-parse tokens.
///   - [pumpChipQaHarness] — synthetic-DS pump for fast functional/a11y tests.
///   - [pumpChipJioHarness] / [pumpChipJioHarnessSettled] — real Jio Convex
///     fixture (production-parity) for goldens + real token resolution. Supports
///     `jioFixture` defaults + `darkMode` + `surfaceMode` + `surfaceAppearance`.
///   - Finders / accessors that read REAL rendered values (size, BoxDecoration,
///     SemanticsData) so behavioural assertions are never circular.
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

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart'
    show qaInputFieldTestDesignSystem, pumpOneUiQaApp;

/// Canonical Chip px from the synthetic measurement DS. Assertions read these
/// constants so they never re-parse the token they are validating (no circular
/// proof). Mirrors `--Chip-*` block in [qaComponentTestDesignSystem].
const Map<String, double> kQaChipHeightPx = {'s': 24, 'm': 28, 'l': 32};
const Map<String, double> kQaChipPaddingPx = {'s': 8, 'm': 10, 'l': 12};
const Map<String, double> kQaChipGapPx = {'s': 4, 'm': 4, 'l': 6};

NativeDesignSystemPayload qaChipTestDesignSystem() {
  final base = qaInputFieldTestDesignSystem();
  final merged = Map<String, dynamic>.from(base.componentCustomProperties)
    ..addAll({
      '--Chip-borderRadius': '9999px',
      '--Chip-fontWeight': '500',
      '--Chip-borderWidth': '1px',
      '--Chip-height-s': '24px',
      '--Chip-height-m': '28px',
      '--Chip-height-l': '32px',
      '--Chip-paddingHorizontal-s': '8px',
      '--Chip-paddingHorizontal-m': '10px',
      '--Chip-paddingHorizontal-l': '12px',
      '--Chip-gap-s': '4px',
      '--Chip-gap-m': '4px',
      '--Chip-gap-l': '6px',
      '--Chip-fontSize-s': '12px',
      '--Chip-fontSize-m': '14px',
      '--Chip-fontSize-l': '16px',
      '--Chip-lineHeight-s': '17px',
      '--Chip-lineHeight-m': '20px',
      '--Chip-lineHeight-l': '22px',
      // slot affordances may live in chips
      '--Avatar-size-xs': '20px',
      '--Avatar-size-s': '32px',
      '--Avatar-borderRadius': '9999px',
      '--Motion-Duration-M': '200ms',
      '--Motion-Tap-Scale-Default': '3',
      '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.5, 0, 0.3, 1)',
    });
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': merged,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

Future<void> pumpChipQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpOneUiQaApp(
      child,
      designSystem: designSystem ?? qaChipTestDesignSystem(),
    ),
  );
  await tester.pumpAndSettle();
}

// ===========================================================================
// Jio-fixture golden harness — renders byte-identical to qa-playground:flutter
// using the real Convex-resolved Jio palette/surfaces/sizing. Use for golden /
// dark / surface visual-regression captures and any test that needs real token
// resolution (NOT the synthetic measurement DS).
//
// Mirrors checkbox_harness.dart / avatar_harness.dart: jioFixture + darkMode +
// surfaceMode params.
// ===========================================================================

const int _kChipDarkRootStep = 100;

Widget pumpChipJioApp(
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
      : (effectiveDark ? _kChipDarkRootStep : 2500);

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
Future<void> pumpChipJioHarness(
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
  await tester.pumpWidget(pumpChipJioApp(
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
Future<void> pumpChipJioHarnessSettled(
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
  await tester.pumpWidget(pumpChipJioApp(
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

// ---------------------------------------------------------------------------
// Finders + real-value accessors.
// ---------------------------------------------------------------------------

Finder chipRootFinder() => find.byType(OneUiChip);

/// The painted chrome (`AnimatedContainer` carrying the chip's `BoxDecoration`).
/// Used to measure the real rendered height and read the real fill/border.
Finder chipContainerFinder({Finder? within}) => find.descendant(
      of: within ?? chipRootFinder().first,
      matching: find.byType(AnimatedContainer),
    );

/// The label/slot `Row` inside the chip — measures intrinsic content width.
Finder chipRowFinder({Finder? within}) => find.descendant(
      of: within ?? chipRootFinder().first,
      matching: find.byType(Row),
    );

/// Real rendered chrome height (px) — reads `getSize`, never re-parses tokens.
double chipHeightPx(WidgetTester tester, {Finder? within}) =>
    tester.getSize(chipContainerFinder(within: within).first).height;

/// Interactive hit target — [OneUiFocusInteractive] including RN-style hit slop.
Finder chipInteractiveFinder({Finder? within}) => find.descendant(
      of: within ?? chipRootFinder().first,
      matching: find.byType(OneUiFocusInteractive),
    );

/// Real hit-test height (px) — includes transparent padding on touch platforms.
double chipHitTargetHeightPx(WidgetTester tester, {Finder? within}) =>
    tester.getSize(chipInteractiveFinder(within: within).first).height;

/// Real `BoxDecoration` painted on the chip chrome.
BoxDecoration chipDecoration(WidgetTester tester, {Finder? within}) {
  final container = tester
      .widget<AnimatedContainer>(chipContainerFinder(within: within).first);
  return container.decoration! as BoxDecoration;
}

/// Real fill colour.
Color? chipFill(WidgetTester tester, {Finder? within}) =>
    chipDecoration(tester, within: within).color;

/// Real border (top side) colour.
Color chipBorderColor(WidgetTester tester, {Finder? within}) =>
    (chipDecoration(tester, within: within).border! as Border).top.color;

/// Real border width.
double chipBorderWidth(WidgetTester tester, {Finder? within}) =>
    (chipDecoration(tester, within: within).border! as Border).top.width;

/// Real label `Text` widget inside the chip.
Text chipLabelText(WidgetTester tester, String label, {Finder? within}) {
  final finder = find.descendant(
    of: within ?? chipRootFinder().first,
    matching: find.text(label),
  );
  return tester.widget<Text>(finder.first);
}

/// Real disabled-dim `Opacity` wrapping the chip chrome.
double chipOpacity(WidgetTester tester, {Finder? within}) {
  final op = tester.widget<Opacity>(find
      .descendant(
        of: within ?? chipRootFinder().first,
        matching: find.byType(Opacity),
      )
      .first);
  return op.opacity;
}

/// The padding band around the chip chrome (left/right horizontal padding).
EdgeInsets chipPadding(WidgetTester tester, {Finder? within}) {
  final padding = tester.widget<Padding>(find
      .descendant(
        of: chipContainerFinder(within: within).first,
        matching: find.byType(Padding),
      )
      .first);
  return padding.padding.resolve(TextDirection.ltr);
}

/// The toggle (button + selected) Semantics node finder by accessible name.
///
/// The chip renders TWO button-semantics widgets: the outer toggle node
/// (`Semantics(button:true, selected:…)`) and the inner [OneUiFocusInteractive]
/// node (button only, `ExcludeSemantics`-wrapped). Only the outer one declares a
/// `selected` toggle state, so we require `props.selected != null` to target it
/// uniquely (the inner widget still exists in the element tree).
Finder chipSemanticsLabel(String label) {
  return find.descendant(
    of: chipRootFinder(),
    matching: find.byWidgetPredicate((widget) {
      if (widget is! Semantics) return false;
      final props = widget.properties;
      return props.button == true &&
          props.selected != null &&
          props.label == label;
    }),
  );
}

/// Real `SemanticsData` for the chip's toggle node. Asserting on this is the
/// only honest way to verify role / selected / enabled state.
SemanticsData chipSemanticsData(
  WidgetTester tester, {
  String? label,
}) {
  final finder = label != null ? chipSemanticsLabel(label) : chipRootFinder();
  expect(finder, findsWidgets);
  return tester.getSemantics(finder.first).getSemanticsData();
}

void expectChipSelected(
  WidgetTester tester, {
  required bool selected,
  String? label,
}) {
  withSemanticsHandle(tester, () {
    final data = chipSemanticsData(tester, label: label);
    expect(
        data.hasFlag(SemanticsFlag.hasToggledState) ||
            data.hasFlag(SemanticsFlag.hasSelectedState),
        isTrue,
        reason: 'chip toggle exposes a selected/toggled state');
    final isSel = data.hasFlag(SemanticsFlag.isSelected) ||
        data.hasFlag(SemanticsFlag.isToggled);
    expect(isSel, selected);
  });
}

void expectChipDisabled(WidgetTester tester, {String? label}) {
  withSemanticsHandle(tester, () {
    final data = chipSemanticsData(tester, label: label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
  });
}

void expectChipEnabled(WidgetTester tester, {String? label}) {
  withSemanticsHandle(tester, () {
    final data = chipSemanticsData(tester, label: label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
  });
}

/// Focus halo uses a [DecoratedBox] with two [BoxShadow]s (gap + outline) on
/// [OneUiFocusInteractive] — web `:focus-visible` parity probe.
int chipFocusHaloCount(WidgetTester tester) {
  var count = 0;
  for (final element in find.byType(DecoratedBox).evaluate()) {
    final decoration = (element.widget as DecoratedBox).decoration;
    if (decoration is BoxDecoration &&
        (decoration.boxShadow?.length ?? 0) >= 2) {
      count++;
    }
  }
  return count;
}
