import 'package:flutter/material.dart';

import 'slider_interactive_story.dart';

/// Web `Default` story + Controls panel (`Slider.stories.tsx`).
class SliderDefaultStoryPage extends StatelessWidget {
  const SliderDefaultStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox.expand(
      child: SliderInteractiveStory(
        fillHeight: true,
      ),
    );
  }
}
