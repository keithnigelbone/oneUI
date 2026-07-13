/// InputField harness for QA playground widget tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';

import 'input_harness.dart';
export 'input_harness.dart';

Finder inputFieldRootFinder() => find.byType(OneUiInputField);

Finder inputFieldLabelFinder(String label) =>
    find.descendant(of: inputFieldRootFinder(), matching: find.text(label));

Finder inputFieldRequiredAsteriskFinder() {
  return find.descendant(
    of: inputFieldRootFinder(),
    matching: find.textContaining(' *'),
  );
}

bool inputFieldHasRequiredAsterisk(WidgetTester tester) =>
    inputFieldRequiredAsteriskFinder().evaluate().isNotEmpty;

Finder inputFieldInfoIconFinder() => find.descendant(
      of: inputFieldRootFinder(),
      matching: find.byWidgetPredicate(
        (w) => w.runtimeType.toString().contains('OneUiIconButton'),
      ),
    );

Finder inputFieldFeedbackFinder() => find.descendant(
      of: inputFieldRootFinder(),
      matching: find.byType(OneUiInputFeedback),
    );

Finder inputFieldDescriptionFinder(String text) => find.descendant(
      of: inputFieldRootFinder(),
      matching: find.text(text),
    );

Finder inputFieldDynamicTextFinder() => find.descendant(
      of: inputFieldRootFinder(),
      matching: find.byType(OneUiInputDynamicText),
    );

Finder inputFieldInnerInputFinder() => find.descendant(
      of: inputFieldRootFinder(),
      matching: find.byType(OneUiInput),
    );

Finder inputFieldSemanticsAnchor(String id) => find.byWidgetPredicate(
      (w) => w is Semantics && w.properties.identifier == id,
    );

SemanticsData inputFieldControlSemanticsData(WidgetTester tester) {
  final finder = find.descendant(
    of: inputFieldRootFinder(),
    matching: find.byWidgetPredicate(
      (w) => w is Semantics && (w.properties.textField ?? false),
    ),
  );
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

/// Inner [OneUiInput] shell minHeight — uses the synthetic DS pin heights.
double inputFieldShellHeightPx(WidgetTester tester) =>
    inputShellHeightPx(tester, within: inputFieldInnerInputFinder());

Set<String>? inputFieldDescribedByNodeIds(WidgetTester tester) {
  return inputFieldControlSemanticsData(tester).controlsNodes;
}

bool inputFieldHasInfoIcon(WidgetTester tester) =>
    inputFieldInfoIconFinder().evaluate().isNotEmpty;

/// Field-named alias of [pumpInputJioHarnessSettled] for golden/e2e suites.
Future<void> pumpInputFieldJioHarnessSettled(
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

Future<void> pumpInputFieldQaHarness(
  WidgetTester tester,
  Widget child, {
  bool settle = true,
}) {
  return pumpInputQaHarness(tester, child, settle: settle);
}
