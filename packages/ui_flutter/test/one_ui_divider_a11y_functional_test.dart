/// Divider accessibility + functional widget tests — parity with
/// `Divider.test.tsx`, RN `dividerA11y.test.ts`, and QA playground Divider matrix.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import 'divider_test_harness.dart';

const _sizes = [kOneUiDividerSizeS, kOneUiDividerSizeM, kOneUiDividerSizeL];
const _attentions = ['high', 'medium', 'low'];
const _orientations = [kOneUiDividerHorizontal, kOneUiDividerVertical];

void main() {
  group('RN parity — separator landmark + hints', () {
    testWidgetsAllPlatforms('renders default horizontal separator',
        (tester) async {
      await tester.pumpWidget(pumpDividerApp(const OneUiDivider()));
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('vertical orientation exposes separator landmark', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          verticalDividerHost(
            const OneUiDivider(orientation: kOneUiDividerVertical),
          ),
        ),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('forwards accessibilityHint to semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(accessibilityHint: 'Section break'),
        ),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorSemantics(tester).hint, 'Section break');
      });
    });

    testWidgetsAllPlatforms('forwards semanticsHint to semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(semanticsHint: 'Section break'),
        ),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorSemantics(tester).hint, 'Section break');
      });
    });

    testWidgetsAllPlatforms('vertical content divider keeps separator landmark',
        (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          verticalDividerHost(
            const OneUiDivider(
              orientation: kOneUiDividerVertical,
              content: kOneUiDividerContentText,
              child: 'Label',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsOneWidget);
        expect(find.text('Label'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('forwards testId to semantics identifier',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(const OneUiDivider(testId: 'divider-root')),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        final nodes = tester
            .widgetList<Semantics>(
              find.byWidgetPredicate(
                (w) =>
                    w is Semantics && w.properties.identifier == 'divider-root',
              ),
            )
            .toList();
        expect(nodes, isNotEmpty);
      });
    });

    testWidgetsAllPlatforms('forwards RN testID alias to semantics identifier',
        (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(const OneUiDivider(testID: 'divider-rn-root')),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        final nodes = tester
            .widgetList<Semantics>(
              find.byWidgetPredicate(
                (w) =>
                    w is Semantics &&
                    w.properties.identifier == 'divider-rn-root',
              ),
            )
            .toList();
        expect(nodes, isNotEmpty);
      });
    });
  });

  group('RN parity — DIVIDER_LINE_A11Y decorative segments', () {
    testWidgetsAllPlatforms('simple divider has no hidden line segments', (
      tester,
    ) async {
      await tester.pumpWidget(pumpDividerApp(const OneUiDivider()));
      await tester.pumpAndSettle();
      expect(dividerHiddenLineSegmentCount(tester), 0);
    });

    testWidgetsAllPlatforms('center content divider hides two line segments', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            contentAlign: kOneUiDividerAlignCenter,
            child: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(dividerHiddenLineSegmentCount(tester), 2);
    });

    testWidgetsAllPlatforms('start align hides trailing line only',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            contentAlign: kOneUiDividerAlignStart,
            child: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(dividerHiddenLineSegmentCount(tester), 1);
    });

    testWidgetsAllPlatforms('end align hides leading line only',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            contentAlign: kOneUiDividerAlignEnd,
            child: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(dividerHiddenLineSegmentCount(tester), 1);
    });
  });

  group('web parity — Divider.test.tsx content modes', () {
    testWidgetsAllPlatforms('ignores child when content is none',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentNone,
            child: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Section'), findsNothing);
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('renders plain string when content is text',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            attention: 'medium',
            child: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Section'), findsOneWidget);
      final text = tester.widget<OneUiText>(find.byType(OneUiText));
      expect(text.size, kOneUiDividerTextSize);
      expect(text.variant, OneUiTextVariant.label);
      expect(text.weight, OneUiTextWeight.medium);
      expect(text.attention, OneUiTextAttention.medium);
    });

    testWidgetsAllPlatforms('renders icon slot when content is icon',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentIcon,
            attention: 'medium',
            child: OneUiIcon(icon: 'star', excludeFromSemantics: true),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final icon = tester.widget<OneUiIcon>(find.byType(OneUiIcon));
      expect(icon.size, kOneUiDividerIconSize);
      expect(icon.emphasis, OneUiIconEmphasis.medium);
    });

    testWidgetsAllPlatforms('maps high attention to icon high emphasis',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentIcon,
            attention: 'high',
            child: OneUiIcon(icon: 'star', excludeFromSemantics: true),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        tester.widget<OneUiIcon>(find.byType(OneUiIcon)).emphasis,
        OneUiIconEmphasis.high,
      );
    });

    testWidgetsAllPlatforms(
        'content text with empty child degrades to simple divider', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            child: '',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Section'), findsNothing);
      expect(dividerHiddenLineSegmentCount(tester), 0);
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('explicit Text child preserved', (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          OneUiDivider(
            content: kOneUiDividerContentText,
            attention: 'medium',
            child: const OneUiText(
              variant: OneUiTextVariant.label,
              size: 'S',
              weight: OneUiTextWeight.medium,
              text: 'OR',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('OR'), findsOneWidget);
    });

    testWidgetsAllPlatforms('numeric child renders when content is text',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            child: 42,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('42'), findsOneWidget);
    });
  });

  group('functional — layout, sizes, and defaults', () {
    testWidgetsAllPlatforms('horizontal divider spans parent width',
        (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          horizontalDividerHost(const OneUiDivider()),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.getSize(find.byType(OneUiDivider)).width, 320);
    });

    testWidgetsAllPlatforms('horizontal content divider spans parent width', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          horizontalDividerHost(
            const OneUiDivider(
              content: kOneUiDividerContentText,
              child: 'Section',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.getSize(find.byType(OneUiDivider)).width, 320);
    });

    testWidgetsAllPlatforms(
        'vertical simple divider stretches in constrained host', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          verticalDividerHost(
              const OneUiDivider(orientation: kOneUiDividerVertical)),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.getSize(find.byType(OneUiDivider)).height, 120);
    });

    testWidgetsAllPlatforms(
        'S/M/L stroke heights are distinct (web --Stroke-S/M/L)', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          Column(
            children: const [
              OneUiDivider(size: kOneUiDividerSizeS),
              SizedBox(height: 8),
              OneUiDivider(size: kOneUiDividerSizeM),
              SizedBox(height: 8),
              OneUiDivider(size: kOneUiDividerSizeL),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      final heights = tester
          .widgetList<OneUiDivider>(find.byType(OneUiDivider))
          .map((w) => tester.getSize(find.byWidget(w)).height)
          .toList();
      expect(heights[0], closeTo(0.5, 0.01));
      expect(heights[1], closeTo(1.0, 0.01));
      expect(heights[2], closeTo(1.5, 0.01));
      expect(heights[0], lessThan(heights[1]));
      expect(heights[1], lessThan(heights[2]));
    });

    testWidgetsAllPlatforms('start align renders label without leading line', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            contentAlign: kOneUiDividerAlignStart,
            child: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Section'), findsOneWidget);
      expect(dividerHiddenLineSegmentCount(tester), 1);
    });

    testWidgetsAllPlatforms('end align renders label without trailing line', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            content: kOneUiDividerContentText,
            contentAlign: kOneUiDividerAlignEnd,
            child: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Section'), findsOneWidget);
      expect(dividerHiddenLineSegmentCount(tester), 1);
    });

    testWidgetsAllPlatforms('roundCaps renders without layout regression', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(const OneUiDivider(roundCaps: true)),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsOneWidget);
      });
      expect(tester.takeException(), isNull);
    });

    testWidgetsAllPlatforms('primary appearance renders with content icon', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpDividerApp(
          const OneUiDivider(
            appearance: 'primary',
            content: kOneUiDividerContentIcon,
            child: OneUiIcon(icon: 'star', excludeFromSemantics: true),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(OneUiIcon), findsOneWidget);
    });
  });

  group('cross-platform smoke — android, iOS, flutter web (linux proxy)', () {
    testWidgetsAllPlatforms('all sizes render', (tester) async {
      for (final size in _sizes) {
        await tester.pumpWidget(
          pumpDividerApp(OneUiDivider(size: size, testId: 'sz-$size')),
        );
        await tester.pumpAndSettle();
        withSemanticsHandle(tester, () {
          expect(dividerSeparatorFinder(), findsOneWidget);
        });
      }
    });

    testWidgetsAllPlatforms('all attention levels render', (tester) async {
      for (final attention in _attentions) {
        await tester.pumpWidget(
          pumpDividerApp(
              OneUiDivider(attention: attention, testId: 'att-$attention')),
        );
        await tester.pumpAndSettle();
        withSemanticsHandle(tester, () {
          expect(dividerSeparatorFinder(), findsOneWidget);
        });
      }
    });

    testWidgetsAllPlatforms('all orientations render', (tester) async {
      for (final orientation in _orientations) {
        final child = orientation == kOneUiDividerVertical
            ? verticalDividerHost(
                OneUiDivider(
                    orientation: orientation, testId: 'ori-$orientation'),
              )
            : OneUiDivider(
                orientation: orientation, testId: 'ori-$orientation');
        await tester.pumpWidget(pumpDividerApp(child));
        await tester.pumpAndSettle();
        withSemanticsHandle(tester, () {
          expect(dividerSeparatorFinder(), findsOneWidget);
        });
      }
    });

    testWidgetsAllPlatforms('content matrix smoke (web slot × align)',
        (tester) async {
      const variants = <({String content, String align, Object? child})>[
        (
          content: kOneUiDividerContentNone,
          align: kOneUiDividerAlignCenter,
          child: null
        ),
        (
          content: kOneUiDividerContentIcon,
          align: kOneUiDividerAlignCenter,
          child: null
        ),
        (
          content: kOneUiDividerContentIcon,
          align: kOneUiDividerAlignStart,
          child: null
        ),
        (
          content: kOneUiDividerContentIcon,
          align: kOneUiDividerAlignEnd,
          child: null
        ),
        (
          content: kOneUiDividerContentText,
          align: kOneUiDividerAlignCenter,
          child: 'Section'
        ),
        (
          content: kOneUiDividerContentText,
          align: kOneUiDividerAlignStart,
          child: 'Section'
        ),
        (
          content: kOneUiDividerContentText,
          align: kOneUiDividerAlignEnd,
          child: 'Section'
        ),
      ];

      for (final variant in variants) {
        final iconChild = variant.content == kOneUiDividerContentIcon
            ? const OneUiIcon(icon: 'star', excludeFromSemantics: true)
            : null;
        await tester.pumpWidget(
          pumpDividerApp(
            OneUiDivider(
              content: variant.content,
              contentAlign: variant.align,
              child: iconChild ?? variant.child,
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        withSemanticsHandle(tester, () {
          expect(dividerSeparatorFinder(), findsOneWidget);
        });
      }
    });

    testWidgetsAllPlatforms('vertical content matrix smoke', (tester) async {
      await tester.pumpWidget(
        pumpDividerApp(
          verticalDividerHost(
            const OneUiDivider(
              orientation: kOneUiDividerVertical,
              content: kOneUiDividerContentText,
              contentAlign: kOneUiDividerAlignCenter,
              child: 'Label',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Label'), findsOneWidget);
      expect(dividerHiddenLineSegmentCount(tester), 2);
    });
  });
}
