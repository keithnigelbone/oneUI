import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/checkbox_field_default_story_page.dart';
import 'package:ui_flutter/foundations/checkbox_field_docs_page.dart';
import 'package:ui_flutter/foundations/checkbox_field_foundations_page.dart';
import 'package:ui_flutter/foundations/checkbox_field_story_catalog.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import 'checkbox_test_harness.dart';

/// Every React `CheckboxField.stories.tsx` section must render without token gaps.
void main() {
  group('CheckboxField Storybook pages', () {
    testWidgets('Docs page renders all section headings', (tester) async {
      await pumpCheckboxStoryHarness(tester, const CheckboxFieldDocsPage());
      expect(find.text('CheckboxField'), findsOneWidget);
      expect(find.text('Multi Options'), findsOneWidget);
      expect(find.text('On Ghost Surface'), findsOneWidget);
      expect(find.byType(OneUiCheckboxField), findsWidgets);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('Default story page renders controls + preview',
        (tester) async {
      await pumpCheckboxStoryHarness(
          tester, const CheckboxFieldDefaultStoryPage());
      expect(find.text('Controls'), findsOneWidget);
      // Label appears in preview + controls TextField (React Default story parity).
      expect(find.text('Email me about product updates'), findsWidgets);
      expect(find.text('size'), findsWidgets);
      expect(find.text('appearance'), findsWidgets);
      expect(find.byType(OneUiCheckboxField), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    for (final story in kCheckboxFieldStoryNavOrder) {
      if (story == CheckboxFieldFoundationStory.docs ||
          story == CheckboxFieldFoundationStory.defaultStory) {
        continue;
      }

      testWidgets('${story.sidebarTitle} foundations page renders',
          (tester) async {
        await pumpCheckboxStoryHarness(
          tester,
          CheckboxFieldFoundationsPage(story: story),
        );
        expect(find.text(story.sidebarTitle), findsOneWidget);
        expect(find.byType(OneUiCheckboxField), findsWidgets);
        expect(find.byType(ConvexGapCard), findsNothing);
      });
    }
  });

  group('CheckboxField showcase sections — direct builders', () {
    Future<void> pumpSection(WidgetTester tester, Widget section) async {
      await pumpCheckboxStoryHarness(
        tester,
        SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: section,
        ),
      );
    }

    for (final story in kCheckboxFieldStoryNavOrder) {
      if (story == CheckboxFieldFoundationStory.docs ||
          story == CheckboxFieldFoundationStory.defaultStory) {
        continue;
      }

      testWidgets('buildSection: ${story.sidebarTitle}', (tester) async {
        late Widget section;
        await tester.pumpWidget(
          pumpCheckboxStoryApp(
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
        expect(find.byType(OneUiCheckboxField), findsWidgets);
        expect(find.byType(ConvexGapCard), findsNothing);
      });
    }
  });
}
