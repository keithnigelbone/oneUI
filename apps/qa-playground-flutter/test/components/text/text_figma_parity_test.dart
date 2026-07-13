/// Text Figma-parity QA suite — `[figma]`.
///
/// Exercises every Figma Text API value against the real widget on the synthetic
/// measurement harness (offline). Per-role COLOURS are covered by Jio goldens.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

void main() {
  group('[figma] Text — variant', () {
    for (final variant in kOneUiTextVariants) {
      testWidgetsAllPlatforms(
          '[figma] variant=$variant renders typography role', (tester) async {
        await pumpTextQaHarness(
          tester,
          OneUiText(text: 'Copy', variant: variant),
        );
        expect(find.text('Copy'), findsOneWidget);
        expect(textStyleOf(tester).fontSize, isNotNull);
      });
    }
  });

  group('[figma] Text — size clamping', () {
    test('[figma] display XL clamps to L', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.display, 'XL'), 'L');
    });

    test('[figma] body 3XS clamps to 2XS', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.body, '3XS'), '2XS');
    });

    test('[figma] code 2XL clamps to M', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.code, '2XL'), 'M');
    });

    testWidgetsAllPlatforms(
        '[figma] display XL renders L fontSize (32px harness)', (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Hero',
          variant: OneUiTextVariant.display,
          size: 'XL',
        ),
      );
      // PROBED: clamped display L → harness fontSize 32.
      expect(textStyleOf(tester).fontSize, 32);
    });

    testWidgetsAllPlatforms('[figma] body S renders 12px', (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
            text: 'Body', variant: OneUiTextVariant.body, size: 'S'),
      );
      expect(textStyleOf(tester).fontSize, 12);
    });

    for (final size in kOneUiTextBodySizes) {
      testWidgetsAllPlatforms('[figma] body size=$size resolves',
          (tester) async {
        await pumpTextQaHarness(
          tester,
          OneUiText(text: 'B', variant: OneUiTextVariant.body, size: size),
        );
        expect(textStyleOf(tester).fontSize, isNotNull);
      });
    }
  });

  group('[figma] Text — weight scoping', () {
    testWidgetsAllPlatforms('[figma] body high vs low weight differs',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'High',
          variant: OneUiTextVariant.body,
          weight: OneUiTextWeight.high,
        ),
      );
      // PROBED: body high → fontWeight w700 on harness.
      final high = textStyleOf(tester).fontWeight;
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Low',
          variant: OneUiTextVariant.body,
          weight: OneUiTextWeight.low,
        ),
      );
      final low = textStyleOf(tester).fontWeight;
      expect(high, FontWeight.w700);
      expect(low, FontWeight.w400);
      expect(high, isNot(low));
    });

    testWidgetsAllPlatforms(
        '[figma] display ignores weight prop (fixed medium)', (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Title',
          variant: OneUiTextVariant.display,
          weight: OneUiTextWeight.low,
        ),
      );
      // PROBED: display low prop → still w500 (fixed role weight).
      expect(textStyleOf(tester).fontWeight, FontWeight.w500);
    });

    testWidgetsAllPlatforms('[figma] code ignores weight prop (fixed medium)',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'fn()',
          variant: OneUiTextVariant.code,
          weight: OneUiTextWeight.high,
        ),
      );
      expect(textStyleOf(tester).fontWeight, FontWeight.w500);
    });

    test('[figma] resolveOneUiTextWeight scoping', () {
      expect(
        resolveOneUiTextWeight(OneUiTextVariant.headline, OneUiTextWeight.low),
        OneUiTextWeight.medium,
      );
      expect(
        resolveOneUiTextWeight(OneUiTextVariant.body, OneUiTextWeight.low),
        OneUiTextWeight.low,
      );
    });
  });

  group('[figma] Text — attention scoping', () {
    testWidgetsAllPlatforms('[figma] body high vs low colour differs',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'High',
          variant: OneUiTextVariant.body,
          attention: OneUiTextAttention.high,
        ),
      );
      final highColor = textColorOf(tester);
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Low',
          variant: OneUiTextVariant.body,
          attention: OneUiTextAttention.low,
        ),
      );
      final lowColor = textColorOf(tester);
      expect(highColor, isNotNull);
      expect(lowColor, isNotNull);
      expect(highColor, isNot(equals(lowColor)));
    });

    testWidgetsAllPlatforms('[figma] display ignores low attention (high-only)',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'High',
          variant: OneUiTextVariant.display,
          attention: OneUiTextAttention.high,
        ),
      );
      final highColor = textColorOf(tester);
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Low',
          variant: OneUiTextVariant.display,
          attention: OneUiTextAttention.low,
        ),
      );
      // PROBED: display low prop → same colour as high (attention scoping).
      expect(textColorOf(tester), equals(highColor));
    });

    test('[figma] attention none resolves to high', () {
      expect(
        resolveOneUiTextAttention(
            OneUiTextVariant.body, OneUiTextAttention.none),
        OneUiTextAttention.high,
      );
    });

    for (final attention in kOneUiTextAttentions) {
      testWidgetsAllPlatforms('[figma] body attention=$attention renders',
          (tester) async {
        await pumpTextQaHarness(
          tester,
          OneUiText(
            text: 'Copy',
            variant: OneUiTextVariant.body,
            attention: attention,
          ),
        );
        expect(textColorOf(tester), isNotNull);
      });
    }
  });

  group('[figma] Text — appearance', () {
    test('[figma] appearance=auto resolves to neutral', () {
      expect(
          resolveOneUiTextState(appearance: 'auto').dataAppearance, 'neutral');
    });

    for (final app in kOneUiTextAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app renders',
          (tester) async {
        await pumpTextQaHarness(
          tester,
          OneUiText(text: 'Role', appearance: app),
        );
        expect(textColorOf(tester), isNotNull);
      });
    }
  });

  group('[figma] Text — italic / underline / strikethrough', () {
    testWidgetsAllPlatforms('[figma] italic → FontStyle.italic',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Slanted', italic: true),
      );
      // PROBED: italic flag → FontStyle.italic on rendered TextStyle.
      expect(textStyleOf(tester).fontStyle, FontStyle.italic);
    });

    testWidgetsAllPlatforms('[figma] underline → TextDecoration.underline',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Under', underline: true),
      );
      expect(
        textStyleOf(tester).decoration,
        TextDecoration.underline,
      );
    });

    testWidgetsAllPlatforms(
        '[figma] strikethrough → TextDecoration.lineThrough', (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Strike', strikethrough: true),
      );
      expect(
        textStyleOf(tester).decoration,
        TextDecoration.lineThrough,
      );
    });

    testWidgetsAllPlatforms('[figma] underline + strikethrough combine',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Both', underline: true, strikethrough: true),
      );
      expect(
        textStyleOf(tester).decoration,
        TextDecoration.combine([
          TextDecoration.underline,
          TextDecoration.lineThrough,
        ]),
      );
    });
  });

  group('[figma] Text — textAlign', () {
    for (final align in OneUiTextAlign.values) {
      testWidgetsAllPlatforms('[figma] textAlign=$align maps to Flutter',
          (tester) async {
        await pumpTextQaHarness(
          tester,
          OneUiText(
            text: 'Aligned',
            textAlign: align,
          ),
        );
        final expected = switch (align) {
          OneUiTextAlign.left => TextAlign.left,
          OneUiTextAlign.center => TextAlign.center,
          OneUiTextAlign.right => TextAlign.right,
        };
        expect(textAlignOf(tester), expected);
      });
    }
  });

  group('[figma] Text — numberOfLines', () {
    testWidgetsAllPlatforms('[figma] maxLines truncates with ellipsis',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Long copy that should truncate when constrained',
          maxLines: 1,
        ),
      );
      final widget = tester.widget<Text>(textRenderFinder().first);
      expect(widget.maxLines, 1);
      expect(widget.overflow, TextOverflow.ellipsis);
    });
  });
}
