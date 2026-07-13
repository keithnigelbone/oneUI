/// Text functional QA tests — `[smoke]` / `[fn]`.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

void main() {
  group('[smoke] Text — API variants', () {
    testWidgetsAllPlatforms('[smoke] renders body copy', (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Hello world'),
      );
      expect(find.text('Hello world'), findsOneWidget);
    });

    for (final variant in OneUiTextVariant.values) {
      testWidgetsAllPlatforms('[smoke] variant=$variant renders',
          (tester) async {
        await pumpTextQaHarness(
          tester,
          OneUiText(text: 'Copy', variant: variant),
        );
        expect(find.text('Copy'), findsOneWidget);
      });
    }

    for (final appearance in ['primary', 'secondary', 'negative', 'positive']) {
      testWidgetsAllPlatforms('[smoke] appearance="$appearance" renders',
          (tester) async {
        await pumpTextQaHarness(
          tester,
          OneUiText(text: 'Role', appearance: appearance),
        );
        expect(find.text('Role'), findsOneWidget);
      });
    }
  });

  group('[fn] Text — interaction', () {
    testWidgetsAllPlatforms('[fn] onPressed fires callback', (tester) async {
      var pressed = false;
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Learn more',
          onPressed: () => pressed = true,
        ),
      );
      await tester.tap(find.text('Learn more'));
      await tester.pumpAndSettle();
      expect(pressed, isTrue);
    });

    testWidgetsAllPlatforms('[fn] testId attaches ValueKey', (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Label', testId: 'qa-text'),
      );
      expect(find.byKey(const ValueKey('qa-text')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] body high weight renders w700',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Bold',
          variant: OneUiTextVariant.body,
          weight: OneUiTextWeight.high,
        ),
      );
      expect(textStyleOf(tester).fontWeight, FontWeight.w700);
    });

    testWidgetsAllPlatforms('[fn] italic renders FontStyle.italic',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Slanted', italic: true),
      );
      expect(textStyleOf(tester).fontStyle, FontStyle.italic);
    });

    testWidgetsAllPlatforms('[fn] underline renders TextDecoration.underline',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Under', underline: true),
      );
      expect(textStyleOf(tester).decoration, TextDecoration.underline);
    });

    testWidgetsAllPlatforms('[fn] maxLines=1 sets ellipsis overflow',
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

    testWidgetsAllPlatforms(
        '[fn] textAlign=center maps to Flutter TextAlign.center',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Centered',
          textAlign: OneUiTextAlign.center,
        ),
      );
      expect(textAlignOf(tester), TextAlign.center);
    });

    testWidgetsAllPlatforms('[fn] display size XL clamps to L fontSize',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Hero',
          variant: OneUiTextVariant.display,
          size: 'XL',
        ),
      );
      expect(textStyleOf(tester).fontSize, 32);
    });

    testWidgetsAllPlatforms('[fn] label 3XS renders harness 9px',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Micro',
          variant: OneUiTextVariant.label,
          size: '3XS',
        ),
      );
      expect(textStyleOf(tester).fontSize, 9);
    });

    testWidgetsAllPlatforms('[fn] body medium weight renders w500',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Medium',
          variant: OneUiTextVariant.body,
          weight: OneUiTextWeight.medium,
        ),
      );
      expect(textStyleOf(tester).fontWeight, FontWeight.w500);
    });

    testWidgetsAllPlatforms('[fn] title ignores low weight prop (fixed medium)',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Title',
          variant: OneUiTextVariant.title,
          weight: OneUiTextWeight.low,
        ),
      );
      expect(textStyleOf(tester).fontWeight, FontWeight.w500);
    });

    testWidgetsAllPlatforms('[fn] code ignores high weight prop (fixed medium)',
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

    testWidgetsAllPlatforms(
        '[fn] strikethrough renders TextDecoration.lineThrough',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Strike', strikethrough: true),
      );
      expect(textStyleOf(tester).decoration, TextDecoration.lineThrough);
    });

    testWidgetsAllPlatforms('[fn] textAlign=right maps to Flutter',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Right',
          textAlign: OneUiTextAlign.right,
        ),
      );
      expect(textAlignOf(tester), TextAlign.right);
    });

    testWidgetsAllPlatforms('[fn] attention none matches high colour',
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
          text: 'None',
          variant: OneUiTextVariant.body,
          attention: OneUiTextAttention.none,
        ),
      );
      expect(textColorOf(tester), equals(highColor));
    });

    test('[fn] appearance=auto resolves to neutral', () {
      expect(
          resolveOneUiTextState(appearance: 'auto').dataAppearance, 'neutral');
    });
  });
}
