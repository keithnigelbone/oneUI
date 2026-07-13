import 'package:flutter/material.dart';

import 'touch_slider_interactive_story.dart';

/// Web `Default` story + Controls panel (`TouchSlider.stories.tsx`).
class TouchSliderDefaultStoryPage extends StatelessWidget {
  const TouchSliderDefaultStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox.expand(
      child: TouchSliderInteractiveStory(
        fillHeight: true,
      ),
    );
  }
}
