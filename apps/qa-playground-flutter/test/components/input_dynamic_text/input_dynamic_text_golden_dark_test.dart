/// InputDynamicText visual-regression tests — DARK.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';

import '../../support/components/input_dynamic_text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputDynamicTextIconsLoaded();
  });

  group('[golden][dark] InputDynamicText', () {
    testWidgets('content+end', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          content: '0 / 100 characters',
          end: 'Helper Button',
        ),
        darkMode: true,
      );
      await expectLater(
        inputDynamicTextRootFinder(),
        matchesGoldenFile(
            'goldens/dark/input_dynamic_text_dark_content_end.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          content: 'Locked',
          end: 'Clear',
          disabled: true,
        ),
        darkMode: true,
      );
      await expectLater(
        inputDynamicTextRootFinder(),
        matchesGoldenFile('goldens/dark/input_dynamic_text_dark_disabled.png'),
      );
    });

    testWidgets('trailing only', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(end: 'Help'),
        darkMode: true,
      );
      await expectLater(
        inputDynamicTextRootFinder(),
        matchesGoldenFile(
            'goldens/dark/input_dynamic_text_dark_trailing_only.png'),
      );
    });
  });
}
