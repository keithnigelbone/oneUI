/// Text visual-regression tests — LIGHT. Captures golden PNGs across the
/// Figma typography matrix using the real Jio Convex fixture.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines:
///   flutter test --update-goldens test/components/text/text_golden_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

OneUiText _text({
  required String copy,
  OneUiTextVariant variant = OneUiTextVariant.body,
  String? size,
  OneUiTextWeight weight = OneUiTextWeight.high,
  OneUiTextAttention attention = OneUiTextAttention.none,
  String appearance = 'primary',
  bool italic = false,
  bool underline = false,
  bool strikethrough = false,
}) {
  return OneUiText(
    text: copy,
    variant: variant,
    size: size,
    weight: weight,
    attention: attention,
    appearance: appearance,
    italic: italic,
    underline: underline,
    strikethrough: strikethrough,
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Text — typography variants', () {
    testWidgets('body / M / high', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        _text(copy: 'Body copy', variant: OneUiTextVariant.body, size: 'M'),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_body_m_high.png'),
      );
    });

    testWidgets('label / S / medium', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        _text(
          copy: 'Label',
          variant: OneUiTextVariant.label,
          size: 'S',
          weight: OneUiTextWeight.medium,
        ),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_label_s_medium.png'),
      );
    });

    testWidgets('title / M / high', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        _text(copy: 'Title', variant: OneUiTextVariant.title, size: 'M'),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_title_m_high.png'),
      );
    });

    testWidgets('headline / L / high', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        _text(copy: 'Headline', variant: OneUiTextVariant.headline, size: 'L'),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_headline_l_high.png'),
      );
    });

    testWidgets('display / M / high', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        _text(copy: 'Display', variant: OneUiTextVariant.display, size: 'M'),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_display_m_high.png'),
      );
    });

    testWidgets('code / M / medium (synthetic harness — bundled code font)',
        (tester) async {
      // Jio fixture resolves JetBrains Mono via google_fonts (offline widget tests
      // cannot fetch). Synthetic harness pins code to bundled JioType Variable.
      await pumpTextQaHarness(
        tester,
        _text(copy: 'const x = 1;', variant: OneUiTextVariant.code, size: 'M'),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_code_m_medium.png'),
      );
    });
  });

  group('[golden] Text — attention × appearance (body)', () {
    for (final entry in {
      'high_primary': (OneUiTextAttention.high, 'primary'),
      'medium_secondary': (OneUiTextAttention.medium, 'secondary'),
      'low_neutral': (OneUiTextAttention.low, 'neutral'),
      'tintedA11y_positive': (OneUiTextAttention.tintedA11y, 'positive'),
    }.entries) {
      testWidgets('body / ${entry.key}', (tester) async {
        await pumpTextJioHarnessSettled(
          tester,
          _text(
            copy: 'Body ${entry.key}',
            attention: entry.value.$1,
            appearance: entry.value.$2,
          ),
        );
        await expectLater(
          textRootFinder(),
          matchesGoldenFile('goldens/text_body_${entry.key}.png'),
        );
      });
    }
  });

  group('[golden] Text — decorations', () {
    testWidgets('body italic + underline', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        _text(copy: 'Decorated', italic: true, underline: true),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_body_italic_underline.png'),
      );
    });

    testWidgets('body strikethrough', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        _text(copy: 'Removed', strikethrough: true),
      );
      await expectLater(
        textRootFinder(),
        matchesGoldenFile('goldens/text_body_strikethrough.png'),
      );
    });
  });
}
