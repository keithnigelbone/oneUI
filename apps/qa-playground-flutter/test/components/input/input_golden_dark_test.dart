/// Input visual-regression tests — DARK.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  group('[golden][dark] Input', () {
    testWidgets('medium primary', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          attention: OneUiInputAttention.medium,
          appearance: OneUiInputAppearance.primary,
          placeholder: 'Email',
        ),
        darkMode: true,
      );
      await expectLater(
        inputRootFinder(),
        matchesGoldenFile('goldens/dark/input_dark_medium_primary.png'),
      );
    });

    testWidgets('high negative error', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          attention: OneUiInputAttention.high,
          appearance: OneUiInputAppearance.negative,
          errorHighlight: true,
          value: 'bad@',
        ),
        darkMode: true,
      );
      await expectLater(
        inputRootFinder(),
        matchesGoldenFile('goldens/dark/input_dark_error.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(value: 'Locked', disabled: true),
        darkMode: true,
      );
      await expectLater(
        inputRootFinder(),
        matchesGoldenFile('goldens/dark/input_dark_disabled.png'),
      );
    });
  });
}
