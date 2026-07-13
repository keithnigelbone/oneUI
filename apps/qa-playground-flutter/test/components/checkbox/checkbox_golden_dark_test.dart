/// Checkbox visual-regression tests — DARK MODE subset.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';

import '../../support/components/checkbox_harness.dart';
import '../../support/golden_capture.dart';

const _kStates = <String>['unchecked', 'checked', 'indeterminate'];
const _kDarkAppearances = <String>['secondary', 'primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][dark] Checkbox — state × appearance (dark)', () {
    for (final state in _kStates) {
      for (final app in _kDarkAppearances) {
        testWidgets('$state / $app (dark)', (tester) async {
          await pumpCheckboxJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(
              OneUiCheckbox(
                ariaLabel: 'cb',
                appearance: app,
                checked: state == 'checked',
                indeterminate: state == 'indeterminate',
              ),
            ),
            darkMode: true,
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/dark/checkbox_dark_${state}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden][dark] Checkbox — readOnly (dark)', () {
    for (final state in ['checked', 'indeterminate']) {
      testWidgets('readonly / $state (dark)', (tester) async {
        await pumpCheckboxJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(
            OneUiCheckbox(
              ariaLabel: 'cb',
              readOnly: true,
              checked: state == 'checked',
              indeterminate: state == 'indeterminate',
            ),
          ),
          darkMode: true,
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/dark/checkbox_dark_readonly_$state.png'),
        );
      });
    }
  });
}
