/// Text accessibility QA tests — resolver units + real widget SemanticsData.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

void main() {
  group('[a11y] resolveOneUiTextAccessibilityLabel', () {
    test('[a11y] prefers semanticsLabel', () {
      expect(
        resolveOneUiTextAccessibilityLabel(
          semanticsLabel: 'Important',
          text: 'hi',
        ),
        'Important',
      );
    });

    test('[a11y] falls back to text prop', () {
      expect(
        resolveOneUiTextAccessibilityLabel(text: 'hello'),
        'hello',
      );
    });
  });

  group('[a11y] resolveOneUiTextSemantics', () {
    test('[a11y] headline exposes header semantics', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'Section',
        variant: OneUiTextVariant.headline,
        isInteractive: false,
      );
      expect(cfg.exposed, isTrue);
      expect(cfg.isHeader, isTrue);
    });

    test('[a11y] plain body does not require wrapper', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'Body',
        variant: OneUiTextVariant.body,
        isInteractive: false,
      );
      expect(cfg.exposed, isFalse);
    });

    test('[a11y] interactive link exposes link semantics', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'Learn more',
        variant: OneUiTextVariant.body,
        isInteractive: true,
      );
      expect(cfg.exposed, isTrue);
      expect(cfg.isLink, isTrue);
    });
  });

  group('[a11y] Text widget — semantics', () {
    testWidgetsAllPlatforms('[a11y] headline exposes header in AT tree',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Section',
          variant: OneUiTextVariant.headline,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Section');
        expect(data.hasFlag(SemanticsFlag.isHeader), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] display exposes header in AT tree',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Hero',
          variant: OneUiTextVariant.display,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Hero');
        expect(data.hasFlag(SemanticsFlag.isHeader), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] interactive copy exposes link semantics',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Learn more',
          onPressed: () {},
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Learn more');
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
      });
    });

    testWidgetsAllPlatforms(
        '[a11y] explicit semanticsLabel overrides visible text',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Click here',
          semanticsLabel: 'Open settings',
          variant: OneUiTextVariant.headline,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Open settings');
        expect(data.label, contains('Open settings'));
      });
    });

    testWidgetsAllPlatforms('[a11y] ariaHidden excludes from semantics tree',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Hidden',
          ariaHidden: true,
        ),
      );
      expect(find.bySemanticsLabel('Hidden'), findsNothing);
    });

    testWidgetsAllPlatforms('[a11y] title does not expose header semantics',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Card title',
          variant: OneUiTextVariant.title,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Card title');
        expect(data.hasFlag(SemanticsFlag.isHeader), isFalse);
      });
    });

    testWidgetsAllPlatforms(
        '[a11y] plain body uses native Text semantics (no wrapper)',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Body copy', variant: OneUiTextVariant.body),
      );
      expect(find.text('Body copy'), findsOneWidget);
      expect(
        find.descendant(
          of: textRootFinder(),
          matching: find.byWidgetPredicate((w) => w is Semantics),
        ),
        findsNothing,
      );
    });

    testWidgetsAllPlatforms('[a11y] interactive copy exposes semanticsHint',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Learn more',
          semanticsHint: 'Opens plan details',
          onPressed: () {},
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Learn more');
        expect(data.hint, contains('Opens plan details'));
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] excludeFromSemantics hides from AT tree',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Decorative',
          excludeFromSemantics: true,
        ),
      );
      expect(find.bySemanticsLabel('Decorative'), findsNothing);
    });
  });
}
