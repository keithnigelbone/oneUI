/// InputField visual-regression tests — LIGHT.
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

  group('[golden] InputField — sizes', () {
    for (final size in ['s', 'm', 'l']) {
      testWidgets('size=$size', (tester) async {
        await pumpInputFieldJioHarnessSettled(
          tester,
          OneUiInputField(
            label: 'Email',
            size: size,
            placeholder: 'you@example.com',
          ),
        );
        await expectLater(
          inputFieldRootFinder(),
          matchesGoldenFile('goldens/input_field_size_$size.png'),
        );
      });
    }
  });

  group('[golden] InputField — field affordances', () {
    testWidgets('label + description', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Password',
          description: 'At least 8 characters.',
          placeholder: '••••••••',
        ),
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/input_field_label_description.png'),
      );
    });

    testWidgets('required asterisk', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Full name', required: true),
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/input_field_required.png'),
      );
    });

    testWidgets('info icon', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'PIN', infoIcon: true),
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/input_field_info_icon.png'),
      );
    });

    testWidgets('feedback error', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          error: 'Enter a valid email address.',
          value: 'bad',
        ),
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/input_field_feedback_error.png'),
      );
    });

    testWidgets('dynamic text row', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Bio',
          dynamicText: '12 / 140',
          helperButton: 'Clear',
        ),
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/input_field_dynamic_text.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Locked',
          value: 'Read only value',
          disabled: true,
        ),
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/input_field_disabled.png'),
      );
    });

    testWidgets('full single field', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          required: true,
          infoIcon: true,
          description: 'We never share your email.',
          error: 'This field is required.',
          dynamicText: '0 / 64',
        ),
      );
      await expectLater(
        inputFieldRootFinder(),
        matchesGoldenFile('goldens/input_field_full_single.png'),
      );
    });
  });
}
