/// InputDynamicText visual-regression tests — LIGHT.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines:
///   flutter test --update-goldens test/components/input_dynamic_text/
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_dynamic_text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputDynamicTextIconsLoaded();
  });

  group('[golden] InputDynamicText — sizes (content only)', () {
    for (final entry in {
      's': OneUiInputLabelSize.s,
      'm': OneUiInputLabelSize.m,
      'l': OneUiInputLabelSize.l,
    }.entries) {
      testWidgets('size=${entry.key} content', (tester) async {
        await pumpInputDynamicTextJioHarnessSettled(
          tester,
          OneUiInputDynamicText(
            size: entry.value,
            content: '0 / 100 characters',
          ),
        );
        await expectLater(
          inputDynamicTextRootFinder(),
          matchesGoldenFile(
            'goldens/input_dynamic_text_size_${entry.key}_content.png',
          ),
        );
      });
    }
  });

  group('[golden] InputDynamicText — sizes (content + end)', () {
    for (final entry in {
      's': OneUiInputLabelSize.s,
      'm': OneUiInputLabelSize.m,
      'l': OneUiInputLabelSize.l,
    }.entries) {
      testWidgets('size=${entry.key} content+end', (tester) async {
        await pumpInputDynamicTextJioHarnessSettled(
          tester,
          OneUiInputDynamicText(
            size: entry.value,
            content: 'Dynamic text',
            end: 'Helper Button',
          ),
        );
        await expectLater(
          inputDynamicTextRootFinder(),
          matchesGoldenFile(
            'goldens/input_dynamic_text_size_${entry.key}_content_end.png',
          ),
        );
      });
    }
  });

  group('[golden] InputDynamicText — states', () {
    testWidgets('trailing only', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(end: 'Helper Button'),
      );
      await expectLater(
        inputDynamicTextRootFinder(),
        matchesGoldenFile('goldens/input_dynamic_text_trailing_only.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          content: '0 / 280 characters',
          end: 'Clear',
          disabled: true,
        ),
      );
      await expectLater(
        inputDynamicTextRootFinder(),
        matchesGoldenFile('goldens/input_dynamic_text_disabled.png'),
      );
    });
  });
}
