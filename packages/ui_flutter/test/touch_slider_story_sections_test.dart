import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/touch_slider_default_story_page.dart';
import 'package:ui_flutter/foundations/touch_slider_foundations_page.dart';
import 'package:ui_flutter/foundations/touch_slider_interactive_story_page.dart';
import 'package:ui_flutter/foundations/touch_slider_story_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import 'slider_test_harness.dart';

void main() {
  group('TouchSlider Storybook pages', () {
    testWidgets('Default story page renders preview', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 900));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const SizedBox(
            width: 1200,
            height: 800,
            child: TouchSliderDefaultStoryPage(),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(TouchSliderDefaultStoryPage), findsOneWidget);
      expect(find.byType(OneUiTouchSlider), findsOneWidget);
    });

    testWidgets('Interactive story renders draggable slider', (tester) async {
      await pumpTouchSliderStoryHarness(
          tester, const TouchSliderInteractiveStoryPage());
      expect(find.byType(OneUiTouchSlider), findsOneWidget);
    });

    testWidgets('motion section renders with subtleMotion toggle', (tester) async {
      await pumpTouchSliderStoryHarness(
        tester,
        TouchSliderFoundationsPage(story: TouchSliderFoundationStory.motion),
      );
      expect(find.text('subtleMotion'), findsOneWidget);
      expect(find.byType(OneUiTouchSlider), findsWidgets);
    });

    for (final story in kTouchSliderStoryNavOrder) {
      if (story == TouchSliderFoundationStory.docs ||
          story == TouchSliderFoundationStory.defaultStory ||
          story == TouchSliderFoundationStory.interactive ||
          story == TouchSliderFoundationStory.motion) {
        continue;
      }
      testWidgets('${story.title} section renders', (tester) async {
        await pumpTouchSliderStoryHarness(
          tester,
          TouchSliderFoundationsPage(story: story),
        );
        expect(find.text(story.title), findsOneWidget);
        expect(find.byType(OneUiTouchSlider), findsWidgets);
      });
    }
  });
}
