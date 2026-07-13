/// RadioField visual-regression tests — DARK MODE subset.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

OneUiRadioField _multi({bool checked = false, bool readOnly = false, String? error}) {
  return OneUiRadioField(
    label: 'Plan',
    readOnly: readOnly,
    error: error,
    defaultValue: checked ? 'basic' : null,
    children: [
      OneUiRadio(value: 'basic', label: 'Basic'),
      OneUiRadio(value: 'pro', label: 'Pro'),
    ],
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] RadioField', () {
    testWidgets('unchecked (dark)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(), darkMode: true);
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/dark/radio_field_dark_unchecked.png'));
    });

    testWidgets('checked (dark)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(checked: true), darkMode: true);
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/dark/radio_field_dark_checked.png'));
    });

    testWidgets('readonly / checked (dark)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(readOnly: true, checked: true),
          darkMode: true);
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/dark/radio_field_dark_readonly.png'));
    });

    testWidgets('feedback (dark)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(error: 'Choose a plan'), darkMode: true);
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/dark/radio_field_dark_feedback.png'));
    });
  });
}
