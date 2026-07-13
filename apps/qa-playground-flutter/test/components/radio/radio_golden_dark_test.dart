/// Radio visual-regression tests — DARK MODE subset.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

const _kStates = <String>['unchecked', 'checked'];
const _kDarkAppearances = <String>['secondary', 'primary', 'positive', 'negative'];

Widget _radio({required String state, String appearance = 'secondary', bool readOnly = false}) {
  final checked = state == 'checked';
  return OneUiRadioGroup(
    defaultValue: checked ? 'a' : null,
    readOnly: readOnly,
    children: [OneUiRadio(value: 'a', appearance: appearance, ariaLabel: 'r')],
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] Radio — state × appearance (dark)', () {
    for (final state in _kStates) {
      for (final app in _kDarkAppearances) {
        testWidgets('$state / $app (dark)', (tester) async {
          await pumpRadioJioHarnessSettled(
            tester,
            _radio(state: state, appearance: app),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiRadioGroup),
            matchesGoldenFile('goldens/dark/radio_dark_${state}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden][dark] Radio — readOnly (dark)', () {
    testWidgets('readonly / checked (dark)', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        _radio(state: 'checked', readOnly: true),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiRadioGroup),
        matchesGoldenFile('goldens/dark/radio_dark_readonly_checked.png'),
      );
    });
  });
}
