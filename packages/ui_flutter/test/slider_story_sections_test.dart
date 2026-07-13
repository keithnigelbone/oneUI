import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/slider_default_story_page.dart';
import 'package:ui_flutter/foundations/slider_foundations_page.dart';
import 'package:ui_flutter/foundations/slider_interactive_story_page.dart';
import 'package:ui_flutter/foundations/slider_story_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';

import 'slider_test_harness.dart';

void main() {
  group('Slider Storybook pages', () {
    testWidgets('Default story page renders preview slider', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 900));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const SizedBox(
            width: 1200,
            height: 800,
            child: SliderDefaultStoryPage(),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SliderDefaultStoryPage), findsOneWidget);
      expect(find.byType(OneUiSlider), findsOneWidget);
    });

    testWidgets('Interactive story renders draggable slider', (tester) async {
      await pumpSliderStoryHarness(
          tester, const SliderInteractiveStoryPage());
      expect(find.byType(OneUiSlider), findsOneWidget);
    });

    testWidgets('motion section renders with subtleMotion toggle', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        SliderFoundationsPage(story: SliderFoundationStory.motion),
      );
      expect(find.text('subtleMotion'), findsOneWidget);
      expect(find.byType(OneUiSlider), findsWidgets);
    });

    for (final story in kSliderStoryNavOrder) {
      if (story == SliderFoundationStory.docs ||
          story == SliderFoundationStory.defaultStory ||
          story == SliderFoundationStory.interactive ||
          story == SliderFoundationStory.motion) {
        continue;
      }
      testWidgets('${story.title} section renders', (tester) async {
        await pumpSliderStoryHarness(
          tester,
          SliderFoundationsPage(story: story),
        );
        expect(find.text(story.title), findsOneWidget);
        expect(find.byType(OneUiSlider), findsWidgets);
      });
    }
  });
}
