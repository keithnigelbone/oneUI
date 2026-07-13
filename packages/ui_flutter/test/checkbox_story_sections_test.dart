import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/checkbox_default_story_page.dart';
import 'package:ui_flutter/foundations/checkbox_docs_page.dart';
import 'package:ui_flutter/foundations/checkbox_foundations_page.dart';
import 'package:ui_flutter/foundations/checkbox_interactive_story_page.dart';
import 'package:ui_flutter/foundations/checkbox_motion_story_page.dart';
import 'package:ui_flutter/foundations/checkbox_responsive_story_page.dart';
import 'package:ui_flutter/foundations/checkbox_story_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';

import 'checkbox_test_harness.dart';

/// Every React `Checkbox.stories.tsx` section must render without layout errors.
void main() {
  group('Checkbox Storybook pages', () {
    testWidgets('Docs page renders merged sections', (tester) async {
      await pumpCheckboxStoryHarness(tester, const CheckboxDocsPage());
      expect(find.text('Checkbox'), findsOneWidget);
      expect(find.text('Sizes'), findsOneWidget);
      expect(find.text('Themes'), findsOneWidget);
      expect(find.text('Read Only'), findsOneWidget);
      expect(find.byType(OneUiCheckbox), findsWidgets);
    });

    testWidgets('Default story page renders controls + preview',
        (tester) async {
      await pumpCheckboxStoryHarness(tester, const CheckboxDefaultStoryPage());
      expect(find.text('Controls'), findsOneWidget);
      expect(find.text('Accept terms and conditions'), findsOneWidget);
      expect(find.text('size'), findsWidgets);
      expect(find.text('appearance'), findsWidgets);
      expect(find.byType(FilterChip), findsWidgets);
    });

    testWidgets('Interactive story toggles on tap', (tester) async {
      await pumpCheckboxStoryHarness(
          tester, const CheckboxInteractiveStoryPage());
      expect(find.text('Toggle me'), findsOneWidget);
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(tester.widget<OneUiCheckbox>(find.byType(OneUiCheckbox)).checked,
          isTrue);
    });

    testWidgets('Motion story renders subtle-motion switch', (tester) async {
      await pumpCheckboxStoryHarness(tester, const CheckboxMotionStoryPage());
      expect(find.text('Subtle motion'), findsOneWidget);
      expect(find.byType(OneUiCheckbox), findsWidgets);
      await tester.tap(find.byType(SwitchListTile));
      await tester.pumpAndSettle();
      expect(find.text('Switch to indeterminate'), findsOneWidget);
    });

    testWidgets('Responsive story toggles rows independently', (tester) async {
      await pumpCheckboxStoryHarness(
          tester, const CheckboxResponsiveStoryPage());
      final boxes = find.byType(OneUiCheckbox);
      expect(boxes, findsNWidgets(6));

      final uncheckedS = tester.widget<OneUiCheckbox>(boxes.at(0));
      final checkedS = tester.widget<OneUiCheckbox>(boxes.at(1));
      expect(uncheckedS.checked, isFalse);
      expect(checkedS.checked, isTrue);

      await tester.tap(boxes.at(0));
      await tester.pumpAndSettle();
      expect(tester.widget<OneUiCheckbox>(boxes.at(0)).checked, isTrue);
      expect(tester.widget<OneUiCheckbox>(boxes.at(1)).checked, isTrue);

      await tester.tap(boxes.at(1));
      await tester.pumpAndSettle();
      expect(tester.widget<OneUiCheckbox>(boxes.at(0)).checked, isTrue);
      expect(tester.widget<OneUiCheckbox>(boxes.at(1)).checked, isFalse);
    });

    for (final story in kCheckboxStoryNavOrder) {
      if (story == CheckboxFoundationStory.docs ||
          story == CheckboxFoundationStory.defaultStory ||
          story == CheckboxFoundationStory.interactive ||
          story == CheckboxFoundationStory.motion ||
          story == CheckboxFoundationStory.responsive) {
        continue;
      }

      testWidgets('${story.title} foundations page renders', (tester) async {
        await pumpCheckboxStoryHarness(
          tester,
          CheckboxFoundationsPage(story: story),
        );
        expect(find.text(story.title), findsOneWidget);
        expect(find.byType(OneUiCheckbox), findsWidgets);
      });
    }
  });

  group('Checkbox showcase sections — direct builders', () {
    Future<void> pumpSection(WidgetTester tester, Widget section) async {
      await pumpCheckboxStoryHarness(
        tester,
        SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: section,
        ),
      );
    }

    for (final story in kCheckboxStoryNavOrder) {
      if (story == CheckboxFoundationStory.docs ||
          story == CheckboxFoundationStory.defaultStory ||
          story == CheckboxFoundationStory.interactive ||
          story == CheckboxFoundationStory.motion) {
        continue;
      }

      testWidgets('buildSection: ${story.title}', (tester) async {
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
        expect(find.byType(OneUiCheckbox), findsWidgets);
      });
    }
  });
}
