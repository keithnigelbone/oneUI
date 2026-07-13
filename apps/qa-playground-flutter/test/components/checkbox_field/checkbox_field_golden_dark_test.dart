/// CheckboxField visual-regression tests — DARK MODE subset.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import '../../support/components/checkbox_field_harness.dart';
import '../../support/golden_capture.dart';

const _kStates = <String>['unchecked', 'checked', 'indeterminate'];
const _kDarkAppearances = <String>['secondary', 'primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][dark] CheckboxField — state × appearance (dark)', () {
    for (final state in _kStates) {
      for (final app in _kDarkAppearances) {
        testWidgets('$state / $app (dark)', (tester) async {
          await pumpCheckboxFieldJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(
              OneUiCheckboxField(
                label: 'Field',
                appearance: app,
                checked: state == 'checked',
                indeterminate: state == 'indeterminate',
              ),
            ),
            darkMode: true,
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/dark/checkbox_field_dark_${state}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden][dark] CheckboxField — field affordances (dark)', () {
    testWidgets('label + description (dark)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(
            label: 'Subscribe',
            description: 'Weekly digest only.',
            checked: true,
          ),
        ),
        darkMode: true,
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/dark/checkbox_field_dark_label_description.png'),
      );
    });

    testWidgets('feedback error (dark)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(
            label: 'Confirm',
            error: 'Please complete verification.',
          ),
        ),
        darkMode: true,
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/dark/checkbox_field_dark_feedback_error.png'),
      );
    });

    testWidgets('required asterisk (dark)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(label: 'Accept terms', required: true),
        ),
        darkMode: true,
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/dark/checkbox_field_dark_required.png'),
      );
    });
  });

  group('[golden][dark] CheckboxField — readOnly (dark)', () {
    for (final state in ['checked', 'indeterminate']) {
      testWidgets('readonly / $state (dark)', (tester) async {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(
            OneUiCheckboxField(
              label: 'Locked',
              readOnly: true,
              checked: state == 'checked',
              indeterminate: state == 'indeterminate',
            ),
          ),
          darkMode: true,
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/dark/checkbox_field_dark_readonly_$state.png'),
        );
      });
    }
  });
}
