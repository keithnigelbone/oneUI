/// Text visual-regression tests — DARK MODE.
///
/// Re-runs the high-signal typography subset under `darkMode: true` so token
/// remapping and on-surface contrast regress here.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

const _kDarkVariants = <String, OneUiTextVariant>{
  'body': OneUiTextVariant.body,
  'label': OneUiTextVariant.label,
  'title': OneUiTextVariant.title,
  'headline': OneUiTextVariant.headline,
  'display': OneUiTextVariant.display,
  // code omitted — JetBrains Mono google_fonts fetch fails offline in widget tests.
};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] Text — typography variants', () {
    for (final entry in _kDarkVariants.entries) {
      testWidgets('${entry.key} / M (dark)', (tester) async {
        await pumpTextJioHarnessSettled(
          tester,
          OneUiText(
            text: 'Dark ${entry.key}',
            variant: entry.value,
            size: 'M',
          ),
          darkMode: true,
        );
        await expectLater(
          textRootFinder(),
          matchesGoldenFile('goldens/dark/text_dark_${entry.key}_m.png'),
        );
      });
    }
  });

  group('[golden][dark] Text — attention levels (body)', () {
    for (final att in ['high', 'medium', 'low']) {
      testWidgets('body / $att (dark)', (tester) async {
        await pumpTextJioHarnessSettled(
          tester,
          OneUiText(
            text: 'Body $att',
            variant: OneUiTextVariant.body,
            attention: OneUiTextAttention.values.byName(att),
          ),
          darkMode: true,
        );
        await expectLater(
          textRootFinder(),
          matchesGoldenFile('goldens/dark/text_dark_body_$att.png'),
        );
      });
    }
  });
}
