/// Input visual-regression tests — LIGHT.
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

  group('[golden] Input — sizes', () {
    for (final entry in {
      'xs': OneUiInputSize.xs,
      's': OneUiInputSize.s,
      'm': OneUiInputSize.m,
      'l': OneUiInputSize.l,
    }.entries) {
      testWidgets('size=${entry.key}', (tester) async {
        await pumpInputJioHarnessSettled(
          tester,
          OneUiInput(size: entry.value, placeholder: 'Placeholder'),
        );
        await expectLater(
          inputRootFinder(),
          matchesGoldenFile('goldens/input_size_${entry.key}.png'),
        );
      });
    }
  });

  group('[golden] Input — attention + appearance', () {
    testWidgets('medium primary', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          attention: OneUiInputAttention.medium,
          appearance: OneUiInputAppearance.primary,
          placeholder: 'Email',
        ),
      );
      await expectLater(
        inputRootFinder(),
        matchesGoldenFile('goldens/input_medium_primary.png'),
      );
    });

    testWidgets('high secondary', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          attention: OneUiInputAttention.high,
          appearance: OneUiInputAppearance.secondary,
          placeholder: 'Search',
        ),
      );
      await expectLater(
        inputRootFinder(),
        matchesGoldenFile('goldens/input_high_secondary.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(value: 'Locked', disabled: true),
      );
      await expectLater(
        inputRootFinder(),
        matchesGoldenFile('goldens/input_disabled.png'),
      );
    });

    testWidgets('pill shape', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          shape: OneUiInputShape.pill,
          placeholder: 'Pill',
        ),
      );
      await expectLater(
        inputRootFinder(),
        matchesGoldenFile('goldens/input_pill.png'),
      );
    });
  });
}
