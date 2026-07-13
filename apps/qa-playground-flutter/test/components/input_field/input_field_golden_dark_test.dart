/// InputField visual-regression tests — DARK MODE subset.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';

import '../../support/components/input_field_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  group('[golden][dark] InputField — sizes', () {
    for (final size in ['s', 'm', 'l']) {
      testWidgets('size=$size (dark)', (tester) async {
        await pumpInputFieldJioHarnessSettled(
          tester,
          OneUiInputField(
            label: 'Email',
            size: size,
            placeholder: 'you@example.com',
          ),
          darkMode: true,
        );
        await expectLater(
          inputFieldRootFinder(),
          matchesGoldenFile('goldens/dark/input_field_dark_size_$size.png'),
        );
      });
    }
  });

  group('[golden][dark] InputField — affordances', () {
    testWidgets('label + description (dark)', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Password',
          description: 'At least 8 characters.',
        ),
        darkMode: true,
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile(
            'goldens/dark/input_field_dark_label_description.png'),
      );
    });

    testWidgets('feedback error (dark)', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          error: 'Enter a valid email address.',
        ),
        darkMode: true,
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/dark/input_field_dark_feedback_error.png'),
      );
    });

    testWidgets('required asterisk (dark)', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Full name', required: true),
        darkMode: true,
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/dark/input_field_dark_required.png'),
      );
    });
  });
}
