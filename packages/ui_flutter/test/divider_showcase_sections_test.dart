library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/divider_default_story_page.dart';
import 'package:ui_flutter/foundations/divider_docs_page.dart';
import 'package:ui_flutter/foundations/divider_foundations_page.dart';
import 'package:ui_flutter/foundations/divider_interactive_story_page.dart';
import 'package:ui_flutter/foundations/divider_story_catalog.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import 'divider_test_harness.dart';

const _expectedDividerStoryTitles = [
  'Docs',
  'Default',
  'Orientations',
  'Sizes',
  'Attention Levels',
  'Attention Levels With Icon',
  'Attention Levels With Text',
  'With Icon',
  'With Label',
  'Round Caps',
  'Surface Context',
  'Interactive',
  'Vertical Sizes',
  'Vertical Attention Levels',
  'Vertical With Icon',
  'Vertical With Label',
  'Vertical Inline Usage',
];

int _minimumDividerCount(DividerFoundationStory story) => switch (story) {
      DividerFoundationStory.docs => 7,
      DividerFoundationStory.defaultStory => 1,
      DividerFoundationStory.orientations => 2,
      DividerFoundationStory.sizes => 3,
      DividerFoundationStory.attentionLevels => 3,
      DividerFoundationStory.attentionLevelsWithIcon => 3,
      DividerFoundationStory.attentionLevelsWithText => 3,
      DividerFoundationStory.withIcon => 3,
      DividerFoundationStory.withLabel => 3,
      DividerFoundationStory.roundCaps => 3,
      DividerFoundationStory.surfaceContext => 4,
      DividerFoundationStory.interactive => 1,
      DividerFoundationStory.verticalSizes => 3,
      DividerFoundationStory.verticalAttentionLevels => 3,
      DividerFoundationStory.verticalWithIcon => 3,
      DividerFoundationStory.verticalWithLabel => 3,
      DividerFoundationStory.verticalInlineUsage => 5,
    };

void main() {
  test('Divider story catalog order matches React Storybook', () {
    expect(kDividerStoryNavOrder.length, 17);
    for (var i = 0; i < kDividerStoryNavOrder.length; i++) {
      expect(kDividerStoryNavOrder[i].title, _expectedDividerStoryTitles[i]);
    }
    expect(kDividerStoryNavOrder.first, DividerFoundationStory.docs);
    expect(
        kDividerStoryNavOrder, contains(DividerFoundationStory.surfaceContext));
    expect(kDividerStoryNavOrder,
        contains(DividerFoundationStory.verticalInlineUsage));
  });

  group('Divider Storybook pages', () {
    testWidgets('Docs page renders merged preview', (tester) async {
      await pumpDividerStoryHarness(tester, const DividerDocsPage());
      expect(find.text('Divider'), findsOneWidget);
      expect(find.byType(OneUiDivider), findsAtLeastNWidgets(7));
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(tester.takeException(), isNull);
    });

    testWidgets('Default story page renders controls + preview',
        (tester) async {
      await pumpDividerStoryHarness(tester, const DividerDefaultStoryPage());
      expect(find.text('orientation'), findsOneWidget);
      expect(find.text('content'), findsOneWidget);
      expect(find.byType(OneUiDivider), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(tester.takeException(), isNull);
    });

    testWidgets('Interactive story renders bare separator', (tester) async {
      await pumpDividerStoryHarness(
          tester, const DividerInteractiveStoryPage());
      expect(find.byType(OneUiDivider), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(dividerSeparatorFinder(), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    for (final story in kDividerStoryNavOrder) {
      if (story == DividerFoundationStory.docs ||
          story == DividerFoundationStory.defaultStory ||
          story == DividerFoundationStory.interactive) {
        continue;
      }

      testWidgets('Foundations page mounts: ${story.title}', (tester) async {
        await pumpDividerStoryHarness(
          tester,
          DividerFoundationsPage(story: story),
        );
        expect(find.text(story.title), findsOneWidget);
        expect(
          find.byType(OneUiDivider),
          findsAtLeastNWidgets(_minimumDividerCount(story)),
        );
        expect(find.byType(ConvexGapCard), findsNothing);
        expect(tester.takeException(), isNull);
      });
    }
  });

  group('Divider showcase sections — direct builders', () {
    Future<void> pumpSection(WidgetTester tester, Widget section) async {
      await pumpDividerStoryHarness(
        tester,
        SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: section,
        ),
      );
    }

    for (final story in kDividerStoryNavOrder) {
      if (story == DividerFoundationStory.docs ||
          story == DividerFoundationStory.defaultStory ||
          story == DividerFoundationStory.interactive) {
        continue;
      }

      testWidgets('buildSection: ${story.title}', (tester) async {
        late Widget section;
        await tester.pumpWidget(
          pumpDividerApp(
            Builder(
              builder: (context) {
                section = story.buildSection(context);
                return const SizedBox();
              },
            ),
          ),
        );
        await tester.pumpAndSettle();
        await pumpSection(tester, section);
        expect(
          find.byType(OneUiDivider),
          findsAtLeastNWidgets(_minimumDividerCount(story)),
        );
        expect(find.byType(ConvexGapCard), findsNothing);
        expect(tester.takeException(), isNull);
      });
    }
  });
}
