/// Text visual-regression tests — Surface-context nesting.
///
/// Renders Text inside each main Surface mode so `[data-surface]` token
/// remapping regressions fail here instead of in production.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

const _kSurfaceModes = <String>['bold', 'subtle', 'minimal', 'elevated'];

const _kAttentions = <String, OneUiTextAttention>{
  'high': OneUiTextAttention.high,
  'medium': OneUiTextAttention.medium,
  'low': OneUiTextAttention.low,
};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][surface] Text — inside Surface(mode=X)', () {
    for (final mode in _kSurfaceModes) {
      for (final att in _kAttentions.entries) {
        testWidgets('surface=$mode / attention=${att.key}', (tester) async {
          await pumpTextJioHarnessSettled(
            tester,
            OneUiText(
              text: 'Surface $mode',
              variant: OneUiTextVariant.body,
              attention: att.value,
              appearance: 'auto',
            ),
            surfaceMode: mode,
            surfaceAppearance: 'primary',
          );
          await expectLater(
            textRootFinder(),
            matchesGoldenFile(
              'goldens/surface/text_in_surface_${mode}_${att.key}.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][surface] Text — cross-role secondary surface', () {
    testWidgets('secondary subtle / high attention', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        const OneUiText(
          text: 'Secondary tint',
          variant: OneUiTextVariant.body,
          attention: OneUiTextAttention.high,
          appearance: 'auto',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/surface/text_secondary_subtle_high.png'),
      );
    });
  });
}
