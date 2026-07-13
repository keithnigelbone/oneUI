import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/bottom_navigation_default_story_page.dart';
import 'package:ui_flutter/foundations/bottom_navigation_docs_page.dart';
import 'package:ui_flutter/foundations/bottom_navigation_foundations_page.dart';
import 'package:ui_flutter/foundations/bottom_navigation_interactive_story_page.dart';
import 'package:ui_flutter/foundations/bottom_navigation_story_catalog.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';

import 'bottom_navigation_test_harness.dart';

/// Every React `BottomNavigation.stories.tsx` section must render without layout errors.
void main() {
  group('BottomNavigation Storybook pages', () {
    testWidgets('Docs page renders merged sections', (tester) async {
      await pumpBottomNavigationStoryHarness(
          tester, const BottomNavigationDocsPage());
      expect(find.text('BottomNavigation'), findsOneWidget);
      expect(find.text('Label Types'), findsOneWidget);
      expect(find.text('Surface Modes'), findsOneWidget);
      expect(find.byType(OneUiBottomNavigation), findsWidgets);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('Default story page renders controls + uncontrolled preview',
        (tester) async {
      await pumpBottomNavigationStoryHarness(
        tester,
        const BottomNavigationDefaultStoryPage(),
      );
      expect(find.text('showDivider'), findsOneWidget);
      expect(find.text('labelType: 1line'), findsOneWidget);
      expect(find.text('appearance: primary'), findsOneWidget);
      expect(find.byType(OneUiBottomNavigation), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('Interactive story updates active value on tap',
        (tester) async {
      await pumpBottomNavigationStoryHarness(
        tester,
        const BottomNavigationInteractiveStoryPage(),
      );
      expect(find.byKey(const Key('active-value')), findsOneWidget);
      expect(find.textContaining('home'), findsWidgets);

      final handle = tester.ensureSemantics();
      try {
        await tester.tap(find.bySemanticsLabel('Search'));
        await tester.pumpAndSettle();
        expect(find.textContaining('search'), findsWidgets);
      } finally {
        handle.dispose();
      }
    });

    for (final story in kBottomNavigationStoryNavOrder) {
      if (story == BottomNavigationFoundationStory.docs ||
          story == BottomNavigationFoundationStory.defaultStory ||
          story == BottomNavigationFoundationStory.interactive) {
        continue;
      }

      testWidgets('${story.title} foundations page renders', (tester) async {
        await pumpBottomNavigationStoryHarness(
          tester,
          BottomNavigationFoundationsPage(story: story),
        );
        expect(find.text(story.title), findsOneWidget);
        expect(find.byType(OneUiBottomNavigation), findsWidgets);
        expect(find.byType(ConvexGapCard), findsNothing);
      });
    }
  });

  group('BottomNavigation showcase sections — direct builders', () {
    Future<void> pumpSection(WidgetTester tester, Widget section) async {
      await pumpBottomNavigationStoryHarness(
        tester,
        SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: section,
        ),
      );
    }

    for (final story in kBottomNavigationStoryNavOrder) {
      if (story == BottomNavigationFoundationStory.docs ||
          story == BottomNavigationFoundationStory.defaultStory ||
          story == BottomNavigationFoundationStory.interactive) {
        continue;
      }

      testWidgets('buildSection: ${story.title}', (tester) async {
        late Widget section;
        await tester.pumpWidget(
          pumpBottomNavigationStoryApp(
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
        expect(find.byType(OneUiBottomNavigation), findsWidgets);
        expect(find.byType(ConvexGapCard), findsNothing);
        if (story == BottomNavigationFoundationStory.surfaceModes) {
          expect(
            find.byKey(const Key('oneui-bottom-nav-top-divider')),
            findsWidgets,
          );
        }
      });
    }
  });
}
