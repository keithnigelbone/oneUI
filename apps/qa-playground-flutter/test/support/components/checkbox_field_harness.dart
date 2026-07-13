/// CheckboxField harness for QA playground widget tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';

import 'checkbox_harness.dart';
export 'checkbox_harness.dart';

Finder checkboxFieldSemanticsLabel(String label) {
  return find.descendant(
    of: find.byType(OneUiCheckboxField),
    matching: find.bySemanticsLabel(label),
  );
}

Finder fieldFeedbackSemanticsAnchor(String id) {
  return find.byWidgetPredicate(
    (widget) =>
        widget is Semantics &&
        widget.properties.identifier == '$id-feedback',
  );
}

Finder semanticsWithLiveRegionFinder() {
  return find.byWidgetPredicate(
    (widget) => widget is Semantics && (widget.properties.liveRegion ?? false),
  );
}

Finder checkboxFieldMultiContainerFinder(String fieldLabel) {
  return find.bySemanticsLabel(fieldLabel);
}

OneUiCheckbox readCheckboxWidget(
  WidgetTester tester, {
  String? testId,
  int index = 0,
}) {
  final Finder finder;
  if (testId != null) {
    finder = find.ancestor(
      of: find.byKey(ValueKey(testId)),
      matching: find.byType(OneUiCheckbox),
    );
  } else {
    finder = find.byType(OneUiCheckbox);
  }
  expect(finder, findsWidgets);
  return tester.widget<OneUiCheckbox>(testId != null ? finder : finder.at(index));
}

void expectCheckboxWidgetErrorHighlight(
  WidgetTester tester, {
  String? testId,
  required bool highlighted,
  int index = 0,
}) {
  expect(
    readCheckboxWidget(tester, testId: testId, index: index).errorHighlight,
    highlighted,
  );
}

SemanticsData checkboxFieldMultiContainerSemantics(
  WidgetTester tester,
  String fieldLabel,
) {
  final finder = checkboxFieldMultiContainerFinder(fieldLabel);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

int countCheckboxRoleSemantics(WidgetTester tester) {
  late int count;
  withSemanticsHandle(tester, () {
    count = find
        .descendant(
          of: find.byType(OneUiCheckboxField),
          matching: find.byWidgetPredicate((widget) {
            if (widget is! Semantics) return false;
            final props = widget.properties;
            return props.checked != null || props.mixed == true;
          }),
        )
        .evaluate()
        .length;
  });
  return count;
}

// ===========================================================================
// Jio-fixture golden harness for CheckboxField.
//
// The Jio pump helpers (`pumpCheckboxJioHarness*`, `darkMode`, `surfaceMode`,
// `surfaceAppearance`) are re-exported from `checkbox_harness.dart`; they take
// any `Widget child`, so they render an `OneUiCheckboxField` byte-identically to
// the qa-playground:flutter web app with production token resolution. The
// aliases below mirror the field naming so field golden/figma/platform suites
// read symmetrically with the Checkbox suite, while reusing the exact same
// pipeline (no second design-system to drift).
// ===========================================================================

/// Field-named alias of [pumpCheckboxJioHarnessSettled] for the golden suites.
Future<void> pumpCheckboxFieldJioHarnessSettled(
  WidgetTester tester,
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) {
  return pumpCheckboxJioHarnessSettled(
    tester,
    child,
    darkMode: darkMode,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  );
}

/// The whole field shell — pin golden capture to [oneUiGoldenCaptureFinder] via
/// [wrapOneUiGoldenChild] so the snapshot includes label, description, feedback
/// and dynamic rows without capturing the full 800×600 test surface.
Finder checkboxFieldRootFinder() => find.byType(OneUiCheckboxField);

// --- Field-specific content finders --------------------------------------

/// The label text node (rich span carrying the optional ` *` required suffix).
Finder checkboxFieldLabelFinder(String label) {
  return find.byWidgetPredicate(
    (widget) =>
        widget is Text &&
        (widget.data == label ||
            (widget.textSpan?.toPlainText().startsWith(label) ?? false)),
  );
}

/// The required asterisk — rendered as a ` *` suffix on the label rich text.
Finder checkboxFieldRequiredAsteriskFinder() => find.textContaining('*');

/// True when the field renders the required `*` marker (visual cue).
bool checkboxFieldHasRequiredAsterisk(WidgetTester tester) =>
    checkboxFieldRequiredAsteriskFinder().evaluate().isNotEmpty;

/// The default info IconButton ('info') rendered beside the label.
Finder checkboxFieldInfoIconFinder() => find.byType(OneUiIconButton);

/// True when the field renders the info icon affordance.
bool checkboxFieldHasInfoIcon(WidgetTester tester) =>
    checkboxFieldInfoIconFinder().evaluate().isNotEmpty;

/// The auto-rendered / slotted InputFeedback (error / feedback row).
Finder checkboxFieldFeedbackFinder() => find.byType(OneUiInputFeedback);

/// True when the field renders a feedback row.
bool checkboxFieldHasFeedback(WidgetTester tester) =>
    checkboxFieldFeedbackFinder().evaluate().isNotEmpty;

/// The description text node.
Finder checkboxFieldDescriptionFinder(String description) =>
    find.text(description);

/// Read the inner checkbox's real `SemanticsData` for the field's accessible
/// name. Wraps the shared [checkboxSemanticsData].
SemanticsData checkboxFieldControlSemantics(
  WidgetTester tester,
  String accessibleName, {
  bool? checked,
}) =>
    checkboxSemanticsData(tester, accessibleName, checked: checked);
