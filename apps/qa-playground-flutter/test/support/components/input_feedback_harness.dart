/// InputFeedback harness for QA playground widget tests.
///
/// Mirrors [icon_button_harness.dart]:
///   - Re-exports [pumpInputQaHarness] as [pumpInputFeedbackQaHarness] — synthetic
///     DS for offline functional/a11y/figma/platform tiers.
///   - [pumpInputFeedbackJioHarnessSettled] — real Jio fixture for goldens + E2E.
///   - Real-value accessors ([inputFeedbackSemanticsData], [inputFeedbackHasLiveRegion],
///     [inputFeedbackProbedPayloadKey], [inputFeedbackBackgroundColor]) — never
///     re-parse the token under test.
///   - [ensureInputFeedbackIconsLoaded] — preload SVG catalog in `setUpAll`.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import 'input_harness.dart';
export 'input_harness.dart';

Future<void> ensureInputFeedbackIconsLoaded() => ensureInputIconsLoaded();

Finder inputFeedbackRootFinder() => find.byType(OneUiInputFeedback);

Finder inputFeedbackDecoratedBoxFinder() => find.descendant(
      of: inputFeedbackRootFinder(),
      matching: find.byWidgetPredicate((w) => w is DecoratedBox),
    );

Finder inputFeedbackIconFinder() => find.descendant(
      of: inputFeedbackRootFinder(),
      matching: find.byType(OneUiIcon),
    );

Finder inputFeedbackPayloadKeyFinder(String payloadKey) =>
    find.byKey(ValueKey<String>(payloadKey));

Finder inputFeedbackSemanticsFinder({String? label}) {
  if (label != null) return find.bySemanticsLabel(label);
  return find.descendant(
    of: inputFeedbackRootFinder(),
    matching: find.byWidgetPredicate(
      (w) =>
          w is Semantics &&
          ((w.properties.liveRegion ?? false) ||
              w.properties.role == SemanticsRole.alert),
    ),
  );
}

Color? inputFeedbackBackgroundColor(WidgetTester tester) {
  final box =
      tester.widget<DecoratedBox>(inputFeedbackDecoratedBoxFinder().first);
  return (box.decoration as BoxDecoration?)?.color;
}

String inputFeedbackProbedPayloadKey(WidgetTester tester) {
  final finder = find.descendant(
    of: inputFeedbackRootFinder(),
    matching: find.byWidgetPredicate(
      (w) =>
          w.key is ValueKey<String> &&
          (w.key! as ValueKey<String>)
              .value
              .startsWith('oneui-input-feedback|'),
    ),
  );
  expect(finder, findsOneWidget);
  final key = tester.widget<KeyedSubtree>(finder).key! as ValueKey<String>;
  return key.value;
}

SemanticsData inputFeedbackSemanticsData(WidgetTester tester, {String? label}) {
  final finder = inputFeedbackSemanticsFinder(label: label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

bool inputFeedbackHasLiveRegion(WidgetTester tester) {
  final finder = find.descendant(
    of: inputFeedbackRootFinder(),
    matching: find.byWidgetPredicate(
      (w) => w is Semantics && (w.properties.liveRegion ?? false),
    ),
  );
  return finder.evaluate().isNotEmpty;
}

bool inputFeedbackSemanticsIsLiveRegion(WidgetTester tester) =>
    inputFeedbackSemanticsData(tester).hasFlag(SemanticsFlag.isLiveRegion);

SemanticsRole? inputFeedbackProbedRole(WidgetTester tester) =>
    inputFeedbackSemanticsData(tester).role;

OneUiInputFeedbackVariant inputFeedbackVariantFromWire(String wire) {
  return OneUiInputFeedbackVariant.values
      .firstWhere((v) => v.wireValue == wire);
}

OneUiInputFeedbackAttention inputFeedbackAttentionFromWire(String wire) {
  return OneUiInputFeedbackAttention.values.firstWhere((a) => a.name == wire);
}

OneUiInputFeedbackSize inputFeedbackSizeFromWire(String wire) =>
    resolveOneUiInputFeedbackSize(wire);

bool inputFeedbackIsRendered(WidgetTester tester) =>
    inputFeedbackDecoratedBoxFinder().evaluate().isNotEmpty;

Future<void> pumpInputFeedbackQaHarness(
  WidgetTester tester,
  Widget child, {
  bool settle = true,
}) {
  return pumpInputQaHarness(tester, child, settle: settle);
}

Future<void> pumpInputFeedbackJioHarnessSettled(
  WidgetTester tester,
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) {
  return pumpInputJioHarnessSettled(
    tester,
    child,
    darkMode: darkMode,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  );
}
